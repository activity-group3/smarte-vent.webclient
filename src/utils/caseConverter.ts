/**
 * Converts snake_case keys to camelCase recursively in objects and arrays
 * @param data - The data to convert
 * @returns The converted data
 */
export const snakeToCamel = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => snakeToCamel(item));
  }

  if (typeof data === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in data) {
      const camelKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
      newObj[camelKey] = snakeToCamel(data[key]);
    }
    return newObj;
  }

  return data;
};

/**
 * Converts camelCase keys to snake_case recursively in objects and arrays
 * @param data - The data to convert
 * @returns The converted data
 */
export const camelToSnake = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => camelToSnake(item));
  }

  if (typeof data === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in data) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = camelToSnake(data[key]);
    }
    return newObj;
  }

  return data;
};