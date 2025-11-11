import React from 'react'

export default function QrCodeCard({qrDataUrl}: {qrDataUrl: string}) {
  return (
    <div className="qr-column">
              <h4 className="block-title">QR-kod</h4>
              <div className="qr-frame">
                <img src={qrDataUrl} alt="Biljett QR" />
              </div>
            </div>
  )
}
