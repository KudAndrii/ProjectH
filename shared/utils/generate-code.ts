export const generateCode = (): string => {
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array, (value) =>
    String.fromCharCode(65 + (value % 26))).join('')
}
