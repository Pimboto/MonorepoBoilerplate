import { describe, expect, it } from 'vitest';
import {
  AuthenticationError,
  BadRequestError,
  DomainError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../domain.errors';

describe('DomainError', () => {
  it('should store message, code, statusCode, and details', () => {
    const details = { key: 'value' };
    const error = new DomainError('test error', 'TEST_CODE', 418, details);

    expect(error.message).toBe('test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(418);
    expect(error.details).toEqual(details);
  });

  it('should set name to the constructor name', () => {
    const error = new DomainError('msg', 'CODE', 500);
    expect(error.name).toBe('DomainError');
  });

  it('should be an instance of Error', () => {
    const error = new DomainError('msg', 'CODE', 500);
    expect(error).toBeInstanceOf(Error);
  });

  it('should leave details undefined when not provided', () => {
    const error = new DomainError('msg', 'CODE', 500);
    expect(error.details).toBeUndefined();
  });
});

describe('NotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new NotFoundError('entity missing');

    expect(error.message).toBe('entity missing');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('should extend DomainError', () => {
    const error = new NotFoundError('not here');
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe('ForbiddenError', () => {
  it('should have code FORBIDDEN and status 403', () => {
    const error = new ForbiddenError('access denied');

    expect(error.message).toBe('access denied');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('ForbiddenError');
  });

  it('should extend DomainError', () => {
    const error = new ForbiddenError('no');
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe('BadRequestError', () => {
  it('should have code BAD_REQUEST and status 400', () => {
    const error = new BadRequestError('invalid input');

    expect(error.message).toBe('invalid input');
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('BadRequestError');
  });

  it('should accept optional details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new BadRequestError('bad', details);
    expect(error.details).toEqual(details);
  });

  it('should leave details undefined when not provided', () => {
    const error = new BadRequestError('bad');
    expect(error.details).toBeUndefined();
  });
});

describe('ValidationError', () => {
  it('should have code BAD_USER_INPUT and status 400', () => {
    const error = new ValidationError('validation failed');

    expect(error.message).toBe('validation failed');
    expect(error.code).toBe('BAD_USER_INPUT');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('should store fields and expose them as details', () => {
    const fields = { email: 'required', name: 'too short' };
    const error = new ValidationError('validation failed', fields);

    expect(error.fields).toEqual(fields);
    expect(error.details).toEqual(fields);
  });

  it('should leave fields undefined when not provided', () => {
    const error = new ValidationError('invalid');
    expect(error.fields).toBeUndefined();
  });
});

describe('AuthenticationError', () => {
  it('should have code UNAUTHENTICATED and status 401', () => {
    const error = new AuthenticationError('not logged in');

    expect(error.message).toBe('not logged in');
    expect(error.code).toBe('UNAUTHENTICATED');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthenticationError');
  });

  it('should extend DomainError', () => {
    const error = new AuthenticationError('nope');
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe('InternalServerError', () => {
  it('should have code INTERNAL_SERVER_ERROR and status 500', () => {
    const error = new InternalServerError('something broke');

    expect(error.message).toBe('something broke');
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('InternalServerError');
  });

  it('should extend DomainError', () => {
    const error = new InternalServerError('boom');
    expect(error).toBeInstanceOf(DomainError);
  });
});
