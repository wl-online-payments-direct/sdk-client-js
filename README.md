# Online Payments JavaScript SDK

The Online Payments JavaScript SDK helps you with accepting payments on your website through the
Online Payments platform.

The SDKs’ main function is to establish a secure channel between your web app and our server. This
channel processes security credentials to guarantee the safe transit of your customers’ data
during the payment process.

**The OnlinePayments SDK helps you with**

- handling encryption of payment context
- convenient JavaScript wrappers for API responses
- user-friendly formatting of payment data such as card numbers and expiry dates
- validation of input
- determining to which payment provider a card number is associated

## Table of Contents

- [Online Payments JavaScript SDK](#online-payments-javascript-sdk)
    - [Table of Contents](#table-of-contents)
    - [Requirements](#requirements)
    - [Installation](#installation)
    - [Distributed packages](#distributed-packages)
        - [Usage Universal Module Definition (UMD)](#usage-universal-module-definition-umd)
        - [Usage ES module (ESM)](#usage-es-module-esm)
    - [Getting started](#getting-started)
    - [Type definitions](#type-definitions)
        - [OnlinePaymentsSdk](#onlinepaymentssdk)
        - [PaymentContext](#paymentcontext)
        - [BasicPaymentProduct](#basicpaymentproduct)
        - [AccountOnFile](#accountonfile)
        - [PaymentProduct](#paymentproduct)
        - [PaymentProductField](#paymentproductfield)
        - [PaymentRequest](#paymentrequest)
            - [Tokenize payment request](#tokenize-payment-request)
            - [Set field values to the payment request](#set-field-values-to-the-payment-request)
            - [Validate payment request](#validate-payment-request)
            - [AccountOnFile with read-only fields](#accountonfile-with-READ_ONLY-fields)
            - [Encrypt payment request](#encrypt-payment-request)
        - [IINDetails](#iindetails)
    - [Payment steps](#payment-steps)
        - [1. Initialize the JavaScript SDK for this payment](#1-initialize-the-javascript-sdk-for-this-payment)
        - [2. Retrieve the payment products](#2-retrieve-the-payment-products)
        - [3. Retrieve payment product details](#3-retrieve-payment-product-details)
        - [4. Encrypt payment information](#4-encrypt-payment-information)
        - [5. Response from the Server API call](#5-response-from-the-server-api-call)
    - [Testing](#testing)
        - [Unit tests](#unit-tests)

## Requirements

The minimum supported browser versions are based on the latest implemented feature
of ["private class fields"](https://caniuse.com/?search=private%20class%20fields):

- Chrome 74+
- Edge 79+
- Safari 14.1+
- Firefox 90+
- Chrome for Android 109+
- Safari on iOS 14.8+
- Opera Mobile 72+
- Android Browser 109+
- Firefox for Android 107+

## Installation

Install this SDK using your preferred node package manager `npm`, `yarn`, or `pnpm`.

```bash
npm install onlinepayments-sdk-client-js
```

## Distributed packages

The SDK can be used as a UMD module or as an ES module.

### Usage Universal Module Definition (UMD)

The SDK is available under global namespace `onlinepaymentssdk` and can be used in the following
way:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        ...
    </head>
    <body>
        <script src="./node_modules/onlinepayments-sdk-client-js/dist/onlinepayments-sdk-client-js.umd.js"></script>
        <script>
            const sdk = window.onlinepaymentssdk.init({
                ...
            })
        </script>
    </body>
</html>
```

### Usage ES module (ESM)

Most bundlers (webpack, rollup, parcel, etc.) support ES Modules. The SDK can be imported in the
following way:

```js
import * as OnlinePaymentsSdk from 'onlinepayments-sdk-client-js';
```

## Getting started

To accept your first payment using the SDK, complete the steps below. Also, see the section "Payment
Steps" for more details on these steps.

1. Request your server to create a Client Session, using the Server API Create Client Session call.
   Return the session data to your web app.
2. Initialize the SDK with the session data:

    ```typescript
    import * as OnlinePaymentsSdk from 'onlinepayments-sdk-client-js';

    const sdk = OnlinePaymentsSdk.init(
        {
            clientSessionId: '47e9dc332ca24273818be2a46072e006',
            customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
            clientApiUrl: 'https://clientapi.com',
            assetUrl: 'https://asset.com',
        },
        {
            appIdentifier: 'MyShopIntegration', // this identifies your application
        },
    );
    ```

3. Use the `sdk` object to retrieve the available Payment Products for a provided context. Display
   the `BasicPaymentProduct` and `AccountOnFile` lists and request your customer to select one.
   Note that you can skip this step if you want to use a specific payment product.

    ```typescript
    const paymentContext: PaymentContextWithAmount = {
        countryCode: 'BE',
        amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
        isRecurring: false,
    };

    sdk.getBasicPaymentProducts(paymentContext)
        .then(({ paymentProducts, accountsOnFile }) => {
            // Display the payment products and/or accounts on file.
        })
        .catch((error) => {
            // handle error state
        });
    ```

4. Make a call for the selected product to retrieve what information should be asked from your
   customer. Display the returned field information to your user to request their details.

    ```typescript
    sdk.getPaymentProduct(1, paymentContext)
        .then((paymentProduct) => {
            const {
                getFields, // array of all the fields the user needs to fill out.
                getRequiredFields, // array of all the required fields the user needs to fill out.
                getField, // returns a single PaymentProductField by id
            } = paymentProduct;

            // Display the form with fields to your user.
            // Use the field helper functions to format and validate data.
        })
        .catch((error) => {
            // handle error state
        });
    ```

5. While the user is filling out their details, save them to a `PaymentRequest`.
   See the [PaymentRequest](#PaymentRequest) section for more info.

    ```typescript
    import { PaymentRequest } from 'onlinepayments-sdk-client-js';

    // paymentProduct is retrieved in the previous step.
    const paymentRequest = new PaymentRequest(paymentProduct);

    // set values directly on the corresponding PaymentProductField instances.
    paymentRequest.getField('cardNumber').setValue('1245 1254 4575 45');
    paymentRequest.getField('cvv').setValue('123');
    paymentRequest.getField('expiryDate').setValue('12/2027');

    // OR with a helper method
    paymentRequest.setValue('cardNumber', '1245 1254 4575 45');
    paymentRequest.setValue('cvv', '123');
    paymentRequest.setValue('expiryDate', '12/2027');
    ```

    Note that the format of the expiry date for the Credit Card payment products depends on
    settings in your merchant account, so it can be either MM/yyyy OR MM/yy. The exact format is
    returned from the API, and the field validation and payment request validation will ensure that
    the format is correct. See the validation section below for `PaymentProductField` for more info.

6. Validate and encrypt the payment request and send the encrypted customer data to your server.

    ```typescript
    sdk.encryptPaymentRequest(paymentRequest)
        .then((encryptedRequest) => {
            /*
             * enrcyptedRequest is the encrypted payment request which can safely be send to your
             * server. It consists of two parts: encryptedFields and encodedClientMetaInfo.
             */
        })
        .catch((err) => {
            // payment request can not be encrypted, handle error state
        });
    ```

7. From your server, make a Create Payment request, providing the encrypted data in the
   `encryptedCustomerInput` field.

## Type definitions

### OnlinePaymentsSdk

For all interaction with the SDK an instance of OnlinePaymentSdk is required. The following code
fragment shows how `OnlinePaymentsSdk` is initialized. The session data is obtained by performing a
Create Client Session call via the Server API, along with optional `SdkConfiguration` that includes
`appIdentifier`, an identifier of your app.

```typescript
import * as OnlinePaymentsSdk from 'onlinepayments-sdk-client-js';

const sdk = OnlinePaymentsSdk.init(
    {
        clientSessionId: '47e9dc332ca24273818be2a46072e006',
        customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
        clientApiUrl: 'https://clientapi.com',
        assetUrl: 'https://asset.com',
    },
    {
        appIdentifier: 'MyShopIntegration', // this identifies your application
    },
);
```

Almost all methods that are offered by `OnlinePaymentsSdk` are simple wrappers around the Client
API. They make the request and convert the response to JavaScript objects that may contain
convenience functions.

### PaymentContext

The `PaymentContext` is an object that contains the context/settings of the upcoming payment. It is
required as an argument to some methods of the `OnlinePaymentsSdk` instance. This object can contain
the following details:

```typescript
export interface PaymentContext {
    countryCode: string; // ISO 3166-1 alpha-2 country code
    amountOfMoney: {
        amount?: number; // Total amount in the smallest denominator of the currency
        currencyCode: string; // ISO 4217 currency code
    };
    isRecurring?: boolean; // Set `true` when payment is recurring. Default false.
}
```

This interface can be imported as a type when using TypeScript:

```typescript
import type { PaymentContext } from 'onlinepayments-sdk-client-js';

const paymentContext: PaymentContext = {
    // ...
};
```

### BasicPaymentProduct

The SDK offers two types to represent information about payment products: `BasicPaymentProduct` and
`PaymentProduct`.
Practically speaking, instances of `BasicPaymentProduct` contain only the information that is
required to display a simple list of payment products from which the user can select one.

Below is an example of how to get display names and assets for the Visa product.

```typescript
const basicPaymentProduct = basicPaymentProducts.paymentProducts.find((p) => p.id === 1);

basicPaymentProduct.id; // 1
basicPaymentProduct.label; // VISA
basicPaymentProduct.logo; // https://www.domain.com/path/to/visa/logo.gif
// this is valid only if there is saved account on file
basicPaymentProduct.accountsOnFile[0].label; // e.g. 4242 **** **** 4242
```

### PaymentProduct

However, once a payment item or an account on file has been
selected, the customer must provide additional information, such as a bank account number, a credit
card number, or an expiry date, before a payment can be processed. Each payment item can have
several fields that need to be completed to process a payment. The instance of the `PaymentProduct`
class contains a list of fields that a user must fill in to complete the payment. For this, there
are several helper methods that retrieve the `PaymentProductField`.

```typescript
sdk.getPaymentProduct(1, paymentContext)
    .then((paymentProduct) => {
        const {
            getField, // array of all the fields available in the payment product.
            getRequiredFields, // array of all the required fields the user needs to fill out.
            getFields, // returns a single PaymentProductField by id
        } = paymentProduct;
    })
    .catch((error) => {
        // handle error state
    });
```

### PaymentProductField

The fields of payment products are represented by instances of `PaymentProductField`. Each field has
an identifier, a type, a definition of restrictions that apply to the value of the field, and a set
of helper methods for formatting and validating an input value.

In the code fragment below, the field with identifier `expiryDate` is retrieved from a payment
product. Methods are available to determine whether the field is required or optional, and
whether its values should be obfuscated in the user interface.

```typescript
const field = paymentProduct.getField('expiryDate');

field.isRequired(); // true if value is required.
field.shouldObfuscate(); // true if needs to be obfuscated.
field.applyMask('0628'); // returns 06/28
field.removeMask('06/28'); // returns 0628
field.validate('06/28'); // returns a list of validation errors (empty list if the value is valid)
```

### AccountOnFile

An instance of `AccountOnFile` (AOF) represents information about a stored card product for the
current user. Available AOF for the current session are available if the Create Client Session call
on the server side had the saved tokens provided. You can find more information in the
[API reference](https://docs.direct.worldline-solutions.com/en/api-reference#tag/Sessions/operation/CreateSessionApi).

The code fragment below shows how display data for an account on file can be retrieved. This label
can be shown to the customer, along with the logo of the corresponding payment product.

```typescript
// This contains all unique saved payment accounts from across all available payment products
const aof = paymentProduct.accountsOnFile[0];

// get display value of a field
accountOnFile.getValue('cardNumber'); // returns masked card number
accountOnFile.getValue('cardholderName'); // returns the cardholder name, if set
accountOnFile.getValue('expiryDate'); // returns the expiry date, if set
```

### PaymentRequest

Once a payment product has been selected and an instance of `PaymentProduct` has been retrieved, a
payment request can be constructed. This class must be used as a container for all the values the
customer provided.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

// paymentProduct is an instance of the PaymentProduct class (not BasicPaymentProduct).
const paymentRequest = new PaymentRequest(paymentProduct);
```

When the payment product is instantiated, methods such as masking and unmasking values, validation,
and encryption will work.

Setting values is done through the instances of the [PaymentRequestField](#paymentrequestfield)
class.

#### Tokenize payment request

A `PaymentRequest` has a property `tokenize`, which is used to indicate whether a payment request
should be stored as an account on file. The code fragment below shows how a payment request should
be constructed when the request should not be stored as an account on file.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

// create payment requust, if tokenize not provided its default value  is false.
const paymentRequest = new PaymentRequest(paymentProduct);
```

If the customer selected an account on file, this instance needs to be set on the payment request
either when instantiating an object or with a dedicated setter. Instances of
`AccountOnFile` can be retrieved from instances of `BasicPaymentProduct` and `PaymentProduct`.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';
// providing paymentProduct and accountOnFile via constructor.
const paymentRequest = new PaymentRequest(paymentProduct, accountOnFile);

// or using setAccountOnFile method:
paymentRequest.setAccountOnFile(accountOnFile);
```

### PaymentRequestField

Payment request fields are represented by instances of `PaymentRequestField`. Each field
provides methods to set and retrieve values, get the field label, obtain masked values for display,
and validate user input against the field's restrictions.

#### Set field values to the payment request

Once a payment request has been created, the values for the payment request fields can be
supplied as follows.

```typescript
paymentRequest.getField('cardNumber').setValue('1245 1254 4575 45');
paymentRequest.getField('cvv').setValue('123');
```

#### Validate field values

Once a value is set, it can be validated. The system will validate the value using predefined
data restrictions set on each field. This ensures only valid values could be encrypted for the
payment request.

```typescript
const field = paymentRequest.getField('cardNumber');
field.setValue('1245 1254 4575 45');
if (field.validate().isValid) {
    // the value is in the correct format.
}

// or use chained methods
paymentRequest.getField('cvv').setValue('123').validate();
```

#### Validate payment request

Once all values have been supplied, the payment request can be validated. The `PaymentRequest` calls
validation on each of its `PaymentRequestField` instances, which use their internal
`DataRestrictions` and validation logic to verify that field values meet all requirements. After the
validation, a list of errors is returned, with errors specifying which requirements were
not met for each field. If there are no errors, the payment request can be encrypted
and sent to our platform via your e-commerce server. If there are validation errors, the customer
should be provided with feedback about these errors as explained above. Each
`ValidationErrorMessage` contains the error message and error type for each field to help display
appropriate feedback.

```typescript
const validationErrorMessages = paymentRequest.validate();

if (validationErrorMessages.length) {
    console.log('the following fields are invalid', validationErrorMessages);
}
```

Validations are defined in the `PaymentProductField` (contained within each `PaymentRequestField`)
and return `ValidationErrorMessage` such as:

```typescript
paymentRequest.setValue('cardNumber', '456735000042797');
paymentRequest.validate();
/*
 * {
 *      errorMessage: "Card number is in invalid format.",
 *      paymentProductFieldId: "cardNumber",
 *      type: "luhn"
 *  }
 */
```

#### AccountOnFile with READ_ONLY fields

When no `AccountOnFile` is selected for the specific `PaymentRequest`, all payment request fields(
such as cardNumber) are writable and can be set normally.
Once an `AccountOnFile` is set on the `PaymentRequest`, the SDK enforces the following behavior:

- All previously set unwritable field values are cleared from the `PaymentRequest`.
- Read-only fields cannot be set manually anymore. Calling setter will throw `InvalidArgumentError`.
- Calling `paymentRequest.getField(readOnlyFieldId).getValue()` will return `undefined`.

This ensures only values that can be changed are submitted.

#### Encrypt payment request

When the `PaymentRequest` has been initialized with the selected payment product, the payment
product field values, potentially the selected account on file info and tokenization info, you can
encrypt it by calling `sdk.encryptPaymentRequest(request)`:

> Although it's possible to use your own encryption algorithms to encrypt a payment request, we
> advise you to use the encryption functionality offered by the SDK.

When the `sdk.encryptPaymentRequest` runs, the `PaymentRequest` is first validated for potential
issues with the data. This makes sure we're not spending time encrypting invalid data that our
platform will not be able to process in the Server API.

### CreditCardTokenRequest

This class is used to create a Card Tokenization request. It contains the essential credit card
fields: card number, cardholder name, expiry date, cvv, and payment product id.

```typescript
const tokenRequest = new CreditCardTokenRequest();

tokenRequest.setCardholderName('test');
tokenRequest.setExpiryDate('122026');
tokenRequest.setCardNumber('12451254457545');
tokenRequest.setSecurityCode('123');
tokenRequest.setProductPaymentId(1);
```

Note that there are no validation rules applied for values set in the token request since it is
detached from the instance of the payment product. This class is meant to be used as a helper for
encrypting data required for creating a token using Server SDK. However, if the invalid data is
provided, the Create Token request will fail.

#### Encrypt token request

```typescript
sdk.encryptTokenRequest(tokenRequest)
    .then((encryptedRequest) => {
        /*
         * enrcyptedRequest is the encrypted token request which can safely be send to your
         * server.
         * It consists of two parts: encryptedFields and encodedClientMetaInfo.
         */
    })
    .catch((err) => {
        // token request can not be encrypted, handle error state
    });
```

### IINDetails

The first six digits of a payment card number are known as the **Issuer Identification Number
(IIN)**. The `sdk.getIinDetails()` call can be used to retrieve the payment product and network that
are associated with the provided IIN.

An instance of `OnlinePaymentsSdk` can be used to check which payment product is associated with an
IIN. The result of this check is an instance of `IinDetailsResponse`. This class has a property
`status` that indicates the result of the check and a property `paymentProductId` that indicates
which payment product is associated with the IIN, if recognized.

The property status can have several values:

- `"SUPPORTED"` indicates that the IIN is associated with a payment product supported by our
  platform.
- `"UNKNOWN"` indicates that the IIN is not recognized.
- `"NOT_ENOUGH_DIGITS"` indicates that fewer than six digits have been provided, and that the IIN
  check cannot be performed.
- `"EXISTING_BUT_NOT_ALLOWED"` indicates that the provided IIN is recognized, but that the
  corresponding product is not allowed for the current payment or merchant.

```typescript
const partialCreditCardNumber = '456735';
const paymentContext: PaymentContextWithAmount = {
    countryCode: 'BE',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
    isRecurring: false,
};

sdk.getIinDetails(partialCreditCardNumber, paymentContext)
    .then((response) => {
        // response is an instance of `IinDetailsResponse`
        const isSupported = response.status === IinDetailsStatus.SUPPORTED;

        // the list of co-brands, if available:
        const coBrands = response.coBrands;
    })
    .catch((error) => {
        // handle error state
    });
```

Some cards are co-branded and could be processed as either a local card _(with a local brand)_ or an
international card _(with an international brand)_. In case you are not set up to process these
local cards, this API call will not return that card type in its response. As soon as the first
six digits of the card number have been captured, you can use the method `sdk.getIinDetails()`
to verify the card type and check if you can accept this card. The returned `paymentProductId` can
be used to retrieve the payment product and provide visual feedback to the user by showing the
appropriate payment product logo.

### Masking

To help in formatting field values based on masks, the SDK offers a base set of masking functions in
`PaymentProductField`.

```typescript
const field = paymentProduct.getField('cardNumber');
// applying mask on a field.
field.applyMask('1234123412341234');

// removing mask from a field.
field.removeMask('1234 1234 1234 1234');

// getting masked value from `PaymentRequestField`
const maskedValue = paymentRequest.getField('cardNumber').getMaskedValue();
```

## Payment steps

Setting up and completing a payment using the JavaScript SDK involves the following steps:

### 1. Initialize the JavaScript SDK for this payment

This is done using information such as _session and customer identifiers_, connection URLs and
payment information like currency and total amount.

```typescript
import { init, PaymentContext } from 'onlinepayments-sdk-client-js';

// create sdk
const sdk = init({
    clientSessionId: '47e9dc332ca24273818be2a46072e006',
    customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
    clientApiUrl: 'https://clientapi.com',
    assetUrl: 'https://asset.com',
});

// payment information
const paymentContext: PaymentContext = {
    countryCode: 'NL',
    amountOfMoney: {
        amount: 1000,
        currencyCode: 'EUR',
    },
};
```

> A successful response from Create Session can be used directly as input for the SDK init method.

- `clientSessionId` / `customerId` properties are used for authentication. These can be
  obtained by your e-commerce server using one of the Server SDKs or directly using the Create
  Session API.
- The `clientApiUrl` and `assetUrl` that the SDK should connect to. The SDK communicates with two
  types of servers to perform its tasks. One type of server offers the Client API discussed above,
  and the other type of server stores the static resources used by the SDK, such as the logos of
  payment products.
- _Payment information_ (`paymentContext`): This information is not needed to construct an SDK,
  but you will need to provide it when requesting any payment product information. The payment
  products that the customer can choose from depend on payment information, so the Client SDK needs
  this information to be able to do its job.
  What is needed is:
    - the total amount of the payment, defined as property `amountOfMoney.amount`
    - the currency that should be used, defined as property `amountOfMoney.currencyCode`
    - the country of the person that is performing the payment, defined as property `countryCode`
    - whether the payment is a single payment or a recurring payment.

### 2. Retrieve the payment products

Retrieve the payment products and accounts on file that can be used for this payment from the Client
API. Your application can use this data to create the payment product selection screen.

```typescript
sdk.getBasicPaymentProducts(paymentContext)
    .then(({ paymentProducts, accountsOnFile }) => {
        // list of `BasicPaymentProduct`
        console.log(paymentProducts);
    })
    .catch(console.error);
```

After initialization, the JavaScript SDK offers easy access to all the payment items that can be
used for this payment. Payment products are instances of BasicPaymentProduct. Your app can use these
products to create a screen that lists them all.

For some payment products, customers can indicate that they want our platform to store part of the
data they enter while using such a payment product. For example, it is possible to store the
cardholder name and the card number for most credit card payment products. The stored data is
referred to as an account on file or token. When the customer wants to use the same payment
product for another payment, it is possible to select one of the stored accounts on file for
this payment. In such cases, the customer doesn't have to enter the information already stored in
the account on file. The list of available payment products that the SDK receives from the
Client API also contains the accounts on file for each payment product. Your application can  
present this list of payment products and accounts on file to the customer.

### 3. Retrieve payment product details

Retrieve all the details about the payment product fields from the Client API that the customer
needs to provide based on the selected payment product or account on file. Your application can
use this information to create the payment product details screen.

```typescript
// you can use ID from the selected payment product retrieved in the previous step
const paymentProductId = 1;
try {
    let paymentProduct = await sdk.getPaymentProduct(id, paymentContext);
    renderFields(paymentProduct.getFields());
} catch (e) {
    // handle error
    console.error(e);
}

function renderFields(fields: PaymentProductField[]) {
    // each field value needs to be set to the `paymentRequest` with `setValue`
    // example: `paymentRequest.getField('cardholderName').setValue(form.cardholderName)`
    // .. render fields to screen
}
```

Once the customer has selected a payment item or a stored account on file, the SDK can request which
information needs to be provided by the customer to perform a payment. When a single product is
retrieved, the SDK provides a list of all the fields that should be rendered, including display
hints and validation rules. If the customer selected an account on file, information already in
this account on file can be prefilled in the input fields, instead of requesting it from the
customer. The data that can be stored and prefilled on behalf of the customer is, of course, in
line with applicable regulation. For a credit card transaction, for instance, the customer is
still expected to input the CVC.
Again, the example app can be used as the starting point to create your screen. If there is no
additional information that needs to be entered, this screen can be skipped.

### 4. Encrypt payment information

Encrypt all the provided payment information with `sdk.encryptPaymentRequest`. Your application
sends the encrypted result to your e-commerce server, which sends it to the Server API.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentRequest = new PaymentRequest(paymentProduct);
// get field value from your input component
paymentRequest.getField('cardholderName').setValue('John Do');
// set other fields...

const validationErrorMessages = paymentRequest.validate();

if (validationMessages.lenght) {
    // display errors to the user.
} else {
    sdk.encryptPaymentRequest(paymentRequest)
        .then((encryptedRequest: EncryptedRequest) => {
            // encryptedRequest.encryptedCustomerInput can be used to send the encrypted input data
            // to the Server SDK to create a payment
        })
        .catch(console.error);
}
```

All the heavy lifting, such as requesting a public key from the Client API, performing the
encryption, and BASE-64 encoding the result into one string, is done for you by the SDK. You
only need to make sure that the `PaymentRequest` object contains all the information entered by
the user. The encrypted payload needs to be sent to your e-commerce server where it can be
forwarded to the Server API.

### 5. Response from the Server API call

It's up to you and your application to show the customer the correct screens based on the response
of the Server API call. In some cases, the payment hasn't finished just yet as the customer must
be redirected to a third party (such as a bank or PayPal) to authorize the payment. See the
Server API documentation on what kinds of responses the Server API can provide. The Client API
has no part in the remainder of the payment.

## Testing

This library contains unit- and integration tests written with [Vitest](https://vitest.dev).
Vitest starts in _watch mode_ by default in development environment and _run mode_ in CI
environment _(when `process.env.CI` presents)_
smartly, [see documentation](https://vitest.dev/guide/features.html#watch-mode).

### Unit tests

Testing input and output of small isolated functions (units) can be found in `./tests/unit`.
You don't need to expose any environment variables to execute unit tests, you can run them by using:

```bash
yarn run test
```
