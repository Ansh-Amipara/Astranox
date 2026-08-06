export interface PaginationDto {
  readonly page: number;
  readonly total: number;
}

export interface PagedResponseDto<T> {
  readonly items: ReadonlyArray<T>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
