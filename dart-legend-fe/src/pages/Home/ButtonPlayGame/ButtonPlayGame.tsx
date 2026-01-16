import { CircularProgress } from "@nextui-org/react";
// import { useNavigate } from "react-router-dom";
// import { ROUTE_PATH } from "@/router/route-path";

export default function ButtonPlayGame({
  onClick,
  loading,
}: {
  loading?: boolean;
  onClick: () => void;
  title?: string;
}) {
  // const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center w-full ">
      {loading ? (
        <CircularProgress />
      ) : (
        <div className="flex items-center justify-between w-full gap-6">
          <div
            onClick={onClick}
            className="w-full py-2.5 relative bg-black/40 rounded-lg outline outline-2 outline-offset-[-2px] outline-cyan-300 inline-flex justify-center items-center gap-2.5"
          >
            <div className="w-full h-full left-[2px] top-0 absolute rounded-lg outline outline-[3px] outline-offset-[-1.50px] outline-cyan-300 blur-sm" />
            <div className="relative z-10 text-white sm:text-lg text-sm font-bold  uppercase leading-normal [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
              PLAY NOW
            </div>
          </div>
          {/* <div
            onClick={() => navigate(ROUTE_PATH.CREATE_ROOM)}
            className="w-1/2  py-2.5 relative bg-black/40 rounded-lg outline outline-2 outline-offset-[-2px] outline-cyan-300 inline-flex justify-center items-center gap-2.5"
          >
            <div className="w-full h-full left-[2px] top-0 absolute rounded-lg outline outline-[3px] outline-offset-[-1.50px] outline-cyan-300 blur-sm" />
            <div className="relative z-10 text-white sm:text-lg text-sm font-bold  uppercase leading-normal [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
              CREATE ROOM
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
