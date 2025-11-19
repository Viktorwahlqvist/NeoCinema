import React from 'react';
import "./Style/Cookiepolicy.scss";

export default function CookiePolicy() {
  return (
    <main className='cookiepolicy-container '>
      <h2 className='cookiepolicy-header mb-3'>Cookiepolicy</h2>

      <p>NeoCinema använder cookies för att ge dig en bättre och mer personlig upplevelse på vår webbplats. Cookies är små textfiler som lagras i din webbläsare när du besöker sidan.</p>

      <h3 className='cookiepolicy-header mt-4 mb-3'>Vilka cookies använder vi?</h3>

      <p>Nödvändiga cookies
        Dessa cookies krävs för att webbplatsen ska fungera korrekt, till exempel för inloggning och säkerhet.</p>

      <p>Analyscookies (kommer att användas senare)
        Dessa cookies hjälper oss att förstå hur webbplatsen används, exempelvis vilka sidor som är populära. Informationen används för att förbättra tjänsten.</p>

      <p>Marknadsföringscookies (kommer att användas senare)
        Dessa cookies används för att visa mer relevanta erbjudanden baserat på hur du använder webbplatsen. NeoCinema använder inte dessa ännu, men kan komma att göra det i framtiden.</p>
    </main>
  );
}
