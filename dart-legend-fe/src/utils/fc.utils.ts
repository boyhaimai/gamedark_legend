/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import { isMobile } from "react-device-detect";

export const shareLink = (link: string, text?: string) => {
  let newLink = "";
  if (link && text) {
    newLink = `${link}&text=${text}`;
  } else {
    newLink = link;
  }
  copy(newLink);
  if ((window as any).Telegram?.WebApp?.openTelegramLink) {
    (window as any).Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(newLink)}`
    );
  }
};

export function formatNumber(num: number) {
  if (!num) return 0;
  return new Intl.NumberFormat("en-US").format(num);
}
export const formatNumberDot = (num: number, _maximumFractionDigits = 4) => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 1 : 0,
    maximumFractionDigits: _maximumFractionDigits,
  });
};

export const formatNumberDot2 = (num: number, _maximumFractionDigits = 6) => {
  const str = Number(num).toFixed(40);
  const match = str.match(/^(\d+)\.(0*)([1-9]\d{0,2})/);

  if (match) {
    const intPart = match[1];
    const zeros = match[2];
    let digits = match[3];

    // Chỉ format nếu có từ 4 hoặc 6 số 0 trở lên
    if (zeros.length >= _maximumFractionDigits) {
      digits = digits.replace(/0+$/, "");
      return `${intPart}.0(${zeros.length})${digits}`;
    }
  }

  return formatNumberDot(num, _maximumFractionDigits);
};
export const previewLink = (link: string, social_type: string) => {
  if (isMobile) {
    if (social_type.toLowerCase() === "telegram") {
      if ((window as any).Telegram?.WebApp?.openTelegramLink) {
        (window as any).Telegram.WebApp.openTelegramLink(link);
      }

      return;
    }
    if ((window as any).Telegram?.WebApp?.openLink) {
      (window as any).Telegram.WebApp.openLink(link);
    }
  } else {
    window.open(link);
  }
};

export const formattedDate = (date: string) => {
  return dayjs(date).format("D MMMM YYYY");
};
