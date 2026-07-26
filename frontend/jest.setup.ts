/**
 * Setup global para Jest.
 * Se ejecuta despues del framework, antes de cada test.
 *
 * Aca van mocks de APIs nativas que no existen en el entorno de test
 * (SecureStore, Platform, etc.). Los agregamos on-demand cuando algun
 * test lo necesite — hoy los services no dependen de nada nativo.
 */

// Placeholder — evita error si algun test necesita esto y no esta mockeado
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
