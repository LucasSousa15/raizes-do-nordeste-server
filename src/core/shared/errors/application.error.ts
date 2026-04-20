export abstract class ApplicationError extends Error {
    constructor(message: string,
        readonly statusCode: number = 400
    ) {
        super(message);
    }

    get name() {
        return this.constructor.name;
    }
}