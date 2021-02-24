# Ingenico Direct JavaScript SDK

The JavaScript SDK helps you to communicate with the [Ingenico Direct](https://support.direct.ingenico.com/) Client API. It's primary features are:

* Handling of all the details concerning the encryption of the payment details,
* Convenient JavaScript wrapper around the API calls and responses,
* Localization of various labels and messages,
* User-friendly formatting (masking) of payment data such as card numbers and expiry dates,
* Validation of input, and
* A check to determine to which payment provider a card number is associated.

## Usage

See the [Ingenico Direct Support Site](https://support.direct.ingenico.com/documentation/sdk/mobile/javascript/) for more information on how to use the SDK.

## Development

### Requirements
1. Node v12+
2. NPM v6+

### Installation

From the root of the project run `npm ci` to install the required dependencies.

### Build

Run `npm run build`.

A distributable folder, `/dist/`, will be created, containing both an original and minified version of:
- `directsdk.noEncrypt.js` - Fully bundled SDK source without the encryption components (default)
- `directsdk.js` - Fully bundled SDK source 