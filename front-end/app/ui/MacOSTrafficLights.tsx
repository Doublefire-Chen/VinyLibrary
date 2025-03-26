"use client";
import Image from "next/image";
import { useState } from "react";

interface MacOSTrafficLightsProps {
  type: "close" | "minimize" | "maximize";
  isHovered: boolean;
  onClick?: () => void;
}

const MacOSTrafficLights: React.FC<MacOSTrafficLightsProps> = ({ type, isHovered, onClick }) => {
  const [press, setPress] = useState(false);

  const getIconSrc = () => {
    const state = press
      ? "press"
      : isHovered
        ? "hover"
        : "normal";
    return `/icons/${type === "close" ? "close" : type === "minimize" ? "minimize" : "maximize"}-${state}.svg`;
  };

  return (
    <div
      className={`w-3.5 h-3.5 bg-transparent rounded-full relative flex items-center justify-center`}
      onClick={onClick}
      onMouseLeave={() => {
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
    >
      <Image
        src={getIconSrc()}
        alt={`${type} button`}
        width={14}
        height={14}
      />
    </div>
  );
};

export default MacOSTrafficLights;
