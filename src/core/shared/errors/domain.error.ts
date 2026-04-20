export abstract class DomainError extends Error {
    constructor(message: string) {
        super(message);
    }

    get name() {
        return this.constructor.name;
    }

    statusCode = 400;
}