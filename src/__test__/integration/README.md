# Integration tests

Integration tests are located in `./src/__test__/integration`. They are testing functions from a
consumer perspective; exposed API of the SDK.

## Prerequisite

Edge browser is installed.

## Run tests

You can run integration tests by using:

```bash
yarn test:integration
```

When you run this command on your local machine (when the environment var `CI` is not set), you will
notice the first time you run it, it can take a few seconds to start up the test environment.
On startup the session details are fetched from the API explorer and stored in cache every 30
minutes. This is done to speed up the development process. The cache is stored in
`./src/__test__/integration/.cache`.
