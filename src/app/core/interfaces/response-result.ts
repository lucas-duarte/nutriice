export interface ResponseResult<T> {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
    result: T
    isSuccess: boolean
    error: any
  }