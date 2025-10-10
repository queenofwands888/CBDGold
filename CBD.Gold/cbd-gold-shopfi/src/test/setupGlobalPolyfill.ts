// Polyfill for global in test environment
declare let global: typeof globalThis;
if (typeof global === 'undefined') {
  (window as unknown as { global: typeof window }).global = window;
}
