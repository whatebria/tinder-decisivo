/**
 * Factory de test users. Cada llamada devuelve un user unico basado en
 * timestamp + random, evitando colisiones entre tests paralelos o reruns.
 */

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

/**
 * Genera un user unico. El prefix ayuda a identificar el test que lo creo
 * cuando revisas la DB despues de un fallo.
 */
export function makeTestUser(prefix = "e2e"): TestUser {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  const suffix = `${stamp}${rand}`;
  return {
    username: `${prefix}_${suffix}`.slice(0, 30), // Django max_length=150 pero cortito
    email: `${prefix}_${suffix}@e2e.local`,
    password: `Test${suffix}!Aa1`, // pasa validators de Django (min 8, mixed)
  };
}
