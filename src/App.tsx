import "bootstrap/dist/css/bootstrap.min.css";
import MyNavbar from "./components/Navbar";
import Cardholder from "./components/Cardholder";

import duneImg from "./assets/dune.jpg";
import interstellarImg from "./assets/interstellar.jpeg";
import pulpfictionImg from "./assets/pulpfiction.jpg";
import greenbookImg from "./assets/greenbook.jpg";

export default function App() {
  const movies = [
    { imageSrc: duneImg, title: "Dune", text: "Öken, kryddan och politiska intriger.", href: "/movies/dune" },
    { imageSrc: interstellarImg, title: "Interstellar", text: "En resa genom wormholes och tid.", href: "/movies/interstellar" },
        { imageSrc: greenbookImg, title: "Green Book", text: "Musik", href: "/movies/greenbook" },
    { imageSrc: pulpfictionImg, title: "Pulp Fiction", text: "Hej", href: "/movies/interstellar" },
   
  ];

  return (
    <>
      <MyNavbar />
      <div className="container py-4">
        {/* centrera innehållet i raden när det inte blir fullt (t.ex. 2 kort) */}
        <div className="row g-4 justify-content-center">
          {movies.map((m) => (
            // varje kort tar 1/3 (3 per rad) från md och uppåt
            // på mobiler: fullbredd, på små skärmar: 2 per rad
            <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center" key={m.title}>
              <Cardholder
                imageSrc={m.imageSrc}
                title={m.title}
                text={m.text}
                buttonLabel="Läs mer"
                buttonHref={m.href}
                widthRem={18}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}