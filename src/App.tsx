import HomePage from "./pages/HomePage";
import BottomNavbar from "./components/BottomNavbar";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import Navdesk from "./components/NavDesk";

function App() {
  return (
    <>
    <Navdesk />
      {/* <MovieDetailPage /> */}
      <AllMoviesPage />
      {/* <HomePage />
      <BottomNavbar /> */}
    </>
  );
}

export default App;
