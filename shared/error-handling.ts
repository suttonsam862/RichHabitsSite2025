
export interface AppError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  statusCode: number;
  details?: Record<string, any>;
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
  userFriendlyMessage: string;
  details?: Record<string, any>;

  constructor(message: string, userFriendlyMessage?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.userFriendlyMessage = userFriendlyMessage || 'Please check your input and try again.';
    this.details = details;
  }
}

export class PaymentError extends Error implements AppError {
  code = 'PAYMENT_ERROR';
  statusCode = 400;
  userFriendlyMessage: string;
  details?: Record<string, any>;

  constructor(message: string, userFriendlyMessage?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'PaymentError';
    this.userFriendlyMessage = userFriendlyMessage || 'Payment processing failed. Please try again.';
    this.details = details;
  }
}

export class DatabaseError extends Error implements AppError {
  code = 'DATABASE_ERROR';
  statusCode = 500;
  userFriendlyMessage = 'A database error occurred. Please try again later.';
  details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'DatabaseError';
    this.details = details;
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof ValidationError || error instanceof PaymentError || error instanceof DatabaseError) {
    return error;
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userFriendlyMessage: 'An unexpected error occurred. Please try again.',
      statusCode: 500
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error occurred',
    userFriendlyMessage: 'An unexpected error occurred. Please try again.',
    statusCode: 500
  };
}
