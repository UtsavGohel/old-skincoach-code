// Minimal shape of the Clerk webhook events we handle (docs/19 Phase 15). Clerk
// sends far more fields; we type only what the users mirror needs. See
// https://clerk.com/docs/integrations/webhooks/overview for the full payloads.

export interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

export interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

// user.deleted carries only the id (+ a deleted flag) — no full user object.
export interface ClerkDeletedData {
  id: string;
  deleted?: boolean;
}

export type ClerkWebhookEvent =
  | { type: 'user.created' | 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: ClerkDeletedData }
  // Events we don't act on (session.*, etc.) still parse but are ignored.
  | { type: string; data: Record<string, unknown> };
