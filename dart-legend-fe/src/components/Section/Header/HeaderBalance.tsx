import { balanceLogo, balanceLogo2 } from "@/assets";
import Loading from "@/components/UI/Loading";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formatNumber } from "@/utils/fc.utils";

export default function HeaderBalance() {
  const { user, loadingUser } = useUserInfo();

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className="w-32 h-6 rounded-[4px] bg-[#0000003D] outline outline-2 outline-offset-[-2px] outline-cyan-300 pr-6 flex items-center justify-center py-1 relative z-1">
          {loadingUser ? (
            <Loading className="w-8 h-8" />
          ) : (
            <p className="text-custom-sm-bold text-white custom-border-text-1 z-2 relative stroke-0-4">
              {user && formatNumber(user?.balance)}
            </p>
          )}
        </div>
        <img
          src={balanceLogo}
          className="w-8 h-8 absolute top-[-4px] right-[-6px]"
          style={{
            zIndex: 10,
          }}
        />
      </div>
      <div className="relative">
        <img
          src={balanceLogo2}
          className="w-8 h-8 absolute top-[-6px] right-[-6px]"
          style={{
            zIndex: 10,
          }}
        />
        <div className="w-32 h-6 rounded-[4px] bg-[#0000003D] outline outline-2 outline-offset-[-2px] outline-cyan-300 pr-6 flex items-center justify-center py-1 relative z-1">
          {loadingUser ? (
            <Loading className="w-8 h-8" />
          ) : (
            <p className="text-custom-sm-bold text-white custom-border-text-1 z-2 relative stroke-0-4">
              {user && formatNumber(user?.point)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
