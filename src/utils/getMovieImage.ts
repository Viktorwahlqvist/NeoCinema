export function getMovieImage(title: string) {
  const name = title.toLowerCase();
  if (name.includes("terminator")) return "/terminatorDesktop.png";
  if (name.includes("blade")) return "/bladeRunnerDesktop.png";
  if (name.includes("matrix")) return "/theMatrixDesktop.png";
  if (name.includes("old")) return "/oldBoyDesktop.png";
  if (name.includes("tron")) return "/tronDesktop.png";
  if (name.includes("ballerina")) return "/ballerinaDesktop.png";
  return "/vite.svg";
}


