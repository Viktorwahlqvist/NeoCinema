import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface NotificationProps {
  setShow: (arg: boolean) => void;
  show: boolean,
  toastMessage: string;
}

export default function NotificationToast({ setShow, show, toastMessage }: NotificationProps) {

  return (
    <ToastContainer position="top-end" className="p-3 toast-under-navbar">
      <Toast
        onClose={() => setShow(false)}
        show={show}
        delay={5000}
        animation={true}
        autohide
        className="toast-styling w-auto"
      >
        <Toast.Header className="toast-header-styling">
          <img
            src="holder.js/20x20?text=%20"
            className="rounded me-2"
            alt=""
          />
          <strong className="me-auto">Notifikation</strong>
          <small>Just nu</small>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
