
declare module 'ignore' {
  export interface  IgnoreInstance {
    add(rules: string[]): void;
    add(rules: string): void;
    filter(paths: string[]): string[];
  }
  function ignore(): IgnoreInstance;
}
