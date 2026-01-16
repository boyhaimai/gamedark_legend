import { arrowLeft } from "@/assets";

export default function HeaderNormalPage({
  title,
  description,
  onBack,
}: {
  title: string;
  description?: string;
  onBack?: () => void;
}) {
  return (
    <div>
      <div className="w-full bg-[#00000066] flex items-center justify-start gap-4 p-4">
        <div onClick={onBack}>
          <img src={arrowLeft} className="w-10 h-8" />
        </div>
        <p className="text-white font-bold text-2xl">{title}</p>
      </div>
      <p className="text-custom-sm-bold text-white stroke-1 uppercase text-center">
        {description}
      </p>
    </div>
  );
}
