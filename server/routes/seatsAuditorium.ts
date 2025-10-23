import { db } from "../db.js"; 

//  Den här funktionen hämtar alltid senaste status för säten i en viss screening - tor viewn räcker men vet ej än
export async function getSeatsFromDB(screeningId: string) {
  const [rows] = await db.query(
    `SELECT 
        s.id AS seatId,
        s.row_num,
        s.seat_num,
        ss.seatStatus,
        a.auditoriumName,
        sc.id AS screeningId,
        sc.start_time
     FROM seats s
     JOIN seatStatusView ss ON s.id = ss.seatId
     JOIN screenings sc ON ss.screeningId = sc.id
     JOIN auditoriums a ON sc.auditoriumId = a.id
     WHERE sc.id = ?`,
    [screeningId]
  );

  return rows;
}
