import { getNFT, postBuyNft } from "@/api/nft/nft";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import Loading from "@/components/UI/Loading";
import NFTCard from "@/components/UI/NFTCard";
import { toast } from "@/components/UI/Toast/toast";
import { nftInfo } from "@/constant/nftInfo";
import { useUserInfo } from "@/hooks/useUserInfo";
import { atomUser, updateUserBalanceAtom } from "@/store/user.store";
import { NFT } from "@/utils/type";
import { useTonAddress } from "@tonconnect/ui-react";
import { clearCache, useRequest } from "ahooks";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const NFTStore = () => {
  const navigate = useNavigate();
  const { data: dataNFT, loading: loadingNFT } = useRequest(getNFT, {
    cacheKey: "nft-store",
    staleTime: 5 * 60 * 1000,
  });

  const address = useTonAddress();
  const { user } = useUserInfo();
  const userWallet = user?.wallet;
  const [store, setStore] = useState<NFT[]>([]);
  const [show, setShow] = useState(true);
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const [showContent, setShowContent] = useState(false);
  const [buyingNFT, setBuyingNFT] = useState<string | null>(null);
  const setUserBalance = useSetAtom(updateUserBalanceAtom);
  const setUser = useSetAtom(atomUser);

  useEffect(() => {
    if (dataNFT?.data?.data) {
      setStore(dataNFT?.data?.data);
      setTimeout(() => setShowContent(true), 200);
    }
  }, [dataNFT]);

  const handleExited = () => {
    navigate(-1);
  };

  const nftDataWithImage = useMemo(() => {
    return store.map((nft) => ({
      ...nft,
      img: nftInfo[nft.type as keyof typeof nftInfo]?.image,
    })) as (NFT & { img: string })[];
  }, [store]);
  const handleByNFT = async (id: string) => {
    if (!address || (userWallet && userWallet !== address)) {
      toast.error("Please connect your TON wallet first!");
      return;
    }
    if (buyingNFT === id) {
      return;
    }
    try {
      setBuyingNFT(id);

      const purchasedNFT = store.find((nft) => nft._id === id);
      if (!purchasedNFT) {
        toast.error("NFT not found!");
        return;
      }
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser.balance < Number(purchasedNFT.price)) {
        toast.error("Insufficient balance!");
        return;
      }

      const response = await postBuyNft(id);
      if (response?.data?.message) {
        setUser((prev) => {
          if (!prev) return prev;
          const newBalance = prev.balance - Number(purchasedNFT.price);
          setUserBalance(newBalance);
          return { ...prev, balance: newBalance };
        });

        toast.success("NFT purchased successfully!");
        clearCache("nft-store");
        clearCache("nft-user");
        const { data } = await getNFT();
        if (data?.data) {
          setStore(data.data);
        }
      }
    } catch (error: any) {
      console.error("Error buying NFT:", error);
      const message =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to purchase NFT");
      toast.error(message);
    } finally {
      setBuyingNFT(null);
    }
  };

  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };

  return (
    <WrapperPage
      showMenu={false}
      animationType={animationType}
      show={show}
      onExited={handleExited}
    >
      <HeaderNormalPage title="NFT STORE" onBack={handleBack} />
      {loadingNFT ? (
        <Loading className="min-h-[75vh]" />
      ) : (
        <div
          className={`p-4 transition-opacity duration-300 h-[90dvh] overflow-y-auto scrollbar-hide ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 gap-4 place-items-center mb-7 w-full">
            {nftDataWithImage.map((nft, idx) => {
              return (
                <div
                  key={idx}
                  className="stagger-item flex justify-center w-full"
                >
                  <NFTCard
                    nft={{
                      ...nft,
                      img: nftInfo[nft.type as keyof typeof nftInfo]?.image,
                    }}
                    variant="store"
                    pricing={nft.price}
                    onBuy={() => handleByNFT(nft._id)}
                    isLoading={buyingNFT === nft._id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </WrapperPage>
  );
};

export default NFTStore;
