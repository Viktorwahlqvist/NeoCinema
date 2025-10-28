import React, { useEffect, useState } from "react";
import FilterBtn from "./FilterBtn";
import "./filter-dropdown.scss";

interface SelectProps {
  label: string;
  options: string[];
  className?: string;
  onClick: (value: string) => void;
}

export default function FilterDropdown({
  label,
  options,
  onClick,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickBtn = () => {
    setIsOpen(!isOpen);
  };

  const handleClickSelect = (value: string) => {
    setIsOpen(false);
    onClick(value);
  };

  return (
    <section className="filter-container">
      <FilterBtn
        btnName={[label]}
        className="filter-btn"
        aria-label={label}
        onClick={handleClickBtn}
      />

      {isOpen && (
        <section className="option-container">
          <FilterBtn
            btnName={options}
            className={`options-dropdown ${className}`}
            onClick={handleClickSelect}
          />
        </section>
      )}
    </section>
  );
}
