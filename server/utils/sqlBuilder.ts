import filterBuilder from "./filterBuilder";

export default function sqlBuilder(
  table: String,
  filter: object,
  sort: string,
  limit: string,
  offset: string
) {
  let sql: string = `SELECT * FROM ${table}`;
  let paginaton: string[] = [];

  const { params, values } = filterBuilder(filter);

  if (params.length > 0) {
    sql += " WHERE " + params.join(" AND ");
  }

  // Allow the user to sort results by a column name
  if (typeof sort === "string") {
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const column = sort.replace(/^-/, "");
    sql += ` ORDER BY ${column} ${direction}`;
  }
  // Limit & Offset
  if (limit) paginaton.push(` LIMIT ${limit}`);
  if (offset) paginaton.push(`OFFSET ${offset}`);
  sql += paginaton.join(" ");

  return { sql, values };
}
