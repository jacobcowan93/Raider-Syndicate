/**
 * Firebase Authentication helpers — client-only.
 *
 * Firebase console: ensure these providers are enabled in
 * Authentication → Sign-in method before using:
 *   • Google
 *   • Email/Password
 *   • Phone
 *
 * TODO: Add Discord provider here once Firebase supports it natively,
 *       or implement an OAuth redirect via a custom OAuthProvider.
 *
 * Import in client components only — this module uses browser Firebase SDK.
 * Usage:
 *   import { signInWithGoogle, signInWithEmail, ... } from '@/lib/firebaseAuth'
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth'
import { auth } from './firebaseClient'

// ─── Auth state ───────────────────────────────────────────────────────────────

/**
 * Subscribe to Firebase auth state changes.
 * Returns the unsubscribe function — call it on component unmount.
 *
 * Usage:
 *   useEffect(() => watchAuthState(setUser), [])
 */
export function watchAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// ─── Google ───────────────────────────────────────────────────────────────────

/** Opens a Google sign-in popup and resolves with UserCredential. */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(auth, provider)
}

// ─── Email / Password ─────────────────────────────────────────────────────────

/** Creates a new account with email + password. */
export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

/** Signs in an existing user with email + password. */
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Starts phone sign-in — sends an SMS verification code.
 *
 * `appVerifier` must be a RecaptchaVerifier bound to a DOM element.
 * The caller is responsible for creating and clearing the verifier.
 *
 * @param phoneNumber  E.164 format, e.g. "+12025551234"
 * @param appVerifier  RecaptchaVerifier instance (invisible preferred)
 */
export async function startPhoneSignIn(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier)
}

/**
 * Confirms the SMS code returned by `startPhoneSignIn`.
 *
 * @param confirmationResult  Return value of `startPhoneSignIn`
 * @param code                6-digit code sent via SMS
 */
export async function confirmPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string,
) {
  return confirmationResult.confirm(code)
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

/** Signs out the current user. */
export async function signOutUser() {
  return signOut(auth)
}

// ─── Error helper ─────────────────────────────────────────────────────────────

/**
 * Converts a Firebase AuthError code into a human-readable message
 * suitable for displaying in the ARC auth UI.
 */
export function authErrorMessage(err: unknown): string {
  const code = (err as AuthError)?.code ?? ''
  const map: Record<string, string> = {
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password. Try again.',
    'auth/email-already-in-use':  'An account with that email already exists.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Enter a valid email address.',
    'auth/popup-closed-by-user':  'Sign-in popup was closed. Please try again.',
    'auth/too-many-requests':     'Too many attempts. Wait a moment and try again.',
    'auth/invalid-phone-number':  'Enter a valid phone number in E.164 format (+12025551234).',
    'auth/invalid-verification-code': 'Incorrect verification code.',
    'auth/code-expired':          'The verification code has expired. Request a new one.',
    'auth/missing-phone-number':  'Enter your phone number.',
    'auth/captcha-check-failed':  'reCAPTCHA check failed. Refresh and try again.',
  }
  return map[code] ?? (err instanceof Error ? err.message : 'An unexpected error occurred.')
}

// TODO: Discord sign-in — add OAuthProvider('discord.com') here once
//       Discord OAuth is wired through Firebase Custom Auth or a provider plugin.
//       Reference: https://firebase.google.com/docs/auth/web/custom-auth
