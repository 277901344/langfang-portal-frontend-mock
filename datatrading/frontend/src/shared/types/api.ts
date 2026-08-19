export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

export interface PaginatedResponse<T = unknown> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ApiError extends Error {
    code: number;
    originalData?: ApiResponse;
}

export function createApiError(
    message: string,
    code: number,
    originalData?: ApiResponse
): ApiError {
    const error = new Error(message) as ApiError;
    error.code = code;
    error.originalData = originalData;
    return error;
}

export function createParamError(message: string, code: number = 11000, originalData?: ApiResponse): ApiError {
    const error = createApiError(message, code, originalData);
    error.name = 'ParamError';
    return error;
}

export function createSystemError(message: string, code: number = 12000, originalData?: ApiResponse): ApiError {
    const error = createApiError(message, code, originalData);
    error.name = 'SystemError';
    return error;
}

export function createBizError(message: string, code: number = 13000, originalData?: ApiResponse): ApiError {
    const error = createApiError(message, code, originalData);
    error.name = 'BizError';
    return error;
}

export function parseResponse<T>(response: ApiResponse<T>): T {
    const { code, message, data } = response;

    switch (true) {
        case code === 10000:
            return data;
        case code >= 11000 && code < 12000:
            throw createParamError(message, code, response);
        case code >= 12000 && code < 13000:
            throw createSystemError(message, code, response);
        case code >= 13000 && code < 14000:
            throw createBizError(message, code, response);
        default:
            throw createApiError(message, code, response);
    }
}
