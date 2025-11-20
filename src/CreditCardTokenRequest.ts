export class CreditCardTokenRequest {
    #cardNumber?: string;
    #cardholderName?: string;
    #expiryDate?: string;
    #securityCode?: string;
    #paymentProductId?: number;

    /**
     * Sets the card number for token request.
     *
     * @param {string | undefined} cardNumber
     */
    setCardNumber(cardNumber?: string): void {
        this.#cardNumber = cardNumber;
    }

    /**
     * Sets the cardholder name for token request.
     *
     * @param {string | undefined} cardholderName
     */
    setCardholderName(cardholderName?: string): void {
        this.#cardholderName = cardholderName;
    }

    /**
     * Sets the expiry date for token request.
     *
     * @param {string | undefined} expiryDate
     */
    setExpiryDate(expiryDate?: string): void {
        this.#expiryDate = expiryDate;
    }

    /**
     * Sets the security code (cvv) for token request.
     *
     * @param {string | undefined} securityCode
     */
    setSecurityCode(securityCode?: string): void {
        this.#securityCode = securityCode;
    }

    /**
     * Sets the payment product id for token request.
     *
     * @param {number | undefined} paymentProductId
     */
    setProductPaymentId(paymentProductId?: number): void {
        this.#paymentProductId = paymentProductId;
    }

    /**
     * Returns the card number for token request.
     *
     *  @returns {string | undefined}
     */
    getCardNumber(): string | undefined {
        return this.#cardNumber;
    }

    /**
     * Returns the cardholder name for token request.
     *
     *  @returns {string | undefined}
     */
    getCardholderName(): string | undefined {
        return this.#cardholderName;
    }

    /**
     * Return the expiry date for token request.
     *
     *  @returns {string | undefined}
     */
    getExpiryDate(): string | undefined {
        return this.#expiryDate;
    }

    /**
     * Returns the security code (cvv) for token request.
     *
     *  @returns {string | undefined}
     */
    getSecurityCode(): string | undefined {
        return this.#securityCode;
    }

    /**
     * Returns the payment product ID for token request.
     *
     *  @returns {number | undefined}
     */
    getPaymentProductId(): number | undefined {
        return this.#paymentProductId;
    }

    /**
     * Retrieves all values in the token request as a record.
     *
     * @returns {Record<string, string | number | undefined>} The raw value of the field, or undefined if not set.
     */
    getValues(): Record<string, string | number | undefined> {
        return {
            cardNumber: this.#cardNumber,
            cardholderName: this.#cardholderName,
            expiryDate: this.#expiryDate,
            cvv: this.#securityCode,
            paymentProductId: this.#paymentProductId,
        };
    }
}
