import React, { useEffect, useState } from "react";
import FilterBtn from "./FilterBtn";
import "./filter-dropdown.scss";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: Option[];
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
          {options.map((option) => (
            <FilterBtn
              key={option.value}
              btnName={[option.label]}
              className={`options-dropdown ${className}`}
              onClick={() => handleClickSelect(option.value)}
            />
          ))}
        </section>
      )}
    </section>
  );
}
