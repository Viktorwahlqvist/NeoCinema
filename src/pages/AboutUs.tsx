import React from "react";
import "./PagesStyle/OmNeo.scss";
import { Flag, GeoAlt, Map } from "react-bootstrap-icons";
import CookiePolicy from "../components/CookiePolicy";

const address = 'Biogatan 1, 123 45 Småstad';
const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;


export default function AboutUs() {
  return (
    <div className="omneo-root">
      <header className="omneo-hero">
        <img className="omneo-hero__img" src="/omNeo.jpg" alt="Biograf med röda stolar" />
        <div className="omneo-hero__overlay">
          <h1 className="omneo-title">Om NeoCinema</h1>
          <p className="omneo-subtitle">
            Bioupplevelser för alla – från storfilmer till kultklassiker, mitt i Småstad.
          </p>
        </div>
      </header>

      <main className="omneo-content">
        <div className="omneo-grid">
          <div>
            <section className="omneo-section">
              <h2>NeoCinema AB</h2>
              <p>
                NeoCinema AB är en lokal biografkedja i Småstad. Vi siktar på att ge dig den bästa
                bioupplevelsen – från de största premiärerna till unika filmpärlor du inte hittar någon annanstans.
              </p>
            </section>

            <section className="omneo-section">
              <h2>Vårt mål</h2>
              <p>
                Vårt mål är att vara Småstads självklara bioval – en plats där alla kan njuta av film.
                Vi kombinerar stora premiärer med noga utvalda filmer och gör biobesöken trygga, personliga och minnesvärda.
              </p>
            </section>

            <section className="omneo-section">
              <h2>Lokal närvaro</h2>
              <p>
                Vi är mer än en biograf – vi är en del av Småstad. Genom samarbeten med skolor,
                föreningar och lokala kulturaktörer skapar vi mötesplatser och upplevelser som engagerar hela samhället.
              </p>
            </section>

            <section className="omneo-section">
              <h2>Hitta oss</h2>
              <ul className="omneo-contact">
                <li><strong>Adress:</strong> Biogatan 1, 123 45 Småstad</li>
                <li><strong>Telefon:</strong> 012-345 67 89</li>
                <li><strong>E-post:</strong> info@neocinema.se</li>
              </ul>
            </section>
          </div>
          <aside className="omneo-icons omneo-icons--bare" aria-label="Dekorativa ikoner">
            <Flag className="omneo-icon" />
            <GeoAlt className="omneo-icon" />         
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Öppna Google Maps: ${address}`}
              className="omneo-iconLink"
              title="Öppna i Google Maps"
            >
              <Map className="omneo-icon" />
            </a>
          </aside>



        </div>
      </main>
      <CookiePolicy />
    </div>
  );
}
