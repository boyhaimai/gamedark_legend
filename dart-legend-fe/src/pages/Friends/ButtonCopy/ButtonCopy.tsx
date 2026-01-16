import { Copy } from "@/assets";
import { toast } from "@/components/UI/Toast/toast";
import { useLinkInvite } from "@/hooks/useLinkInvite";
import copy from "copy-to-clipboard";

export default function ButtonCopy() {
  const { textAndLink } = useLinkInvite();
  const onCopy = async () => {
    copy(textAndLink);
    toast.success("Copied");
  };

  return (
    <button
      className="w-20 h-16 relative bg-[#47FFFF] rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)] outline outline-2 outline-black overflow-hidden"
      onClick={onCopy}>
      <div className="w-9 h-9 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img src={Copy} alt="copy" className="w-full h-full" color="black" />
      </div>
    </button>
  );
}
