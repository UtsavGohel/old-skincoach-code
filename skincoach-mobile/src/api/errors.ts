// Typed error hierarchy so hooks/screens can branch on failure kind (docs/18: "throw
// typed error", never a bare Error). Mirrors docs/05's { success, message, code } shape.
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Distinct from ApiError (which means "the server responded with a failure") so the
// Offline Banner / No-Internet error flow (docs/02) can be triggered specifically,
// rather than shown as a generic error.
export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}
