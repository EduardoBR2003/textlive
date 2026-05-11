export function validatePasswordInput(password: string): {
  valid: boolean;
  message: string;
} {
  if (!password) {
    return { valid: false, message: 'A senha é obrigatória' };
  }
  if (password.length < 4) {
    return { valid: false, message: 'A senha deve ter no mínimo 4 caracteres' };
  }
  if (password.length > 64) {
    return { valid: false, message: 'A senha deve ter no máximo 64 caracteres' };
  }
  return { valid: true, message: '' };
}
