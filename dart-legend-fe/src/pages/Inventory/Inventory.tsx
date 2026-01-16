import { getNFT_User } from "@/api/nft/nft";
import { nftStore } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import Loading from "@/components/UI/Loading";
import NFTCard from "@/components/UI/NFTCard";
import { nftInfo } from "@/constant/nftInfo";
import { Iinventory } from "@/utils/type";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Inventory = () =>
  // { onSelectNFT }: { onSelectNFT: (nft: NFT) => void }
  {
    const navigate = useNavigate();
    const { data, loading } = useRequest(getNFT_User, {
      cacheKey: "nft-user",
      staleTime: 5 * 60 * 1000,
    });
    const [inventory, setInventory] = useState<Iinventory[]>([]);
    const [show, setShow] = useState(true);
    const [animationType, setAnimationType] = useState<
      "fade-up" | "slide-left"
    >("fade-up");
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
      if (data?.data?.data && Array.isArray(data.data.data)) {
        const item = data.data.data.map((item: Iinventory) => ({
          ...item,
        }));
        setTimeout(() => setShowContent(true), 200);
        if (item) {
          setInventory(item);
        } else {
          setInventory([]);
        }
      }
    }, [data]);

    // const handleClick = (nft: Iinventory) => {
    //   onSelectNFT({
    //     ...nft.nft,
    //     img: nft.nft.img,
    //   });
    // };

    const handleBack = () => {
      setAnimationType("slide-left");
      setShow(false);
    };

    const handleExited = () => {
      navigate(-1);
    };

    return (
      <WrapperPage
        showMenu={false}
        animationType={animationType}
        show={show}
        onExited={handleExited}
      >
        <HeaderNormalPage title="INVENTORY" onBack={handleBack} />

        {loading ? (
          <Loading className="min-h-[75vh]" />
        ) : (
          <div
            className={`min-h-[60vh] p-4 grid gap-4 transition-opacity duration-300 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {inventory.length > 0 ? (
              inventory.map((nft, index) => (
                <div key={index}>
                  <NFTCard
                    variant="inventory"
                    nft={{
                      ...nft.nft,
                      img: nftInfo[nft.nft.type as keyof typeof nftInfo]?.image,
                    }}
                    pricing={nft.nft.price}
                    count={nft.count}
                    earnings={nft.reward_SGC}
                    unclaimedReward={nft.reward - nft.unclaimed_reward}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center min-h-[60vh]">
                <img
                  src={nftStore}
                  alt="No NFT"
                  className="w-25 h-25 opacity-60 mb-2"
                />
                <p className="text-white text-custom-xl-bold text-center">
                  You don't own any NFT yet
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-cyan-400 rounded-lg transition"
                  onClick={() => navigate("/store")}
                >
                  <p className="text-white text-custom-xl-bold">
                    Explore Store
                  </p>
                </button>
              </div>
            )}
          </div>
        )}
      </WrapperPage>
    );
  };

export default Inventory;
