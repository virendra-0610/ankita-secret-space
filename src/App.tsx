import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { MusicControl } from './components/MusicControl';

const STORAGE_KEY = 'ankita_heart_record';
const KNOWN_TOKEN = 'ankita-garden-heart-key-v1'; // change if you want a different validation token
const ITERATIONS = 150000; // PBKDF2 iterations — increase for more work factor

// helpers
const encode = (s: string) => new TextEncoder().encode(s);
const decode = (buf: ArrayBuffer) => new TextDecoder().decode(buf);
const b64Encode = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
const b64Decode = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveKey(password: string, salt: Uint8Array, iterations = ITERATIONS) {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return key;
}

async function createRecord(password: string) {
  // AES-GCM: derive key from password, encrypt known token and return record to store
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt, ITERATIONS); // returns AES-GCM CryptoKey
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encode(KNOWN_TOKEN)
  );

  const rec = {
    method: 'gcm',
    salt: b64Encode(salt),
    iv: b64Encode(iv),
    ct: b64Encode(ciphertext),
    iterations: ITERATIONS,
  };
  console.debug('[createRecord:gcm] storing record:', rec);
  return rec;
}

async function validatePassword(password: string) {
  const raw = localStorage.getItem(STORAGE_KEY);
  console.debug('[validatePassword] raw stored value:', raw);
  if (!raw) return false;
  try {
    const rec = JSON.parse(raw);
    console.debug('[validatePassword] parsed record:', rec);

    // Plain test fallback
    if ((rec.method === 'plain' && rec.plain) || rec.plain) {
      const enteredB64 = b64Encode(encode(password));
      console.debug('[validatePassword] enteredB64:', enteredB64, 'stored plain:', rec.plain);
      return enteredB64 === rec.plain;
    }

    // PBKDF2/verifier fallback
    if (rec.verifier && rec.salt) {
      const salt = b64Decode(rec.salt);
      const iterations = rec.iterations || ITERATIONS;

      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const bits = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        keyMaterial,
        256
      );

      const derivedB64 = b64Encode(bits);
      console.debug('[validatePassword] derivedB64:', derivedB64, 'stored verifier:', rec.verifier);
      return derivedB64 === rec.verifier;
    }

    // AES-GCM path
    if (rec.method === 'gcm' && rec.salt && rec.iv && rec.ct) {
      try {
        const salt = b64Decode(rec.salt);
        const iv = b64Decode(rec.iv);
        const ct = b64Decode(rec.ct);
        const key = await deriveKey(password, salt, rec.iterations || ITERATIONS);
        const pt = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          ct
        );
        const plain = decode(pt);
        console.debug('[validatePassword:gcm] decrypted plain:', plain);
        return plain === KNOWN_TOKEN;
      } catch (e) {
        console.debug('[validatePassword:gcm] decrypt failed', e);
        return false;
      }
    }

    console.debug('[validatePassword] no matching validation method found in record');
    return false;
  } catch (e) {
    console.error('validatePassword error', e);
    return false;
  }
}

