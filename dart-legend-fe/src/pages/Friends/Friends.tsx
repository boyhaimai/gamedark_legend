import { getUserReferral } from "@/api/user/user";
import { balanceLogo2, inviteFriend, inviteFriend_Pre } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import NoData from "@/components/UI/EmptyState/NoData";
import { buildLink } from "@/hooks/useLinkInvite";
import { useUserInfo } from "@/hooks/useUserInfo";
import { IReferral } from "@/utils/type";
import { useRequest } from "ahooks";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonCopy from "./ButtonCopy/ButtonCopy";
import Invited from "./Invited/Invited";

const invitationTiers = [
  {
    icon: inviteFriend,
    title: "Invite normal Friend",
    token: "+500",
    reward: "for you",
  },
  {
    icon: inviteFriend_Pre,
    title: "Friend with Telegram Premium",
    token: "+1000",
    reward: "for you and your friend",
  },
];

export default function Friends() {
  const [show, setShow] = useState(true);
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const navigate = useNavigate();
  const { data, loading } = useRequest(getUserReferral, {
    cacheKey: "user-referral",
    staleTime: 2 * 60 * 1000,
  });

  const { user } = useUserInfo();
  const [friendList, setFriendList] = useState<IReferral[]>([]);

  useEffect(() => {
    if (data?.data?.data) {
      const referralData = Array.isArray(data.data.data)
        ? data.data.data
        : data.data.data.friendUser || [];
      setFriendList(referralData);
    }
  }, [data]);

  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => {
        navigate(-1);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [show, navigate]);

  const linkInvite = buildLink(user?.code);

  const inviteMessage = ` Join me in Dart Legend - a free-to-play mobile portal to endless airdrops 🪂`;

  const handleShare = () => {
    const encodedLink = encodeURIComponent(linkInvite);
    const encodedMessage = encodeURIComponent(inviteMessage);
    const telegramLink = `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`;
    window.location.href = telegramLink;
  };

  return (
    <WrapperPage showMenu={false} animationType={animationType} show={show}>
      <HeaderNormalPage title="Referral" onBack={handleBack} />
      <div className="px-6 py-5 space-y-5">
        <div className="bg-[#00000080] border-1 border-white rounded-xl">
          <div className=" w-full h-full p-4">
            {invitationTiers.map((tier, index) => (
              <div
                key={tier.title}
                className={clsx(
                  "flex items-center gap-4 border-solid border-[#FFFFFF1A] py-4",
                  {
                    "border-t-1": index > 0,
                  }
                )}
              >
                <img src={tier.icon} className="w-10 h-10" />
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{tier.title}</p>
                  <div className="flex items-center gap-[2px]">
                    <div className="flex items-center">
                      <img src={balanceLogo2} className="w-6 h-6" />
                      <div className="flex gap-1 items-center justify-center text-center ml-1">
                        <p className="text-[#04FF05] text-sm font-normal">
                          {tier.token}
                        </p>
                        <p className="text-white text-sm font-normal">
                          {tier.reward}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pb-4">
          <button
            onClick={handleShare}
            className="w-full h-16 relative bg-[#47FFFF] rounded-lg"
          >
            <p className="text-black text-xl font-bold">Invite a friend</p>
          </button>
          <ButtonCopy />
        </div>
        <div className="space-y-5">
          <p className="text-white text-xl font-bold">LIST FRIEND</p>
          {friendList.length > 0 ? (
            <Invited data={friendList} loading={loading} />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    </WrapperPage>
  );
}
