import React from "react";
import "./filter-btn.scss";

interface BtnInput {
  btnName: string[];
  className?: string;
  onClick: (bName: string) => void;
}

export default function FilterBtn({ btnName, onClick, className }: BtnInput) {
  return (
    <>
      {btnName.map((bName, i) => (
        <button
          key={i}
          name={bName}
          onClick={() => onClick(bName)}
          className={`overall-button ${className || ""}`}
        >
          {bName}
        </button>
      ))}
    </>
  );
}
