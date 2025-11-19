import React from "react";
import "./Style/Movietags.scss";
interface TagsProps {
  actors: string[];
  ageLimit: number;
  duration: number;
  genrer: string[];
}

export default function MovieTags({
  actors,
  ageLimit,
  duration,
  genrer,
}: TagsProps) {
  return (
    <ul className="ul-list-tags">
      <li className="li-tags">{`${Math.floor(duration / 60)}h ${duration % 60
        }m`}</li>
      {genrer.map((g, i) => (
        <li className="li-tags" key={i}>
          {g}
        </li>
      ))}
      <li className="li-tags">{`${ageLimit}+`}</li>
      {actors.map((actors, i) => (
        <li className="li-tags" key={i}>
          {actors}
        </li>
      ))}
    </ul>
  );
}
