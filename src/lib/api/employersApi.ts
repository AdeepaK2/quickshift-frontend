const base = process.env.NEXT_PUBLIC_API_URL + "/employers";

export const getAll = () => fetch(base).then((res) => res.json());
export const verify = (id: string) =>
  fetch(`${base}/${id}/verify`, { method: "PATCH" }).then((res) => res.json());
export const suspend = (id: string) =>
  fetch(`${base}/${id}/suspend`, { method: "PATCH" }).then((res) => res.json());
