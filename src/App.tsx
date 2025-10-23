import React from "react";
import HomePage from "./pages/HomePage";
import BottomNavbar from "./components/BottomNavbar";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import NavDesk from "./components/NavDesk";
import { useIsMobile } from "./hooks/useIsMobile";

function App() {
  const isMobile = useIsMobile(); 

  return (
    <>
      {isMobile ? <BottomNavbar /> : <NavDesk />}
      <AllMoviesPage />
    </>
  );
}

export default App;