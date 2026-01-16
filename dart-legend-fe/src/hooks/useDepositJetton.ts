import { toast } from "@/components/UI/Toast/toast";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useState } from "react";
import { Cell, beginCell, Address, toNano } from "@ton/core";
import { walletCancel } from "@/api/wallet/wallet";

export const useDepositJetton = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);

  const handleJettonTransfer = async (
    jettonWalletAddress: string,
    destinationAddress: string,
    amount: string,
    decimals: number = 9,
    orderId?: string
  ) => {
    setLoading(true);
    const safetyTimeout = setTimeout(() => setLoading(false), 30000);

    try {
      if (!amount || Number(amount) <= 0) throw new Error("Invalid amount");
      if (!jettonWalletAddress) throw new Error("Jetton wallet address is missing");
      if (!destinationAddress) throw new Error("Destination address is missing");

      // Convert amount to basic units based on decimals
      const jettonAmount = BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));

      // Build forward payload (comment)
      let comment = `Deposit ${amount} SGC`;
      if (orderId) comment += ` | Order: ${orderId}`;
      
      const forwardPayloadCell = beginCell()
        .storeUint(0, 32) // Text comment opcode
        .storeStringTail(comment)
        .endCell();



      const jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // Jetton transfer opcode
        .storeUint(0, 64) // query_id
        .storeCoins(jettonAmount) // amount of jettons to transfer
        .storeAddress(Address.parse(destinationAddress)) // destination address (master wallet)
        .storeAddress(Address.parse(destinationAddress)) // response_destination (where to send excess TON)
        .storeBit(0) // custom_payload (null)
        .storeCoins(toNano("0.05")) // forward_ton_amount (for notification)
        .storeBit(1) // forward_payload in separate cell
        .storeRef(forwardPayloadCell) // forward_payload
        .endCell();

      const payload = jettonTransferBody.toBoc().toString("base64");

      // Send transaction to user's jetton wallet
      const messages = [
        {
          address: jettonWalletAddress, // User's jetton wallet address
          amount: toNano("0.1").toString(), // TON for gas fees
          payload,
        },
      ];

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages,
      });

      if (result.boc) {
        try {
          const hash = Cell.fromBase64(result.boc).hash().toString("base64");
          toast.success("Jetton transfer submitted! Waiting for confirmation...");
          // Don't update balance optimistically anymore
          // setUser(updateBalance); 
          return { hash, success: true };
        } catch (e) {
          console.warn("Could not parse transaction hash from boc", e);
          toast.success("Jetton transfer submitted! Waiting for confirmation...");
          return { success: true };
        }
      } else {
        toast.success("Jetton transfer submitted! Waiting for confirmation...");
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      console.error("Jetton transfer error:", error);
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
        if (orderId && destinationAddress) {
          try {
            await walletCancel(destinationAddress, orderId);
            toast.success("Order cancelled successfully");
          } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Failed to cancel order");
          }
        }
        return { success: false, cancelled: true };
      }
      toast.error(
        error instanceof Error ? error.message : "Jetton transfer failed"
      );
      return { success: false };
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  return { handleJettonTransfer, loading };
};
