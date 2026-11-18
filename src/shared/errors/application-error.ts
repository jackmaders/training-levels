import { HttpStatusCodes, type HttpStatusCode } from "../lib/http-status-codes";

const ErrorCodes = {
  CURRICULUM_STEP_NOT_FOUND: "CURRICULUM_STEP_NOT_FOUND",
  CURRICULUM_STEP_TEST_REQUIRED: "CURRICULUM_STEP_TEST_REQUIRED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  USER_FORBIDDEN: "USER_FORBIDDEN",
  USER_UNAUTHENTICATED: "USER_UNAUTHENTICATED",
} as const;

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

const ErrorConfig: Record<ErrorCode, { message: string; statusCode?: HttpStatusCode }> = {
  CURRICULUM_STEP_NOT_FOUND: {
    message: "Curriculum step not found.",
    statusCode: HttpStatusCodes.NOT_FOUND,
  },
  CURRICULUM_STEP_TEST_REQUIRED: {
    message: "Complete a passing Test before marking this Step complete.",
    statusCode: HttpStatusCodes.CONFLICT,
  },
  INTERNAL_SERVER_ERROR: { message: "Something went wrong." },
  USER_FORBIDDEN: { message: "Permission denied.", statusCode: HttpStatusCodes.FORBIDDEN },
  USER_UNAUTHENTICATED: { message: "Not Authenticated.", statusCode: HttpStatusCodes.UNAUTHORIZED },
};

class ApplicationError extends Error {
  public override readonly name = "ApplicationError";
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown> | undefined;

  public constructor(
    code: ErrorCode,
    options?: { message?: string; details?: Record<string, unknown>; cause?: unknown },
  ) {
    const config = ErrorConfig[code];
    const message = options?.message === "" ? config.message : (options?.message ?? config.message);
    super(message, { cause: options?.cause });

    this.code = code;
    this.statusCode = config.statusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR;
    this.details = options?.details;
  }

  public toJSON() {
    return {
      code: this.code,
      message: ErrorConfig[this.code].message,
      name: this.name,
      statusCode: this.statusCode,
    };
  }
}

export { ApplicationError };
