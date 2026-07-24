const USER_ID_KEY = 'hamster_daily_user_id';

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id) {
  localStorage.setItem(USER_ID_KEY, id);
}

export async function createNewUser() {
  const res = await fetch('/api/users', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  setUserId(data.userId);
  return data.userId;
}

export async function checkUserId(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.ok;
}

export function switchUserId(id) {
  setUserId(id);
}

export function ensureUserId() {
  return getUserId() || createNewUser();
}
