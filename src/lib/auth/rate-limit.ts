import 'server-only';

// Простое ограничение попыток входа в памяти процесса: 5 ошибок за 15 минут на ключ.
// Для нескольких экземпляров приложения заменить на хранение в базе.
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

export function isLocked(key: string) {
  const now = Date.now();
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list.length >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  failures.set(key, [...(failures.get(key) ?? []), Date.now()]);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
