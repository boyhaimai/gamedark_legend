import { getMe } from "@/api/user/user";
import { toast } from "@/components/UI/Toast/toast";
import { atomUser } from "@/store/user.store";
import { useRequest } from "ahooks";
import { useAtom } from "jotai";

export const useUserInfo = () => {
  const [user, setUser] = useAtom(atomUser);
  const {
    runAsync: onGetUserInfo,
    error: errorUser,
    loading: loadingUser,
    refresh: refreshUserInfo,
  } = useRequest(getMe, {
    manual: true,
    onSuccess(res) {
      setUser(res?.data?.data);
    },
    onError() {
      toast.error("Not found user");
    },
  });

  return {
    onGetMe: onGetUserInfo,
    error: errorUser,
    user,
    loadingUser,
    refreshUserInfo,
  };
};
