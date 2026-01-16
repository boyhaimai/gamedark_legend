import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { gameAtom } from "@/store/game.store";
import { socketIo, SocketEvent } from "@/service/socket/SocketListener";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "@/hooks/useUserInfo";

interface ChatMessage {
  id: string;
  gameId: string;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  createdAt: number;
}

const Chat = () => {
  const navigate = useNavigate();
  const [game] = useAtom(gameAtom);
  const { user } = useUserInfo();
  const gameId = game?._id || "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Mock messages for demo - remove when real socket is connected
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        gameId,
        userId: 1,
        username: "You",
        content: "I dropped my phone on my face",
        createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
      },
      {
        id: "2",
        gameId,
        userId: 2,
        username: "Opponent",
        content: "physically yes. emotionally? shattered.",
        createdAt: Date.now() - 1000 * 60 * 20, // 20 min ago
      },
      {
        id: "3",
        gameId,
        userId: 2,
        username: "Opponent",
        content: "Just in case you e",
        createdAt: Date.now() - 1000 * 60 * 10, // 10 min ago
      },
      {
        id: "4",
        gameId,
        userId: 2,
        username: "Opponent",
        content:
          "It's not just a game. It's pain. It's hope. It's heartbreak. It's Champions League.",
        createdAt: Date.now() - 1000 * 60 * 5, // 5 min ago
      },
    ];
    setMessages(mockMessages);
  }, [gameId]);

  // Auto-scroll
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join/leave room
  useEffect(() => {
    if (!gameId) return;
    socketIo.emit(SocketEvent.CHAT_JOIN, { gameId });
    const handleIncoming = (payload: ChatMessage) => {
      if (payload.gameId !== gameId) return;
      setMessages((prev) => [...prev, payload]);
    };
    socketIo.on(SocketEvent.CHAT_MESSAGE, handleIncoming);
    return () => {
      socketIo.off(SocketEvent.CHAT_MESSAGE, handleIncoming);
      socketIo.emit(SocketEvent.CHAT_LEAVE, { gameId });
    };
  }, [gameId]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !!gameId,
    [input, gameId]
  );

  const send = () => {
    if (!canSend) return;
    const payload = { content: input.trim(), gameId };
    socketIo.emit(SocketEvent.CHAT_MESSAGE, payload);
    setInput("");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isOwnMessage = (message: ChatMessage) =>
    message.userId === user?.userId;

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Background with city skyline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D12] via-[#1a1d24] to-[#0B0D12] opacity-90"></div>
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {user?.avatar && (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="text-white font-semibold text-sm">
              {user?.username || "Player"}
            </div>
            <div className="text-white/60 text-xs">TOP 1920</div>
          </div>
        </div>
        <div className="ml-auto text-white/50 text-xs">
          Room: {gameId?.slice(-5) || "-"}
        </div>
        <button
          className="text-white/80 hover:text-white transition-colors"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
        {/* Today separator */}
        <div className="flex justify-center">
          <div className="text-white/40 text-xs bg-black/20 px-3 py-1 rounded-full">
            Today
          </div>
        </div>

        {messages.map((message) => {
          const isOwn = isOwnMessage(message);
          return (
            <div
              key={message.id + message.createdAt}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] ${isOwn ? "order-2" : "order-1"}`}>
                {!isOwn && (
                  <div className="text-white/60 text-[10px] mb-1 ml-1">
                    {message.username}
                  </div>
                )}
                <div
                  className={`flex items-end gap-2 ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isOwn && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0"></div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-800/80 text-white"
                    } text-sm leading-relaxed whitespace-pre-wrap break-words`}
                  >
                    {message.content}
                  </div>
                  {isOwn && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
                  )}
                </div>
                <div
                  className={`text-white/40 text-[10px] mt-1 ${
                    isOwn ? "text-right mr-1" : "ml-1"
                  }`}
                >
                  {formatTime(message.createdAt)}
                  {!isOwn && <span className="ml-1">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={listEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Are you gonna do it again?"
          className="w-full rounded-full bg-white/10 text-white px-4 py-3 outline-none placeholder-white/50 focus:bg-white/15 transition-colors"
        />
        <button
          onClick={send}
          disabled={!canSend}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-30"
        >
          ✈
        </button>
      </div>
    </div>
  );
};

export default Chat;
