import { balanceLogo, sgc } from "@/assets";
import { NFT } from "@/utils/type";
import React from "react";
import { formatNumber } from "@/utils/fc.utils";

interface NFTCardProps {
  nft: NFT & { img?: string };
  variant: "inventory" | "store";
  pricing?: number | string;
  onClick?: () => void;
  onBuy?: () => void;
  isLoading?: boolean;
  count?: number;
  earnings?: number;
  unclaimedReward?: number;
}

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  variant,
  pricing,
  count,
  earnings,
  unclaimedReward,
  onClick,
  onBuy,
  isLoading = false,
}) => {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) {
      return;
    }
    onBuy?.();
  };
  const handleCardClick = () => {
    if (!isLoading) {
      onClick?.();
    }
  };

  if (variant === "store") {
    // Tính toán thanh tiến trình dựa vào lượng đã bán và tổng supply
    const sold = Number(nft.total_sold || 0); // Lượng đã bán
    const supply = Number(nft.total || 0); // Tổng supply
    const percent = supply > 0 ? Math.min((sold / supply) * 100, 100) : 0;
    return (
      <div
        className={`w-full rounded-2xl p-4 bg-[#0000003D] border-2 border-[#47FFFF] flex items-center gap-4 ${
          isLoading ? "opacity-75 pointer-events-none" : ""
        }`}
        onClick={handleCardClick}
        style={{ boxSizing: "border-box" }}
      >
        {/* Left image */}
        <img src={nft.img} alt={nft.name} className="w-36 h-36" />

        {/* Right content */}
        <div className="flex-1 flex flex-col gap-4 w-[50%]">
          <p className="text-white text-sm font-bold"># {nft.name}</p>

          {/* Progress */}
          <div className="relative w-full h-4 rounded-[4px] bg-[#FFFFFF3D] overflow-hidden">
            {/* Fill */}
            <div
              className="absolute left-0 top-0 h-full bg-[#47FFFF] "
              style={{ width: `${percent}%` }}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-[4px] text-white text-xs font-medium">
              {formatNumber(sold)}/{formatNumber(supply)}
            </div>
          </div>

          {/* Price button */}
          <button
            className="mt-3 w-full py-[10px] rounded-lg bg-gradient-to-r from-[#FC1CFF] to-[#00FCFF] flex items-center justify-center gap-1 text-white"
            onClick={handleBuyClick}
            disabled={isLoading}
          >
            <img src={balanceLogo} alt="balanceLogo2" className="w-6 h-6" />
            <p className="text-white text-base font-bold tracking-wider">
              {isLoading ? "Buying..." : formatNumber(Number(pricing))}
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl p-4 bg-[#0000003D] border-2 border-[#47FFFF] flex items-center gap-4 ${
        isLoading ? "opacity-75 pointer-events-none" : ""
      }`}
      onClick={handleCardClick}
      style={{ boxSizing: "border-box" }}
    >
      {/* Left image */}
      <img src={nft.img} alt={nft.name} className="w-36 h-36" />

      {/* Right content */}
      <div className="flex-1 flex flex-col gap-4 w-[50%]">
        <p className="text-white text-sm font-bold"># {nft.name}</p>

        <div className=" inline-flex justify-between items-center">
          <div className="justify-start text-white text-sm font-bold font-['Roboto_Mono']">
            Amount
          </div>
          <div className="justify-start text-white text-sm font-bold font-['Roboto_Mono']">
            {count || 0}
          </div>
        </div>
        <div className=" inline-flex justify-between items-center">
          <div className="justify-start text-white text-sm font-bold font-['Roboto_Mono']">
            Pricing
          </div>
          <div className="flex gap-2 items-center">
            <div className="justify-start text-cyan-300 text-sm font-bold font-['Roboto_Mono']">
              {formatNumber(Number(pricing))}
            </div>
            <img src={balanceLogo} alt="balanceLogo" className="w-5 h-5" />
          </div>
        </div>
        <div className=" inline-flex justify-between items-start">
          <div className="justify-start text-white text-sm font-bold font-['Roboto_Mono'] mt-1">
            Earning
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-2 items-center">
              <div className="justify-start text-cyan-300 text-sm font-bold font-['Roboto_Mono']">
                {formatNumber(Number(unclaimedReward) || 0)}
              </div>
              <img src={balanceLogo} alt="balanceLogo" className="w-5 h-5" />
            </div>
            <div className="flex gap-2 items-center">
              <div className="justify-start text-cyan-300 text-sm font-bold font-['Roboto_Mono']">
                {formatNumber(Number(earnings) || 0)}
              </div>
              <img src={sgc} alt="sgc" className="w-5 h-5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
