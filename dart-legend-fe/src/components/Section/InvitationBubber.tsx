import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bubber } from "@/assets";
import { ROUTE_PATH } from "@/router/route-path";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "invitation_bubber_position";

type Position = { left: number; top: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const InvitationBubber = ({ count }: { count: number }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<Position>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Position;
    } catch {}
    return { left: 16, top: 120 };
  });
  // Persist position when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {}
  }, [position]);

  const getBounds = useCallback(() => {
    const node = containerRef.current;
    const width = node?.offsetWidth ?? 0;
    const height = node?.offsetHeight ?? 0;
    const maxLeft = (window.innerWidth || 0) - width - 8;
    const maxTop = (window.innerHeight || 0) - height - 8;
    return {
      minLeft: 8,
      minTop: 8,
      maxLeft: Math.max(8, maxLeft),
      maxTop: Math.max(8, maxTop),
    };
  }, []);

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      draggingRef.current = true;
      dragOffsetRef.current = {
        x: clientX - position.left,
        y: clientY - position.top,
      };
    },
    [position.left, position.top]
  );

  const onPointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ("touches" in e) {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
      } else {
        startDrag(
          (e as React.MouseEvent).clientX,
          (e as React.MouseEvent).clientY
        );
      }
    },
    [startDrag]
  );

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingRef.current) return;
      lastPointerRef.current = { x: clientX, y: clientY };
      const bounds = getBounds();
      const nextLeft = clamp(
        clientX - dragOffsetRef.current.x,
        bounds.minLeft,
        bounds.maxLeft
      );
      const nextTop = clamp(
        clientY - dragOffsetRef.current.y,
        bounds.minTop,
        bounds.maxTop
      );
      setPosition({ left: nextLeft, top: nextTop });
    },
    [getBounds]
  );

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const bounds = getBounds();
    const { x: clientX, y: clientY } = lastPointerRef.current;
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;

    // Determine wrap conditions first (dragged beyond viewport)
    const exceededLeft = clientX < 0;
    const exceededRight = clientX > viewportWidth;
    const exceededTop = clientY < 0;
    const exceededBottom = clientY > viewportHeight;

    if (exceededLeft || exceededRight || exceededTop || exceededBottom) {
      // If both axes exceeded, choose the dominant overflow distance
      const overflowX = exceededLeft
        ? -clientX
        : exceededRight
        ? clientX - viewportWidth
        : 0;
      const overflowY = exceededTop
        ? -clientY
        : exceededBottom
        ? clientY - viewportHeight
        : 0;

      if (Math.abs(overflowX) >= Math.abs(overflowY)) {
        // Snap to opposite horizontal edge
        const nextLeft = exceededLeft ? bounds.maxLeft : bounds.minLeft;
        setPosition((prev) => ({
          left: nextLeft,
          top: clamp(prev.top, bounds.minTop, bounds.maxTop),
        }));
      } else {
        // Snap to opposite vertical edge
        const nextTop = exceededTop ? bounds.maxTop : bounds.minTop;
        setPosition((prev) => ({
          left: clamp(prev.left, bounds.minLeft, bounds.maxLeft),
          top: nextTop,
        }));
      }
      return;
    }

    // Otherwise, snap to the nearest edge
    const dLeft = Math.abs(position.left - bounds.minLeft);
    const dRight = Math.abs(bounds.maxLeft - position.left);
    const dTop = Math.abs(position.top - bounds.minTop);
    const dBottom = Math.abs(bounds.maxTop - position.top);

    const minDist = Math.min(dLeft, dRight, dTop, dBottom);

    if (minDist === dLeft) {
      setPosition((prev) => ({
        left: bounds.minLeft,
        top: clamp(prev.top, bounds.minTop, bounds.maxTop),
      }));
    } else if (minDist === dRight) {
      setPosition((prev) => ({
        left: bounds.maxLeft,
        top: clamp(prev.top, bounds.minTop, bounds.maxTop),
      }));
    } else if (minDist === dTop) {
      setPosition((prev) => ({
        left: clamp(prev.left, bounds.minLeft, bounds.maxLeft),
        top: bounds.minTop,
      }));
    } else {
      setPosition((prev) => ({
        left: clamp(prev.left, bounds.minLeft, bounds.maxLeft),
        top: bounds.maxTop,
      }));
    }
  }, [getBounds, position.left, position.top]);

  // Global listeners for drag interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) =>
      onPointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0)
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleEnd = () => onPointerUp();

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove as any);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("mouseup", handleEnd as any);
      window.removeEventListener("touchend", handleEnd as any);
      window.removeEventListener("touchcancel", handleEnd as any);
    };
  }, [onPointerMove, onPointerUp]);

  // Keep position inside viewport on resize/orientation change
  useEffect(() => {
    const handleResize = () => {
      const bounds = getBounds();
      setPosition((prev) => ({
        left: clamp(prev.left, bounds.minLeft, bounds.maxLeft),
        top: clamp(prev.top, bounds.minTop, bounds.maxTop),
      }));
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize as any);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize as any);
    };
  }, [getBounds]);

  const style = useMemo(
    () => ({ left: position.left, top: position.top }),
    [position]
  );

  return (
    <div
      ref={containerRef}
      className="absolute z-10 select-none cursor-grab active:cursor-grabbing touch-none"
      style={style}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onClick={() => navigate(ROUTE_PATH.CHAT)}
    >
      <img src={bubber} alt="bubber" draggable={false} />
      <div className=" absolute top-0 right-0 w-5 h-5 p-2.5 bg-rose-500 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white inline-flex flex-col justify-center items-center gap-2.5">
        <div className="text-center justify-start text-Alabaster-0 text-xs font-bold font-['Roboto_Mono'] leading-none">
          {count}
        </div>
      </div>
    </div>
  );
};

export default InvitationBubber;
