import { getLeaderBoardEarn, getLeaderBoardReferral } from "@/api/rank/rank";
import { balanceLogo, User } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formatNumber } from "@/utils/fc.utils";
import { PNL, Referral } from "@/utils/type";
import { useRequest } from "ahooks";
import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import TopUserBoard from "./TopUserBoard";

const tabs = ["Top PNL", "Top referral"];

export default function Rank() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [tabIndicatorPosition, setTabIndicatorPosition] = useState(0);
  const [show, setShow] = useState(true);
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const { user } = useUserInfo();
  const navigate = useNavigate();

  const { data: dataPNL, loading: loadingPNL } = useRequest(
    getLeaderBoardEarn,
    {
      cacheKey: "top-pnl-leaderboard",
      staleTime: 5 * 60 * 1000,
    }
  );
  const { data: dataTopReferral, loading: loadingReferral } = useRequest(
    getLeaderBoardReferral,
    {
      cacheKey: "top-referral-leaderboard",
      staleTime: 5 * 60 * 1000,
    }
  );

  const dataTopPNL = dataPNL?.data?.data ?? [];
  const dataReferral = dataTopReferral?.data?.data ?? [];

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => {
        navigate(-1);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [show, navigate]);

  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };

  const handleTabChange = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
      const tabIndex = tabs.findIndex((t) => t === tab);
      setTabIndicatorPosition(tabIndex * 100);
    });
  };

  return (
    <WrapperPage
      className="bg-no-repeat bg-cover"
      animationType={animationType}
      show={show}>
      <HeaderNormalPage title="RANK" onBack={handleBack} />
      <div className="p-4 animate-fade-in pb-28">
        <div className="mb-6">
          <div className="flex bg-[#00000080] border-2 border-[#47FFFF66] rounded-lg p-[2px] w-full mx-auto relative overflow-hidden">
            <div
              className="absolute top-[2px] left-[2px] h-[calc(100%-3px)] overflow-hidden bg-[#47FFFF] rounded-lg tab-indicator transition-all duration-300"
              style={{
                width: "calc(50% - 1px)",
                transform: `translateX(${tabIndicatorPosition}%)`,
              }}></div>
            {tabs.map((tab) => (
              <button
                onClick={() => handleTabChange(tab)}
                className={`w-full transition-all rounded-lg duration-150 text-center py-[10px] relative z-10 ${
                  activeTab === tab ? "active" : ""
                }`}>
                <div
                  className={`justify-start text-black text-sm font-bold ${
                    activeTab === tab ? "text-black" : "text-white"
                  }`}>
                  {tab}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between animate-slide-up mb-6">
          <p className="text-white text-xl font-bold">USER</p>
          <p className="text-white text-xl font-bold">
            {activeTab === tabs[0] ? "EARNED" : "INVITED"}
          </p>
        </div>

        <TransitionGroup component={null}>
          <CSSTransition
            key={activeTab}
            timeout={300}
            classNames="tab-fade"
            unmountOnExit>
            <div className="min-h-[60vh]">
              <div className="tab-content">
                <TopUserBoard
                  data={
                    activeTab === tabs[0]
                      ? dataTopPNL.map((u: PNL) => ({
                          _id: u._id,
                          username: u.username,
                          value: u.balance,
                        }))
                      : dataReferral.map((u: Referral) => ({
                          _id: u._id,
                          username: u.username,
                          value: u.friend,
                        }))
                  }
                  loading={activeTab === tabs[0] ? loadingPNL : loadingReferral}
                  type={activeTab === tabs[0] ? "pnl" : "referral"}
                />
              </div>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>

      {/* User info bar - fixed at bottom */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="w-full h-20 bg-[#00000066] border-t-2 border-[#47FFFF] rounded-t-xl shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)] outline outline-2 outline-black overflow-hidden">
            <div className="w-full h-20 left-0 top-0 absolute rounded-t-lg border-[3px] border-t-cyan-300 blur-sm" />
            <div className="right-[28px] top-[24px] absolute flex items-center gap-1">
              <img
                src={activeTab === tabs[0] ? balanceLogo : User}
                className="w-6 h-6"
                alt="User"
              />
              <div className="text-white text-sm font-bold">
                {formatNumber(
                  activeTab === tabs[0] ? user?.balance ?? 0 : user?.friend ?? 0
                )}
              </div>
            </div>
            <div className="left-[28px] top-[16px] absolute flex items-center gap-2">
              <div className="w-10 h-10 relative flex justify-center items-center">
                <div
                  className="w-8 h-8 text-white rounded-lg flex justify-center items-center font-bold text-[14px] text-center shadow-[0px_1px_0px_0px_rgba(0,0,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black"
                  style={{
                    background:
                      "linear-gradient(180deg, #5ACBF5 0%, #3AA8F7 100%)",
                  }}>
                  <div className="text-white text-sm font-bold">
                    {activeTab === tabs[0]
                      ? user?.rankTopEarn
                      : user?.rankTopReferral}
                  </div>
                </div>
              </div>
              <div className="text-white text-sm font-bold">
                {user?.username}
              </div>
            </div>
          </div>
        </div>
      )}
    </WrapperPage>
  );
}
