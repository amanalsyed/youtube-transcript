import { jsPDF } from 'jspdf';
import { TranscriptSegment, CopyFormat, ExportFormat, VideoMetadata } from '../types';

export function formatSecondsToSrtTime(seconds: number): string {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const hh = String(hrs).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');

  return `${hh}:${mm}:${ss},${mmm}`;
}

export function formatSecondsToVttTime(seconds: number): string {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const hh = String(hrs).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

export function formatSegmentsToSrt(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, idx) => {
      const index = idx + 1;
      const start = formatSecondsToSrtTime(seg.start);
      const end = formatSecondsToSrtTime(seg.end || seg.start + (seg.duration || 3));
      return `${index}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join('\n');
}

export function formatSegmentsToVtt(segments: TranscriptSegment[], videoTitle?: string): string {
  let vtt = 'WEBVTT\n';
  if (videoTitle) {
    vtt += `NOTE Transcript for: ${videoTitle}\n`;
  }
  vtt += '\n';

  vtt += segments
    .map((seg, idx) => {
      const start = formatSecondsToVttTime(seg.start);
      const end = formatSecondsToVttTime(seg.end || seg.start + (seg.duration || 3));
      return `${idx + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join('\n');

  return vtt;
}

export function formatSegmentsToMarkdown(
  segments: TranscriptSegment[],
  video?: VideoMetadata,
  translatedSegments?: TranscriptSegment[],
  targetLanguageName?: string
): string {
  let md = '';
  if (video) {
    md += `# ${video.title}\n\n`;
    if (video.author) md += `**Creator:** ${video.author}\n`;
    if (video.durationFormatted) md += `**Duration:** ${video.durationFormatted}\n`;
    if (video.url) md += `**Video URL:** ${video.url}\n`;
    if (targetLanguageName) md += `**Language:** Translated to ${targetLanguageName}\n`;
    md += `\n---\n\n## Transcript\n\n`;
  } else {
    md += `# YouTube Video Transcript\n\n---\n\n`;
  }

  if (translatedSegments && translatedSegments.length === segments.length) {
    md += segments
      .map((seg, idx) => {
        const trans = translatedSegments[idx];
        return `### [${seg.timestamp}]\n- **Original:** ${seg.text.trim()}\n- **${targetLanguageName || 'Translated'}:** ${trans.text.trim()}`;
      })
      .join('\n\n');
  } else {
    md += segments
      .map((seg) => `- **[${seg.timestamp}]** ${seg.text.trim()}`)
      .join('\n\n');
  }

  return md;
}

export function formatSegmentsToText(
  segments: TranscriptSegment[],
  format: CopyFormat,
  video?: VideoMetadata,
  translatedSegments?: TranscriptSegment[],
  targetLanguageName?: string
): string {
  if (format === 'markdown') {
    return formatSegmentsToMarkdown(segments, video, translatedSegments, targetLanguageName);
  }

  if (format === 'bilingual' && translatedSegments && translatedSegments.length === segments.length) {
    return segments
      .map((seg, idx) => {
        const trans = translatedSegments[idx];
        return `[${seg.timestamp}] ${seg.text}\n  ↳ [${targetLanguageName || 'Translated'}]: ${trans.text}`;
      })
      .join('\n\n');
  }

  if (format === 'with-timestamps') {
    return segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
  }
  return segments.map((s) => s.text).join(' ');
}

export function generatePdfDocument(
  segments: TranscriptSegment[],
  video?: VideoMetadata,
  languageLabel?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Header Background Bar
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('YouTube Video Transcript', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 212, 216); // zinc-300
  const subTitle = languageLabel
    ? `Generated via YouTube Transcript App • ${languageLabel}`
    : 'Generated via YouTube Transcript App';
  doc.text(subTitle, margin, 20);

  // Date on right
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(dateStr, pageWidth - margin, 20, { align: 'right' });

  currentY = 38;

  // Video Info Card
  if (video) {
    doc.setFillColor(244, 244, 245); // zinc-100
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');

    doc.setTextColor(24, 24, 27);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');

    const splitTitle = doc.splitTextToSize(video.title || 'Untitled Video', contentWidth - 8);
    doc.text(splitTitle[0] || video.title, margin + 4, currentY + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122); // zinc-500

    let metaLine = '';
    if (video.author) metaLine += `Creator: ${video.author}    `;
    if (video.durationFormatted) metaLine += `Duration: ${video.durationFormatted}    `;
    metaLine += `Total Segments: ${segments.length}`;
    if (languageLabel) metaLine += `    Language: ${languageLabel}`;

    doc.text(metaLine, margin + 4, currentY + 16);

    currentY += 32;
  }

  // Section Heading
  doc.setTextColor(39, 39, 42); // zinc-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(languageLabel ? `Transcript (${languageLabel})` : 'Full Transcript', margin, currentY);
  currentY += 6;

  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Transcript lines
  const timestampColWidth = 20;
  const textColX = margin + timestampColWidth + 2;
  const textColWidth = contentWidth - timestampColWidth - 2;

  doc.setFontSize(9);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const lines = doc.splitTextToSize(seg.text.trim(), textColWidth);
    const blockHeight = Math.max(lines.length * 4.5, 6) + 3;

    // Check if new page is needed
    if (currentY + blockHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;

      // Small header on subsequent pages
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(161, 161, 170);
      doc.text(`Transcript: ${video?.title?.slice(0, 50) || 'YouTube Video'}...`, margin, currentY);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 8;
    }

    // Timestamp pill text
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(82, 82, 91); // zinc-600
    doc.text(`[${seg.timestamp}]`, margin, currentY + 4);

    // Dialogue text
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(24, 24, 27); // zinc-900
    doc.text(lines, textColX, currentY + 4);

    currentY += blockHeight;
  }

  // Save PDF
  const sanitizedTitle = (video?.title || 'youtube-transcript')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);

  const suffix = languageLabel ? `_${languageLabel.toLowerCase().replace(/\s+/g, '_')}` : '';
  doc.save(`${sanitizedTitle || 'transcript'}${suffix}.pdf`);
}

