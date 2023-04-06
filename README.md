# Online Payments JavaScript SDK

The Online Payments JavaScript SDK helps you with accepting payments on your website, through the Online Payments platform.

The SDKs’ main functions is to establish a secure channel between your web app and our server. This channel processes security credentials to guarantee the safe transit of your customers’ data during the payment process.

**The OnlinePayments SDK helps you with**

- handling of encryption of payment context
- convenient JavaScript wrappers for API responses
- user-friendly formatting of payment data such as card numbers and expiry dates
- validation of input
- determining to which payment provider a card number is associated

## Table of Contents

[[_TOC_]]

## Requirements

The minimum supported browser versions are based on the latest implemented feature of ["private class fields"](https://caniuse.com/?search=private%20class%20fields):

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

Install this SDK using your preferred node package manager `npm`, `yarn` or `pnpm`.

```bash
npm install onlinepayments-sdk-client-js
```

## Distributed packages

The SDK can be used as UMD module or as ES module.

### Usage Universal Module Definition (UMD)

The SDK is available under global namespace `onlinepaymentssdk` and can be used in the following way:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <script src="./node_modules/onlinepayments-sdk-client-js/dist/onlinepayments-sdk-client-js.umd.js"></script>
    <script>
      const session = new window.onlinepaymentssdk.Session({
        ...
      })
    </script>
  </body>
</html>
```

### Usage ES module (ESM)

Most bundlers (webpack, rollup, parcel, etc.) support ES Modules. The SDK can be imported in the following way:

```js
import { Session } from 'onlinepayments-sdk-client-js';
```

## Getting started

To accept your first payment using the SDK, complete the steps below. Also see the section "Payment Steps" for more details on these steps.

1. Request your server to create a Client Session, using the Server API create Client Session call. Return the session details to your web app.
2. Initialize the SDK with the session details

```typescript
import { Session } from 'onlinepayments-sdk-client-js';

const session = new Session({
  clientSessionId: '47e9dc332ca24273818be2a46072e006',
  customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
  clientApiUrl: 'https://clientapi.com',
  assetUrl: 'https://asset.com',
});
```

3. Use the session to retrieve the available Payment Products for a provided context. Display the BasicPaymentProduct and accountsOnFile lists and request your customer to select one.

```typescript
session
  .getBasicPaymentItems({
    countryCode: 'BE',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
    locale: 'nl_BE',
    isRecurring: false,
  })
  .then((basicPaymentItems) => {
    const {
      basicPaymentItems, // array of `BasicPaymentProduct`
      accountsOnFile, // array of `AccountOnFile`
      json, // raw JSON (returned from server)
      paymentProductById, // method to get basicPaymentItem when id is known
      basicPaymentProductByAccountOnFileId, // method to get the corresponding product, based on the provided Account on File ID
    } = basicPaymentItems;

    // Display the contents of basicPaymentItems & accountsOnFile to your user
  })
  .catch((err) => {
    // when promise rejects, inform user what happened
  });
```

4. Make a call for the selected product to retrieve what information should be asked from your customer. Display the returned field information to your user to request their details.

```typescript
session
  .getPaymentProduct(1, paymentContext)
  .then((paymentProduct) => {
    const {
      paymentProductFields, // array of all the fields the user needs to fill out.
      paymentProductFieldById, // method return `PaymentProductField` by given id
      json, // raw server response from internal call
    } = paymentProduct;

    // Display the fields in paymentProductFields to your user.
  })
  .catch((error) => {
    // handle error state
  });
```

5. While the user is filling out their details, save them to a `PaymentRequest`.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentRequest = new PaymentRequest();
paymentRequest.setPaymentProduct(paymentProduct);
paymentRequest.setValue('cardNumber', '1245 1254 4575 45');
paymentRequest.setValue('cvv', '123');
paymentRequest.setValue('expiryDate', '12/25');
```

6. Validate and encrypt the payment request, and send the encrypted customer data to your server.

```typescript
const encryptor = session.getEncryptor();
encryptor
  .encrypt(paymentRequest)
  .then((payload) => {
    // payload is the encrypted payment request which can safely be send to your server
  })
  .catch((err) => {
    // payment request can not be encrypted, handle error state
  });
```

7. From your server, make a create payment request, providing the encrypted data in the `encryptedCustomerInput` field.

## Type definitions

### Session

For all interaction with the SDK an instance of Session is required. The following code fragment shows how `Session` is initialized. The session details are obtained by performing a create Client Session call via the Server API.

```typescript
import { Session } from 'onlinepayments-sdk-client-js';

const session = new Session({
  clientSessionId: '47e9dc332ca24273818be2a46072e006',
  customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
  clientApiUrl: 'https://clientapi.com',
  assetUrl: 'https://asset.com',
});
```

Almost all methods that are offered by `Session` are simple wrappers around the Client API. They make the request and convert the response to JavaScript objects that may contain convenience functions.

If you just want the raw JSON without all the extra SDK details then you can always get that via the json field of those objects.

### PaymentContext

`PaymentContext` is an object that contains the context/settings of the upcoming payment. It is required as argument to some of the methods of the `Session` instance. This object can contain the following details:

```typescript
export interface PaymentContext {
  countryCode: string; // ISO 3166-1 alpha-2 country code
  amountOfMoney: {
    amount: number; // Total amount in the smallest denominator of the currency
    currencyCode: string; // ISO 4217 currency code
  };
  isRecurring?: boolean; // Set `true` when payment is recurring. Default false.
  locale?: string; // IETF Language Tag + ISO 15897, example: 'nl_NL'
}
```

This interface can be imported as type when using TypeScript:

```typescript
import type { PaymentContext } from 'onlinepayments-sdk-client-js';

const paymentContext: PaymentContext = {
  // ...
};
```

### BasicPaymentItems

This object contains the available Payment Items for the current payment. Use the `getBasicPaymentItems` function on `Session` to request the data.

The object you will receive is `BasicPaymentItems` which contains two lists for all available `BasicPaymentProduct`s and `AccountOnFile`s. These items should be displayed to the user, so that they can select their preferred payment method.

The code fragment below shows how to get the `BasicPaymentItems` instance.

```typescript
session
  .getBasicPaymentItems(paymentContext)
  .then((basicPaymentItems) => {
    const {
      basicPaymentItems, // array of `BasicPaymentProduct`
      accountsOnFile, // array of `AccountOnFile`
      json, // raw JSON (returned from server)
      paymentProductById, // method to get basicPaymentItem when id is known
      basicPaymentProductByAccountOnFileId, // method to get basicPaymentItem when account
    } = basicPaymentItems;
  })
  .catch((err) => {
    // when promise rejects, inform user what happened
  });
```

### BasicPaymentProduct

The SDK offers two types to represent information about payment products: `BasicPaymentProduct` and `PaymentProduct`. Practically speaking, instances of `BasicPaymentProduct` contain only the information that is required to display a simple list of payment products from which the user can select one.

The type `PaymentProduct` contains additional information such as the individual form fields that the user needs to fill out. This type is typically used when creating a form that asks the user for their details. See the [PaymentProduct](#PaymentProduct) section for more info.

Below is an example for how to obtain display names and assets for the Visa product.

```typescript
const basicPaymentProduct = basicPaymentItems.basicPaymentItemById[1];

basicPaymentProduct.id; // 1
basicPaymentProduct.displayHints.label; // VISA
basicPaymentProduct.displayHints.logo; // http://www.domain.com/path/to/visa/logo.gif
basicPaymentProduct.accountOnFileById[1].getMaskedValueByAttributeKey['alias']
  .value; // **** **** **** 1234
```

### AccountOnFile

An instance of `AccountOnFile` represents information about a stored card product for the current user. Available Account on File IDs for the current payment must be provided in the body of the server create Client Session call.

The code fragment below shows how display data for an account on file can be retrieved. This label can be shown to the customer, along with the logo of the corresponding payment product.

```typescript
// This contains all available accounts on file for the payment product.
basicPaymentProduct.accountsOnFile;

// This contains all accounts on file for payment product VISA
const aof = basicPaymentItems.basicPaymentItemById[1].accountsOnFile;

// This shows a mask based nicely formatted value for that obfuscated cardNumber.
// The mask that is used is defined in the displayHints of this account on file.
// If the mask was {{9999}} {{9999}} {{9999}} {{9999}} {{999}} then the result would be
// **** **** **** 7412
const maskedValue = aof.getMaskedValueByAttributeKey('cardNumber');
```

### PaymentProduct

`BasicPaymentProduct` only contains the information required by a customer to distinguish one payment product from another. However, once a payment item or an account on file has been selected, the customer must provide additional information, such as a bank account number, a credit card number, or an expiry date, before a payment can be processed. Each payment item can have several fields that need to be completed to process a payment. Instances of `BasicPaymentProduct` do not contain any information about these fields.

Information about the fields of payment products is represented by instances of `PaymentProductField`, which are contained in instances of `PaymentProduct`. The class `PaymentProductField` is described below. The session component can be used to retrieve instances of PaymentProduct, as shown in the following code fragment.

```typescript
session
  .getPaymentProduct(1, paymentContext)
  .then((paymentProduct) => {
    const {
      paymentProductFields, // array of all the fields the user still needs to fill out
      paymentProductFieldById, // method return `PaymentProductField` by given id
      json, // raw server response from internal call
    } = paymentProduct;
  })
  .catch((error) => {
    // handle error state
  });
```

### PaymentProductField

The fields of payment products are represented by instances of `PaymentProductField`. Each field has an identifier, a type, a definition of restrictions that apply to the value of the field, and information about how the field should be presented graphically to the customer. Additionally, an instance of a field can be used to determine whether a given value is valid for the field.

In the code fragment below, the field with identifier `“cvv”` is retrieved from a payment product. The data restrictions of the field are inspected to see whether this field is a required field or an optional field. Additionally, the display hints of the field are inspected to see whether the values a customer provides should be obfuscated in a user interface.

```typescript
const cvvField = paymentProduct.paymentProductFieldById['cvv'];

cvvField.dataRestrictions.isRequired; // state if value is required
cvvField.displayHints.obfuscate; // state if needs to be obfuscated
```

### PaymentRequest

Once a payment product has been selected and an instance of `PaymentProduct` has been retrieved, a payment request can be constructed. This class must be used as a container for all the values the customer provided.

A payment request can be instantiated using the `PaymentRequest`

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentRequest = new PaymentRequest();
```

#### Tokenize payment request

A `PaymentProduct` has a property `tokenize`, which is used to indicate whether a payment request should be stored as an account on file. The code fragment below shows how a payment request should be constructed when the request should not be stored as an account on file.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

// create payment requet
const paymentRequest = new PaymentRequest();
paymentRequest.setPaymentProduct(paymentProduct);
paymentRequest.setTokenize(false);
```

If the customer selected an account on file, both the account on file and the corresponding payment product must be supplied while constructing the payment request, as shown below. Instances of `AccountOnFile` can be retrieved from instances of `BasicPaymentProduct` and `PaymentProduct`.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentRequest = new PaymentRequest();

// paymentProduct is an instance of the `PaymentProduct` class (not `BasicPaymentProduct`)
paymentRequest.setPaymentProduct(paymentProduct);

// accountOnFile is an instance of the `AccountOnFile` class
paymentRequest.setAccountOnFile(accountOnFile);
paymentRequest.setTokenize(false);
```

#### Set field values to payment request

Once a payment request has been configured, the values for the payment product's fields can be supplied as follows. The identifiers of the fields, such as “cardNumber” and “cvv” in the example below, are used to set the values of the fields using the payment request.

```typescript
paymentRequest.setValue('cardNumber', '1245 1254 4575 45');
paymentRequest.setValue('cvv', '123');
```

#### Validate payment request

Once all values have been supplied, the payment request can be validated. Behind the scenes the validation uses the `DataRestrictions` class for each of the fields that were added to the `PaymentRequest`. After the validation, a list of errors is available, which indicates the problems that occurred during validation. If there are no errors, the payment request can be encrypted and sent to our platform via your e-commerce server. If there are validation errors, the customer should be provided with feedback about these errors as explained above.

```typescript
const { isValid, getErrorMessageIds } = paymentRequest;

if (!isValid()) {
  console.log('the following fields are invalid', getErrorMessageIds());
}
```

The validations are the `PaymentProductFieldValidators` linked to the `PaymentProductFields` and are returned as value, for example:

```typescript
paymentRequest.setValue('cardNumber', '456735000042797');
paymentRequest.getErrorMessageIds(); // ['luhn'];
```

#### Encrypt payment request

When the `PaymentRequest` has been initialised with the selected payment product, the payment product field values, potentially the selected account on file info and tokenization info, you can encrypt it by accessing the`Encryptor` class using `session.getEncryptor`:

```typescript
const encryptor = session.getEncryptor();
encryptor
  .encrypt(paymentRequest)
  .then((payload) => {
    // payload is the encrypted payment request which can safely be send to the server
  })
  .catch((err) => {
    // payment request can not be encrypted, handle error state
  });
```

> Although it's possible to use your own encryption algorithms to encrypt a payment request, we advise you to use the encryption functionality that is offered by the SDK.

When the encryptor runs, the `PaymentRequest` is first validated for potential issues with the data. This makes sure we're not spending time encrypting invalid data that our platform will not be able to process in the Server API.

### IINDetails

The first six digits of a payment card number are known as the **Issuer Identification Number (IIN)**. The `session.iinDetails` call can be used to retrieve the payment product and network that are associated to the provided IIN.

An instance of `Session` can be used to check which payment product is associated with an IIN. The result of this check is an instance of `IINDetailsResponse`. This class has a property status that indicates the result of the check and a property `paymentProductId` that indicates which payment product is associated with the IIN.

The property status can have several values:

- `"SUPPORTED"` indicates that the IIN is associated with a payment product that is supported by our platform.
- `"UNKNOWN` indicates that the IIN is not recognized.
- `"NOT_ENOUGH_DIGITS"` indicates that fewer than six digits have been provided and that the IIN check cannot be performed.
- `"EXISTING_BUT_NOT_ALLOWED"` indicates that the provided IIN is recognized, but that the corresponding product is not allowed for the current payment.

```typescript
const partialCreditCardNumber = '456735';
const paymentContext = {
  // ...
};

session
  .getIinDetails(partialCreditCardNumber, paymentContext)
  .then((response) => {
    // response is an instance of `IinDetailsResponse`
    const isSupported = response.status === 'SUPPORTED';
  })
  .catch((error) => {
    // handle error state
  });
```

Some cards are dual branded and could be processed as either a local card _(with a local brand)_ or an international card _(with an international brand)_. In case you are not setup to process these local cards, this API call will not return that card type in its response. As soon as the first 6 digits of the card number have been captured you can use the method `session.getIinDetails` API to verify the card type and check if you can accept this card. The returned `paymentProductId` can be used to provide visual feedback to the user by
showing the appropriate payment product logo.

> **Note:** `paymentContext` is only optional when you have already called `session.getBasicPaymentItems` or `session.getPaymentProductNetworks`; then the `paymentContext` will be taken from the session.

### MaskingUtil

To help in formatting field values based on masks the SDk offers the `MaskingUtil` class. It allows you to apply and unapply masks on string.

```typescript
import { MaskingUtil } from 'onlinepayments-sdk-client-js';

const maskingUtil = new MaskingUtil();

const mask = '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}';
const value = '1234567890123456';

// apply masked value
const maskedString = maskingUtil.applyMask(mask, value);
const maskedValue = maskedString.getFormattedValue(); // "1234 5678 9012 3456"

// remove masked value
maskingUtil.removeMask(mask, maskedValue); // "1234567890123456"
```

## Payment steps

Setting up and completing a payment using the JavaScript SDK involves the following steps:

### 1. Initialize the JavaScript SDK for this payment

This is done using information such as _session and customer identifiers_, connection URLs and payment information like currency and total amount.

```typescript
import type { PaymentContext } from 'onlinepayments-sdk-client-js';
import { Session } from 'onlinepayments-sdk-client-js';

// create session
const session = new Session({
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

> A successful response from Create Session can be used directly as input for the Session constructor.

- `clientSessionId` / `customerId` properties are used for authentication purposes. These can be obtained by your e-commerce server using on of the Server SDKs or directly using the Create Session API.
- The `clientApiUrl` and `assetUrl` that the SDK should connect to. The SDK communicates with two types of servers to perform its tasks. One type of server offers the Client API discussed above, and the other type of server stores the static resources used by the SDK, such as the logos of payment products.
- _Payment information_ (`paymentContext`): This information is not needed to construct a session, but you will need to provide it when requesting any payment product information. The payment products that the customer can choose from depends on payment information so the Client SDK needs this information to be able to do its job. What is needed is:
  - the total amount of the payment, defined as property `amountOfMoney.amount`
  - the currency that should be used, defined as property `amountOfMoney.currencyCode`
  - the country of the person that is performing the payment, defined as property `countryCode`
  - whether the payment is a single payment or a recurring payment.

### 2. Retrieve the payment items

Retrieve the payment items and accounts on file that can be used for this payment from the Client API. Your application can use this data to create the payment product selection screen.

```typescript
session
  .getBasicPaymentItems(paymentContext)
  .then(({ basicPaymentItems }) => {
    console.log(basicPaymentItems);
    // list of `BasicPaymentProduct`
    // see `import('onlinepaymentssdk').BasicPaymentProduct`
  })
  .catch(console.error);
```

After initialization, the JavaScript SDK offers easy access to all the payment items that can be used for this payment. Payment items are instances of BasicPaymentProduct. Your app can use these items to create a screen that lists them all.

For some payment products, customers can indicate that they want our platform to store part of the data they enter while using such a payment product. For example, it is possible to store the card holder name and the card number for most credit card payment products. The stored data is referred to as an account on file or token. When the customer wants to use the same payment product for another payment, it is possible to select one of the stored accounts on file for this payment. In such cases, the customer doesn't have to enter the information that is already stored in the account on file. The list of available payment products that the SDK receives from the Client API also contains the accounts on file for each payment product. Your application can present this list of payment products and accounts on file to the customer.

### 3. Retrieve payment product details

Retrieve all the details about the payment product fields from the Client API that the customer needs to provide based on the selected payment product or account on file. Your application can use this information to create the payment product details screen.

```typescript
import type {
  PaymentProduct,
  PaymentProductField,
} from 'onlinepayments-sdk-client-js';
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentItemId = 1; // could be extracted from url path

// create an instance of PaymentRequest to build the request
const paymentRequest = new PaymentRequest();

function renderField(field: PaymentProductField) {
  // each field value needs to be set to the `paymentRequest` with `setValue`
  // example: `paymentRequest.setValue('cardholderName', 'John Do')`
  // .. render field to screen
}

session
  .getPaymentProduct(id, paymentContext)
  .then((paymentProduct: PaymentProduct) => {
    // attach the paymentProduct to the request
    paymentRequest.setPaymentProduct(paymentProduct);

    const { paymentProductFields, displayHints } = paymentProduct;

    // we can render the fields!!
    paymentProductFields.forEach(renderField);
  })
  .catch(console.error);
```

Once the customer has selected a payment item or a stored account on file, the SDK can request which information needs to be provided by the customer to perform a payment. When a single product is retrieved, the SDK provides a list of all the fields that should be rendered including display hints and validation rules. If the customer selected an account on file, information that is already in this account on file can be prefilled in the input fields, instead of requesting it from the customer. The data that can be stored and prefilled on behalf of the customer is, of course, in line with applicable regulation. For a credit card transaction, for instance, the customer is still expected to input the CVC. Again, the example app can be used as the starting point to create your screen. If there is no additional information that needs to be entered, this screen can be skipped.

### 4. Encrypt payment information

Encrypt all the provided payment information with `session.getEncryptor`. Your application sends the encrypted result to your e-commerce server, which sends it to the Server API.

```typescript
import { PaymentRequest } from 'onlinepayments-sdk-client-js';

const paymentRequest = new PaymentRequest();
paymentRequest.setPaymentProduct(paymentProduct);
paymentRequest.setValue('cardholderName', 'John Do');

if (!paymentRequest.isValid()) {
  throw new Error(`Errors found in ${paymentRequest.getErrorMessageIds()}`);
}

session
  .getEncryptor()
  .encrypt(paymentRequest)
  .then((encryptedPayload: string) => {
    // `encryptedPayload` can be use to send to the Server SDK to create a payment
  })
  .catch(console.error);
```

All the heavy lifting, such as requesting a public key from the Client API, performing the encryption and BASE-64 encoding the result into one string, is done for you by the SDK. You only need to make sure that the PaymentRequest object contains all the information entered by the user.
The encrypted payload needs to be sent to your e-commerce server where it can be forwarded to the Server API.

### 5. Response from the Server API call

It's up to you and your application to show the customer the correct screens based on the response of the Server API call. In some cases, the payment hasn't finished just yet as the customer must be redirected to a third party (such as a bank or PayPal) to authorise the payment. See the Server API documentation on what kinds of responses the Server API can provide. The Client API has no part in the remainder of the payment.

## Testing

This library contains unit- and integration tests written with [Vitest](https://vitest.dev).
Vitest starts in _watch mode_ by default in development environment and _run mode_ in CI
environment _(when `process.env.CI` presents)_ smartly, [see documentation](https://vitest.dev/guide/features.html#watch-mode).

### Unit tests

Testing input and output of small isolated functions (units) can be found in `./src/__test__/unit`.
You don't need to expose any environment variables in order to execute unit tests, you can run them by using:

```bash
npm run test
```
