declare module 'mammoth' {
  interface RawTextResult {
    value: string
    messages: Array<{
      type: string
      message: string
    }>
  }

  interface Options {
    styleMap?: string[]
    includeDefaultStyleMap?: boolean
    convertImage?: any
    ignoreEmptyParagraphs?: boolean
    [key: string]: any
  }

  export function extractRawText(options: { path?: string; buffer?: Buffer }): Promise<RawTextResult>
  export function convertToHtml(options: { path?: string; buffer?: Buffer } & Options): Promise<any>
  export function convertToMarkdown(options: { path?: string; buffer?: Buffer } & Options): Promise<any>
}

