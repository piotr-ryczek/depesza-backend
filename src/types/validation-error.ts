import ErrorCode from 'src/lib/error-code';

export type ValidationError = {
  field: string;
  message: ErrorCode;
};
