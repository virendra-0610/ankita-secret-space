/*
  Secure local store using PBKDF2 + AES-GCM.
  - STORAGE_KEY holds encrypted JSON of all notes keyed by YYYY-MM-DD.
  - KNOWN_TOKEN is used as passphrase (matches App.tsx token).
  - ITERATIONS matches work factor used elsewhere.
*/
const STORAGE_KEY = 'ankita_heart_record';
const KNOWN_TOKEN = 'ankita-garden-heart-key-v1';
const ITERATIONS = 150000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function randBytes(len = 12) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}

async function encryptObject(obj: any) {
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKey(KNOWN_TOKEN, salt);
  const plain = encoder.encode(JSON.stringify(obj));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  const payload = {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(data))
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function decryptObject(): Promise<any | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    const salt = new Uint8Array(payload.salt);
    const iv = new Uint8Array(payload.iv);
    const data = new Uint8Array(payload.data).buffer;
    const key = await deriveKey(KNOWN_TOKEN, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(decoder.decode(decrypted));
  } catch (e) {
    console.warn('decrypt failed', e);
    return null;
  }
}

/* Public API: get notes map, save note for date */
export async function loadAllNotes(): Promise<Record<string, Array<{ id: string; text: string; createdAt: string }>>> {
  const obj = await decryptObject();
  return obj && typeof obj === 'object' ? obj : {};
}

export async function saveNoteForDate(isoDate: string, text: string) {
  const notes = await loadAllNotes();
  const arr = notes[isoDate] || [];
  arr.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, text, createdAt: new Date().toISOString() });
  notes[isoDate] = arr;
  await encryptObject(notes);
  return notes[isoDate];
}

export async function deleteNote(isoDate: string, id: string) {
  const notes = await loadAllNotes();
  const arr = (notes[isoDate] || []).filter(n => n.id !== id);
  notes[isoDate] = arr;
  await encryptObject(notes);
  return arr;
}