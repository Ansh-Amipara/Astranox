import type { ApiErrorDto } from './ErrorDto';
import type { PaginationDto } from './PaginationDto';

export interface ApiResponseDto<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiErrorDto;
  readonly meta?: PaginationDto;
}
