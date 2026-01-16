import { versus } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalAddPlayer from "../Modal";

const CreateRoom = () => {
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const [show, setShow] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const handleBack = () => {
    setAnimationType("slide-left");
    setShow(false);
  };
  const handleExited = () => {
    navigate(-1);
  };

  return (
    <WrapperPage
      createRoom
      showMenu={false}
      animationType={animationType}
      show={show}
      onExited={handleExited}
    >
      <HeaderNormalPage title="CREATE ROOM" onBack={handleBack} />
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-40 inline-flex flex-col justify-start items-center gap-1 mt-4">
          <div className="self-stretch text-center justify-start text-white text-lg font-bold font-['Roboto_Mono']">
            ID: 1234
          </div>
          <div className="self-stretch text-center justify-start text-white text-lg font-bold font-['Roboto_Mono']">
            Expire: 60s
          </div>
        </div>
        <div className="inline-flex flex-col justify-center items-center gap-10 flex-1">
          <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] flex flex-col justify-start items-center gap-3">
            <div className="w-32 h-32 relative inline-flex justify-start items-center gap-2.5">
              <div className="w-32 h-32 left-0 top-0 absolute rounded-2xl outline outline-4 outline-offset-[-2px] outline-cyan-300 blur-sm" />
              <img
                className="flex-1 self-stretch rounded-2xl border-[3px] border-cyan-300"
                src="https://placehold.co/124x124"
              />
            </div>
            <div className="justify-start text-white text-base font-bold font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
              Lancel Tran
            </div>
          </div>
          <img src={versus} alt="logo" />
          <div
            onClick={() => setIsOpen(true)}
            className="w-32 h-32 relative bg-black/40 rounded-2xl outline outline-[3px] outline-offset-[-3px] outline-fuchsia-500 flex flex-col justify-center items-center gap-4"
          >
            <div className="w-32 h-32 left-0 top-0 absolute rounded-2xl outline outline-4 outline-offset-[-2px] outline-fuchsia-500 blur-sm" />
            <div className="w-10 h-10 relative">
              <div className="w-5 h-0 left-[10px] top-[20px] absolute outline outline-[3px] outline-offset-[-1.50px] outline-fuchsia-500" />
              <div className="w-0 h-5 left-[20px] top-[10px] absolute outline outline-[3px] outline-offset-[-1.50px] outline-fuchsia-500" />
              <div className="w-10 h-10 left-0 top-0 absolute opacity-0" />
            </div>
          </div>
        </div>
      </div>
      <ModalAddPlayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        img="https://placehold.co/40x40"
        point={100}
        token={100}
        title="Add Player"
        description="Add Player"
        onSuccess={() => {}}
        link="https://www.google.com"
        questKey="add-player"
      />
    </WrapperPage>
  );
};

export default CreateRoom;
