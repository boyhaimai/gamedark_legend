import { useEffect, useRef, useState } from "react";
import ProcessBar from "../../UI/ProcessBar/ProcessBar";
import WrapperPage from "../WrapperPage";
import { CircularProgress } from "@nextui-org/react";
import clsx from "clsx";
import { LogoDart2 } from "@/assets";

export default function LoadingScreen({
  loading,
  isLoaded,
  onLoadingComplete,
}: {
  loading?: boolean;
  isLoaded?: boolean;
  onLoadingComplete?: () => void;
}) {
  const [value, setValue] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasTriggeredComplete, setHasTriggeredComplete] =
    useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCompleted || value >= 100 || loading) return;

    intervalRef.current = setInterval(() => {
      setValue((v) => {
        const newValue = Math.min(v + Math.floor(Math.random() * 5) + 1, 100);

        if (newValue >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsCompleted(true);
        }

        return newValue;
      });
    }, 30);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isCompleted, value, loading]);

  useEffect(() => {
    if (value === 100 && !hasTriggeredComplete) {
      setHasTriggeredComplete(true);
      onLoadingComplete?.();
    }
  }, [value, hasTriggeredComplete, onLoadingComplete]);

  return (
    <WrapperPage
      className={clsx(
        "max-w-[500px] z-[9999] !mb-0 !pb-0 py-12 px-6 flex flex-col justify-end gap-[35vh]",
        { ["!z-0"]: isLoaded && value >= 100 }
      )}
      showMenu={false}
    >
      <div className="flex justify-center items-center w-full mt-[20%]">
        <img src={LogoDart2} className="w-[242px] h-[174px] object-contain" />
      </div>
      <div className="flex justify-center items-center flex-col mt-4 pb-12">
        {loading ? (
          <CircularProgress className="mt-4" />
        ) : (
          <>
            <p
              className="text-white text-[20px] font-bold mb-2"
              style={{
                WebkitTextStroke: "3px #000",
                paintOrder: "stroke fill",
              }}
            >
              {`${Math.round(value)}%`}
            </p>
            <ProcessBar value={value} />
          </>
        )}
      </div>
      <p className="absolute bottom-0 left-0 text-white text-[10px] p-2">
        1.0.0
      </p>
    </WrapperPage>
  );
}
