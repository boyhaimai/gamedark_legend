import HeaderCompetitor from "@/components/Section/Header/HeaderCompetitor";
import HeaderInfo from "@/components/Section/Header/HeaderInfo";
import WrapperPage from "@/components/Section/WrapperPage";
import { gameAtom } from "@/store/game.store";
import { useAtom } from "jotai";
import Game from "../game/Game";
import { useEffect, useState } from "react";
import { SocketEvent, socketIo } from "@/service/socket/SocketListener";
import { topBgGame } from "@/assets";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "@/router/route-path";

const Dart = () => {
  const [game, setGame] = useAtom(gameAtom);
  const [remain, setRemain] = useState(60);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const navigate = useNavigate();

  // Nếu thiếu đối thủ (game chưa đủ dữ liệu), đưa về Home để tránh crash
  useEffect(() => {
    if (!game?.user_1 || !game?.user_2) {
      navigate(ROUTE_PATH.HOME, { replace: true });
    }
  }, [game?.user_1, game?.user_2, navigate]);

  // Force Telegram back button (and hardware back) to return to HOME
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();

    const handleBack = () => {
      navigate(ROUTE_PATH.HOME, { replace: true });
    };

    if (tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    }

    // Fallback: Bind to the event directly in case onClick misses
    if (tg.onEvent) {
      tg.onEvent("backButtonClicked", handleBack);
    }

    // Optional: handle browser back (popstate) to also return HOME from game
    window.addEventListener("popstate", handleBack);

    return () => {
      if (tg.BackButton) {
        tg.BackButton.offClick(handleBack);
        tg.BackButton.hide();
      }
      if (tg.offEvent) {
        tg.offEvent("backButtonClicked", handleBack);
      }
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);

  useEffect(() => {
    if (!game?._id) return;
    socketIo.emit(SocketEvent.GET_GAME, game._id);
    const handleGameData = (data: any) => {
      setGame(data);
    };
    socketIo.on(SocketEvent.SEND_DATA_GAME, handleGameData);
    return () => {
      socketIo.off(SocketEvent.SEND_DATA_GAME, handleGameData);
    };
  }, [game?._id, setGame]);

  useEffect(() => {
    if (!game?._id) return;
    socketIo.connect();
    socketIo.emit(SocketEvent.JOIN_GAME, game._id);
  }, [game?._id]);

  useEffect(() => {
    if (!game?.updatedAt) return;
    const calcRemain = () => {
      const updatedAt = new Date(game.updatedAt).getTime();
      const now = Date.now();
      const remainSec = 60 - Math.floor((now - updatedAt) / 1000);
      return remainSec > 0 ? remainSec : 0;
    };
    setRemain(calcRemain());
    if (calcRemain() <= 0) return;

    const interval = setInterval(() => {
      setRemain(calcRemain());
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.updatedAt]);

  const minutes = Math.floor(remain / 60);
  const secs = remain % 60;
  const timeString = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <WrapperPage bg>
      <img
        src={topBgGame}
        alt="topBgGame"
        className="w-full absolute top-0 left-0"
      />
      <div className="flex items-center justify-between h-20 p-4 z-10">
        <HeaderInfo currentScore={currentScore} />
        <HeaderCompetitor currentScore={opponentScore} />
      </div>
      <div className="flex flex-col items-center justify-center mb-2 w-full gap-2">
        <div className="w-16 text-center justify-start bg-[#000000A3] rounded-[48px] border-[0.50px] border-neutral-800/10  text-cyan-300">
          {timeString}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full flex-1">
        <Game
          onScoreChange={setCurrentScore}
          onOpponentScoreChange={setOpponentScore}
        />
      </div>
    </WrapperPage>
  );
};

export default Dart;
