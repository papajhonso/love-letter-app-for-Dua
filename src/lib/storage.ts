import fs from 'fs';
import path from 'path';
import { CreateLetterPayload, Letter } from '@/types/letter';
import { Redis as UpstashRedis } from '@upstash/redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'letters.json');

const ADJECTIVES = [
  'sweet', 'tender', 'gentle', 'golden', 'velvet', 'starlit', 'radiant',
  'cherished', 'blooming', 'whispering', 'endless', 'darling', 'moonlit',
  'blushing', 'eternal', 'warm',
];

const NOUNS = [
  'heart', 'rose', 'whisper', 'star', 'dove', 'sunflower', 'melody',
  'butterfly', 'serenade', 'spark', 'poem', 'honeybee', 'embrace', 'sunset',
  'promise', 'petal',
];

// ✅ Upstash REST client only — stateless HTTP, perfect for Vercel serverless.
// Removed node-redis (TCP) entirely: it hangs indefinitely in serverless environments.
function getUpstashClient(): UpstashRedis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new UpstashRedis({ url, token });
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

export async function generateUniqueSlug(): Promise<string> {
  const upstash = getUpstashClient();

  for (let attempt = 0; attempt < 50; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    const slug = `${adj}-${noun}-${num}`;
    const key = `letter:${slug.toLowerCase()}`;

    if (upstash) {
      const exists = await upstash.exists(key);
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
  const slug = await generateUniqueSlug();
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

  const key = `letter:${slug.toLowerCase()}`;

  // 1. Try Upstash HTTP REST
  const upstash = getUpstashClient();
  if (upstash) {
    try {
      await upstash.set(key, newLetter);
      await upstash.sadd('letters:all', slug.toLowerCase());
      return newLetter;
    } catch (err) {
      console.error('Upstash save failed:', err);
    }
  }

  // 2. Fallback to local file (dev only)
  const letters = readLettersFromFile();
  letters.unshift(newLetter);
  writeLettersToFile(letters);
  return newLetter;
}

export async function getLetterBySlug(slug: string): Promise<Letter | null> {
  const key = `letter:${slug.toLowerCase()}`;

  // 1. Try Upstash HTTP REST
  const upstash = getUpstashClient();
  if (upstash) {
    try {
      const found = await upstash.get<Letter>(key);
      if (found) return found;
      return null;
    } catch (err) {
      console.error('Upstash get failed:', err);
    }
  }

  // 2. Fallback to local file (dev only)
  const letters = readLettersFromFile();
  const found = letters.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function markLetterOpened(slug: string): Promise<boolean> {
  const key = `letter:${slug.toLowerCase()}`;

  // 1. Try Upstash HTTP REST
  const upstash = getUpstashClient();
  if (upstash) {
    try {
      const letter = await upstash.get<Letter>(key);
      if (letter && !letter.openedAt) {
        letter.openedAt = new Date().toISOString();
        await upstash.set(key, letter);
      }
      return true;
    } catch (err) {
      console.error('Upstash markOpened failed:', err);
    }
  }

  // 2. Fallback to local file (dev only)
  const letters = readLettersFromFile();
  const index = letters.findIndex((l) => l.slug.toLowerCase() === slug.toLowerCase());
  if (index === -1) return false;

  if (!letters[index].openedAt) {
    letters[index].openedAt = new Date().toISOString();
    writeLettersToFile(letters);
  }
  return true;
}
