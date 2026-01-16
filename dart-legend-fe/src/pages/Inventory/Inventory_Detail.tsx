import WrapperPage from "@/components/Section/WrapperPage";
import { formatNumber } from "@/utils/fc.utils";
import { NFT } from "@/utils/type";

const Inventory_Detail = ({
  data,
  onClose,
  animationType,
}: {
  data: NFT;
  onClose: () => void;
  animationType: "fade-up" | "slide-left";
}) => {
  return (
    <WrapperPage showMenu={false} animationType={animationType} show={true}>
      <div className="animate-fade-in">
        <div className="w-full bg-blue-500 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)] flex items-center justify-between p-4">
          <div className="flex items-center gap-4 justify-start">
            <button
              className="left-4 z-10 cursor-pointer hover-scale transition-transform duration-200"
              onClick={onClose}
            ></button>
            <p className="text-white text-custom-xl-bold">INVENTORY DETAIL</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center gap-4 animate-slide-up">
        <div className="w-full border-2 bg-[#001F4D] border-black rounded-xl shadow-[0px_0px_19.250091552734375px_0px_rgba(244,189,255,0.70)] flex justify-center hover-lift">
          <img
            src={data.image}
            alt={data.name}
            className="w-[358px] h-[358px]"
          />
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-white text-custom-xl-bold tracking-tight">
            # {data.name}
          </p>
        </div>

        <p className="text-white text-custom-sm-bold tracking-tight">
          {data.description}
        </p>
        <div className="flex items-center justify-between w-full gap-3"></div>
      </div>
      <div className="bg-[#032F6F] p-4 rounded-xl shadow-[0px_0px_19.25px_0px_rgba(244,189,255,0.70)] m-4 flex items-center justify-between animate-fade-in">
        <p className="text-white text-custom-sm-bold tracking-tight">Pricing</p>
        <p className="text-white text-custom-sm-bold tracking-tight">
          {formatNumber(data.price)} balanceLogo2
        </p>
      </div>
    </WrapperPage>
  );
};

export default Inventory_Detail;
