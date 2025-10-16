export default function filterBuilder(filter: object) {
  let params: string[] = [];
  let values: string[] = [];
  // Add filters dynamically to query and values array
  Object.entries(filter).forEach(([key, value]) => {
    if (key === "age") {
      const num = Number(value);
      const operator = num >= 0 ? "<=" : ">=";
      const age = Math.abs(num);

      params.push(`Age ${operator} ?`);
      values.push(age.toString());
    } else {
      value = value.replace(/[-_]/g, " ");
      const endsWith = value.includes("%") ? " LIKE" : " =";
      params.push(`${key} ${endsWith} ?`);
      console.log(value);

      values.push(value as string);
    }
  });

  return { params, values };
}
