import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import Invitation from "@/components/Section/Invitation";
import WrapperPage from "@/components/Section/WrapperPage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InvitationList = () => {
  const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
    "fade-up"
  );
  const [show, setShow] = useState(true);
  // const [isOpen, setIsOpen] = useState(false);
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
      <HeaderNormalPage title="INVITATION TO CHALLENGE" onBack={handleBack} />
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Invitation />
      </div>
    </WrapperPage>
  );
};

export default InvitationList;
