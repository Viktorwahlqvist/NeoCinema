import React from "react";
import "./Style/trailer.scss";
interface TrailerProps {
  videoId: string;
  title: string;
}

export default function Trailer({ videoId, title }: TrailerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <figure className="ratio ratio-16x9 trailer">
      <iframe src={embedUrl} className="trailer-iframe" title={title} />
    </figure>
  );
}
