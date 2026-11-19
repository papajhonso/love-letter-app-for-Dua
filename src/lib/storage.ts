import fs from 'fs';
import path from 'path';
import { CreateLetterPayload, Letter } from '@/types/letter';
import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient } from 'redis';

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

// Node-Redis singleton — used when REDIS_URL is set (Vercel Redis marketplace integration).
// Includes a 5-second connect timeout so it never hangs serverless functions.
let nodeRedisClient: ReturnType<typeof createClient> | null = null;
let nodeRedisConnecting: Promise<ReturnType<typeof createClient> | null> | null = null;

async function getNodeRedis() {
  const url =
    process.env.REDIS_URL ||
    process.env.I_LOVE_DUA_REDIS_URL ||
    process.env.KV_URL ||
    process.env.STORAGE_REDIS_URL;

  if (!url) return null;
  if (nodeRedisClient && nodeRedisClient.isOpen) return nodeRedisClient;

  if (!nodeRedisConnecting) {
    nodeRedisConnecting = (async () => {
      try {
        const client = createClient({ url });
        client.on('error', (err) => console.error('Redis Client Error:', err));
        await Promise.race([
          client.connect(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Redis connect timeout')), 5000)
          ),
        ]);
        nodeRedisClient = client as ReturnType<typeof createClient>;
        return nodeRedisClient;
      } catch (e) {
        console.error('Failed to connect to node-redis:', e);
        nodeRedisConnecting = null;
        return null;
      }
    })();
  }
  return nodeRedisConnecting;
}

// Upstash REST client — used when KV_REST_API_URL + KV_REST_API_TOKEN are set.
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
  const nodeRedis = await getNodeRedis();
  const upstash = getUpstashClient();

  for (let attempt = 0; attempt < 50; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    const slug = `${adj}-${noun}-${num}`;
    const key = `letter:${slug.toLowerCase()}`;

    if (nodeRedis) {
      const exists = await nodeRedis.exists(key);
      if (!exists) return slug;
    } else if (upstash) {
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

  // 1. Try Node Redis (REDIS_URL from Vercel marketplace integration)
  const nodeRedis = await getNodeRedis();
  if (nodeRedis) {
    try {
      await nodeRedis.set(key, JSON.stringify(newLetter));
      await nodeRedis.sAdd('letters:all', slug.toLowerCase());
      return newLetter;
    } catch (err) {
      console.error('Node Redis save failed:', err);
    }
  }

  // 2. Try Upstash HTTP REST (KV_REST_API_URL + KV_REST_API_TOKEN)
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

  // 3. Fallback to local file (dev only — ephemeral on Vercel)
  const letters = readLettersFromFile();
  letters.unshift(newLetter);
  writeLettersToFile(letters);
  return newLetter;
}

export async function getLetterBySlug(slug: string): Promise<Letter | null> {
  const key = `letter:${slug.toLowerCase()}`;

  // 1. Try Node Redis
  const nodeRedis = await getNodeRedis();
  if (nodeRedis) {
    try {
      const data = await nodeRedis.get(key);
      if (data) return JSON.parse(data) as Letter;
      return null;
    } catch (err) {
      console.error('Node Redis get failed:', err);
    }
  }

  // 2. Try Upstash HTTP REST
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

  // 3. Fallback to local file (dev only)
  const letters = readLettersFromFile();
  const found = letters.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function markLetterOpened(slug: string): Promise<boolean> {
  const key = `letter:${slug.toLowerCase()}`;

  // 1. Try Node Redis
  const nodeRedis = await getNodeRedis();
  if (nodeRedis) {
    try {
      const data = await nodeRedis.get(key);
      if (data) {
        const letter = JSON.parse(data) as Letter;
        if (!letter.openedAt) {
          letter.openedAt = new Date().toISOString();
          await nodeRedis.set(key, JSON.stringify(letter));
        }
      }
      return true;
    } catch (err) {
      console.error('Node Redis markOpened failed:', err);
    }
  }

  // 2. Try Upstash HTTP REST
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

  // 3. Fallback to local file (dev only)
  const letters = readLettersFromFile();
  const index = letters.findIndex((l) => l.slug.toLowerCase() === slug.toLowerCase());
  if (index === -1) return false;
  if (!letters[index].openedAt) {
    letters[index].openedAt = new Date().toISOString();
    writeLettersToFile(letters);
  }
  return true;
}
