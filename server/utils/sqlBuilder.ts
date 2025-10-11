import filterBuilder from "./filterBuilder";

export default function sqlBuilder(
  table: String,
  filter: object,
  sort: string
) {
  let sql: string = `SELECT * FROM ${table}`;

  const { params, values } = filterBuilder(filter);

  console.log(values);

  if (params.length > 0) {
    sql += " WHERE " + params.join(" AND ");
  }

  // Allow the user to sort results by a column name
  if (typeof sort === "string") {
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const column = sort.replace(/^-/, "");
    sql += ` ORDER BY ${column} ${direction}`;
  }

  return { sql, values };
}
