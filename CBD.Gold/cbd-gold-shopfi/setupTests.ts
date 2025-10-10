
// Polyfill for global in test environment for Node.js and browser
if (typeof global === 'undefined') {
  (window as unknown as { global: typeof window }).global = window;
}

import '@testing-library/jest-dom';
