import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

import { ApiError } from '../../utils/api-error.js';

export type SupportedResumeMime =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export interface ExtractedText {
  /** The cleaned-up plain text representation of the document. */
  text: string;
  /**
   * Number of pages in the source. PDF only — DOCX yields `undefined`
   * because Word doesn't have a stable page count without rendering.
   */
  pageCount?: number;
}

/**
 * Convert a resume upload buffer into plain UTF-8 text. We support
 * PDF and DOCX — anything else is rejected with a 415-style error.
 *
 * Why we centralize this:
 * - Both code paths normalize whitespace identically so the downstream
 *   parser doesn't have to guess at line endings.
 * - The deterministic resume parser is sensitive to consecutive blank
 *   lines (used as section separators), so we collapse trailing spaces
 *   without collapsing line breaks.
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedText> {
  if (mimeType === 'application/pdf') {
    return extractFromPdf(buffer);
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDocx(buffer);
  }
  throw ApiError.badRequest(`Unsupported resume mime type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractedText> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    // Disable the default page-joiner ("-- 1 of 2 --") which would otherwise
    // contaminate the body text and confuse downstream section parsing.
    const result = await parser.getText({ pageJoiner: '\n' });
    return {
      text: normalize(result.text),
      pageCount: result.total,
    };
  } catch (err) {
    throw ApiError.badRequest(
      `Could not read PDF: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  } finally {
    // Important — pdfjs spawns workers internally; this releases them.
    await parser.destroy().catch(() => {
      /* swallow */
    });
  }
}

async function extractFromDocx(buffer: Buffer): Promise<ExtractedText> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: normalize(result.value),
    };
  } catch (err) {
    throw ApiError.badRequest(
      `Could not read DOCX: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
}

/**
 * Light whitespace normalization that preserves paragraph boundaries.
 * The downstream parser uses blank lines to detect section breaks.
 */
function normalize(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ') // non-breaking space → space
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
