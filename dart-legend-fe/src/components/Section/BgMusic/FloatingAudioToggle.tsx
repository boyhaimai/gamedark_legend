import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { musicEnabledAtom } from "@/store/music.store";

type Position = { x: number; y: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const BUTTON_SIZE = 44;

const FloatingAudioToggle = () => {
  const [musicEnabled, setMusicEnabled] = useAtom(musicEnabledAtom);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<Position>(() => {
    if (typeof window === "undefined") return { x: 0, y: 120 };
    return {
      x: window.innerWidth - BUTTON_SIZE,
      y: window.innerHeight / 2 - BUTTON_SIZE / 2,
    };
  });
  const dragRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current || pointerIdRef.current !== event.pointerId) return;
      const { innerWidth, innerHeight } = window;
      setPos((prev) => {
        const nextX = clamp(
          prev.x + event.movementX,
          0,
          innerWidth - BUTTON_SIZE
        );
        const nextY = clamp(
          prev.y + event.movementY,
          0,
          innerHeight - BUTTON_SIZE
        );
        return { x: nextX, y: nextY };
      });
    };

    const handleUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      dragRef.current = false;
      pointerIdRef.current = null;

      // Snap to nearest screen edge so the button never stays in the middle
      const { innerWidth, innerHeight } = window;
      setPos((prev) => {
        const distances = {
          left: prev.x,
          right: innerWidth - BUTTON_SIZE - prev.x,
          top: prev.y,
          bottom: innerHeight - BUTTON_SIZE - prev.y,
        };
        const closest = Object.entries(distances).reduce((a, b) =>
          a[1] < b[1] ? a : b
        )[0];

        if (closest === "left") {
          return { x: 0, y: prev.y };
        }
        if (closest === "right") {
          return { x: innerWidth - BUTTON_SIZE, y: prev.y };
        }
        if (closest === "top") {
          return { x: prev.x, y: 0 };
        }
        return { x: prev.x, y: innerHeight - BUTTON_SIZE };
      });

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    const handlePointerDown = (event: PointerEvent) => {
      dragRef.current = true;
      pointerIdRef.current = event.pointerId;
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    };

    const currentBtn = buttonRef.current;
    currentBtn?.addEventListener("pointerdown", handlePointerDown);

    return () => {
      currentBtn?.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={(e) => {
        e.stopPropagation();
        setMusicEnabled((prev) => !prev);
      }}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        width: 44,
        height: 44,
        borderRadius: 12,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
      }}
      aria-label={
        musicEnabled ? "Mute background music" : "Unmute background music"
      }
      title="Drag to move"
    >
      <span style={{ fontSize: 18 }}>{musicEnabled ? "🔊" : "🔇"}</span>
    </button>
  );
};

export default FloatingAudioToggle;
