/**
 * Custom error types for Clavix
 */

export class ClavixError extends Error {
  constructor(
    message: string,
    public readonly hint?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ClavixError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PermissionError extends ClavixError {
  constructor(message: string, hint?: string) {
    super(message, hint, 'PERMISSION_ERROR');
    this.name = 'PermissionError';
  }
}

export class ValidationError extends ClavixError {
  constructor(message: string, hint?: string) {
    super(message, hint, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class IntegrationError extends ClavixError {
  constructor(message: string, hint?: string) {
    super(message, hint, 'INTEGRATION_ERROR');
    this.name = 'IntegrationError';
  }
}

export class DataError extends ClavixError {
  constructor(message: string, hint?: string) {
    super(message, hint, 'DATA_ERROR');
    this.name = 'DataError';
  }
}
