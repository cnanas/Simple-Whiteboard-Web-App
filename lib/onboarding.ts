export const ONBOARDING_KEYS = {
  SEEN_SPLASH: "whiteboard-seen-splash",
  TUTORIAL_DONE: "whiteboard-tutorial-done",
} as const;

export function hasSeenSplash(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEYS.SEEN_SPLASH) === "1";
}

export function setSeenSplash(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEYS.SEEN_SPLASH, "1");
}

export function hasCompletedTutorial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEYS.TUTORIAL_DONE) === "1";
}

export function setTutorialDone(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEYS.TUTORIAL_DONE, "1");
}
