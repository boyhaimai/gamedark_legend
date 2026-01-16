import { toast } from "@/components/UI/Toast/toast";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useState } from "react";
import { Cell, toNano, beginCell } from "@ton/core";
import { walletCancel } from "@/api/wallet/wallet";
import { useSetAtom } from "jotai";
import { updateUserBalanceAtom, atomUser } from "@/store/user.store";
import type { IUser } from "@/store/user.store";

export const useDeposit = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const setUserBalance = useSetAtom(updateUserBalanceAtom);
  const setUser = useSetAtom(atomUser);

  const handleTransfer = async (
    amount: string,
    wallet?: string,
    orderId?: string
  ) => {
    setLoading(true);
    const safetyTimeout = setTimeout(() => setLoading(false), 30000);

    try {
      if (!amount || Number(amount) <= 0) throw new Error("Invalid amount");
      if (!wallet) throw new Error("Receiver address is missing");

      let messageText = `Deposit ${amount} TON`;
      if (orderId) messageText += ` | Order: ${orderId}`;
      // Encode message as TON Cell (BOC)
      const payload = beginCell()
        .storeUint(0, 32)
        .storeStringTail(messageText)
        .endCell()
        .toBoc()
        .toString("base64");

      const messages = [
        {
          address: wallet,
          amount: toNano(amount).toString(),
          payload,
        },
      ];

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages,
      });

      const updateBalance = (prev: IUser | null) => {
        if (!prev) return prev;
        const newBalance = prev.balance + Number(amount);
        setUserBalance(newBalance);
        return { ...prev, balance: newBalance };
      };

      if (result.boc) {
        try {
          const hash = Cell.fromBase64(result.boc).hash().toString("base64");
          toast.success("Transaction submitted!");
          setUser(updateBalance);
          return { hash, success: true };
        } catch (e) {
          console.warn("Could not parse transaction hash from boc", e);
        }
      } else {
        toast.success("Transaction submitted!");
        setUser(updateBalance);
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      console.error("Transfer error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const userRejectionKeywords = [
        "User rejected",
        "User cancelled",
        "cancelled",
        "rejected",
        "User closed",
        "closed",
        "dismissed",
        "User dismissed",
        "TonConnectUIError",
        "[TON_CONNECT_SDK_ERROR]",
      ];
      const isUserRejected = userRejectionKeywords.some((keyword) =>
        errorMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      if (isUserRejected) {
        clearTimeout(safetyTimeout);
        setLoading(false);
        if (orderId && wallet) {
          try {
            await walletCancel(wallet, orderId);
            toast.success("Order cancelled successfully");
          } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Failed to cancel order");
          }
        }
        return { success: false, cancelled: true };
      }
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
      return { success: false };
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  return { handleTransfer, loading };
};
