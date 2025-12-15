// utils/onlyNumberInput.ts
export function onlyNumberInput(value: string) {
  return value.replace(/[^0-9]/g, ""); // ← elimina todo lo que NO sea número
}
