/**
 * JavaScript SDK Pipeline using Versioned Shared Library
 *
 * This Jenkinsfile should be placed in the root of your SDK repository.
 * Jenkins will automatically checkout the code.
 *
 * Key Points:
 * 1. Use @Library('sdk-jenkins-shared-lib@v1.2.0') to pin to a specific version
 * 2. Never use @main in production - always pin to a tagged version
 * 3. Use feature branches for testing: @Library('...'@feature-branch-name)
 * 4. Configure Multibranch Pipeline in Jenkins to point to your SDK repo
 */

// Pin to specific version for stability
@Library('sdk-jenkins-shared-lib@v1.2.0') _

pipeline {
    agent {
        docker {
            image 'node:22.12-alpine'
            args  '-u root:root -v $HOME/.yarn:/root/.yarn -v $HOME/.cache:/root/.cache -v $HOME/.npm:/root/.npm'
            reuseNode true  // Reuses the workspace where Jenkins already checked out the code
        }
    }

    parameters {
        booleanParam(
            name: 'DRY_RUN',
            defaultValue: false,
            description: 'Enable dry-run mode (test without actually pushing and publishing)'
        )
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        SDK_NAME = 'JavaScript'
        NODE_ENV = 'ci'
        CI = 'true'  // Enable CI mode for test reporters (JUnit XML output)

        // Target GitHub repositories (mirror destinations)
        WORLDLINE_REPO_URL  = 'wl-online-payments-direct/sdk-client-js.git'
        WHITELABEL_REPO_URL = 'online-payments/sdk-client-js.git'
    }

    stages {

        stage('Prepare Environment') {
            steps {
                sh '''
                    set -eu

                    # Install required tools
                    apk add --no-cache git bash zip unzip rsync curl

                    # Enable Corepack to use the yarn version specified in package.json
                    corepack enable

                    echo "Node version: $(node -v)"
                    echo "Yarn version: $(yarn -v)"

                    # Mark workspace as safe for git operations
                    git config --global --add safe.directory "$PWD"
                '''
            }
        }

        stage('Build') {
            steps {
                echo "Building ${env.SDK_NAME} SDK"

                sh '''
                    set -eu

                    yarn config set network-timeout 60000
                    yarn config set network-concurrency 8

                    yarn install --frozen-lockfile \\
                        --prefer-offline \\
                        --non-interactive \\
                        --production=false

                    # Run build
                    yarn build
                '''
            }
        }

        stage('Security Audit') {
            steps {
                echo "Running security audit for ${env.SDK_NAME} SDK"

                sh '''
                    set -eu
                    yarn run audit
                '''
            }
        }

        stage('Test - Unit') {
            steps {
                echo "Running unit tests for ${env.SDK_NAME} SDK"

                sh '''
                    set -eu
                    yarn test:unit
                '''
            }
        }

        stage('Test - Integration') {
            steps {
                echo "Running integration tests for ${env.SDK_NAME} SDK"

                withCredentials([
                    string(credentialsId: 'worldline-merchant-id', variable: 'MERCHANT_ID'),
                    string(credentialsId: 'worldline-api-id', variable: 'API_ID'),
                    string(credentialsId: 'worldline-api-secret', variable: 'API_SECRET')
                ]) {
                    sh '''
                        set -eu

                        # Create .env file for integration tests
                        cat > .env <<EOF
# Integration test credentials
VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID=${MERCHANT_ID}
VITE_ONLINEPAYMENTS_SDK_API_ID=${API_ID}
VITE_ONLINEPAYMENTS_SDK_API_SECRET=${API_SECRET}
VITE_ONLINEPAYMENTS_SDK_HOST=payment.preprod.direct.worldline-solutions.com
VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION=4567350000427977
VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION=4242424242424242
VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION=302
VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION=2
VITE_PRODUCT_TYPE_ID_SURCHARGE_CURRENCY_CONVERSION=12
VITE_PRODUCT_TYPE_VERSION_SURCHARGE_CURRENCY_CONVERSION=v2
VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION=5bf3da321c3745b08c407143b1beb506
EOF

                        # Run integration tests
                        yarn test:integration
                    '''
                }
            }
            post {
                always {
                    // Clean up env
                    sh '''
                        rm -f .env
                        rm -rf tests/integration/.cache
                    '''
                }
            }
        }

        stage('Extract Version & Package') {
            when {
                anyOf {
                    branch 'main'
                    tag pattern: 'v\\d+\\.\\d+\\.\\d+.*', comparator: 'REGEXP'
                }
            }
            steps {
                script {
                    echo 'Reading version from package.json'

                    def version = sh(
                        script: "node -p \"require('./package.json').version\"",
                        returnStdout: true
                    ).trim()

                    env.VERSION     = version
                    env.VERSION_TAG = "v${version}"

                    echo "Version:      ${env.VERSION}"
                    echo "Version tag:  ${env.VERSION_TAG}"
                }

                script {
                    // Use npm pack (not yarn) to ensure consistency with npm publish
                    // npm pack respects .npmignore and files field correctly
                    def pkgFile = sh(
                        script: '''
                            set -e
                            # npm pack outputs the filename as the last line
                            npm pack 2>&1 | tail -1
                        ''',
                        returnStdout: true
                    ).trim()

                    if (!pkgFile.endsWith('.tgz')) {
                        error("npm pack did not return a .tgz filename. Got: ${pkgFile}")
                    }

                    env.PACKAGE_TGZ = pkgFile
                    echo "Package created: ${env.PACKAGE_TGZ}"

                    // Verify the file exists
                    sh "ls -lh ${env.PACKAGE_TGZ}"
                }

                archiveArtifacts artifacts: '*.tgz',
                                 fingerprint: true,
                                 onlyIfSuccessful: true
            }
        }

        stage('Check Version Not Published') {
            when {
                anyOf {
                    branch 'main'
                    tag pattern: 'v\\d+\\.\\d+\\.\\d+.*', comparator: 'REGEXP'
                }
            }
            steps {
                script {
                    echo "Checking if version ${env.VERSION} is already published to npm"

                    def packageName = sh(
                        script: "node -p \"require('./package.json').name\"",
                        returnStdout: true
                    ).trim()

                    // Check if version exists on npm (exit code 0 = exists, non-zero = doesn't exist)
                    def versionExists = sh(
                        script: "npm view ${packageName}@${env.VERSION} version 2>/dev/null || echo 'not-found'",
                        returnStdout: true
                    ).trim()

                    if (versionExists != 'not-found' && versionExists == env.VERSION) {
                        echo "Version ${env.VERSION} is already published to npm. Skipping publish stages."
                        env.SKIP_PUBLISH = 'true'
                    } else {
                        echo "Version ${env.VERSION} is not yet published. Proceeding with release."
                        env.SKIP_PUBLISH = 'false'
                    }
                }
            }
        }

        stage('Prepare for Production') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        tag pattern: 'v\\d+\\.\\d+\\.\\d+.*', comparator: 'REGEXP'
                    }
                    expression { env.SKIP_PUBLISH != 'true' }
                }
            }
            steps {
                echo "Removing dev-only files before pushing to production repositories"

                sh '''
                    set -eu

                    # Remove dev-only files
                    rm -f DEV.md
                    rm -f .env.example
                    rm -f Jenkinsfile
                    rm -rf test-results
                    rm -rf coverage

                    echo "Dev-only files removed"
                '''
            }
        }

        stage('GitHub Upload') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        tag pattern: 'v\\d+\\.\\d+\\.\\d+.*', comparator: 'REGEXP'
                    }
                    expression { env.SKIP_PUBLISH != 'true' }
                }
            }
            steps {
                script {
                    echo "Uploading ${env.SDK_NAME} SDK to GitHub repositories"

                    // Worldline repository
                    gitHub.pushRepo(
                        humanName: 'Worldline',
                        credentialsId: 'github-worldline-token',
                        repo: env.WORLDLINE_REPO_URL,
                        tag: env.VERSION_TAG,
                        gitName: "Worldline Direct Jenkins CI",
                        gitEmail: "82139942+worldline-direct-support-team@users.noreply.github.com",
                        dryRun: params.DRY_RUN
                    )
                    gitHub.createRelease(
                        humanName: 'Worldline',
                        credentialsId: 'github-worldline-token',
                        repo: env.WORLDLINE_REPO_URL,
                        tag: env.VERSION_TAG,
                        artifacts: '*.tgz',
                        dryRun: params.DRY_RUN
                    )

                    // Whitelabel repository
                    gitHub.pushRepo(
                        humanName: 'Whitelabel',
                        credentialsId: 'github-whitelabel-token',
                        repo: env.WHITELABEL_REPO_URL,
                        tag: env.VERSION_TAG,
                        gitName: "Online Payments Jenkins CI",
                        gitEmail: "96182451+online-payments-support-team@users.noreply.github.com",
                        dryRun: params.DRY_RUN
                    )
                    gitHub.createRelease(
                        humanName: 'Whitelabel',
                        credentialsId: 'github-whitelabel-token',
                        repo: env.WHITELABEL_REPO_URL,
                        tag: env.VERSION_TAG,
                        artifacts: '*.tgz',
                        dryRun: params.DRY_RUN
                    )
                }
            }
        }

        stage('Publish to NPM') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        tag pattern: 'v\\d+\\.\\d+\\.\\d+.*', comparator: 'REGEXP'
                    }
                    expression { env.SKIP_PUBLISH != 'true' }
                }
            }
            steps {
                script {
                    npmPublish.publish(
                        credentialsId: 'npm-token',
                        packageFile: env.PACKAGE_TGZ,
                        dryRun: params.DRY_RUN,
                        access: 'public'
                    )
                }
            }
        }
    }

    post {
        always {
            cleanWs(deleteDirs: true, notFailBuild: true)
        }
        success {
            echo "JavaScript SDK build and publish pipeline finished successfully. Version: ${env.VERSION_TAG}"
        }
        failure {
            echo 'JavaScript SDK build and publish pipeline FAILED. Check the logs of individual stages.'
        }
    }
}
