export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", details);
  }
}

export class SteamApiError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, "STEAM_API_ERROR", details);
  }
}

export class SteamProfilePrivateError extends AppError {
  constructor(message = "O perfil ou os jogos da Steam não estão públicos.") {
    super(message, 403, "STEAM_PROFILE_PRIVATE");
  }
}

export class CachePersistenceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, "CACHE_PERSISTENCE_ERROR", details);
  }
}
