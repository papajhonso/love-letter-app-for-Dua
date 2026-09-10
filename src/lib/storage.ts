import fs from 'fs';
import path from 'path';
import { CreateLetterPayload, Letter } from '@/types/letter';
import { Redis } from '@upstash/redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'letters.json');

const ADJECTIVES = [
  'sweet',
  'tender',
  'gentle',
  'golden',
  'velvet',
  'starlit',
  'radiant',
  'cherished',
  'blooming',
  'whispering',
  'endless',
  'darling',
  'moonlit',
  'blushing',
  'eternal',
  'warm',
];

const NOUNS = [
  'heart',
  'rose',
  'whisper',
  'star',
  'dove',
  'sunflower',
  'melody',
  'butterfly',
  'serenade',
  'spark',
  'poem',
  'honeybee',
  'embrace',
  'sunset',
  'promise',
  'petal',
];

// Helper to get Redis client if configured (Vercel KV or Upstash Redis)
function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readLettersFromFile(): Letter[] {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as Letter[];
  } catch (error) {
    console.error('Error reading letters data from local file:', error);
    return [];
  }
}

function writeLettersToFile(letters: Letter[]): void {
  try {
    ensureDataDir();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(letters, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error('Error writing letters data to local file:', error);
  }
}

export async function generateUniqueSlug(redis: Redis | null): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    const slug = `${adj}-${noun}-${num}`;

    if (redis) {
      const exists = await redis.exists(`letter:${slug.toLowerCase()}`);
      if (!exists) return slug;
    } else {
      const letters = readLettersFromFile();
      const exists = letters.some((l) => l.slug.toLowerCase() === slug.toLowerCase());
      if (!exists) return slug;
    }
  }
  return `letter-${Date.now().toString(36)}`;
}

export async function saveLetter(payload: CreateLetterPayload): Promise<Letter> {
  const redis = getRedisClient();
  const slug = await generateUniqueSlug(redis);
  const now = new Date().toISOString();

  const newLetter: Letter = {
    id: `letter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    slug,
    recipientName: payload.recipientName.trim(),
    senderName: payload.senderName.trim(),
    body: payload.body.trim(),
    fontChoice: payload.fontChoice,
    paperStyle: payload.paperStyle,
    photoUrl: payload.photoUrl,
    photoCaption: payload.photoCaption?.trim(),
    stickers: payload.stickers || ['wax-seal'],
    sealColor: payload.sealColor || 'crimson',
    sendMethod: payload.sendMethod,
    recipientEmail: payload.recipientEmail?.trim(),
    createdAt: now,
  };

  if (redis) {
    try {
      // Store in Upstash Redis / Vercel KV
      await redis.set(`letter:${slug.toLowerCase()}`, newLetter);
      await redis.sadd('letters:all', slug.toLowerCase());
      return newLetter;
    } catch (err) {
      console.error('Redis save failed, falling back to local file:', err);
    }
  }

  // Local file fallback
  const letters = readLettersFromFile();
  letters.unshift(newLetter);
  writeLettersToFile(letters);
  return newLetter;
}

export async function getLetterBySlug(slug: string): Promise<Letter | null> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const found = await redis.get<Letter>(`letter:${slug.toLowerCase()}`);
      if (found) return found;
    } catch (err) {
      console.error('Redis get failed, falling back to local file:', err);
    }
  }

  // Local file fallback
  const letters = readLettersFromFile();
  const found = letters.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function markLetterOpened(slug: string): Promise<boolean> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const letter = await redis.get<Letter>(`letter:${slug.toLowerCase()}`);
      if (letter && !letter.openedAt) {
        letter.openedAt = new Date().toISOString();
        await redis.set(`letter:${slug.toLowerCase()}`, letter);
      }
      return true;
    } catch (err) {
      console.error('Redis markOpened failed, falling back to local file:', err);
    }
  }

  // Local file fallback
  const letters = readLettersFromFile();
  const index = letters.findIndex((l) => l.slug.toLowerCase() === slug.toLowerCase());
  if (index === -1) return false;

  if (!letters[index].openedAt) {
    letters[index].openedAt = new Date().toISOString();
    writeLettersToFile(letters);
  }
  return true;
}
