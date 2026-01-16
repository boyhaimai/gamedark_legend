import { cancelGame } from "@/api/game/game";
import { Rotation } from "@/assets";
import HeaderInfo from "@/components/Section/Header/HeaderInfo";
import WrapperPage from "@/components/Section/WrapperPage";
import { toast } from "@/components/UI";
import { getAvatarUrl } from "@/utils/avatar";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTE_PATH } from "@/router/route-path";
import { SocketEvent, socketIo } from "@/service/socket/SocketListener";
import { gameAtom } from "@/store/game.store";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const messages = ["FINDING PLAYER...", "MATCH FOUND!"];

const LoadingGame = () => {
  const { user } = useUserInfo();
  const [isMatched, setIsMatched] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [text, setText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [gameId, setGameId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{
    username: string;
    avatar: string | null;
  } | null>(null);
  const [waitingText, setWaitingText] = useState("");
  const [isCancel, setIsCancel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const setGame = useSetAtom(gameAtom);

  const matchGame = location.state?.matchGame;
  useEffect(() => {
    if (!matchGame) {
      navigate(ROUTE_PATH.HOME);
      return;
    }
    setGameId(matchGame._id);
    if (matchGame.status === "START_GAME") {
      setIsMatched(true);
      setGame(matchGame);
      const myId = user?._id;
      const { user_1, user_2 } = matchGame;
      if (user_1 && user_2) {
        if (user_1._id === myId) {
          setOtherUser({
            username: user_2.username,
            avatar: user_2.avatar || null,
          });
        } else {
          setOtherUser({
            username: user_1.username,
            avatar: user_1.avatar || null,
          });
        }
      }
    }

    const handleJoinGame = () => {
      socketIo.emit(SocketEvent.JOIN_GAME, matchGame._id);
    };

    if (socketIo.connected) {
      handleJoinGame();
    } else {
      socketIo.connect();
    }

    socketIo.on("connect", handleJoinGame);

    return () => {
      socketIo.off("connect", handleJoinGame);
    };
  }, [matchGame]);

  useEffect(() => {
    if (!socketIo.connected) {
      socketIo.connect();
    }

    const onStartGame = (data: any) => {
      setIsMatched(true);
      setGame(data);
      const myId = user?._id;
      const { user_1, user_2 } = data;
      if (user_1 && user_2) {
        if (user_1._id === myId) {
          setOtherUser({
            username: user_2.username,
            avatar: user_2.avatar || null,
          });
        } else {
          setOtherUser({
            username: user_1.username,
            avatar: user_1.avatar || null,
          });
        }
      }
    };

    socketIo.on(SocketEvent.START_GAME, onStartGame);

    return () => {
      socketIo.off(SocketEvent.START_GAME, onStartGame);
    };
  }, [socketIo, user]);

  useEffect(() => {
    const current = isMatched ? messages[1] : messages[0];
    const timeoutId = window.setTimeout(() => {
      const updated = isDeleting
        ? current.substring(0, text.length - 1)
        : current.substring(0, text.length + 1);
      setText(updated);
      if (!isDeleting && updated === current) {
        setTimeout(() => setIsDeleting(true), 1000);
        setSpeed(50);
      } else if (isDeleting && updated === "") {
        setIsDeleting(false);
        setMessageIndex((prev) => prev + 1);
        setSpeed(150);
      }
    }, speed);
    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, messageIndex, speed, isMatched]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMatched && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isMatched && countdown === 0) {
      navigate(ROUTE_PATH.DART);
    }
    return () => clearTimeout(timer);
  }, [isMatched, countdown, navigate]);

  useEffect(() => {
    if (otherUser) {
      setWaitingText("");
      return;
    }
    const waitingMsg = "Waiting...";
    const timeoutId = window.setTimeout(() => {
      const updated = isDeleting
        ? waitingMsg.substring(0, waitingText.length - 1)
        : waitingMsg.substring(0, waitingText.length + 1);
      setWaitingText(updated);
      if (!isDeleting && updated === waitingMsg) {
        setTimeout(() => setIsDeleting(true), 1000);
        setSpeed(50);
      } else if (isDeleting && updated === "") {
        setIsDeleting(false);
        setSpeed(150);
      }
    }, speed);
    return () => clearTimeout(timeoutId);
  }, [waitingText, isDeleting, speed, otherUser]);

  useEffect(() => {
    if (isMatched) {
      setText("");
      setIsDeleting(false);
    }
  }, [isMatched]);

  const handleCancel = async () => {
    try {
      socketIo.disconnect();
      if (gameId) {
        setIsCancel(true);
        const result = await cancelGame(gameId);
        if (result.data.message === "DONE") {
          toast.success("Cancel game success");
        }
        navigate(ROUTE_PATH.HOME);
      }
      setGame(null);
    } catch (error) {
      console.log(error);
      toast.error("Cancel game failed");
    }
  };

  return (
    <WrapperPage className="bg-no-repeat bg-cover flex flex-col min-h-screen p-4">
      <div className="flex items-center justify-between ">
        <HeaderInfo />
        <div className="inline-flex justify-end items-center gap-2">
          <div className="inline-flex flex-col justify-start items-end gap-1">
            <div className="justify-start text-white text-custom-lg-bold font-normal  [text-shadow:_0px_2px_0px_rgb(0_0_0_/_1.00)]">
              {otherUser ? otherUser.username : <>{waitingText}</>}
            </div>
          </div>
          {otherUser ? (
            <img
              src={getAvatarUrl(otherUser.avatar)}
              alt={otherUser.username}
              className="w-10 h-10 rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 relative bg-gray-700 rounded-lg border-2 border-black" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <img
          src={Rotation}
          alt="Rotation"
          className="w-56 h-56 mb-8 rotating-image"
        />
        <div className="text-white text-custom-2xl-bold uppercase stroke-1 mb-4">
          {text}
        </div>
        {!isMatched && (
          <button
            className={`${
              isCancel ? "opacity-50 cursor-not-allowed" : ""
            } px-3 py-1 bg-[#FFFFFF3D] rounded-lg text-[#47FFFF] font-normal text-sm mt-2 uppercase`}
            onClick={handleCancel}
            disabled={isCancel}
          >
            {isCancel ? "CANCELING..." : "CANCEL"}
          </button>
        )}
      </div>
      <div className="w-full flex justify-center mt-8 mb-2">
        {isMatched ? (
          <div className="w-96 h-24 py-4 relative bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-cyan-300 inline-flex flex-col justify-center items-center gap-1.5">
            <div className="self-stretch text-center justify-start text-white text-base font-bold font-['Roboto_Mono'] leading-tight">
              MATCH WILL START IN
            </div>
            <div className="self-stretch text-center justify-start text-cyan-300 text-3xl font-bold font-['Roboto_Mono'] leading-10">
              {countdown}
            </div>
            <div className="w-96 h-24 left-0 top-0 absolute rounded-xl border-[3px] border-cyan-300 blur-sm" />
          </div>
        ) : (
          <div className="w-96 py-4 relative bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-cyan-300 inline-flex flex-col justify-center items-center gap-1.5">
            <div className="self-stretch text-center justify-start text-cyan-300 text-base font-bold font-['Roboto_Mono'] leading-tight">
              TIP:
            </div>
            <div className="self-stretch text-center justify-start text-white text-sm font-normal font-['Roboto_Mono'] leading-tight">
              The higher you upgrade your darts, the higher your chances of
              winning.
            </div>
            <div className="w-96 h-24 left-0 top-0 absolute rounded-xl border-[3px] border-cyan-300 blur-sm" />
          </div>
        )}
      </div>
      <style>{`
        .cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .rotating-image {
          animation: rotate 3s linear infinite;
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </WrapperPage>
  );
};

export default LoadingGame;
