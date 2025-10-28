// import { useEffect, useState } from "react";
// import "./MoviesPage.css";

// interface MovieInfo {
//   duration: number;
//   age_limit: string;
//   description: string;
//   mobileImg: string;
//   desktopImg: string;
//   release_date: string;
// }

// interface Movie {
//   id: number;
//   title: string;
//   info: MovieInfo;
//   mobileImg?: string;
//   genres?: string;
// }

// export default function MoviesPage() {
//   const [movies, setMovies] = useState<Movie[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMovies = async () => {
//       try {
//         const res = await fetch("/api/movies");
//         const data = await res.json();
//         if (Array.isArray(data)) setMovies(data);
//         else if (Array.isArray(data.movies)) setMovies(data.movies);
//       } catch (err) {
//         console.error("❌ Error fetching movies:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMovies();
//   }, []);

//   if (loading) {
//     return (
//       <main className="movies-page">
//         <p>Laddar filmer...</p>
//       </main>
//     );
//   }

//   return (
//     <main className="movies-page">
//       <h1>Filmer</h1>
//       <section className="movies-list">
//         {movies.map((movie) => (
//           <article
//             key={movie.id}
//             className="movie-card"
//             style={{
//               backgroundImage: `url(${movie.info?.mobileImg || "/placeholder.jpg"})`,
//             }}
//           >
//             <div className="movie-info">
//               <h2>{movie.title}</h2>
//               <p>{movie.info?.description}</p>
//             </div>
//           </article>
//         ))}
//       </section>
//     </main>
//   );
// }
