export {};

declare global {
  interface Window {
    feather?: {
      replace: () => void;
    };
  }
}
