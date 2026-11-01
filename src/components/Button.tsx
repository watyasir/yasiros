import type { ComponentPropsWithoutRef } from "react";

const variants = {
  primary: "bg-pop text-ink hover:bg-pop-strong",
  plain: "border border-solid border-line bg-card text-ink hover:bg-fill-strong",
};

/** Primary (one per view) or plain button. 44px tall on phone, 36px from 640px up. */
export function Button({
  variant = "plain",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button
      type="button"
      className={`press min-h-11 cursor-pointer rounded-full border-0 px-4 text-[13px] font-semibold sm:min-h-9 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
