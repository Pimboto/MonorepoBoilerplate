/**
 * Base class for all domain errors.
 * Pure TypeScript — no framework dependencies.
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string) {
    super(message, 'FORBIDDEN', 403);
  }
}

export class BadRequestError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BAD_REQUEST', 400, details);
  }
}

export class ValidationError extends DomainError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'BAD_USER_INPUT', 400, fields as Record<string, unknown>);
    this.fields = fields;
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string) {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class InternalServerError extends DomainError {
  constructor(message: string) {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}
