# 4.0.0

The SDK was internally refactored to be unified with Client SDKs in other technologies.
This log states only externally visible changes. For usage example, check the [README.md](README.md)
file.

## Changed

- The main entry `Session` class changed to `OnlinePaymentSdk`. It is instantiated with
  `init(sessionData, configuration?)` provided in the main SDK export.
- Fluent API added for domain models:
    - `PaymentProductField`:
        - `validate(value)` returns array of `ValidationErrorMessage` (previously `isValid()`).
        - Added methods: `getLabel()`, `getPlaceholder()`, `getDisplayOrder()`, `isRequired()`,
          `shouldObfuscate()`, `applyMask(value)`, `removeMask(value)`
    - `PaymentRequest`:
        - Constructor now requires `PaymentProduct` (previously optional).
        - `validate()` returns `ValidationResult` containing validation errors.
        - Field values managed through `PaymentRequestField` instances.
        - Setting `AccountOnFile` automatically clears non-writable field values set previously
          on the payment request.
        - Setting a value to a READ_ONLY field throws `InvalidArgumentError`.

## Added

- `PaymentProduct`: added methods for field access:
    - `getFields()` - returns all fields
    - `getRequiredFields()` - returns only required fields
    - `getField(id)` - returns specific field by ID
- `PaymentRequestField` - Internal class for field value management with methods:
    - `getValue()`, `setValue(value)`, `clearValue()`
    - `getMaskedValue()`, `getType()`
    - `getId()`, `getLabel()`, `getPlaceholder()`, `isRequired()`, `shouldObfuscate()`
    - `validate()` - validates individual field value
- `PaymentRequest`: added methods:
    - `getField(id)` - returns `PaymentRequestField` for fluent API
    - `getValues()` - returns all unmasked values as object
    - `validate()` - validates entire request, returns `ValidationResult` (see below)
- `AccountOnFile`: added methods
    - `getValue(fieldId)` - get stored value for field
    - `getRequiredAttributes()` - get attributes that must be provided
    - `isWritable(fieldId)` - check if field can be modified
- `BasicPaymentProduct`: added method
    - `getAccountOnFile(id)` - retrieve specific account on file
- `ValidationResult` - New class wrapping validation results with:
    - `isValid` - boolean indicating if validation passed
    - `errors` - array of `ValidationErrorMessage`
- Error hierarchy:
    - `SDKError` - Abstract base class for all SDK errors
    - `ConfigurationError` - Invalid session/config data
    - `InvalidArgumentError` - Invalid method arguments
    - `ResponseError` - API request failures (includes HTTP status)
    - `EncryptionError` - Encryption or validation failures
- `SdkConfiguration` parameter with `appIdentifier` property to identify the integrating
  application.

## Removed

- `JSON` properties not returned from methods anymore (direct object access instead).
- `BasicPaymentItems` class removed.
- `getBasicPaymentItems()` method removed from facade. Use `getBasicPaymentProducts()` instead.
- `Session` class removed. Use `init()` function to create `OnlinePaymentSdk` instance. The
  interface of the previous `Session` and new `OnlinePaymentsSdk` instances is mostly the same.

# 3.6.2

## Changed

- Fixed a bug in the JOSEEncryptor.

# 3.6.1

## Changed

- Fixed a bug in serializing the token request.
- Fixed a bug in encoding UTF-8 characters.

# 3.6.0

## Added

A new class `CreditCardTokenRequest` has been added. It is used to create a request for a credit
card tokenization. It works similarly to the `PaymentRequest` class, but it does not validate
values, nor unmasks them. Encryptor class is extended with a new method `encryptTokenRequest`.
You can use it to get the encrypted data for the tokenization request.

## Changed

- `Encryptor.encrypt` now throws an instance of `EncryptionError` if the payment request is not
  valid.
- The following methods will now throw a `ResponseError` when the request failed:
    - `Session.getPublicKey`
    - `Session.getIinDetails`
    - `Session.getPaymentProductNetworks`
    - `Session.getSurchargeCalculation`
    - `Session.getCurrencyConversionQuote`
- Removed support for detached mode from `PaymentRequest`. Previously, the class supported a
  detached mode in which validation behavior differed.
    - The fields `noValidate` and `paymentProductId` have been removed from both the class and its
      constructor.
    - Updated `getPaymentProductId()` to return the ID of the associated PaymentProduct object
      instead of a standalone value.

# 3.5.0

## Changed

- Fixed bug when validating a `PaymentRequest`. Previously, if a mandatory field was not set and
  there was another field that was valid, the request could be validated and encrypted. Now,
  each field must be valid.
- Some payment products are not supported in the encrypted payment request, so they are now filtered
  out from the list of available payment products. These products are filtered:
    - Maestro (id: 117)
    - Intersolve (id: 5700)
    - Sodexo & Sport Culture (id: 5772)
    - VVV Giftcard (id: 5784)
- The property `PaymentProductField.DisplayHints.Tooltip.image` is marked deprecated and will be
  removed in the next release since it is not being sent from the API.
- The boolean properties of the `BasicPaymentProduct` type were properly marked as undefinable.

# 3.4.0

## Added

- The `PaymentRequest` can now be instantiated in the "detached" mode. Check the README file for
  more info.

## Deprecated

- `PaymentContext.locale` has been marked deprecated and should not be used anymore since it has no
  influence on behavior.

## Changed

- The Google Pay payment data retrieved from the API is properly set to the payment product so that
  `BasicPaymentProduct.paymentProduct320SpecificData` has received values.
- The API requests requiring the `PaymentContext` object data have been aligned with the API
  requirements. For `Session` methods `getBasicPaymentProducts`, `getBasicPaymentItems`,
  `getPaymentProduct`, and `getPaymentProductNetworks` the `paymentContext.amountOfMoney.amount`
  parameter is not mandatory anymore, while it still is for the `getIinDetails`, as per the API
  specification.

# 3.3.0

## Changed

- Removed the Apple Pay types since they were mainly not needed.
- Removed deprecated properties from the Session class.

# 3.2.2

## Changed

- Update the export of the Apple Pay types.

# 3.2.1

Internal maintenance.

# 3.2.0

## Changed

- The type of the `AccountOnFile.id` has been changed to string.

# 3.1.2

## Changed

- Updated and exported all types used externally

# 3.1.1

## Changed:

- Fixed reported issue: [#9](https://github.com/wl-online-payments-direct/sdk-client-js/issues/9)
