import { sendTo } from "@/api/wallet/wallet";
import { toast } from "@/components/UI/Toast/toast";
import { useAtomValue } from "jotai";
import { atomUser } from "@/store/user.store";
import { useState } from "react";

interface SendToProps {
  refresh: () => void;
}

const SendTo: React.FC<SendToProps> = ({ refresh }) => {
  const user = useAtomValue(atomUser);
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userName.trim()) {
      toast.error("Please enter a username");
      return;
    }
    const numericAmount = Number(amount);
    if (!amount || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (numericAmount > (user?.balance ?? 0)) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setLoading(true);
    try {
      await sendTo(userName.trim(), amount);
      toast.success("Balance sent successfully");
      setUserName("");
      setAmount("");
      refresh();
    } catch (error) {
      console.error("Failed to send balance:", error);
      toast.error("Failed to send balance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full flex flex-col gap-4 bg-[#FFFFFF1A] border border-[#FFFFFF33] rounded-2xl p-4 shadow-lg">
        <p className="text-white text-lg font-bold tracking-wide text-center">
          SEND BALANCE
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-semibold">
              Recipient username
            </label>
            <span className="text-white/70 text-xs">
              Available: {user?.balance?.toLocaleString() ?? 0}
            </span>
          </div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter username"
            className="w-full rounded-lg border border-[#47FFFF66] bg-transparent px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-[#47FFFF]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-semibold">Amount</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-[#47FFFF66] bg-transparent px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-[#47FFFF]"
          />
        </div>
        <button
          className={`w-full h-14 mt-2 relative bg-[#47FFFF] rounded-lg border-2 border-[#47FFFF] text-gray-900 text-xl font-['Squada_One'] uppercase tracking-wide ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={loading}
          onClick={handleSend}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default SendTo;
