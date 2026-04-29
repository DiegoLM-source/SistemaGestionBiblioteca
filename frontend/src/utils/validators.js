export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

export const isValidEmail = (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isValidPhone = (value) =>
  !value || /^[0-9]{7,15}$/.test(String(value).trim());

export const isPositiveInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

export const isNonNegativeInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;

export const isValidIsbn = (value) =>
  /^(?:\d{10}|\d{13})$/.test(String(value).trim());

export const isValidDate = (value) => !Number.isNaN(Date.parse(value));
