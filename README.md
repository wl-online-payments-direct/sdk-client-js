# Online Payments JavaScript SDK

The JavaScript SDK helps you to communicate with the Online Payments client API. It's primary features are:

* Handling of all the details concerning the encryption of the payment details,
* Convenient JavaScript wrapper around the API calls and responses,
* Localization of various labels and messages,
* User-friendly formatting (masking) of payment data such as card numbers and expiry dates,
* Validation of input, and
* A check to determine to which payment provider a card number is associated.

## Development

### Requirements
1. Node v12+
2. NPM v6+

### Installation

From the root of the project run `npm ci` to install the required dependencies.

### Build

Run `npm run build`.

A distributable folder, `/dist/`, will be created, containing both an original and minified version of:
- `onnlinepaymentssdk.noEncrypt.js` - Fully bundled SDK source without the encryption components (default)
- `onlinepaymentsdk.js` - Fully bundled SDK source 