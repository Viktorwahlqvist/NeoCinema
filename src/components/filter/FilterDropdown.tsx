import React, { useEffect, useRef, useState } from "react";
import FilterBtn from "./FilterBtn";
import "./Filter-dropdown.scss";

interface Option { label: string; value: string; }

interface SelectProps {
  label: string;                   
  options: Option[];
  onClick: (value: string) => void;  
  className?: string;
  selectedLabel?: string;            // What is shown on the button
  allLabel?: string;                 // Example "all dates"
}

export default function FilterDropdown({
  label,
  options,
  onClick,
  className,
  selectedLabel,
  allLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = () => setOpen(v => !v);
  const choose = (value: string) => { setOpen(false); onClick(value); };

  // Close when clicking outside or ESC
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="filter-dd" ref={ref}>
      <FilterBtn
        btnName={[selectedLabel || label]}
        className="filter-dd__trigger"
        aria-label={label}
        onClick={toggle}
      />

      {open && (
        <div className="filter-dd__menu" role="listbox" aria-label={label}>
          {allLabel && (
            <button
              type="button"
              className={`overall-button filter-dd__item ${className || ""}`}
              onClick={() => choose("")}
            >
              {allLabel}
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`overall-button filter-dd__item ${className || ""}`}
              onClick={() => choose(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}