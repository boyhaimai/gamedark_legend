import { Spinner } from "@nextui-org/react";
import clsx from "clsx";

const Loading = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        "absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in z-50",
        className
      )}
      style={{ transition: "opacity 0.3s" }}
    >
      <Spinner color="primary" size="lg" />
    </div>
  );
};

export default Loading;
