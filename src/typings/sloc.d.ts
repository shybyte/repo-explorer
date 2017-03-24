declare interface SlocResult {
  total: number;
  source: number;
}

declare module "sloc" {
  function sloc(file: string, fileType: string): SlocResult;
  export = sloc;
}

