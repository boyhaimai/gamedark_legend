import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import clsx from "clsx";

interface AnimatedWrapperProps {
  children: React.ReactNode;
  show: boolean;
  animationType: "fade-up" | "slide-left" | "fade" | "scale";
  className?: string;
  timeout?: number;
  onExited?: () => void;
  onEntered?: () => void;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  show,
  animationType,
  className = "",
  timeout = 400,
  onExited,
  onEntered,
}) => {
  const nodeRef = useRef(null);
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={show}
      timeout={timeout}
      classNames={animationType}
      unmountOnExit
      onExited={onExited}
      onEntered={onEntered}>
      <div ref={nodeRef} className={clsx("animated-wrapper", className)}>
        {children}
      </div>
    </CSSTransition>
  );
};

export default AnimatedWrapper;
