/**
 * Error thrown when encryption fails.
 */
export class EncryptionError extends Error {
    constructor(
        message: string,
        readonly errors: string[] = [],
    ) {
        super(message);
    }
}
