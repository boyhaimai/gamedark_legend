import HeaderBalance from "@/components/Section/Header/HeaderBalance";
import WrapperPage from "@/components/Section/WrapperPage";
import { nftInfo } from "@/constant/nftInfo";
import { NFT } from "@/utils/type";
import { useState } from "react";

const NFTDetail = ({
  data,
  onClose,
  animationType,
}: {
  data: NFT;
  onClose: () => void;
  animationType: "fade-up" | "slide-left";
}) => {
  const [quantity, setQuantity] = useState(1);

  // const handleByNFT = (id: string) => {
  //   postBuyNft(id);
  //   clearCache("nft-store");
  //   clearCache("nft-user");
  // };

  return (
    <WrapperPage showMenu={false} animationType={animationType} show={true}>
      <div>
        <div className="w-full bg-blue-500 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)] flex items-center justify-between p-4">
          <div className="flex items-center gap-4 justify-start">
            <button
              className="left-4 z-10 cursor-pointer hover-scale transition-transform duration-200"
              onClick={onClose}
            ></button>
            <p className="text-white text-custom-xl-bold">NFT STORE</p>
          </div>
          <HeaderBalance />
        </div>
      </div>

      <div className="p-4 flex flex-col items-center gap-4">
        <div className="w-full border-2 bg-[#001F4D] border-black rounded-xl shadow-[0px_0px_19.250091552734375px_0px_rgba(244,189,255,0.70)] flex justify-center">
          <img
            src={nftInfo[data.type as keyof typeof nftInfo].image}
            alt={data.name}
            className="w-[358px] h-[358px]"
          />
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-white text-custom-xl-bold tracking-tight ">
            # {data.name}
          </p>
        </div>

        <p className="text-white text-custom-sm-bold tracking-tight">
          {data.description}
        </p>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center justify-center gap-2 py-2 px-[2px] bg-[#1F2535] border border-black rounded-lg">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            ></button>
            <p className="text-white text-lg font-normal min-w-[30px] text-center">
              {quantity}
            </p>
            <button onClick={() => setQuantity((prev) => prev + 1)}></button>
          </div>
          {/* <button
            className={`flex gap-2 items-center justify-center text-lg bg-[#EFC609] rounded-lg py-2 px-8 w-[70%] ${
              data.isOwned ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleByNFT(data._id);
            }}
            disabled={data.isOwned}>
            <img src={balanceLogo2} alt="balanceLogo2" className="w-8 h-8" />
            <p className="font-normal text-white">{data.price}</p>
          </button> */}
        </div>
      </div>
    </WrapperPage>
  );
};

export default NFTDetail;
