import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "./Style/ConfirmCancelModal.scss";

interface ConfirmCancelModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingTitle?: string;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  show,
  onClose,
  onConfirm,
  bookingTitle,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      className="confirm-cancel-modal"
    >
      <Modal.Header closeButton className="confirm-cancel-header">
        <Modal.Title>Bekräfta avbokning</Modal.Title>
      </Modal.Header>

      <Modal.Body className="confirm-cancel-body">
        <p>
          Är du säker på att du vill avboka{" "}
          <strong>{bookingTitle}</strong>?
        </p>
      </Modal.Body>

      <Modal.Footer className="confirm-cancel-footer">
        <Button
          onClick={onClose}
          className="cancel-btn"
        >
          Nej
        </Button>
        <Button

          onClick={onConfirm}
          className="confirm-btn"
        >
          Ja, avboka
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmCancelModal;
