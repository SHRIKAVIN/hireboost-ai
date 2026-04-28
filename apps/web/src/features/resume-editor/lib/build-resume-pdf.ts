import type { ResumeStructuredData } from '@hireboost/shared';
import { jsPDF } from 'jspdf';

const MARGIN = 48;
const LINE = 13;
const PAGE_W = 612; // letter pt
const PAGE_H = 792;

function pageInnerWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - MARGIN * 2;
}

/**
 * Plain, single-column PDF suitable for ATS parsers (no text in images, simple Helvetica).
 */
export function buildResumePdfBlob(data: ResumeStructuredData): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  let y = MARGIN;

  const ensure = (extra: number) => {
    if (y + extra > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const textBlock = (lines: string[], size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const w = pageInnerWidth(doc);
    for (const raw of lines) {
      const wrapped = doc.splitTextToSize(raw, w) as string[];
      for (const line of wrapped) {
        ensure(LINE);
        doc.text(line, MARGIN, y);
        y += LINE;
      }
    }
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  ensure(24);
  const name = data.basics.fullName.trim() || 'Resume';
  doc.text(name, MARGIN, y);
  y += 26;

  const contactBits = [
    data.basics.email,
    data.basics.phone,
    data.basics.location,
  ].filter((s) => s && String(s).trim());
  if (contactBits.length) {
    textBlock([contactBits.join(' · ')], 10);
    y += 4;
  }

  if (data.basics.links?.length) {
    textBlock(
      [data.basics.links.map((l) => `${l.label}: ${l.url}`).join('  |  ')],
      9,
    );
    y += 8;
  } else {
    y += 6;
  }

  const section = (title: string) => {
    y += 6;
    ensure(LINE + 4);
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 16;
    textBlock([title], 11, 'bold');
    y += 2;
  };

  if (data.summary.trim()) {
    section('SUMMARY');
    textBlock([data.summary.trim()], 10);
  }

  if (data.skills.length) {
    section('SKILLS');
    textBlock([data.skills.join(' · ')], 10);
  }

  if (data.experience.length) {
    section('EXPERIENCE');
    for (const exp of data.experience) {
      const titleLine = [exp.role, exp.company].filter(Boolean).join(' — ');
      if (titleLine) textBlock([titleLine], 11, 'bold');
      const dates = exp.current
        ? [exp.startDate, 'Present'].filter(Boolean).join(' – ')
        : [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      const meta = [dates, exp.location].filter(Boolean).join(' · ');
      if (meta) textBlock([meta], 9);
      y += 4;
      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        const wrapped = doc.splitTextToSize(`• ${bullet.trim()}`, pageInnerWidth(doc) - 12) as string[];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        for (let i = 0; i < wrapped.length; i++) {
          ensure(LINE);
          const prefix = i === 0 ? '' : '  ';
          doc.text(prefix + wrapped[i], MARGIN + (i === 0 ? 0 : 8), y);
          y += LINE;
        }
      }
      y += 8;
    }
  }

  if (data.education.length) {
    section('EDUCATION');
    for (const ed of data.education) {
      const head = [ed.degree, ed.field, ed.institution].filter(Boolean).join(' — ');
      if (head) textBlock([head], 10, 'bold');
      const dates = [ed.startDate, ed.endDate].filter(Boolean).join(' – ');
      if (dates) textBlock([dates], 9);
      if (ed.details?.trim()) textBlock([ed.details.trim()], 10);
      y += 6;
    }
  }

  if (data.projects.length) {
    section('PROJECTS');
    for (const p of data.projects) {
      if (p.name) textBlock([p.name], 10, 'bold');
      if (p.url?.trim()) textBlock([p.url.trim()], 9);
      if (p.description?.trim()) textBlock([p.description.trim()], 10);
      for (const bullet of p.bullets) {
        if (!bullet.trim()) continue;
        const wrapped = doc.splitTextToSize(`• ${bullet.trim()}`, pageInnerWidth(doc) - 12) as string[];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        for (let i = 0; i < wrapped.length; i++) {
          ensure(LINE);
          doc.text((i === 0 ? '' : '  ') + wrapped[i], MARGIN + (i === 0 ? 0 : 8), y);
          y += LINE;
        }
      }
      y += 6;
    }
  }

  if (data.certifications.length) {
    section('CERTIFICATIONS');
    for (const c of data.certifications) {
      const line = [c.name, c.issuer].filter(Boolean).join(' — ');
      if (line) textBlock([line], 10);
      if (c.issueDate?.trim()) textBlock([c.issueDate.trim()], 9);
      y += 4;
    }
  }

  return doc.output('blob');
}

export function downloadResumePdf(data: ResumeStructuredData, baseFileName = 'resume'): void {
  const safe = baseFileName.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'resume';
  const blob = buildResumePdfBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safe}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
