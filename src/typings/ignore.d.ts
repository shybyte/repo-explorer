
declare module 'ignore' {
  export interface  IgnoreInstance {
    add(rules: string[]): void;
    add(rules: string): void;
    filter(paths: string[]): string[];
    ignores(path: string): boolean;
  }
  function ignore(): IgnoreInstance;
}
