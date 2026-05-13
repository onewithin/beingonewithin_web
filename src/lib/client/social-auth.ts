import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/client/firebase";

export type SocialProvider = "google" | "apple";

export type SocialIdentity = {
  provider: SocialProvider;
  idToken: string;
  email: string;
  name?: string;
  image?: string;
};

async function authWithProvider(
  provider: GoogleAuthProvider | OAuthProvider,
  providerName: SocialProvider,
): Promise<SocialIdentity> {
  const auth = getFirebaseAuth();
  const credentialResult = await signInWithPopup(auth, provider);
  const idToken = await credentialResult.user.getIdToken();

  if (!idToken) {
    await signOut(auth).catch(() => undefined);
    throw new Error("Social sign-in failed to return an ID token.");
  }

  const email = credentialResult.user.email;
  if (!email) {
    await signOut(auth).catch(() => undefined);
    throw new Error(
      "Provider did not return an email. Please use another sign-in method.",
    );
  }

  const identity: SocialIdentity = {
    provider: providerName,
    idToken,
    email,
    name: credentialResult.user.displayName || undefined,
    image: credentialResult.user.photoURL || undefined,
  };

  // Session is maintained by backend cookies; keep Firebase stateless on web.
  await signOut(auth).catch(() => undefined);

  return identity;
}

export async function authenticateWithGoogle(): Promise<SocialIdentity> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return authWithProvider(provider, "google");
}

export async function authenticateWithApple(): Promise<SocialIdentity> {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return authWithProvider(provider, "apple");
}
