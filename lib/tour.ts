import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { setTutorialDone } from "./onboarding";

const TOUR_ELEMENTS = {
  canvas: "[data-tour='canvas']",
  quickActions: "[data-tour='quick-actions']",
  customize: "[data-tour='customize']",
  settings: "[data-tour='settings']",
} as const;

export function runTutorial(): void {
  const steps: DriveStep[] = [
    {
      popover: {
        title: "Welcome to your whiteboard",
        description:
          "This is your infinite canvas. You can pan by dragging, zoom with pinch or Ctrl+scroll, and add widgets from the bar below.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: TOUR_ELEMENTS.canvas,
      popover: {
        title: "Canvas",
        description:
          "Drag the background to pan. Use pinch (or Ctrl + scroll) to zoom. Your widgets live here—move and resize them freely.",
        side: "top",
        align: "center",
      },
    },
    {
      element: TOUR_ELEMENTS.quickActions,
      popover: {
        title: "Quick actions",
        description:
          "Tap any icon to add that widget to the canvas. Hold the gear to reorder these shortcuts.",
        side: "top",
        align: "center",
      },
    },
    {
      element: TOUR_ELEMENTS.customize,
      popover: {
        title: "Customize bar",
        description:
          "Tap the gear to add or remove widgets from the bar. Use \"More widgets…\" for the full list of types.",
        side: "top",
        align: "center",
      },
    },
    {
      element: TOUR_ELEMENTS.settings,
      popover: {
        title: "Settings & account",
        description:
          "Export your board, switch to list view, sign in to save to the cloud, and change theme.",
        side: "top",
        align: "end",
      },
    },
    {
      popover: {
        title: "You're all set",
        description: "Start adding widgets and make this board yours. You can sign in anytime to save to the cloud.",
        side: "top",
        align: "center",
      },
    },
  ];

  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    showButtons: ["next", "previous", "close"],
    overlayColor: "rgba(0,0,0,0.5)",
    steps,
    onDestroyStarted: () => {
      driverObj.destroy();
    },
    onDestroyed: () => {
      setTutorialDone();
    },
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
  });

  driverObj.drive();
}
