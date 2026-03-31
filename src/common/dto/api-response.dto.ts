import { IPaginationMeta } from '@common/interfaces/pagination.interface';

export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: IPaginationMeta;
  error?: string;
  timestamp?: string;

  constructor(
    success: boolean,
    data?: T,
    message?: string,
    meta?: IPaginationMeta,
    error?: string,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.meta = meta;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success', meta?: IPaginationMeta) {
    return new ApiResponseDto(true, data, message, meta);
  }

  static error(error: string, message = 'Error') {
    return new ApiResponseDto(false, undefined, message, undefined, error);
  }
}
