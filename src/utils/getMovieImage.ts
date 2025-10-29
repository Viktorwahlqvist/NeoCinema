
export function getMovieImage(title: string) {
  switch (title.toLowerCase()) {
    case "the terminator":
      return "/terminatorDesktop.png";
    case "blade runner":
      return "/bladeRunnerDesktop.png";
    case "the matrix":
      return "/theMatrixDesktop.png";
    case "old boy":
      return "/oldBoyDesktop.png";
    case "tron":
      return "/tronDesktop.png";
    case "ballerina":
      return "/ballerinaDesktop.png";
    default:
      return "/vite.svg"; // fallback om ingen bild hittas
  }
}

