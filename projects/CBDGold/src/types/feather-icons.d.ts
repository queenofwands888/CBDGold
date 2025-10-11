declare module 'feather-icons' {
  type FeatherIconDefinition = {
    toSvg: (options?: Record<string, string>) => string;
  };

  const feather: {
    icons: Record<string, FeatherIconDefinition>;
  };

  export default feather;
}
