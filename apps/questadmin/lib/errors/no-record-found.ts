
// lib/errors/NoRecordFoundError.ts
export class NoRecordFoundError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 404) {
        super(message);
        this.statusCode = statusCode;
    }
}
