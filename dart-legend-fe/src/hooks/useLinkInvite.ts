/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useUserInfo } from "./useUserInfo";

export const buildLink = (value: any) => {
  return `${import.meta.env.VITE_TELEGRAM_LINK_BOT}?start=${value}`;
};
export const useLinkInvite = () => {
  const { user } = useUserInfo();
  const link = buildLink(user?.code);

  const [text, setText] = useState("");
  const [textAndLink, setTextAndLink] = useState("");
  useEffect(() => {
    setText(`⟶ Play game with Dart Legends!`);
    setTextAndLink(
      `${link}

⟶ Play game with Dart Legends!`
    );
  }, [link]);

  const onGetLink = () => {};
  return {
    onGetLink,
    link,
    text,
    textAndLink,
  };
};
