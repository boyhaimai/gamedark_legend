import clsx from "clsx";

export default function ProcessBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={clsx("w-40 h-3 relative rounded", {
        [className]: !!className,
      })}>
      <div className="w-40 h-3 left-0 top-0 absolute bg-white/40 rounded outline outline-1 outline-white" />
      <div
        className="h-3 left-0 top-0 absolute bg-cyan-300 rounded blur-[2px] transition-all"
        style={{ width: `${value}%` }}
      />
      <div
        className="h-3 left-0 top-0 absolute bg-cyan-300 rounded transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
