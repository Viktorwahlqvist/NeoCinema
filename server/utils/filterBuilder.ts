export default function filterBuilder(filter: object) {
  let params: string[] = [];
  let values: string[] = [];
  // Add filters dynamically to query and values array
  Object.entries(filter).forEach(([key, value]) => {
    const endsWith = value.includes("%") ? " LIKE" : " =";
    params.push(`${key} ${endsWith} ?`);
    console.log(value);

    values.push(value as string);
  });

  return { params, values };
}
