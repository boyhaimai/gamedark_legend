import { useEffect } from "react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { io, Socket } from "socket.io-client";

const accessToken = localStorage.getItem("accessToken");

export const urlSocket =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

export const socketIo: Socket = io(urlSocket, {
  auth: { accessToken },
  autoConnect: true,
});

export enum SocketEvent {
  START_GAME = "start_game",
  ATTACK = "attack",
  END_GAME = "end_game",
  JOIN_GAME = "join_game",
  GET_GAME = "get_game",
  SEND_DATA_GAME = "send_data_game",
  CHAT_JOIN = "chat_join",
  CHAT_LEAVE = "chat_leave",
  CHAT_MESSAGE = "chat_message",
}

const SocketListener = () => {
  const { user } = useUserInfo();
  useEffect(() => {
    if (!user) return; // Ensure user is loaded before connecting
    // Connect to the socket server and set up event listeners
    socketIo.connect();
    return () => {
      if (socketIo.connected) {
        // <-- This is important
        socketIo.close();
      }
    };
  }, [user]);

  return null;
};
export default SocketListener;
