"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { TextButton } from "@/components/TextButton";
import { sendMagicLink, signInWithCode, verifyEmailCode, type CodeState, type LoginState } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });
  const [withCode, setWithCode] = useState(false);

  if (withCode) return <CodeForm onBack={() => setWithCode(false)} />;

  if (state.status === "sent") return <EmailCodeForm email={state.email} />;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-[13px] font-semibold">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        className="min-h-11 rounded-full border border-line bg-card px-4 text-[17px] text-ink"
      />
      {(state.status === "error" || notice) && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {state.status === "error" ? state.message : notice}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <TextButton onClick={() => setWithCode(true)} className="self-center">
        Have a code?
      </TextButton>
    </form>
  );
}

/** For the iPhone home-screen app: the one-time code from Settings on a signed-in device. */
function CodeForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<CodeState, FormData>(signInWithCode, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="code" className="text-[13px] font-semibold">
        Sign-in code
      </label>
      <p className="m-0 text-[13px] text-soft">On a device that&apos;s signed in, open Settings → Sign in on another device.</p>
      <input
        id="code"
        name="code"
        type="text"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        required
        maxLength={12}
        placeholder="ABCD-EFGH"
        className="min-h-11 rounded-full border border-line bg-card px-4 font-mono text-[20px] tracking-[0.12em] text-ink uppercase"
      />
      {state.status === "error" && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <TextButton onClick={onBack} className="self-center">
        Use email instead
      </TextButton>
    </form>
  );
}

/**
 * After the email is sent: type its code here to sign in on this device (the way in for the
 * installed iPhone app), or open the email's link in the same browser.
 */
function EmailCodeForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<CodeState, FormData>(verifyEmailCode, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-3">
      <div role="status" className="flex flex-col gap-1">
        <h2 className="m-0 text-[17px] font-semibold">Check your email</h2>
        <p className="m-0 text-[15px] text-soft">If {email} can sign in, an email is on its way. Type its code here, or open its link in this browser.</p>
      </div>
      <input type="hidden" name="email" value={email} />
      <label htmlFor="token" className="text-[13px] font-semibold">
        Code from the email
      </label>
      <input
        id="token"
        name="token"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]*"
        maxLength={12}
        required
        placeholder="123456"
        className="min-h-11 rounded-full border border-line bg-card px-4 font-mono text-[20px] tracking-[0.12em] text-ink"
      />
      {state.status === "error" && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
