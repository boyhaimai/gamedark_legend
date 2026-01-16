// src/components/UI/NumberText.tsx
import React from "react";

interface NumberTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TextOutLine: React.FC<NumberTextProps> = ({
  children,
  className = "",
  style,
}) => (
  <span className={`text-outline-number ${className}`} style={style}>
    {children}
    <style>{`
   .text-outline-number {
  color: #FEFEFE;
  font-family: 'Lilita One', sans-serif;
  -webkit-text-stroke: 0.3px #000;
    }
    `}</style>
  </span>
);

export default TextOutLine;
