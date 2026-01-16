// components/GradientNineSliceBox.tsx
import React from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  radius?: number;
};

export default function GradientNineSliceBox({
  className = "",
  children,
  color = "linear-gradient(180deg, #00fcff 0%, #fc1cff 100%)",
  radius = 4,
}: Props) {
  const encode = (svg: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  // đặt các biến giống CSS bạn gửi
  const vars: React.CSSProperties = {
    ["--box-border--border" as any]: color,

    // 9-slice corners/edges (stroke=2, rx=4, ry=4)
    ["--box--border__top-left" as any]: encode(
      `<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='1' y='1' width='18' height='18' rx='${radius}' ry='${radius}' stroke='black' stroke-width='2' /></svg>`
    ),
    ["--box--border__top" as any]:
      "url(\"data:image/svg+xml,<svg preserveAspectRatio='none' width='100' height='10' viewBox='0 0 100 10' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='-1' y1='1' x2='101' y2='1' stroke='%23000' stroke-width='2'/></svg>\")",
    ["--box--border__top-right" as any]: encode(
      `<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='-9' y='1' width='18' height='18' rx='${radius}' ry='${radius}' stroke='black' stroke-width='2' /></svg>`
    ),
    ["--box--border__left" as any]:
      "url(\"data:image/svg+xml,<svg preserveAspectRatio='none' width='10' height='100' viewBox='0 0 10 100' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='1' y1='-1' x2='1' y2='101' stroke='%23000' stroke-width='2'/></svg>\")",
    ["--box--border__right" as any]:
      "url(\"data:image/svg+xml,<svg preserveAspectRatio='none' width='10' height='100' viewBox='0 0 10 100' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='9' y1='-1' x2='9' y2='101' stroke='%23000' stroke-width='2'/></svg>\")",
    ["--box--border__bottom-left" as any]: encode(
      `<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='1' y='-9' width='18' height='18' rx='${radius}' ry='${radius}' stroke='black' stroke-width='2' /></svg>`
    ),
    ["--box--border__bottom" as any]:
      "url(\"data:image/svg+xml,<svg preserveAspectRatio='none' width='100' height='10' viewBox='0 0 100 10' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='-1' y1='9' x2='101' y2='9' stroke='%23000' stroke-width='2'/></svg>\")",
    ["--box--border__bottom-right" as any]: encode(
      `<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='-9' y='-9' width='18' height='18' rx='${radius}' ry='${radius}' stroke='black' stroke-width='2' /></svg>`
    ),
  };

  // chuỗi mask như CSS gốc (giữ đúng khoảng cách .625rem)
  const maskStr = `
    var(--box--border__top-left) 0 0 / .625rem .625rem,
    var(--box--border__top) .625rem 0 / calc(100% - 1.25rem) .625rem,
    var(--box--border__top-right) 100% 0 / .625rem .625rem,
    var(--box--border__left) 0 .625rem / .625rem calc(100% - 1.25rem),
    var(--box--border__right) 100% .625rem / .625rem calc(100% - 1.25rem),
    var(--box--border__bottom-left) 0 100% / .625rem .625rem,
    var(--box--border__bottom) .625rem 100% / calc(100% - 1.25rem) .625rem,
    var(--box--border__bottom-right) 100% 100% / .625rem .625rem
  `;

  return (
    <div
      style={vars}
      className={[
        // khung trong suốt, có thể resize nếu muốn giống demo
        "relative w-full p-2.5 font-bold",
        "overflow-hidden", // giữa trong suốt
        className,
      ].join(" ")}
    >
      {/* Content */}
      <div className="relative z-10 flex justify-between items-center">
        {children ?? "Your content here"}
      </div>

      {/* Overlay vẽ viền gradient bằng mask 9-slice */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--box-border--border)",
          WebkitMask: maskStr,
          mask: maskStr,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
