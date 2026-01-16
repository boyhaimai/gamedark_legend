import { atom } from "jotai";

// Store for managing background music state
export const musicEnabledAtom = atom(true);
export const musicVolumeAtom = atom(0.5);

// Debug functions for testing
if (typeof window !== "undefined") {
  (window as any).musicStore = {
    get: () => {
      return { musicEnabled: true, musicVolume: 0.5 };
    },
    toggle: () => {
      console.log("Use setMusicEnabled from component instead");
    },
  };
}
