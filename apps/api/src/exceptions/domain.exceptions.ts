import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiError, ApiResponse, UserRole } from '@repo/types';

export class WorkspaceNotFoundException extends HttpException {
  constructor() {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: 'Workspace not found',
      error: {
        message: 'The specified workspace does not exist',
        error: 'WORKSPACE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    };
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor(action: string, requiredRole?: UserRole) {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.FORBIDDEN,
      message: 'Insufficient permissions',
      error: {
        message: requiredRole
          ? `Only ${requiredRole} can ${action}`
          : `You don't have permission to ${action}`,
        error: 'INSUFFICIENT_PERMISSIONS',
        statusCode: HttpStatus.FORBIDDEN,
      },
    };
    super(response, HttpStatus.FORBIDDEN);
  }
}

export class ReleaseNotFoundException extends HttpException {
  constructor() {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: 'Release not found',
      error: {
        message: 'The specified release does not exist',
        error: 'RELEASE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    };
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class UserNotMemberException extends HttpException {
  constructor() {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: 'User is not a member',
      error: {
        message: 'You are not a member of this workspace',
        error: 'USER_NOT_MEMBER',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
    };
    super(response, HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(message: string = 'User not found') {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message,
      error: {
        message: 'The specified user does not exist',
        error: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    };
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class BugNotFoundException extends HttpException {
  constructor() {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: 'Bug not found',
      error: {
        message: 'The specified bug does not exist',
        error: 'BUG_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    };
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class HotfixNotFoundException extends HttpException {
  constructor() {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: 'Hotfix not found',
      error: {
        message: 'The specified hotfix does not exist',
        error: 'HOTFIX_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    };
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedActionException extends HttpException {
  constructor(action: string) {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: `Unauthorized to ${action}`,
      error: {
        message: `You can only ${action} items you created`,
        error: 'UNAUTHORIZED_ACTION',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
    };
    super(response, HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidPermissionException extends HttpException {
  constructor(action: string) {
    const response: ApiResponse<null, ApiError> = {
      success: false,
      status: HttpStatus.FORBIDDEN,
      message: `You do not have permission to ${action}`,
      error: {
        message: 'Permission denied',
        error: 'INVALID_PERMISSION',
        statusCode: HttpStatus.FORBIDDEN,
      },
    };
    super(response, HttpStatus.FORBIDDEN);
  }
}
