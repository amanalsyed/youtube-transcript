import { TranscriptSegment, KeyMoment } from '../types';
import { formatTimeSeconds } from './textUtils';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does',
  'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so',
  'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we',
  'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves', 'also', 'just', 'like', 'really', 'going', 'know', 'think', 'see',
  'one', 'get', 'got', 'even', 'make', 'much', 'well', 'way', 'thing', 'things', 'people', 'say',
  'said', 'look', 'come', 'go', 'now', 'right', 'back', 'take', 'want', 'first', 'two', 'good',
  'little', 'use', 'using', 'used', 'many', 'put', 'need', 'something', 'always', 'never'
]);

const TRANSITION_PATTERNS = [
  { pattern: /\b(first|firstly|to begin with|let's start|welcome back|in this video|today we)\b/i, weight: 3, type: 'intro' },
  { pattern: /\b(second|secondly|next|moving on|let's talk about|another important|the second thing|step 2)\b/i, weight: 3, type: 'step' },
  { pattern: /\b(third|thirdly|step 3|next step|furthermore|additionally)\b/i, weight: 3, type: 'step' },
  { pattern: /\b(the main problem|the key challenge|why does this matter|here is why|the problem is)\b/i, weight: 2.5, type: 'problem' },
  { pattern: /\b(the solution|how to solve|how it works|how we can|the key is|let me explain)\b/i, weight: 2.5, type: 'solution' },
  { pattern: /\b(for example|for instance|take a look|demonstration|in practice|let's see)\b/i, weight: 2, type: 'example' },
  { pattern: /\b(in conclusion|to conclude|to wrap up|in summary|to summarize|the bottom line|finally|key takeaways?)\b/i, weight: 3.5, type: 'conclusion' },
  { pattern: /\b(important thing|crucial point|remember that|keep in mind|pro tip|note that)\b/i, weight: 2, type: 'tip' },
];

/**
 * Extracts top frequent keywords from a list of segments
 */
function extractTopKeywords(segments: TranscriptSegment[], limit = 4): string[] {
  const wordFreq = new Map<string, number>();

  for (const seg of segments) {
    const words = seg.text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    for (const w of words) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }
  }

  const sorted = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  return sorted.slice(0, limit);
}

/**
 * Creates a clean, human-readable section title from segment text and keywords
 */
function generateSectionTitle(
  firstSegment: TranscriptSegment,
  clusterSegments: TranscriptSegment[],
  index: number,
  totalMoments: number
): { title: string; summary: string; keywords: string[] } {
  const keywords = extractTopKeywords(clusterSegments, 3);
  const text = clusterSegments.map((s) => s.text).join(' ');
  const firstText = firstSegment.text.trim();

  let title = '';

  // Check for transition patterns
  if (index === 0) {
    title = 'Introduction & Overview';
  } else if (index === totalMoments - 1 && totalMoments > 2) {
    title = 'Conclusion & Key Takeaways';
  } else {
    // Check if there is a strong transition phrase
    for (const { pattern, type } of TRANSITION_PATTERNS) {
      if (pattern.test(firstText)) {
        if (type === 'conclusion') title = 'Summary & Wrap Up';
        else if (type === 'problem') title = 'The Core Problem & Context';
        else if (type === 'solution') title = 'Solution & How It Works';
        else if (type === 'example') title = 'Practical Example & Demonstration';
        else if (type === 'tip') title = 'Important Insights & Tips';
        else if (type === 'step') title = `Key Stage ${index}: Topic Breakdown`;
        break;
      }
    }
  }

  // Fallback to top keywords if generic
  if (!title) {
    if (keywords.length > 0) {
      const capitalized = keywords.map((k) => k.charAt(0).toUpperCase() + k.slice(1));
      if (capitalized.length >= 2) {
        title = `Focus: ${capitalized.slice(0, 2).join(' & ')}`;
      } else {
        title = `Focus on ${capitalized[0]}`;
      }
    } else {
      title = `Part ${index + 1}: Overview`;
    }
  }

  // Extract a 1-sentence summary snippet
  let summary = firstText;
  if (summary.length < 50 && clusterSegments.length > 1) {
    summary = clusterSegments.slice(0, 2).map((s) => s.text).join(' ');
  }
  if (summary.length > 120) {
    summary = summary.slice(0, 117) + '...';
  }

  return { title, summary, keywords };
}

/**
 * Analyzes transcript segments and divides them into 3 to 7 Key Moments
 */
export function extractKeyMoments(segments: TranscriptSegment[]): KeyMoment[] {
  if (!segments || segments.length === 0) return [];

  // For very short transcripts (less than 4 segments)
  if (segments.length < 4) {
    const fullText = segments.map((s) => s.text).join(' ');
    const keywords = extractTopKeywords(segments, 3);
    return [
      {
        id: 'moment-0',
        start: segments[0].start,
        end: segments[segments.length - 1].end,
        timestamp: segments[0].timestamp,
        title: 'Full Video Overview',
        summary: fullText.slice(0, 100) + (fullText.length > 100 ? '...' : ''),
        keywords,
        startSegmentId: segments[0].id,
        confidence: 'high',
      },
    ];
  }

  const totalDuration = segments[segments.length - 1].end || segments[segments.length - 1].start;
  
  // Determine desired number of key moments (between 3 and 7 based on duration & segment count)
  let targetMomentsCount = 4;
  if (totalDuration > 1200 || segments.length > 100) {
    targetMomentsCount = 6;
  } else if (totalDuration > 600 || segments.length > 50) {
    targetMomentsCount = 5;
  } else if (segments.length < 15) {
    targetMomentsCount = 3;
  }

  // Score candidate split points using transition markers and time spacing
  const segmentCount = segments.length;
  const idealWindowSize = Math.floor(segmentCount / targetMomentsCount);

  const splitIndices: number[] = [0];

  for (let m = 1; m < targetMomentsCount; m++) {
    const idealIdx = m * idealWindowSize;
    const searchRadius = Math.max(2, Math.floor(idealWindowSize * 0.4));
    const startRange = Math.max(splitIndices[m - 1] + 2, idealIdx - searchRadius);
    const endRange = Math.min(segmentCount - 2, idealIdx + searchRadius);

    let bestIdx = idealIdx;
    let highestScore = -1;

    for (let i = startRange; i <= endRange; i++) {
      const seg = segments[i];
      let score = 1; // base score

      // Check transition words
      for (const { pattern, weight } of TRANSITION_PATTERNS) {
        if (pattern.test(seg.text)) {
          score += weight;
        }
      }

      // Proximity to ideal center bonus
      const distFromIdeal = Math.abs(i - idealIdx);
      score += Math.max(0, 2 - distFromIdeal / 3);

      if (score > highestScore) {
        highestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx > splitIndices[splitIndices.length - 1]) {
      splitIndices.push(bestIdx);
    }
  }

  // Build KeyMoment items from splits
  const moments: KeyMoment[] = [];

  for (let i = 0; i < splitIndices.length; i++) {
    const startIdx = splitIndices[i];
    const endIdx = i < splitIndices.length - 1 ? splitIndices[i + 1] : segmentCount;
    const cluster = segments.slice(startIdx, endIdx);
    if (cluster.length === 0) continue;

    const firstSeg = cluster[0];
    const lastSeg = cluster[cluster.length - 1];
    const { title, summary, keywords } = generateSectionTitle(
      firstSeg,
      cluster,
      i,
      splitIndices.length
    );

    moments.push({
      id: `moment-${i}-${firstSeg.id}`,
      start: firstSeg.start,
      end: lastSeg.end || lastSeg.start + 3,
      timestamp: firstSeg.timestamp,
      title,
      summary,
      keywords,
      startSegmentId: firstSeg.id,
      confidence: 'high',
    });
  }

  return moments;
}
