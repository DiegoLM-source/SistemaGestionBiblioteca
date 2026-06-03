const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
};

const isValidPhone = (value) => {
    if (!value) return true;
    return /^[0-9]{7,15}$/.test(String(value).trim());
};

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

const isValidDate = (value) => !Number.isNaN(Date.parse(value));

const isValidIsbn = (value) => /^(?:\d{10}|\d{13})$/.test(String(value).trim());

const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const normalizePagination = (limitValue, offsetValue, defaultLimit = 100, maxLimit = 500) => {
    const parsedLimit = Number(limitValue);
    const parsedOffset = Number(offsetValue);

    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, maxLimit)
        : defaultLimit;
    const offset = Number.isInteger(parsedOffset) && parsedOffset >= 0
        ? parsedOffset
        : 0;

    return { limit, offset };
};

const createValidationError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

module.exports = {
    isNonEmptyString,
    normalizeText,
    isValidEmail,
    isValidPhone,
    isPositiveInteger,
    isNonNegativeInteger,
    isValidDate,
    isValidIsbn,
    getCurrentDateString,
    normalizePagination,
    createValidationError
};
