import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import bgMusic from "@/assets/audio/bgMusic.mp3";
import { musicEnabledAtom, musicVolumeAtom } from "@/store/music.store";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicEnabled] = useAtom(musicEnabledAtom);
  const [musicVolume] = useAtom(musicVolumeAtom);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = musicVolume;

    const playAudio = () => {
      audio.play().catch((error) => {
        console.log("Play failed:", error);
      });
    };

    if (musicEnabled) {
      playAudio();

      // Retry on user interaction if autoplay was blocked
      const handleInteraction = () => {
        if (audio.paused && musicEnabled) {
          playAudio();
        }
      };

      document.addEventListener("click", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("keydown", handleInteraction);

      return () => {
        document.removeEventListener("click", handleInteraction);
        document.removeEventListener("touchstart", handleInteraction);
        document.removeEventListener("keydown", handleInteraction);
      };
    } else {
      audio.pause();
    }
  }, [musicEnabled, musicVolume]);

  useEffect(() => {
    if (audioRef.current) {
      (window as any).audioDebug = {
        audio: audioRef.current,
        musicEnabled,
        play: () => audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        getPaused: () => audioRef.current?.paused,
        getCurrentTime: () => audioRef.current?.currentTime,
        getDuration: () => audioRef.current?.duration,
        pauseAll: () => {
          document.querySelectorAll("audio").forEach((audio) => audio.pause());
        },
      };
    }
  }, [musicEnabled]);

  return <audio ref={audioRef} src={bgMusic} loop hidden />;
};

export default BackgroundMusic;
