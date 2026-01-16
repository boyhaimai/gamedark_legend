declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes: () => void;
        version?: string;
        initData?: string;
      };
    };
    UnityToJS: (message: string) => void;
  }
}
