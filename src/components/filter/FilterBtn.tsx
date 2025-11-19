import React from "react";
import "./Filter-btn.scss";

interface BtnInput {
  btnName: string[];
  className?: string;
  onClick: (bName: string) => void;
  activeGenre?: string | null;
}

export default function FilterBtn({ btnName, onClick, className, activeGenre }: BtnInput) {
  return (
    <>
      {btnName.map((bName, i) => (
        <button
  key={i}
  name={bName}
  type="button"
  onClick={() => onClick(bName)}
  className={`overall-button ${className || ""} ${
    activeGenre === bName ? "active" : ""
  }`}
>
  {bName}
</button>

      ))}
    </>
  );
}
