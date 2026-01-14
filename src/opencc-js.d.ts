declare module "opencc-js" {
  export interface ConverterOptions {
    from: string;
    to: string;
  }

  export interface Converter {
    (input: string): string;
  }

  export function Converter(options: ConverterOptions): Converter;
}
