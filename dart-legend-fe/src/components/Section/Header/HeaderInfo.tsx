import { getAvatarUrl } from "@/utils/avatar";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formatNumber } from "@/utils/fc.utils";
import { sgc } from "@/assets";
import { getEarnSGC } from "@/api/wallet/wallet";
import { useRequest } from "ahooks";
import { Skeleton } from "@nextui-org/react";

interface HeaderInfoProps {
  currentScore?: number;
}

export default function HeaderInfo({ currentScore }: HeaderInfoProps) {
  const { user } = useUserInfo();

  const { data, loading } = useRequest(getEarnSGC, {
    cacheKey: "earn-sgc",
    staleTime: 5 * 60 * 1000,
  });

  const earnSGC = data?.data?.data.total ?? 0;

  return (
    <div className="pl-1 pr-4 flex justify-start items-center gap-2">
      <div className="flex justify-between items-center gap-2">
        <img
          src={getAvatarUrl(user?.avatar)}
          className="w-11 h-11 rounded-lg"
          alt="avatar"
        />
        <div className="">
          <div className="justify-start text-white text-lg font-bold  [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
            {user?.username}
          </div>
          <div className="justify-start text-yellow-300 text-sm font-bold flex items-center gap-1">
            {currentScore !== undefined ? (
              <>SCORE: {currentScore}</>
            ) : loading ? (
              <Skeleton className="rounded-md w-16 h-4 bg-white/20" />
            ) : (
              <>
                <img
                  src={sgc}
                  alt="SGC"
                  className="w-5 h-5 object-contain rounded-full"
                />
                {formatNumber(earnSGC ?? 0)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
