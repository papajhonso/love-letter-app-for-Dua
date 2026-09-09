import fs from 'fs';
import path from 'path';
import { CreateLetterPayload, Letter } from '@/types/letter';

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
    console.error('Error reading letters data:', error);
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
    console.error('Error writing letters data:', error);
  }
}

export function generateCuteSlug(existingLetters: Letter[]): string {
  const existingSlugs = new Set(existingLetters.map((l) => l.slug.toLowerCase()));
  for (let attempt = 0; attempt < 50; attempt++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90 + 10); // 10 to 99
    const slug = `${adj}-${noun}-${num}`;
    if (!existingSlugs.has(slug)) {
      return slug;
    }
  }
  // Fallback unique slug
  return `letter-${Date.now().toString(36)}`;
}

export async function saveLetter(payload: CreateLetterPayload): Promise<Letter> {
  const letters = readLettersFromFile();
  const slug = generateCuteSlug(letters);
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

  letters.unshift(newLetter);
  writeLettersToFile(letters);
  return newLetter;
}

export async function getLetterBySlug(slug: string): Promise<Letter | null> {
  const letters = readLettersFromFile();
  const found = letters.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function markLetterOpened(slug: string): Promise<boolean> {
  const letters = readLettersFromFile();
  const index = letters.findIndex((l) => l.slug.toLowerCase() === slug.toLowerCase());
  if (index === -1) return false;

  if (!letters[index].openedAt) {
    letters[index].openedAt = new Date().toISOString();
    writeLettersToFile(letters);
  }
  return true;
}
