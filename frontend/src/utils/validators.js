export const REGEX = {
  // v1 Zyphera regex rules
  password: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export function validatePassword(password) {
  return REGEX.password.test(password || '');
}

export function validateEmail(email) {
  return REGEX.email.test(email || '');
}

export function validateLoginIdentifier(identifier) {
  const v = (identifier || '').trim();
  // v1 accepts email OR length >= 3
  return validateEmail(v) || v.length >= 3;
}

