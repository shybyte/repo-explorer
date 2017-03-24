declare interface  IgnoreInstance {
  add(rules: string[]): void;
  add(rules: string): void;
  filter(paths: string[]): string[];
  ignores(path: string): boolean;
}

declare module 'ignore' {
  function ignore(): IgnoreInstance;
  export = ignore;
}
