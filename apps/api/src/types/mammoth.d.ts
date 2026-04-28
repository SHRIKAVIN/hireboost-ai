/**
 * Minimal ambient types for the `mammoth` package — it doesn't ship types.
 * We only use `extractRawText`, so we declare just that surface.
 */
declare module 'mammoth' {
  export interface MammothMessage {
    type: 'warning' | 'error' | 'info';
    message: string;
  }

  export interface ExtractRawTextResult {
    value: string;
    messages: MammothMessage[];
  }

  export type MammothInput =
    | { buffer: Buffer }
    | { path: string }
    | { arrayBuffer: ArrayBuffer };

  export function extractRawText(input: MammothInput): Promise<ExtractRawTextResult>;

  const _default: {
    extractRawText: typeof extractRawText;
  };
  export default _default;
}
