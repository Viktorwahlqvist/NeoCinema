import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Testa MovieDetailPage direkt på rotadressen */}
        <Route path="/" element={<MovieDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
