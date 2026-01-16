import {
  connectWallet,
  getDestWallet,
  // getWalletPrice,
  postWalletWithdraw,
  walletAccept,
  walletOrder,
} from "@/api/wallet/wallet";
import { TonIcon } from "@/assets";
import { toast } from "@/components/UI/Toast/toast";
import { useDeposit } from "@/hooks/useDeposit";
import { useDepositJetton } from "@/hooks/useDepositJetton";
import { Select, SelectItem } from "@nextui-org/react";
import { Address } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { clearCache } from "ahooks";
import React, { useRef, useState } from "react";

interface DepositProps {
  type: "DEPOSIT" | "WITHDRAW";
  amount: string;
  setAmount: (v: string) => void;
  refresh: () => void;
}

const token = [
  {
    symbol: "TON",
    img: TonIcon,
  },
  // {
  //   symbol: "SGC",
  //   img: sgc,
  // },
];

const WalletOrder: React.FC<DepositProps> = ({
  type,
  amount,
  setAmount,
  refresh,
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { handleTransfer, loading } = useDeposit();
  const { handleJettonTransfer, loading: jettonLoading } = useDepositJetton();
  const ref = useRef<{ reload?: () => void }>();
  const [selectedToken, setSelectedToken] = useState(token[0]);
  // const { data: price } = useRequest(getWalletPrice, {
  //   cacheKey: "wallet-price",
  //   staleTime: 2 * 60 * 1000,
  // });
  const handleTokenChange = (value: string) => {
    const selectedTokenData = token.find((t) => t.symbol === value);
    if (selectedTokenData) {
      setSelectedToken(selectedTokenData);
    }
  };

  const handleOrder = async () => {
    try {
      if (!amount || Number(amount) <= 0)
        return toast.error("Please enter a valid amount");
      if (!tonConnectUI.connected) return toast.error("Wallet not connected");

      let friendlyAddress = address;
      if (address && !address.startsWith("EQ") && !address.startsWith("UQ")) {
        try {
          friendlyAddress = Address.parse(address).toString({
            testOnly: false,
          });
        } catch (error) {
          console.error("Invalid address format:", error);
          return toast.error("Invalid address format");
        }
      }
      await connectWallet(friendlyAddress);

      const isSGC = selectedToken.symbol === "SGC";
      const {
        data: { data },
      } = await walletOrder(friendlyAddress, isSGC ? "SGC" : undefined);

      const orderId =
        data?.order_id || data?._id || data?.id || data?.orderId || "";

        
      const destWalletRes = await getDestWallet();
      const destWalletRaw =
        destWalletRes?.data?.data?.wallet ||
        destWalletRes?.data?.data?.address ||
        destWalletRes?.data?.data;
      if (!destWalletRaw || typeof destWalletRaw !== "string")
        return toast.error("Invalid destination wallet format");
      let destWallet = destWalletRaw;

      if (!orderId) {
        return toast.error("Failed to create order. Please try again.");
      }

      
      if (!destWalletRaw.startsWith("EQ") && !destWalletRaw.startsWith("UQ")) {
        try {
          destWallet = Address.parse(destWalletRaw).toString({
            testOnly: false,
          });
        } catch (error) {
          console.error("Invalid destination wallet format:", error);
          return toast.error("Invalid destination wallet format");
        }
      }

      if (isSGC) {
        // Extract jetton wallet info from order response
        const userJettonWallet = data?.jettonWalletAddress;
        const decimals = data?.decimals || 9;

        if (!userJettonWallet) {
          return toast.error("Failed to get jetton wallet address. Please try again.");
        }
        if (!destWallet) {
          return toast.error("Failed to get master wallet address. Please try again.");
        }

        // Transfer jetton using hook
        const result = await handleJettonTransfer(
          userJettonWallet,
          destWallet,
          amount,
          decimals,
          orderId
        );

        if (result?.success && result?.hash) {
          try {
            // Show waiting message
            toast.success("Transaction sent! Waiting for confirmation...");
            
            // Wait for transaction to be indexed (polling)
            // This can take 10-60 seconds depending on network
            // Wait for transaction to be indexed (polling)
            // This can take 10-60 seconds depending on network
            const { waitForJettonTransaction } = await import("@/utils/tonTransaction");
            await waitForJettonTransaction(result.hash);
            
            // Transaction confirmed! Send to BE for verification
            await walletAccept(friendlyAddress, result.hash, orderId);
            toast.success("SGC deposit successful!");
            
            if (ref.current?.reload) ref.current.reload();
            setAmount("");
            clearCache("wallet-history");
            refresh();
          } catch (error) {
            console.error("Error confirming transaction:", error);
            
            // Even on timeout, send to BE so cron job can verify later
            try {
              await walletAccept(friendlyAddress, result.hash, orderId);
            } catch (acceptError) {
              console.error("Failed to submit order:", acceptError);
            }
            
            toast.success(
              "Confirmation taking longer than expected. We'll update your balance automatically within 5 minutes."
            );
          }
        }
        return;
      }

      const result = await handleTransfer(amount, destWallet, orderId);
      if (result?.success && result?.hash) {
        await walletAccept(friendlyAddress, result.hash, orderId);
        if (ref.current?.reload) ref.current.reload();
        setAmount("");
        clearCache("wallet-history");
        refresh();
      }
    } catch (error: unknown) {
      console.error("Error in handleOrder:", error);
      toast.error("Transaction failed. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    if (loading) return;
    if (!amount || Number(amount) <= 0)
      return toast.error("Please enter a valid amount");
    if (Number(amount) < 0.001)
      return toast.error("Amount must be at least 0.001");

    let friendlyAddress = address;
    if (address && !address.startsWith("EQ") && !address.startsWith("UQ")) {
      try {
        friendlyAddress = Address.parse(address).toString({
          testOnly: false,
        });
      } catch (error) {
        console.error("Invalid address format:", error);
        return toast.error("Invalid address format");
      }
    }

    try {
      await connectWallet(friendlyAddress);
      await postWalletWithdraw(friendlyAddress, Number(amount));
      toast.success("Withdrawal request sent successfully");
      if (ref.current?.reload) ref.current.reload();
      setAmount("");
      clearCache("wallet-history");
      refresh();
    } catch (error) {
      console.error("Error in handleWithdraw:", error);
      toast.error("Transaction failed. Please try again.");
    }
  };

  const handleButtonClick = () => {
    if (!address) return;
    return type === "DEPOSIT" ? handleOrder() : handleWithdraw();
  };

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="w-full flex justify-between items-center mb-2">
          <p className="font-normal text-white text-custom-sm-bold drop-shadow-md tracking-tight">
            {type}
          </p>
          <div className="flex items-center space-x-2">
            {/* <p className="text-white text-custom-sm-bold">
                Balance:{" "}
                {user?.balance ? formatNumberDot(Number(user?.balance)) : 0} TON
              </p> */}
            {/* <button
            className="justify-start text-[#EFC609] text-custom-sm-bold underline tracking-tight"
            onClick={() => setAmount(balance.toFixed(2))}>
            MAX
          </button> */}
          </div>
        </div>

        <div className="w-full bg-[#FFFFFF3D] border-2 border-[#FFFFFF3D] rounded-xl flex items-center justify-between mb-4 shadow-lg p-4">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-custom-xl-bold text-white outline-none tracking-tight drop-shadow-md placeholder:text-gray-300 placeholder:opacity-80"
          />
          <Select
            selectedKeys={[selectedToken.symbol]}
            onChange={(e) => handleTokenChange(e.target.value)}
            className=" rounded-full max-sm:max-w-[22%] max-w-[120px] flex items-center justify-center"
            size="md"
            aria-label="Select token"
            classNames={{
              trigger: "bg-[#47FFFF] rounded-full flex items-center gap-2",
              value: "flex items-center gap-2",
              mainWrapper: "bg-[#47FFFF] rounded-full",
              listbox: "p-0",
              popoverContent: "px-2",
            }}
            renderValue={() => (
              <div className="flex items-center gap-1">
                <img
                  className="w-6 h-6 rounded-full"
                  src={selectedToken.img}
                  alt={selectedToken.symbol}
                />
                <p className="text-black sm:text-custom-lg-bold hide-on-415">
                  {selectedToken.symbol}
                </p>
              </div>
            )}
          >
            {token.map((t) => (
              <SelectItem
                key={t.symbol}
                value={t.symbol}
                textValue={t.symbol}
                className="px-0"
              >
                <div className="flex items-center gap-2 w-fit">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={t.img}
                    alt={t.symbol}
                  />
                  <p className="text-black sm:text-custom-lg-bold hide-on-415">
                    {t.symbol}
                  </p>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>

        <button
          className={`w-full h-16 mt-5 relative bg-[#47FFFF] rounded-lg border-3 border-[#47FFFF]  ${
            !tonConnectUI.connected ||
            Number(amount) <= 0 ||
            loading ||
            jettonLoading
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            !tonConnectUI.connected ||
            Number(amount) <= 0 ||
            loading ||
            jettonLoading
          }
          onClick={handleButtonClick}
        >
          <div className="justify-start text-gray-800 text-xl font-normal font-['Squada_One'] uppercase leading-normal">
            {loading || jettonLoading
              ? "Processing..."
              : selectedToken.symbol === "SGC" && type === "DEPOSIT"
              ? "Deposit SGC"
              : `${type}`}
          </div>
        </button>
      </div>
    </>
  );
};

export default WalletOrder;
