/**
 * Error handling utilities for API responses
 * ==========================================
 *
 * Provides functions to extract user-friendly error messages
 * from structured API error responses and display them to users.
 */

import { ApiError } from "@repo/types";

/**
 * Extract a user-friendly error message from an API error response
 */
export function getErrorMessage(error: ApiError): string {
  // If the error message is an array, join them
  if (Array.isArray(error.message)) {
    return error.message.join(", ");
  }

  // Return the message directly
  return error.message || "An unexpected error occurred";
}

/**
 * Check if an error is a permission-related error
 */
export function isPermissionError(error: ApiError): boolean {
  return error.error === "INSUFFICIENT_PERMISSIONS";
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return (
    error.error === "INVALID_TASK_ID" ||
    error.error === "INVALID_ASSIGNED_USERS" ||
    error.error === "INVALID_WORKSPACE_ID"
  );
}

/**
 * Check if an error is a not found error
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.error === "TASK_NOT_FOUND";
}

/**
 * Get a user-friendly error message with suggested actions
 */
export function getErrorMessageWithSuggestion(error: ApiError): string {
  const baseMessage = getErrorMessage(error);

  if (isPermissionError(error)) {
    return `${baseMessage} Please contact your workspace manager if you need different permissions.`;
  }

  if (isValidationError(error)) {
    return `${baseMessage} Please check your input and try again.`;
  }

  if (isNotFoundError(error)) {
    return `${baseMessage} Please refresh the page and try again.`;
  }

  return `${baseMessage} Please try again. If the problem persists, contact support.`;
}
