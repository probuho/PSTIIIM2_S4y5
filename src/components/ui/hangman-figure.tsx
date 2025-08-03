import React from "react";

interface HangmanFigureProps {
  incorrectGuesses: number;
}

const HangmanFigure: React.FC<HangmanFigureProps> = ({ incorrectGuesses }) => {
  const parts = [
    //Horca
    <line key="gallows-pole" x1="10" y1="200" x2="10" y2="10" stroke="#4a5568" strokeWidth="4" />,
    <line key="gallows-top" x1="10" y1="10" x2="100" y2="10" stroke="#4a5568" strokeWidth="4" />,
    <line key="gallows-rope" x1="100" y1="10" x2="100" y2="50" stroke="#4a5568" strokeWidth="2" />,
    <line key="gallows-base-1" x1="0" y1="200" x2="20" y2="200" stroke="#4a5568" strokeWidth="4" />,
    <line key="gallows-base-2" x1="10" y1="200" x2="40" y2="170" stroke="#4a5568" strokeWidth="4" />,

    //Cuerpo
    <circle key="head" cx="100" cy="75" r="25" stroke="#4a5568" strokeWidth="2" fill="none" />,
    <line key="body" x1="100" y1="100" x2="100" y2="150" stroke="#4a5568" strokeWidth="2" />,
    <line key="left-arm" x1="100" y1="110" x2="70" y2="130" stroke="#4a5568" strokeWidth="2" />,
    <line key="right-arm" x1="100" y1="110" x2="130" y2="130" stroke="#4a5568" strokeWidth="2" />,
    <line key="left-leg" x1="100" y1="150" x2="70" y2="180" stroke="#4a5568" strokeWidth="2" />,
    <line key="right-leg" x1="100" y1="150" x2="130" y2="180" stroke="#4a5568" strokeWidth="2" />,
    <circle key="left-hand" cx="70" cy="130" r="5" fill="#4a5568" />,
    <circle key="right-hand" cx="130" cy="130" r="5" fill="#4a5568" />,
    <circle key="left-foot" cx="70" cy="180" r="5" fill="#4a5568" />,
    <circle key="right-foot" cx="130" cy="180" r="5" fill="#4a5568" />,
  ];

  return (
    <svg width="200" height="220" viewBox="0 0 200 220" className="w-full h-auto max-w-[200px] sm:max-w-[250px]">
      <g strokeLinecap="round">
        {parts.slice(0, 5 + incorrectGuesses)}
      </g>
    </svg>
  );
};

export default HangmanFigure;
