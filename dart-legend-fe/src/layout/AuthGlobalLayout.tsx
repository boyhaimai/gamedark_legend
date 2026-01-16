import { authUser } from "@/api/auth/auth";
import LoadingScreen from "@/components/Section/LoadingScreen";
import { useHapticFeedback } from "@/hooks/useHaptic";
import { useUserInfo } from "@/hooks/useUserInfo";
import { atomLoading } from "@/store/loading.store";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
// import InvitationBubber from "@/components/Section/InvitationBubber";

const AuthGlobalLayout = () => {
  const { onGetMe } = useUserInfo();

  const loadingFirst = useAtomValue(atomLoading);
  const setLoading = useSetAtom(atomLoading);
  useHapticFeedback();

  const [authDone, setAuthDone] = useState(false);
  const [userDone, setUserDone] = useState(false);
  const [loadingGameDone, setLoadingGameDone] = useState(false);

  useEffect(() => {
    const initData =
      //@ts-expect-error: Telegram is not defined in the global scope
      window?.Telegram?.WebApp?.initData || localStorage.getItem("initData");

    if (!initData) return;

    authUser({ initData }).then((res) => {
      if (res?.data?.data?.access_token) {
        localStorage.setItem("access_token", res.data.data.access_token);
        setAuthDone(true);
        onGetMe().then(() => setUserDone(true));
      } else {
        setAuthDone(true);
        setUserDone(true);
      }
    });
  }, []);

  useEffect(() => {
    if (authDone && userDone) {
      setLoading(false);
    }
  }, [authDone, userDone, setLoading]);

  const showLoading =
    loadingFirst || !authDone || !userDone || !loadingGameDone;

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      {/* Persistent background layer to avoid white flashes */}
      <div className="absolute inset-0 -z-10 bg-[url('/src/assets/images/new-BG.jpg')] bg-cover bg-center bg-no-repeat" />

      <AnimatePresence mode="wait">
        {showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute w-full h-full top-0 left-0 z-[10000]"
          >
            <LoadingScreen onLoadingComplete={() => setLoadingGameDone(true)} />
          </motion.div>
        ) : (
          <>
            {/* <InvitationBubber count={5} /> */}
            <motion.div
              key="outlet"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute w-full h-full top-0 left-0"
            >
              <Outlet />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthGlobalLayout;
