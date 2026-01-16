import { getAvatarUrl } from "@/utils/avatar";
import { useUserInfo } from "@/hooks/useUserInfo";
import { gameAtom } from "@/store/game.store";
import { useAtom } from "jotai";
import { useMemo } from "react";

interface HeaderCompetitorProps {
  currentScore?: number;
}

const HeaderCompetitor = ({ currentScore }: HeaderCompetitorProps) => {
  const { user } = useUserInfo();
  const [game] = useAtom(gameAtom);

  const isUser1 = useMemo(() => {
    return game?.user_1._id === user?._id;
  }, [game, user]);

  return (
    <div className="inline-flex justify-start items-center gap-2 ">
      <div className="inline-flex flex-col justify-end items-end gap-1">
        <div className="justify-start text-white text-custom-lg-bold">
          {isUser1
            ? game?.user_2?.username ?? "Opponent"
            : game?.user_1?.username ?? "Opponent"}
        </div>
        {currentScore !== undefined && (
          <div className="justify-start text-fuchsia-500 text-sm font-bold">
            SCORE: {currentScore}
          </div>
        )}
      </div>
      <div className=" flex items-center justify-center">
        <img
          src={getAvatarUrl(
            isUser1 ? game?.user_2?.avatar : game?.user_1?.avatar
          )}
          className="w-11 h-11 rounded-lg "
        />
      </div>
    </div>
  );
};

export default HeaderCompetitor;
