import React, { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import {
  dispatchGoogleCredential,
  dispatchGoogleSignInError,
} from '../../auth/googleSignInBridge';

/** `google.accounts.id.initialize` must run once per client_id per page load. */
let gsiInitializedForClientId: string | null = null;

/**
 * Renders the official Sign in with Google button without re-running GIS `initialize`
 * on every React remount (e.g. navigating back to `/login`).
 */
const GoogleSignInButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { clientId, locale, scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !containerRef.current) return;

    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    if (gsiInitializedForClientId !== clientId) {
      gsi.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          if (!credentialResponse?.credential) {
            dispatchGoogleSignInError();
            return;
          }
          dispatchGoogleCredential({
            credential: credentialResponse.credential,
            clientId: credentialResponse.clientId,
            select_by: credentialResponse.select_by,
          });
        },
        use_fedcm_for_button: true,
      });
      gsiInitializedForClientId = clientId;
    }

    gsi.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      locale,
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [clientId, locale, scriptLoadedSuccessfully]);

  return <div ref={containerRef} style={{ height: 40 }} />;
};

export default GoogleSignInButton;
