export abstract class InfraError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 500,
  ) {
    super(message);
  }

  get name() {
    return this.constructor.name;
  }
}
