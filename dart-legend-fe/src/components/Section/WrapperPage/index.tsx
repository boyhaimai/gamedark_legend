import React, { useRef } from "react";
import clsx from "clsx";
import { CSSTransition } from "react-transition-group";
import MenuBottom from "../MenuBottom/MenuBottom";
import "@/styles/animations.css";

interface WrapperPageProps {
  children: React.ReactNode;
  className?: string;
  showMenu?: boolean;
  style?: React.CSSProperties;
  animationType?: "fade-up" | "slide-left" | "";
  show?: boolean;
  onExited?: () => void;
  bg?: boolean;
  createRoom?: boolean;
  homePage?: boolean;
}

const WrapperPage: React.FC<WrapperPageProps> = ({
  children,
  className = "",
  showMenu,
  style,
  animationType = "",
  show = true,
  onExited,
  bg = false,
  homePage = false,
  createRoom = false,
}) => {
  const nodeRef = useRef(null);

  if (!animationType) {
    return (
      <div
        className={clsx(
          createRoom
            ? "bg-[url('/src/assets/images/bg-create.png')]"
            : bg
            ? "bg-[url('/src/assets/images/bgGame.jpg')]"
            : "bg-[url('/src/assets/images/new-BG.jpg')]",
          homePage ? "justify-between" : "",
          "bg-cover  bg-center h-screen bg-no-repeat w-full overflow-auto scrollable m-auto flex flex-col scrollbar-hide",
          className
        )}
        style={{
          height: "100dvh",
          ...style,
        }}
      >
        {children}
        {showMenu && <MenuBottom />}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fixed background layer */}
      <div
        className={clsx(
          "absolute inset-0 bg-cover bg-center bg-no-repeat",
          createRoom
            ? "bg-[url('/src/assets/images/bg-create.png')]"
            : bg
            ? "bg-[url('/src/assets/images/bgGame.jpg')]"
            : "bg-[url('/src/assets/images/new-BG.jpg')]"
        )}
      />

      <CSSTransition
        in={show}
        timeout={400}
        classNames={animationType}
        unmountOnExit={false}
        onExited={onExited}
        nodeRef={nodeRef}
      >
        <div
          ref={nodeRef}
          className={clsx(
            "relative z-10 w-full h-full flex flex-col scrollable",
            homePage ? "justify-between" : "",
            className
          )}
          style={{
            height: "100dvh",
            ...style,
          }}
        >
          {children}
          {showMenu && <MenuBottom />}
        </div>
      </CSSTransition>
    </div>
  );
};

export default WrapperPage;
