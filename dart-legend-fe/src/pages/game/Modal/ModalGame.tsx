import { findGame } from "@/api/game/game";
import { balanceLogo, defeat, house, victory } from "@/assets";
import { AxiosErrorResponse } from "@/components/Section/MenuBottom/MenuBottom";
import { toast } from "@/components/UI";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTE_PATH } from "@/router/route-path";
import { SocketEvent, socketIo } from "@/service/socket/SocketListener";
import { gameAtom } from "@/store/game.store";
import { getAvatarUrl } from "@/utils/avatar";
import { Button, Modal, ModalBody, ModalContent } from "@nextui-org/react";
import { clearCache, useRequest } from "ahooks";
import clsx from "clsx";
import { useAtom, useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModalGame({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [game] = useAtom(gameAtom);
  const setGame = useSetAtom(gameAtom);
  const [isLoading, setIsLoading] = useState(false);

  const isUser1 = useMemo(() => {
    return game?.user_1._id === user?._id;
  }, [game, user]);

  const [exitAnim, setExitAnim] = useState(false);

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
        navigate(ROUTE_PATH.WALLET);
        return;
      }
      setIsLoading(true);
      retryFindGame();
      clearCache("history");
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      classNames={{
        base: "rounded-2xl p-0 relative ",
        body: "p-0",
        header: "p-0",
        footer: "p-0",
      }}
      size="md"
      placement="center"
    >
      <ModalContent>
        <img
          src={game?.winner?._id === user?._id ? victory : defeat}
          alt="bgModalGame"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        />
        <div
          className={`relative z-10 py-4 ${exitAnim ? "animate-fade-out" : ""}`}
        >
          <ModalBody className="flex flex-col items-center">
            <div className="flex w-full justify-between gap-6 mt-[100px] mb-4">
              {/* User */}
              <div className="flex flex-col items-start flex-1">
                <img
                  src={getAvatarUrl(user?.avatar)}
                  className="w-14 h-14 rounded-lg border-2 border-black bg-white ml-4"
                />
                <p className="text-white text-base font-bold mt-1 mb-1 text-center ml-4">
                  {user?.username || "You"}
                </p>
                <div
                  className={clsx(
                    "px-6 py-2 flex items-center justify-center rounded-r-xl border-2 border-[#47FFFF] mt-1 min-w-[60px]"
                  )}
                >
                  <p className="text-custom-xl-bold text-white">
                    {isUser1
                      ? game?.total_point_user_1
                      : game?.total_point_user_2}
                  </p>
                </div>
              </div>
              {/* VS */}
              <div className="flex flex-col items-end flex-1">
                <img
                  src={getAvatarUrl(
                    isUser1 ? game?.user_2?.avatar : game?.user_1?.avatar
                  )}
                  className="w-14 h-14 rounded-lg border-2 border-black bg-white mr-4"
                />
                <p className="text-white text-base font-bold mt-1 mb-1 text-center mr-4">
                  {isUser1
                    ? game?.user_2?.username ?? "Opponent"
                    : game?.user_1?.username ?? "Opponent"}
                </p>
                <div
                  className={clsx(
                    "px-6 py-2 flex items-center justify-center rounded-l-xl border-2 border-[#47FFFF] mt-1 min-w-[60px]"
                  )}
                >
                  <p className="text-custom-xl-bold text-white">
                    {isUser1
                      ? game?.total_point_user_2
                      : game?.total_point_user_1}
                  </p>
                </div>
              </div>
            </div>
            {/* Reward */}
            <div className="w-full flex flex-col items-center mb-4 px-4">
              <div className="w-full flex justify-center items-center bg-[#FFFFFF3D] rounded-xl py-3">
                <img
                  src={balanceLogo}
                  alt="balanceLogo"
                  className="w-8 h-8 mr-2"
                />
                <span
                  className={clsx(
                    "text-2xl font-bold",
                    game?.winner?._id === user?._id
                      ? "text-[#04FF05]"
                      : "text-[#DB001E]"
                  )}
                >
                  +{game?.winner?._id === user?._id ? game?.winner?.point : 0}{" "}
                </span>
              </div>
            </div>
            {/* Buttons */}
            <div className="w-full flex gap-3 mt-2 p-4">
              <Button
                isIconOnly
                className={`bg-[#47FFFF] border-2 border-black rounded-lg w-14 h-14 flex items-center justify-center shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)]`}
                onClick={() => {
                  setExitAnim(true);
                  setTimeout(() => {
                    socketIo.disconnect();
                    navigate(ROUTE_PATH.HOME);
                    clearCache("history");
                  }, 400);
                }}
              >
                <img src={house} alt="house" />
              </Button>
              <Button
                className="flex-1 bg-[#47FFFF] border-2 border-black rounded-lg text-black h-14 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)]"
                onClick={handlePlayGame}
                isLoading={isLoading || findGameLoading}
              >
                <p className="text-black text-base font-bold text-center">
                  NEXT MATCH
                </p>
              </Button>
            </div>
          </ModalBody>
        </div>
      </ModalContent>
    </Modal>
  );
}
