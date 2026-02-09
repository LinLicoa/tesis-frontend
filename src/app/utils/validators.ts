/**
 * Valida si un email tiene formato correcto
 * @param email Correo electrónico a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export function isValidEmail(email: string): boolean {
  // Expresión regular estándar para validación de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Valida si una cédula ecuatoriana es válida usando el algoritmo de módulo 10
 * @param cedula Número de cédula a validar
 * @returns true si la cédula es válida, false en caso contrario
 */
export function isValidCedula(cedula: string): boolean {
  if (!cedula) return false;

  // Debe tener 10 dígitos
  if (cedula.length !== 10) return false;

  // Debe ser solo dígitos
  if (!/^\d+$/.test(cedula)) return false;

  // Los dos primeros dígitos corresponden a la provincia (01-24) o 30
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  return true;
}

/**
 * Valida si un nombre completo contiene solo letras y espacios
 * @param nombre Nombre a validar
 * @returns true si el nombre es válido, false en caso contrario
 */
export function isValidNombreCompleto(nombre: string): boolean {
  if (!nombre || nombre.trim().length === 0) return false;

  // Solo permite letras (incluyendo acentos, ñ, ü) y espacios
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return nombreRegex.test(nombre.trim());
}
