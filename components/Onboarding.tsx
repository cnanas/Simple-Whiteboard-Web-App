"use client";

import { WelcomeToast } from "./WelcomeToast";

export function Onboarding({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WelcomeToast />
      {children}
    </>
  );
}
