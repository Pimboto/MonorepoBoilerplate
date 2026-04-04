import { GraphQLError } from 'graphql';

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
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
}
