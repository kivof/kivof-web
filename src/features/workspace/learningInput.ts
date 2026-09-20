export function vector(text: string, max = 64) {
  const values = text.split(",").map((value) => Number(value.trim()));
  if (
    !text.trim() ||
    values.length > max ||
    values.some((value) => !Number.isFinite(value))
  )
    throw new Error("invalid_request");
  return values;
}
export async function imageData(file: File) {
  if (!["image/png", "image/jpeg"].includes(file.type))
    throw new Error("invalid_image");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("invalid_image"));
    reader.readAsDataURL(file);
  });
  if (data.length > 131072) throw new Error("image_too_large");
  return data;
}
export function actionSequence(value: string) {
  if (!value.trim()) return undefined;
  const rows = JSON.parse(value);
  if (
    !Array.isArray(rows) ||
    rows.length > 32 ||
    rows.some(
      (row) =>
        !Array.isArray(row) ||
        !row.length ||
        row.length > 32 ||
        row.some(
          (number) => typeof number !== "number" || !Number.isFinite(number),
        ),
    )
  )
    throw new Error("invalid_request");
  return rows as number[][];
}
