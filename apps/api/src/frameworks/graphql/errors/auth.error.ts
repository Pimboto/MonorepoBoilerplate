import { GraphQLError } from 'graphql';
import type {
  AuthenticationError as DomainAuthenticationError,
  BadRequestError as DomainBadRequestError,
  DomainError,
  ForbiddenError as DomainForbiddenError,
  InternalServerError as DomainInternalServerError,
  NotFoundError as DomainNotFoundError,
  ValidationError as DomainValidationError,
} from '../../../core/errors';

/**
 * Converts a DomainError into a GraphQLError with proper extensions.
 * Use this in GraphQL resolvers to translate domain-layer errors
 * into the format Apollo Server expects.
 */
export function toGraphQLError(error: DomainError): GraphQLError {
  return new GraphQLError(error.message, {
    extensions: {
      code: error.code,
      http: { status: error.statusCode },
      ...(error.details ? { details: error.details } : {}),
    },
  });
}

/**
 * GraphQL-specific error classes.
 *
 * These extend GraphQLError so Apollo Server serialises them correctly.
 * Resolver code that already imports from this file keeps working
 * without any changes.
 */

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  static fromDomain(error: DomainAuthenticationError): AuthenticationError {
    return new AuthenticationError(error.message);
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 },
        fields,
      },
    });
  }

  static fromDomain(error: DomainValidationError): ValidationError {
    return new ValidationError(error.message, error.fields);
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }

  static fromDomain(error: DomainForbiddenError): ForbiddenError {
    return new ForbiddenError(error.message);
  }
}

export class BadRequestError extends GraphQLError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      extensions: {
        code: 'BAD_REQUEST',
        http: { status: 400 },
        details,
      },
    });
  }

  static fromDomain(error: DomainBadRequestError): BadRequestError {
    return new BadRequestError(error.message, error.details);
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }

  static fromDomain(error: DomainNotFoundError): NotFoundError {
    return new NotFoundError(error.message);
  }
}

export class InternalServerError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
      },
    });
  }

  static fromDomain(error: DomainInternalServerError): InternalServerError {
    return new InternalServerError(error.message);
  }
}
