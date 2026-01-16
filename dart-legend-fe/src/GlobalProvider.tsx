import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { createContext, useMemo } from "react";
import BackgroundMusic from "./components/Section/BgMusic/BackgroundMusic";
import FloatingAudioToggle from "./components/Section/BgMusic/FloatingAudioToggle";

export const UITonContextValue = createContext(null);

const UITonProvider = ({ children }: { children: React.ReactNode }) => {
  const manifestUrl = useMemo(() => {
    return new URL("tonconnect-manifest.json", window.location.href).toString();
  }, []);

  return (
    <>
      <BackgroundMusic />
      <FloatingAudioToggle />
      <UITonContextValue.Provider value={null}>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          {children}
        </TonConnectUIProvider>
      </UITonContextValue.Provider>
    </>
  );
};

export default UITonProvider;
