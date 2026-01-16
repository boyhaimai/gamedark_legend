import { connectWallet } from "@/api/wallet/wallet";
import { TonIcon } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
} from "@tonconnect/ui-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletPage from "./Tabs";

const Wallet = () => {
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [show, setShow] = useState(true);
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const navigate = useNavigate();

  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };
  const connectWalletToUpdateDB = async () => {
    await connectWallet(address);
  };
  useEffect(() => {
    if (wallet) {
      connectWalletToUpdateDB();
    }
  }, [wallet]);

  React.useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => {
        navigate(-1);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [show, navigate]);

  return (
    <WrapperPage
      showMenu={false}
      animationType={animationType}
      show={show}
      bg={false}
    >
      <HeaderNormalPage title="WALLET" onBack={handleBack} />
      <div className="flex flex-col items-center justify-center relative">
        {!wallet ? (
          <div className="mt-24 w-full flex flex-col items-center justify-center">
            <img src={TonIcon} alt="Wallet Home" className="m-4" />
            <section className=" w-full  py-2 cursor-pointer p-4">
              <div className="text-center mb-6 mt-8">
                <p className="text-white text-xl font-bold">
                  CONNECT YOUR TON WALLET
                </p>
                <p className="text-center text-white text-sm font-normal mt-3">
                  Connect your TON wallet, if you don’t have one, create one in
                  your telegram account
                </p>
              </div>
              <button className="self-stretch w-full h-14 px-6 py-3 relative bg-black/40 rounded-lg outline outline-2 outline-offset-[-2px] outline-cyan-300 inline-flex justify-center items-center gap-2.5">
                <div className="w-full h-14 left-0 top-0 absolute rounded-lg border-[3px] border-cyan-300 blur-sm" />
                <div className="justify-start text-white text-xl font-normal font-['Squada_One'] uppercase leading-normal [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                  <div className="justify-start text-white text-xl font-normal font-['Squada_One'] uppercase leading-normal [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                    Connect ton wallet
                  </div>
                </div>
              </button>
            </section>
          </div>
        ) : (
          <WalletPage />
        )}
        <div className="absolute bottom-0 px-4 left-0 right-0 w-full">
          <TonConnectButton className="w-full min-w-[680px] h-14 rounded-lg" />
        </div>
      </div>
    </WrapperPage>
  );
};

export default Wallet;
