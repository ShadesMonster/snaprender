export class AppError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function formatError(code, message, extra = {}) {
  return {
    error: {
      code,
      message,
      ...extra,
    },
  };
}

export const ErrorCodes = {
  INVALID_API_KEY: 'invalid_api_key',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  USAGE_LIMIT_EXCEEDED: 'usage_limit_exceeded',
  INVALID_REQUEST: 'invalid_request',
  RENDERING_FAILED: 'rendering_failed',
  INTERNAL_ERROR: 'internal_error',
};
