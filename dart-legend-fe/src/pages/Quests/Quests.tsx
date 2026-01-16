import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import { startTransition, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import DailyQuest from "./DailyQuest/DailyQuest";
import ListQuests from "./ListQuests/ListQuests";

const tabs = ["DAILY", "QUEST"];

export default function Quests() {
  const [activeTab, setActiveTab] = useState("DAILY");
  const [show, setShow] = useState(true);
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const [tabIndicatorPosition, setTabIndicatorPosition] = useState(0);
  const navigate = useNavigate();
  const dailyRef = useRef<HTMLDivElement | null>(null);
  const questRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = activeTab === "DAILY" ? dailyRef : questRef;

  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };

  const handleExited = () => {
    navigate(-1);
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
      showMenu={false}
      animationType={animationType}
      show={show}
      onExited={handleExited}>
      <HeaderNormalPage title="MISSION" onBack={handleBack} />
      <div className="p-4 animate-fade-in">
        <div className="mb-6">
          <div className="flex bg-[#00000080] border-2 border-[#47FFFF66] rounded-lg p-1 w-full mx-auto relative overflow-hidden">
            <div
              className="absolute top-1 left-1 h-[calc(100%-8px)] bg-[#47FFFF] rounded-lg tab-indicator transition-all duration-300"
              style={{
                width: "calc(50% - 3px)",
                transform: `translateX(${tabIndicatorPosition}%)`,
              }}
            />

            {tabs.map((tab, index) => (
              <div className="relative w-full" key={index}>
                <button
                  onClick={() => handleTabChange(tab)}
                  className={`w-full text-custom-sm-bold transition-all rounded-lg duration-150 text-center py-[10px] px-8 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.50)] tab-button relative z-10 ${
                    activeTab === tab ? "active text-black" : "text-white"
                  }`}>
                  {tab}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="tab-content-container">
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={activeTab}
              nodeRef={nodeRef}
              timeout={300}
              classNames="content-fade">
              <div ref={nodeRef} className="tab-content">
                {activeTab === "DAILY" ? <DailyQuest /> : <ListQuests />}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    </WrapperPage>
  );
}
