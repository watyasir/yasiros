"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAllowedEmail } from "@/lib/auth";
import { redeemSignInCode } from "@/lib/signin-code";
import { createClient as createServerClient, supabaseEnv } from "@/lib/supabase/server";

export type LoginState = { status: "idle" } | { status: "sent"; email: string } | { status: "error"; message: string };

/** Emails a sign-in link, but only to ALLOWED_EMAIL. Anyone else sees the same "check your email" reply. */
export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter your email address." };
  }
  if (!isAllowedEmail(email)) {
    // Don't reveal which email is allowed.
    return { status: "sent", email };
  }

  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  // "implicit" puts the login in the link itself, so it works in whichever browser opens the email
  // (the default needs the same browser that asked). /auth/callback finishes the sign-in.
  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return {
      status: "error",
      message:
        error.status === 429
          ? "Too many sign-in emails for now. Wait a few minutes, then try again."
          : "Couldn't send the link. Try again in a moment.",
    };
  }
  return { status: "sent", email };
}

export type CodeState = { status: "idle" } | { status: "error"; message: string };

/**
 * "Have a code?": signs this device in with the one-time code from /settings on a signed-in device.
 * The server checks the code, makes a magic-link token with the admin API and verifies it here,
 * which sets this device's login cookies.
 */
export async function signInWithCode(_prev: CodeState, form: FormData): Promise<CodeState> {
  const wrong: CodeState = { status: "error", message: "That code is wrong, used or older than 10 minutes. Make a new one in Settings." };
  const allowed = process.env.ALLOWED_EMAIL?.trim();
  if (!allowed) return wrong;
  const tokenHash = await redeemSignInCode(allowed, String(form.get("code") ?? ""));
  if (!tokenHash) return wrong;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  if (error || !isAllowedEmail(data.user?.email)) {
    await supabase.auth.signOut({ scope: "local" });
    return { status: "error", message: "Couldn't finish signing in. Make a new code and try again." };
  }
  redirect("/");
}

export type EmailCodeState = { status: "idle" } | { status: "error"; message: string };

/**
 * Types-the-code sign-in (works inside the iPhone home-screen app, which can't open the email
 * link): the 6-digit code in the sign-in email, checked with Supabase's email OTP. Needs {{ .Token }}
 * in the Supabase "Magic link" email template. Only ALLOWED_EMAIL can finish.
 */
export async function verifyEmailCode(_prev: EmailCodeState, form: FormData): Promise<EmailCodeState> {
  const email = String(form.get("email") ?? "").trim();
  const token = String(form.get("token") ?? "").replace(/\D/g, "");
  const wrong: EmailCodeState = { status: "error", message: "That code is wrong or expired. Check the email again, or go back and send a new one." };
  if (!isAllowedEmail(email) || token.length < 6 || token.length > 10) return wrong;
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !isAllowedEmail(data.user?.email)) {
    if (!error) await supabase.auth.signOut({ scope: "local" });
    return wrong;
  }
  redirect("/");
}
