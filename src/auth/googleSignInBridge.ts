import type { CredentialResponse } from '@react-oauth/google';

type CredentialHandler = (response: CredentialResponse) => void;
type VoidHandler = () => void;

let credentialHandler: CredentialHandler | null = null;
let errorHandler: VoidHandler | null = null;

/** Login page registers the active credential / error handlers (refs via closure). */
export const setGoogleSignInHandlers = (handlers: {
  onCredential: CredentialHandler | null;
  onError?: VoidHandler | null;
}): void => {
  credentialHandler = handlers.onCredential;
  errorHandler = handlers.onError ?? null;
};

export const dispatchGoogleCredential = (response: CredentialResponse): void => {
  credentialHandler?.(response);
};

export const dispatchGoogleSignInError = (): void => {
  errorHandler?.();
};