export function downloadTranscriptFile(
  segments: TranscriptSegment[],
  video: VideoMetadata | undefined,
  format: ExportFormat = 'txt-timestamps',
  languageSuffix?: string
): void {
  const sanitizedTitle = (video?.title || 'youtube-transcript')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);

  const langTag = languageSuffix ? `_${languageSuffix}` : '';

  if (format === 'pdf') {
    generatePdfDocument(segments, video, languageSuffix);
    return;
  }

  let content = '';
  let filename = '';
  let mimeType = 'text/plain;charset=utf-8';

  switch (format) {
    case 'srt':
      content = formatSegmentsToSrt(segments);
      filename = `${sanitizedTitle || 'transcript'}${langTag}.srt`;
      mimeType = 'application/x-subrip;charset=utf-8';
      break;

    case 'vtt':
      content = formatSegmentsToVtt(segments, video?.title);
      filename = `${sanitizedTitle || 'transcript'}${langTag}.vtt`;
      mimeType = 'text/vtt;charset=utf-8';
      break;

    case 'markdown':
      content = formatSegmentsToMarkdown(segments, video);
      filename = `${sanitizedTitle || 'transcript'}${langTag}.md`;
      mimeType = 'text/markdown;charset=utf-8';
      break;

    case 'txt-plain':
      content = formatSegmentsToText(segments, 'text-only', video);
      filename = `${sanitizedTitle || 'transcript'}${langTag}_plain.txt`;
      mimeType = 'text/plain;charset=utf-8';
      break;

    case 'txt-timestamps':
    default:
      content = formatSegmentsToText(segments, 'with-timestamps', video);
      filename = `${sanitizedTitle || 'transcript'}${langTag}_timestamps.txt`;
      mimeType = 'text/plain;charset=utf-8';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function formatTimeSeconds(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remSecs = s % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(remSecs).padStart(2, '0');
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findMatches(segments: TranscriptSegment[], query: string): number[] {
  if (!query || !query.trim()) return [];
  const cleanQuery = query.trim().toLowerCase();
  const matchedSegmentIds: number[] = [];

  for (const seg of segments) {
    if (seg.text.toLowerCase().includes(cleanQuery)) {
      matchedSegmentIds.push(seg.id);
    }
  }

  return matchedSegmentIds;
}
