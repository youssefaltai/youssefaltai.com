export interface Pagination {
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: PaginationMeta
}

export interface BaseApiResponse<T> {
    success: boolean
    data: T | null
    message: string
}

export interface ApiDataResponse<T> extends BaseApiResponse<T> {
    success: true
    data: T
}

export interface ApiPaginatedDataResponse<T> extends BaseApiResponse<T[]> {
    success: true
    data: T[]
    pagination: Pagination
}

export interface ApiErrorResponse<T = null> extends BaseApiResponse<T> {
    success: false
    error: any
}


export type ApiResponse<T> = ApiDataResponse<T> | ApiErrorResponse<T> | ApiPaginatedDataResponse<T>