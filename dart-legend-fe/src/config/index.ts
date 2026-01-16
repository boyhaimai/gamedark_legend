export type TConfig = {
  base_url: string;
};

export type TSocketConfig = {
  base_url: string;
};

export const config: TConfig = {
  // base_url: import.meta.env.VITE_BASE_URL || "https://api.dartlegends.tech/api",
  base_url: import.meta.env.VITE_BASE_URL || "http://localhost:3579/api",
};

export const socketConfig: TSocketConfig = {
  // base_url: import.meta.env.VITE_SOCKET_URL || "https://socket.dartlegends.tech",
  base_url: import.meta.env.VITE_SOCKET_URL || "http://localhost:3579",
};
