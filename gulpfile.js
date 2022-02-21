const gulp       = require('gulp');
const concat     = require('gulp-concat');
const uglify     = require('gulp-uglify-es').default;
const rimraf     = require('gulp-rimraf');
const sourcemaps = require('gulp-sourcemaps');
const replace    = require('gulp-replace');
const plumber    = require('gulp-plumber');
const fs         = require('fs');
const pkg        = require('./package.json');

const sdkSrcNoEncryption = [
  'src/core.js',
  'src/promise.js',
  'src/net.js',
  'src/Util.js',
  'src/ApplePay.js',
  'src/PublicKeyResponse.js',
  'src/C2SCommunicatorConfiguration.js',
  'src/IinDetailsResponse.js',
  'src/C2SCommunicator.js',
  'src/LabelTemplateElement.js',
  'src/Attribute.js',
  'src/AccountOnFileDisplayHints.js',
  'src/AccountOnFile.js',
  'src/PaymentProduct302SpecificData.js',
  'src/PaymentProductDisplayHints.js',
  'src/BasicPaymentProduct.js',
  'src/MaskedString.js',
  'src/MaskingUtil.js',
  'src/ValidationRuleLuhn.js',
  'src/ValidationRuleExpirationDate.js',
  'src/ValidationRuleFixedList.js',
  'src/ValidationRuleLength.js',
  'src/ValidationRuleRange.js',
  'src/ValidationRuleRegularExpression.js',
  'src/ValidationRuleEmailAddress.js',
  'src/ValidationRuleTermsAndConditions.js',
  'src/ValidationRuleIban.js',
  'src/ValidationRuleFactory.js',
  'src/DataRestrictions.js',
  'src/ValueMappingElement.js',
  'src/FormElement.js',
  'src/Tooltip.js',
  'src/PaymentProductFieldDisplayHints.js',
  'src/PaymentProductField.js',
  'src/PaymentProduct.js',
  'src/BasicPaymentProducts.js',
  'src/BasicPaymentItems.js',
  'src/PaymentRequest.js',
  'src/C2SPaymentProductContext.js',
  'src/JOSEEncryptor.js',
  'src/Encryptor.js',
  'src/session.js'
];

const fullSdkSrc = [
  'node_modules/node-forge/dist/forge.min.js',
].concat(sdkSrcNoEncryption);

const buildSdk = ({source, destName, done}) => {
  const destNameMin = destName.split('.js').concat('.min.js').join('');

  gulp.src(source)
    .pipe(concat(destName))
    .pipe(replace(/\$\{version\}/g, pkg.version))
    .pipe(gulp.dest('./dist/'))

  gulp.src(source)
    .pipe(sourcemaps.init())
    .pipe(concat(destNameMin))
    .pipe(uglify())
    .pipe(replace(/\$\{version\}/g, pkg.version))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/'));

  done();
}

gulp.task('createFullSdk', (done) => {
  buildSdk({
    source: fullSdkSrc,
    destName: 'onlinepaymentssdk.js',
    done
  });
});

gulp.task('createSdkNoEncryption', (done) => {
  buildSdk({
    source: sdkSrcNoEncryption,
    destName: 'onlinepaymentssdk.noEncrypt.js',
    done
  });
});

// clean folder
gulp.task('clean', function (cb) {
  return gulp.src('./dist', { read: false, allowEmpty: true }).pipe(plumber()).pipe(rimraf());
});

gulp.task('build', gulp.series('clean', gulp.parallel('createFullSdk', 'createSdkNoEncryption')));

gulp.task('watch', function () {
  gulp.watch(['src/*.js'], gulp.series('build'))
});

gulp.task('default', function () {
  console.error('no default task! use gulp --tasks');
});
