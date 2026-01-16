export const playAudio = (audioSrc: string, volume: number = 0.3): void => {
  try {
    const audio = new Audio(audioSrc);
    audio.volume = volume;
    audio.play().catch((error) => {
      console.warn("Failed to play audio:", error);
    });
  } catch (error) {
    console.warn("Error creating audio element:", error);
  }
};
