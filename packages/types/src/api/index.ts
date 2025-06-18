export type ApiResponse<T, E> =
  | {
      success: true;
      status: number;
      data: T;
      message: string;
      pagination?: PaginationInfo;
    }
  | {
      success: false;
      status: number;
      data?: never;
      message: string;
      error: E;
    };

export type ErrorCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

export type CreatedResponse<T> = {
  success: true;
  status: 201;
  data: T;
  message: "Created";
};

export type BadRequestResponse = {
  success: false;
  status: 400;
  message: "Bad Request";
  error: ApiError & { code: "BAD_REQUEST" };
};

export type ConflictResponse = {
  success: false;
  status: 409;
  message: "Conflict";
  error: ApiError & {
    code: "CONFLICT";
    details: { resource: string; reason: string };
  };
};

export type InternalServerErrorResponse = {
  success: false;
  status: 500;
  message: "Internal Server Error";
  error: ApiError & { code: "INTERNAL_SERVER_ERROR"; stack?: string };
};
