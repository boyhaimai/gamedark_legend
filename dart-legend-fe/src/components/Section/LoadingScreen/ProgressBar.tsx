import { formatNumber } from "@/utils/fc.utils";
import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  width?: number | string;
  height?: number | string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  height = 28,
}) => {
  const percent = Math.min((current / total) * 100, 100);
  return (
    <div
      style={{
        background: "#232738",
        borderRadius: 8,
        height,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #111",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${percent}%`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#FEE746",
            height: "50%",
            borderTopLeftRadius: 6,
          }}
        />
        <div
          style={{
            background: "#F07527",
            height: "50%",
            borderBottomLeftRadius: 6,
          }}
        />
      </div>
      <span
        className="font-normal text-white"
        style={{
          position: "absolute",
          right: 16,
          fontSize: 28,
          textShadow: "1px 1px 2px #000",
          fontWeight: 700,
        }}
      >
        <p className="text-white text-custom-sm-bold tracking-tight">
          {formatNumber(current)}/{formatNumber(total)}
        </p>
      </span>
    </div>
  );
};

export default ProgressBar;
