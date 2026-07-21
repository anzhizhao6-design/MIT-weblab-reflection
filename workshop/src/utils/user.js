const STORAGE_KEY = 'hamster_user_id';

export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 'user-' + crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function setUserId(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

/** Call backend to create a new user, then save it locally. */
export async function createNewUser() {
  const res = await fetch('/api/users', { method: 'POST' });
  const data = await res.json();
  setUserId(data.userId);
  return data.userId;
}

/** Check if a given user ID exists on the backend. */
export async function checkUserId(id) {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return data.exists;
}
