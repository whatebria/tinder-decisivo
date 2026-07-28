/**
 * Setup global para Jest.
 * Se ejecuta despues del framework, antes de cada test.
 *
 * Aca van mocks de APIs nativas que no existen en el entorno de test
 * (SecureStore, Platform, etc.). Los agregamos on-demand cuando algun
 * test lo necesite — hoy los services no dependen de nada nativo.
 */

// jsdom no expone TextEncoder/TextDecoder por default, pero algunas deps
// de Expo (whatwg-url) los tocan al cargarse. Polyfill barato.
if (typeof (globalThis as { TextEncoder?: unknown }).TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require("util");
  (globalThis as { TextEncoder: unknown }).TextEncoder = TextEncoder;
  (globalThis as { TextDecoder: unknown }).TextDecoder = TextDecoder;
}

// Placeholder — evita error si algun test necesita esto y no esta mockeado
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
