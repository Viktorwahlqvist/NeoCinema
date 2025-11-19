import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "./style/Cookingmodal.scss";


interface CookingConsent {
  necessary: boolean,
  analytics: boolean,
  marketing: boolean;
}

export default function CookieModal() {
  const [cookieConsent, setCookieConsent] = useState<CookingConsent | null>(() => {
    const saved = localStorage.getItem('cookieConsent');
    return saved ? JSON.parse(saved) : null;
  }
  );


  const handleAllowNecessary = () => {
    const consent = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setCookieConsent(consent);
  };

  const handleAllowAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setCookieConsent(consent);
  };

  return (
    <Modal
      show={!cookieConsent}
      centered
      className="custom-modal"
      backdrop="static"
      animation={true}
    >
      <Modal.Header>
        <section className="d-flex align-items-center w-100">
          <img
            src='/NeoCinema.png'
            className='neo-logo-img'
            alt='NeoCinema logotyp'
          />
          <h5 className="mb-0 ms-md-5 modal-h5">Vi använder cookies</h5>
        </section>
      </Modal.Header>

      <Modal.Body className='modal-body'>
        <ul className='list-unstyled d-flex flex-column gap-3'>
          <li><strong>Inloggning:</strong> Säkerställa att du kan logga in (nödvändiga cookies)</li>
          <li><strong>Statistik:</strong> Samla statistik för att förbättra tjänsten (kommer snart)</li>
        </ul>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" className='modal-buttons' onClick={handleAllowNecessary}>Tillåt endast nödvändiga</Button>
        <Button variant="primary" className='modal-buttons' onClick={handleAllowAll}>Acceptera alla</Button>
      </Modal.Footer>
    </Modal>
  );
}
