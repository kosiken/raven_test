

export enum ErrorType {
    EXISTS = 'EXISTS',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    INVALID_USER = 'INVALID_USER',
    INVALID_TOKEN = 'INVALID_TOKEN'
}

export class AppError extends Error {
    constructor(public errorType: ErrorType,  public error?: Error | undefined) {
      super(error?.message || 'No message');
    }
  }
