import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "./style/cookingmodal.scss"

export default function CookieModal() {
  
  // Tillfälliga useStates till vi har implementerat localstorage.
    const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

   return (
      <Modal
      show={show}
      onHide={handleClose}
      centered
      className="custom-modal"
       backdrop="static"
      animation={true}
    >
      <Modal.Header>
        <section className="d-flex align-items-center justify-content-between w-100">
          <h5 className="mb-0 ms-5">Vi använder cookies</h5>
          <img 
            src='/NeoCinema.png' 
            className='neo-logo-img' 
            alt='NeoCinema logotyp, visas längst upp till höger' 
          />
        </section>
</Modal.Header>

      <Modal.Body className='modal-body'>
        <p>Modal body text goes here.</p>
      </Modal.Body>

      <Modal.Footer>
        {/* Tillfälig save  */}
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={handleClose}>Save changes</Button>
      </Modal.Footer>
    </Modal>
  );
}
