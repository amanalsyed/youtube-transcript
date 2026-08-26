import axios from 'axios';
import he from 'he';
import { GoogleGenAI } from '@google/genai';
import type {
  TranscriptSegment,
  TargetTranslationLanguage,
  TranslatedTranscriptData,
  TranslationResponse,
} from '../src/types';
import { ALL_TRANSLATION_LANGUAGES } from '../src/data/translationLanguages';

export const POPULAR_TRANSLATION_LANGUAGES: TargetTranslationLanguage[] = ALL_TRANSLATION_LANGUAGES;

// In-Memory Translation Cache (2-hour TTL)
interface TranslationCacheEntry {
  data: TranslatedTranscriptData;
  expiresAt: number;
}
const translationMemoryCache = new Map<string, TranslationCacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_CACHE_ENTRIES = 500;

function getCachedTranslation(key: string): TranslatedTranscriptData | null {
  const entry = translationMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    translationMemoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedTranslation(key: string, data: TranslatedTranscriptData) {
  if (translationMemoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = translationMemoryCache.keys().next().value;
    if (oldestKey) translationMemoryCache.delete(oldestKey);
  }
  translationMemoryCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

/**
 * Fast Single-batch Gemini translation using JSON schema
 */
async function translateChunkWithGemini(
  texts: string[],
  targetLangName: string,
  targetLangCode: string
): Promise<string[] | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `You are a high-speed video subtitle translator. Translate these subtitle segments into ${targetLangName} (ISO: ${targetLangCode}).
Rules:
1. Return array of exactly ${texts.length} translated strings in identical order.
2. Keep natural spoken subtitle flow and preserve idioms.
3. Respond ONLY with valid JSON: {"translations": ["...", "..."]}

Input:
${JSON.stringify(texts)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const outputText = response.text?.trim();
    if (!outputText) return null;

    const parsed = JSON.parse(outputText);
    if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) {
      return parsed.translations.map((t: unknown, i: number) =>
        typeof t === 'string' && t.trim() ? t.trim() : texts[i]
      );
    }
  } catch (err) {
    console.warn('[Gemini Translator] Chunk error:', err);
  }
  return null;
}

/**
 * Translate texts in parallel batches with Gemini 2.5 Flash
 */
async function translateAllWithGeminiParallel(
  texts: string[],
  targetLangName: string,
  targetLangCode: string
): Promise<string[] | null> {
  const CHUNK_SIZE = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    chunks.push(texts.slice(i, i + CHUNK_SIZE));
  }

  try {
    // Run all chunks concurrently with Promise.all
    const chunkPromises = chunks.map((chunk) =>
      translateChunkWithGemini(chunk, targetLangName, targetLangCode)
    );

    const chunkResults = await Promise.all(chunkPromises);

    // If any chunk failed, return null to allow fast fallback
    for (const res of chunkResults) {
      if (!res) return null;
    }

    const combined: string[] = [];
    for (const res of chunkResults) {
      if (res) combined.push(...res);
    }

    if (combined.length === texts.length) {
      return combined;
    }
  } catch (err) {
    console.warn('[Gemini Parallel] Parallel execution error:', err);
  }
  return null;
}

/**
 * Fast Google Translate GTX query
 */
async function translateTextGtx(text: string, targetLangCode: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const params = new URLSearchParams();
  params.append('client', 'gtx');
  params.append('sl', 'auto');
  params.append('tl', targetLangCode);
  params.append('dt', 't');
  params.append('q', text);

  const response = await axios.post(
    'https://translate.googleapis.com/translate_a/single',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 8000,
    }
  );

  const data = response.data;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const parts = data[0]
      .filter((item: unknown) => Array.isArray(item) && typeof item[0] === 'string')
      .map((item: unknown[]) => item[0] as string);
    const result = parts.join('');
    if (result) {
      return he.decode(result.trim());
    }
  }

  throw new Error(`GTX parsing failed for ${targetLangCode}`);
}

/**
 * Fast GTX batch translation with numeric indexing and parallel execution
 */
async function translateSegmentBatchGtx(texts: string[], targetLangCode: string): Promise<string[]> {
  const taggedText = texts.map((t, idx) => `<<<${idx}>>> ${t}`).join('\n\n');

  try {
    const translatedBlob = await translateTextGtx(taggedText, targetLangCode);
    const extracted: (string | null)[] = new Array(texts.length).fill(null);
    const regex = /(?:<{1,3}|«{1,2}|\[{1,3})\s*(\d+)\s*(?:>{1,3}|»{1,2}|\]{1,3})\s*([^<«\[]*)/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(translatedBlob)) !== null) {
      const idx = parseInt(match[1], 10);
      const text = match[2]?.trim();
      if (idx >= 0 && idx < texts.length && text) {
        extracted[idx] = text;
      }
    }

    const matchedCount = extracted.filter(Boolean).length;
    if (matchedCount >= texts.length * 0.8) {
      return extracted.map((res, i) => res || texts[i]);
    }
  } catch (err) {
    console.warn('[GTX Batch] Tag parser fallback needed:', err);
  }

  // Fast concurrent fallback: parallel chunks of 15 items
  const results: string[] = [];
  const chunkSize = 15;
  for (let i = 0; i < texts.length; i += chunkSize) {
    const slice = texts.slice(i, i + chunkSize);
    const sliceResults = await Promise.all(
      slice.map((txt) =>
        translateTextGtx(txt, targetLangCode).catch(() => txt)
      )
    );
    results.push(...sliceResults);
  }

  return results;
}

/**
 * Ultra-fast parallel GTX runner across full transcript
 */
async function translateAllWithGtxParallel(
  texts: string[],
  targetLangCode: string
): Promise<string[]> {
  const BATCH_SIZE = 35;
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    batches.push(texts.slice(i, i + BATCH_SIZE));
  }

  // Run batches in parallel (concurrency up to 6 simultaneous batch requests)
  const results: string[] = [];
  const CONCURRENT_BATCHES = 6;

  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const batchSlice = batches.slice(i, i + CONCURRENT_BATCHES);
    const batchOutputs = await Promise.all(
      batchSlice.map((batch) => translateSegmentBatchGtx(batch, targetLangCode))
    );
    for (const out of batchOutputs) {
      results.push(...out);
    }
  }

  return results;
}

/**
 * Main translation handler for entire transcript segments
 */
export async function translateTranscriptSegments(
  segments: TranscriptSegment[],
  targetLangCode: string,
  videoId?: string
): Promise<TranslationResponse> {
  if (!segments || segments.length === 0) {
    return {
      success: false,
      error: 'No transcript segments to translate.',
    };
  }

  const targetLang =
    POPULAR_TRANSLATION_LANGUAGES.find(
      (l) => l.code.toLowerCase() === targetLangCode.toLowerCase()
    ) || {
      code: targetLangCode,
      name: targetLangCode.toUpperCase(),
      nativeName: targetLangCode.toUpperCase(),
      flag: '🌐',
    };

  const cacheKey = `${videoId || 'raw'}:${targetLang.code}`;
  const cached = getCachedTranslation(cacheKey);
  if (cached) {
    return {
      success: true,
      targetLanguage: cached.targetLanguage,
      segments: cached.segments,
      fullText: cached.fullText,
      wordCount: cached.wordCount,
    };
  }

  try {
    const texts = segments.map((s) => s.text);
    let translatedTexts: string[] = [];

    // Attempt 1: Gemini 2.5 Flash in parallel batches (fastest & most natural)
    const geminiParallelResults = await translateAllWithGeminiParallel(
      texts,
      targetLang.name,
      targetLang.code
    );

    if (geminiParallelResults && geminiParallelResults.length === texts.length) {
      translatedTexts = geminiParallelResults;
    } else {
      // Attempt 2: Ultra-fast parallel GTX batching
      translatedTexts = await translateAllWithGtxParallel(texts, targetLang.code);
    }

    // Quick verification: check that translation happened
    const isTargetEnglish = targetLang.code === 'en';
    if (!isTargetEnglish && texts.length > 2) {
      let identicalCount = 0;
      for (let i = 0; i < texts.length; i++) {
        if (texts[i].trim().toLowerCase() === (translatedTexts[i] || '').trim().toLowerCase()) {
          identicalCount++;
        }
      }

      // If high identical count found, run fast parallel direct recovery
      if (identicalCount / texts.length > 0.8) {
        console.warn(`[Speed Translator] Similarity detected for ${targetLang.name}. Running fast parallel recovery...`);
        const recoveryChunks: string[] = [];
        const CONCURRENT_RECOVERY = 15;
        for (let i = 0; i < texts.length; i += CONCURRENT_RECOVERY) {
          const slice = texts.slice(i, i + CONCURRENT_RECOVERY);
          const recovered = await Promise.all(
            slice.map((t) => translateTextGtx(t, targetLang.code).catch(() => t))
          );
          recoveryChunks.push(...recovered);
        }
        translatedTexts = recoveryChunks;
      }
    }

    const translatedSegments: TranscriptSegment[] = segments.map((seg, idx) => {
      const translatedText = (translatedTexts[idx] || seg.text).trim();
      return {
        ...seg,
        text: translatedText,
      };
    });

    const fullText = translatedSegments.map((s) => s.text).join(' ');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    const resultData: TranslatedTranscriptData = {
      targetLanguage: targetLang,
      segments: translatedSegments,
      fullText,
      wordCount,
    };

    setCachedTranslation(cacheKey, resultData);

    return {
      success: true,
      targetLanguage: targetLang,
      segments: translatedSegments,
      fullText,
      wordCount,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Translation error';
    return {
      success: false,
      error: `Failed to translate transcript into ${targetLang.name}: ${msg}. Please try again.`,
    };
  }
}
