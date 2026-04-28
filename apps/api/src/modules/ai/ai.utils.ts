import type { ResumeStructuredData } from '@hireboost/shared';

/**
 * Models sometimes wrap JSON in fences; strip and parse.
 */
export function parseJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const body = (fence?.[1] ?? trimmed).trim();
  return JSON.parse(body) as unknown;
}

/** Avoid accidental PII drops — keep original contact fields when the model blanks them. */
export function preserveContactBasics(
  original: ResumeStructuredData,
  enhanced: ResumeStructuredData,
): ResumeStructuredData {
  const ob = original.basics;
  const eb = enhanced.basics;
  return {
    ...enhanced,
    basics: {
      ...eb,
      fullName: eb.fullName?.trim() || ob.fullName,
      email: eb.email?.trim() || ob.email,
      phone: eb.phone?.trim() || ob.phone,
      location: eb.location?.trim() || ob.location,
      links:
        eb.links && eb.links.length > 0
          ? eb.links
          : ob.links && ob.links.length > 0
            ? ob.links
            : undefined,
    },
  };
}
