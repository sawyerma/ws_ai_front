/**
 * Access nested object properties safely.
 * @param obj The object to access.
 * @param path A dot-separated string representing the path to the property.
 * @param defaultValue The value to return if the path is not found.
 * @returns The value at the specified path or the default value.
 */
export function safeAccess<T>(obj: any, path: string, defaultValue: T): T {
  return path.split('.').reduce((acc, key) => {
    try {
      // The check `acc && acc[key] !== undefined` handles cases where acc is null/undefined
      return acc && acc[key] !== undefined ? acc[key] : defaultValue;
    } catch {
      return defaultValue;
    }
  }, obj) as T;
}
