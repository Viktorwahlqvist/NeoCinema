import React from "react";
import Button from "react-bootstrap/Button";

interface BtnInput {
  btnName: string;
  onClick: () => void;
}

export default function FilterBtn({ btnName, onClick }: BtnInput) {
  return (
    <>
      <Button variant="outline-primary" onClick={onClick}>
        {btnName}
      </Button>
    </>
  );
}
