import React from "react";
import "./PagesStyle/KioskPage.scss";
import drink from "../assets/drink2.svg";
import popcorn from "../assets/popcorn3.svg";
import candy from "../assets/candy2.svg";

export default function KioskPage() {
  const hours = [
    { label: "Tisdag–Lördag", time: "16:30 – 22:00" },
    { label: "Söndag", time: "15:30 – 21:00" },
  ];

  const menu = [
    { name: "Popcorn (liten)", price: "35 kr" },
    { name: "Popcorn (stor)", price: "55 kr" },
    { name: "Godispåse (välj själv)", price: "45 kr" },
    { name: "Chokladkaka", price: "25 kr" },
    { name: "Chips (påse)", price: "30 kr" },
    { name: "Donut", price: "25 kr" },
    { divider: true },
    { name: "Varm macka", price: "50 kr" },
    { name: "Nachos med ostsås", price: "50 kr" },
    { name: "Korv med bröd", price: "35 kr" },
    { divider: true },
    { name: "Läsk (33 cl)", price: "20 kr" },
    { name: "Läsk (50 cl)", price: "30 kr" },
    { name: "Iskaffe", price: "40 kr" },
    { name: "Energidryck", price: "40 kr" },
    { name: "Slush (stor)", price: "45 kr" },
  ];

  return (
    <div className="kioskA-root">
      <h1 className="kioskA-title">Kiosk</h1>

      <main className="kioskA-grid">
        {/* Vänster stor panel */}
        <section className="kioskA-panel">
          <h2 className="kioskA-heading">Välkommen till Neon Snacks!</h2>

          <p className="kioskA-lead">
            Vi är stolta över att presentera vår helt nyöppnade kiosk –
            fullproppad med godsaker som gör bioupplevelsen ännu bättre. Här
            hittar du allt från klassiska popcorn och läsk till färgstarka
            snacks och sötsaker i sann retro-anda. Perfekt för dig som vill
            krydda filmkvällen med något extra!
          </p>

          <div className="kioskA-cols">
            <p>
              Hos oss hittar du både klassiker och nya favoriter – popcorn,
              läsk, godis och snacks som förhöjer filmupplevelsen.
            </p>
            <p>
              På Neon Snacks hittar du inte bara godis och popcorn – vi serverar
              även enklare mat som korv med bröd och andra snabba rätter.
              Perfekt om du vill stilla hungern innan filmen börjar!
            </p>
          </div>

          <div className="kioskA-icons">
            <img
              src={drink}
              alt="Drink"
              className="kA-icon"
              width={80}
              height={80}
            />
            <img
              src={popcorn}
              alt="Popcorn"
              className="kA-icon"
              width={80}
              height={80}
            />
            <img
              src={candy}
              alt="Candy"
              className="kA-icon"
              width={80}
              height={80}
            />
          </div>
        </section>

        {/* Högerkolumn */}
        <aside className="kioskA-side">
          <section className="kA-box">
            <h3 className="kA-boxTitle">Öppettider</h3>
            <ul className="kA-hours">
              {hours.map((h) => (
                <li key={h.label}>
                  <span>{h.label}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="kA-box">
            <div className="kA-menuHead">
              <img
                src={popcorn}
                alt=""
                aria-hidden
                className="kA-icon kA-icon--small"
              />
              <h3>Utbud</h3>
              <img
                src={drink}
                alt=""
                aria-hidden
                className="kA-icon kA-icon--small"
              />
            </div>
            <ul className="kA-menu">
              {menu.map((m, i) =>
                m.divider ? (
                  <li key={`d-${i}`} className="kA-divider" aria-hidden />
                ) : (
                  <li key={m.name} className="kA-row">
                    <span className="kA-item">{m.name}</span>
                    <span className="kA-dots" aria-hidden />
                    <span className="kA-price">{m.price}</span>
                  </li>
                )
              )}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