export default function AnkitaGardenPage() {
  const [zooming, setZooming] = useState(false);
  const [securePage, setSecurePage] = useState(false);
  const [heartKey, setHeartKey] = useState('');
  const [isBlog, setIsBlog] = useState(false);

  // Add music control
  const currentTrack = securePage ? 'heartKey' : isBlog ? 'blog' : 'welcome';
  const audioRef = useBackgroundMusic(currentTrack);

  const handleEnterClick = () => {
    setZooming(true);
    setTimeout(() => {
      setSecurePage(true); // open heart key page (setup or validate)
      setZooming(false);
    }, 500);
  };

  const handleSecureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      // First-time setup: create and save encrypted record
      try {
        const rec = await createRecord(heartKey);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
        setSecurePage(false);
        setIsBlog(true); // navigate to blog on first setup success
        setHeartKey('');
      } catch (err) {
        console.error('Failed to create record', err);
        alert('Something went wrong saving your key.');
      }
      return;
    }

    // Subsequent login: validate entered heart key
    const ok = await validatePassword(heartKey);
    setHeartKey('');
    setSecurePage(false);

    if (ok) {
      // success -> blog page
      setIsBlog(true);
    } else {
      // failure -> welcome (home) page
      setIsBlog(false);
      // optionally show message
      alert('Heart key did not match. Returning to welcome page.');
    }
  };

  // Blog page with fixed audio controls
  if (isBlog) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center">
        <div className="max-w-3xl p-8 bg-white/80 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-mono mb-4">Blog — &ldquo;A Quiet Garden&rdquo;</h1>
          <p className="text-sm text-gray-700 mb-4">
            This is the blog page placeholder. The user has successfully unlocked with the heart key.
          </p>
          
          {/* Music Controls */}
          <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <button
              onClick={() => audioRef.current?.play()}
              className="text-rose-600 hover:text-rose-700"
            >
              ▶️
            </button>
            <button
              onClick={() => audioRef.current?.pause()}
              className="text-rose-600 hover:text-rose-700"
            >
              ⏸️
            </button>
            <span className="text-xs text-rose-600">
              Playing Track {(currentTrack || 0) + 1}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-pink-100 via-blue-100 to-rose-100">
      {/* main content zooms when entering */}
      <motion.main
        className="flex-1 flex flex-col items-center justify-center"
        animate={zooming ? { scale: 1.06, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40"
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Floating petals */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-pink-300 rounded-full opacity-60"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{
              y: ['0%', '110%'],
              x: ['0%', `${Math.random() * 50 - 25}%`],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity }}
          />
        ))}

        {/* Logo and Title with Subtraction Effect */}
        <div className="relative z-20 mb-8 w-full">
          <div className="flex items-center justify-center gap-6">
            <motion.span
              className="text-8xl mix-blend-difference cursor-pointer"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
              }}
            >
              🌸
            </motion.span>
            <h2 className="text-9xl md:text-9xl font-mono text-blue-800 mix-blend-difference backdrop-blur-sm tracking-tighter">
              Pause
            </h2>
          </div>
        </div>

        {/* Message in centered rectangle */}
        <div className="relative w-full z-10 flex justify-center">
          <div className="inline-block bg-blue-100/40 backdrop-blur-sm py-8 px-20 shadow-lg rounded-lg border border-white/30">
            <p className="text-lg md:text-1xl text-blue-800 font-mono tracking-tight max-w-4xl mx-auto text-center leading-relaxed">
              Welcome{' '}
              <motion.span
                className="relative inline-block bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold"
                animate={{
                  textShadow: [
                    '0 0 4px #f10c0cff',
                    '0 0 11px #abc61fff',
                    '0 0 19px #1f2a92ff',
                    '0 0 40px #ff1493',
                    '0 0 80px #ff69b4',
                    '0 0 90px #ff69b4',
                    '0 0 100px #ff1493',
                    '0 0 150px #ff69b4',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                Ankita
              </motion.span>{' '}
              ! <br />
              This is your secret space, for the moments you need to stop running — a quiet corner that remembers your breath. Write when you wish, listen when you need, and know this place was made so you can{' '}
              <motion.span
                className="relative inline-block bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-transparent bg-clip-text font-bold"
                animate={{
                  textShadow: [
                    '0 0 4px #fff',
                    '0 0 11px #fff',
                    '0 0 19px #d51616ff',
                    '0 0 40px #f0f',
                    '0 0 80px #0ff',
                    '0 0 90px #0ff',
                    '0 0 100px rgba(8, 132, 132, 1)',
                    '0 0 150px #0ff',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                pause
              </motion.span>
              . <br />
              — Made with care.
            </p>
          </div>
        </div>

        {/* Enter button (triggers zoom -> secure page) */}
        <div className="w-full flex justify-center">
          <motion.button
            onClick={handleEnterClick}
            whileHover={{ scale: 1.05 }}
            className="mt-10 relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 px-6 py-3 rounded-full font-mono text-lg shadow-md hover:shadow-blue-400/60 transition-all overflow-hidden"
          >
            <span> Dive in </span>
            <span>→</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </div>
      </motion.main>

      {/* Secure page shown after zoom */}
      {securePage && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-rose-100/95 via-pink-100/95 to-rose-200/95 backdrop-blur-md overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {/* Floating hearts background */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-50"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: `rgba(${90 + Math.random() * 65}, ${100 + Math.random() * 50}, ${150 + Math.random() * 50}, 0.4)`,
              }}
              animate={{
                y: ['0%', '100%'],
                x: ['0%', `${Math.random() * 70 - 25}%`],
                rotate: [0, 360],
                scale: [1.5, 1.7, 1.5],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              ♥
            </motion.div>
          ))}

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-[80vw] max-w-[1200px] mx-auto shadow-xl text-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h3 className="text-sm font-mono text-center mb-4 leading-relaxed text-rose-900">
              Whisper the single word only your heart would know — this seed will fold your words into silence and keep them safe. This key will be a lock that keeps this garden closed. It will be yours to open, only when you wish.
            </h3>
            <form onSubmit={handleSecureSubmit} className="flex flex-col gap-4">
              <div className="relative mx-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-900">
                  ♥
                </span>
                <input
                  aria-label="heart key"
                  type="password"
                  value={heartKey}
                  onChange={(e) => setHeartKey(e.target.value)}
                  placeholder="Enter heart key"
                  className="px-12 py-3 rounded-xl text-center font-mono w-72 
                    bg-white/30 backdrop-blur-sm shadow-lg
                    focus:ring-2 focus:ring-rose-300/50
                    focus:outline-none transition-all duration-300
                    placeholder:text-rose-300"
                />
              </div>
              <div className="flex items-center justify-center">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-flex items-center gap-3 bg-gradient-to-r from-rose-200 to-pink-300 
                    text-rose-900 px-6 py-3 rounded-full font-mono text-sm shadow-md 
                    hover:shadow-rose-400/60 transition-all overflow-hidden"
                >
                  <span>Access your secrets</span>
                  <span className="text-rose-700">♥</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      <MusicControl audioRef={audioRef} currentTrack={currentTrack} />
    </div>
  );
}

// appended helper you can call from console to clear stored record during testing
// (open DevTools console and run: localStorage.removeItem('ankita_heart_record'))