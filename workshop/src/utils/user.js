/**
 * Simple user identity: generates a UUID once and stores it in localStorage.
 * Each browser gets its own unique ID. No passwords needed.
 */

const STORAGE_KEY = 'hamster_user_id';

function generateId() {
  return 'user-' + crypto.randomUUID();
}

export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
