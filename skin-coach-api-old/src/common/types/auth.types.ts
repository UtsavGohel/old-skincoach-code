// The verified Clerk identity attached to a request by ClerkAuthGuard. `clerkId`
// is the Clerk user id (JWT `sub`) — our local `users.clerkId` mirrors it, so this
// is what UsersService keys off of. Kept deliberately thin: no email/name here,
// since the session JWT doesn't carry those by default (the webhook owns that data).
export interface AuthContext {
  clerkId: string;
  sessionId?: string;
}

// Augment Express's Request so `request.auth` is typed everywhere the guard runs.
declare module 'express' {
  interface Request {
    auth?: AuthContext;
  }
}
