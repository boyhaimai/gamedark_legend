// import { disconnectWallet } from "@/api/wallet/wallet";
import { disconnectWallet } from "@/api/wallet/wallet";
import { Copy, TonIcon } from "@/assets";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useMemo, useState } from "react";
import { toast } from "@/components/UI/Toast/toast";
import copy from "copy-to-clipboard";

const Disconnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const receiver = useTonAddress();
  const [loading, setLoading] = useState(false);

  const onCopy = async () => {
    copy(receiver);
    toast.success("Copied");
  };

  const sliceWallet = useMemo(() => {
    if (!receiver) return "";
    return receiver.slice(0, 6) + "..." + receiver.slice(-4);
  }, [receiver]);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await tonConnectUI.disconnect();
      await disconnectWallet(receiver);
      toast.success("Disconnected successfully");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className=" relative p-4 flex flex-col items-center justify-center">
      <img src={TonIcon} alt="Wallet Home" />
      <section className=" bg-bg-navbar w-full  py-2 cursor-pointer ">
        <div className="text-center mb-6 mt-8">
          <div className="self-stretch text-center justify-start text-white text-xl font-bold font-['Roboto_Mono']">
            YOUR TON WALLET IS CONNECTED
          </div>
          <div className="self-stretch text-center justify-start text-white text-sm font-normal font-['Roboto_Mono']">
            You can disconnect it or copy wallet address
          </div>
        </div>
        <div className="w-full flex justify-between">
          <div className="flex w-full items-center justify-center p-4 gap-2 bg-[#47FFFF] border-[3px] border-[#47FFFF] rounded-lg ">
            <p className="justify-start text-gray-800 text-xl font-normal font-['Squada_One'] uppercase">
              {sliceWallet}
            </p>
            <button onClick={onCopy}>
              <img src={Copy} alt="Copy" />
            </button>
          </div>
        </div>
      </section>
      <button
        className="h-14 px-6 py-3 mt-32 relative bg-black/40 rounded-lg outline outline-2 outline-offset-[-2px] outline-cyan-300 inline-flex justify-center items-center gap-2.5"
        onClick={handleDisconnect}
        disabled={loading}
      >
        <div className="w-full h-14 left-0 top-0 absolute rounded-lg border-[3px] border-cyan-300 blur-sm" />
        <div className="justify-start text-white text-xl font-normal font-['Squada_One'] uppercase leading-normal [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
          Disconnect
        </div>
      </button>
    </div>
  );
};

export default Disconnect;
