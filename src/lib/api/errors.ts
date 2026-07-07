export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  details: { field: string; message: string }[];
}

export function isErrorResponse(error: unknown): error is ErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error &&
    "message" in error
  );
}
