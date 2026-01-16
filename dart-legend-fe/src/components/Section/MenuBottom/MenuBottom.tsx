import {
  Dart,
  history,
  inventory,
  mission,
  nftStore,
  rank,
  referral,
  wallet,
} from "@/assets";
import ButtonPlayGame from "@/pages/Home/ButtonPlayGame/ButtonPlayGame";
import { ROUTE_PATH } from "@/router/route-path";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/UI/Toast/toast";
import { useState } from "react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { findGame } from "@/api/game/game";
import { useRequest } from "ahooks";
import { useSetAtom } from "jotai";
import { gameAtom } from "@/store/game.store";
import { SocketEvent, socketIo } from "@/service/socket/SocketListener";
import { playAudio } from "@/utils/audio";

// Định nghĩa interface cho AxiosError
export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const menus = [
  {
    title: "INVERTORY ",
    icon: inventory,
    href: ROUTE_PATH.INVENTORY,
    mp3: Dart,
  },
  {
    title: "RANK",
    icon: rank,
    href: ROUTE_PATH.RANK,
    mp3: Dart,
  },
  {
    title: "REFERAL",
    icon: referral,
    href: ROUTE_PATH.FRIENDS,
    mp3: Dart,
  },
  {
    title: "NFT STORE",
    icon: nftStore,
    href: ROUTE_PATH.NFT,
    mp3: Dart,
  },
  {
    title: "HISTORY",
    icon: history,
    href: ROUTE_PATH.HISTORY,
    mp3: Dart,
  },
  {
    title: "MISION",
    icon: mission,
    href: ROUTE_PATH.QUESTS,
    mp3: Dart,
  },
  {
    title: "WALLET",
    icon: wallet,
    href: ROUTE_PATH.WALLET,
    mp3: Dart,
  },
];

const ItemMenu = ({
  title,
  icon,
  href,
  className,
  classIcon,
  mp3,
}: {
  title: string;
  icon: string;
  href: string;
  className?: string;
  classIcon?: string;
  mp3?: string;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (mp3) {
      playAudio(mp3, 0.4);
    }
    setTimeout(() => {
      navigate(href);
    }, 50);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center justify-center cursor-pointer ${className}`}
    >
      <div
        className={`min-w-[48px] min-h-[62px] flex items-center justify-center ${classIcon}`}
      >
        <img
          src={icon}
          alt={title}
          className="min-w-[48px] min-h-[62px] object-contain"
        />
      </div>
    </div>
  );
};

export default function MenuBottom() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserInfo();
  const setGame = useSetAtom(gameAtom);

  const { loading: findGameLoading, run: retryFindGame } = useRequest(
    findGame,
    {
      onSuccess: (data) => {
        if (data?.data?.data) {
          setGame(data.data.data);
          socketIo.emit(SocketEvent.JOIN_GAME, data.data.data._id);
          navigate(ROUTE_PATH.LOADING_GAME, {
            state: { matchGame: data.data.data },
          });
        }
      },
      onError: (error) => {
        const defaultMessage = "Failed to find game. Please try again.";
        const errorMessage =
          error && typeof error === "object" && "response" in error
            ? (error as AxiosErrorResponse).response?.data?.message ||
              (error as AxiosErrorResponse).message ||
              defaultMessage
            : defaultMessage;
        toast.error(errorMessage);
      },
      manual: true,
    }
  );

  const handlePlayGame = async () => {
    try {
      if (user && user?.balance < 5) {
        toast.error("You don't have enough balance to play game");
        return;
      }
      setIsLoading(true);
      retryFindGame();
    } catch (error) {
      const defaultMessage = "Failed to find game. Please try again.";
      if (error instanceof Error && error.message === "Request timeout") {
        toast.error(
          "Request timeout. Please check your connection and try again."
        );
      } else if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosErrorResponse;
        const message =
          axiosError.response?.data?.message ||
          axiosError.message ||
          defaultMessage;
        toast.error(message);
      } else {
        toast.error(defaultMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-md:m-2 max-sm:m-0 h-[150px] min-[400px]:h-[200px] flex flex-col justify-between mb-6 z-10">
      <div className="flex justify-between items-center ">
        {menus.map((m, idx) => (
          <div key={m.title}>
            <ItemMenu
              title={m.title}
              icon={m.icon}
              href={m.href}
              mp3={m.mp3}
              key={idx}
            />
          </div>
        ))}
      </div>
      <ButtonPlayGame
        onClick={handlePlayGame}
        loading={isLoading || findGameLoading}
      />
    </div>
  );
}
