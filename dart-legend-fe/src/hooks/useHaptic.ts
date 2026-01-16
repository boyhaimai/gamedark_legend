/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

export const hapticClick = () => {
  (window as any)?.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
};
export const useHapticFeedback = () => {
  useEffect(() => {
    const handleDocumentClick = () => {
      (window as any)?.Telegram?.WebApp?.HapticFeedback?.impactOccurred(
        "medium"
      );
    };

    // Add event listener
    document.addEventListener("click", handleDocumentClick);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);
};
