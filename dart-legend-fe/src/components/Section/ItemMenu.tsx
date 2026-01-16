import { useNavigate } from "react-router-dom";

const ItemMenu = ({
  title,
  icon,
  tag,
  href,
}: {
  title: string;
  icon: string;
  tag?: string;
  href: string;
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(href)}
      className="relative w-28 h-[60px] flex items-end justify-center cursor-pointer">
      {/* Background button */}
      <div className="absolute bottom-0 w-full h-10 bg-[#353C52] rounded-[3px] border border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)]">
        <div className="absolute top-0 w-full h-0.5 bg-gray-500/50" />
        <div className="absolute bottom-0 w-full h-[3px] bg-gray-800" />
      </div>

      {/* Title */}
      <p className="relative pb-1 pt-5 px-4 text-white text-custom-sm-bold uppercase tracking-tight">
        {title}
      </p>

      {/* Icon */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center">
        <img src={icon} alt={title} className="w-9 h-9 object-contain" />
      </div>

      {/* Notification badge */}
      {tag && (
        <div className="absolute top-2 right-0 w-5 h-5">
          <div className="absolute w-full h-full bg-red-600 rounded-full shadow-[0px_1px_0px_0px_#000,inset_0.5px_-1px_0px_0px_rgba(0,0,0,0.25),inset_-0.5px_1px_0px_0px_#FF7B7B] outline outline-[0.6px] outline-black" />
          <div className="relative w-full h-full flex items-center justify-center text-white text-custom-xs-bold">
            {tag}
          </div>
        </div>
      )}
    </div>
  );
};
export default ItemMenu;
