import React, { useEffect, useRef, useState, useMemo } from 'react';

import Calendar from 'react-calendar';  // Add this import
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import 'react-calendar/dist/Calendar.css';
import '../styles/blog.css';
import '../styles/modal.css';
import '../styles/page-layout.css';
import { MusicPanel } from './MusicPanel';
import { loadAllNotes, saveNoteForDate, deleteNote } from '../utils/secureStore';

// Unique background images from public folder
const SLIDES = Array.from(new Set([
  '/images/backgrounds/bg1.jpg',
  '/images/backgrounds/bg2.jpg',
  '/images/backgrounds/bg3.jpg',
  '/images/backgrounds/bg4.jpg'
]));

// Calendar Value types
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BlogPageProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
  onTrackChange?: (track: 'welcome' | 'heartKey' | 'blog') => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ audioRef, currentTrack, onTrackChange }) => {
  const [date, setDate] = useState<Value>(new Date());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notesList, setNotesList] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [draft, setDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  // Removed stars array as it's no longer needed

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      const all = await loadAllNotes();
      setNotesList(all[selectedDate] || []);
    })();
  }, [selectedDate]);

  const handleDateChange = (v: Value) => setDate(v);

  // Update the onClickDay handler to ensure modal opens + fireworks
  const onClickDay = async (d: Date) => {
    const iso = d.toISOString().slice(0, 10);
    setSelectedDate(iso);
    setDraft('');
    const notes = await loadAllNotes();
    setNotesList(notes[iso] || []);
    setIsModalOpen(true);

    // trigger small fireworks at last pointer position (fallback to center)
    const container = pageRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };
      const p = lastPointer.current || center;
      const id = Date.now();
      setFireworks(prev => [...prev, { id, x: p.x, y: p.y }]);
      setTimeout(() => setFireworks(prev => prev.filter(f => f.id !== id)), 1200);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !draft.trim()) return;
    await saveNoteForDate(selectedDate, draft.trim());
    setDraft('');
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleDelete = async (id: string) => {
    if (!selectedDate) return;
    const arr = await deleteNote(selectedDate, id);
    setNotesList(arr);
  };

  return (
    <motion.div ref={pageRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-screen w-screen overflow-hidden" onMouseDown={(e) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      lastPointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }}>
      {/* Global slideshow background */}
      <div className="fixed inset-0 w-full h-full -z-20">
        {SLIDES.map((src, i) => (
          <motion.div
            key={src}
            className="calendar-slide fixed inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              willChange: 'opacity, transform',
              filter: 'brightness(1.1) contrast(1.1)',
              objectFit: 'cover',
              width: '100vw',
              height: '100vh'
            }}
            animate={{ 
              opacity: i === slideIndex ? 1 : 0, 
              scale: i === slideIndex ? 1.05 : 1 
            }}
            transition={{ 
              opacity: { duration: 3, ease: [0.4, 0, 0.2, 1] }, 
              scale: { duration: 10, ease: 'easeInOut' } 
            }}
          />
        ))}
      </div>

      {/* Pause text with animation */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
        <motion.span
          className="text-3xl mix-blend-difference cursor-pointer"
          animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }}
          aria-hidden
        >
          🌸
        </motion.span>
        <motion.h2 
          className="text-5xl font-mono text-blue-100 mix-blend-difference tracking-widest font-light"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}
        >
          Pause
        </motion.h2>
      </div>

      {/* Main content area */}
      <div className="relative z-10 h-full w-full pt-24">
        <div className="main-columns flex-1 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 w-full md:w-auto ml-auto">
              <MusicPanel audioRef={audioRef} />
            </div>

            {/* Right side - Calendar */}
            <div className="calendar-section w-full md:w-[400px] relative rounded-3xl overflow-hidden p-4 bg-white/30 backdrop-blur-md border border-white/20 shadow-2xl">
              <Calendar
                onChange={handleDateChange}
                value={date}
                minDate={new Date(1994, 9, 31)}
                maxDate={new Date(2095, 9, 31)}
                className="blog-calendar"
                onClickDay={onClickDay}
                formatShortWeekday={(locale, date) => 
                  ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fireworks Layer */}
      <div className="fireworks-layer pointer-events-none">
        {fireworks.map(f => (
          <div key={f.id} className="firework" style={{ left: f.x, top: f.y }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} style={{ ['--n' as any]: i }} />
            ))}
          </div>
        ))}
      </div>

      <>
        {isModalOpen && ReactDOM.createPortal(
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50"
              onClick={() => setIsModalOpen(false)}
              style={{ width: '100vw', height: '100vh' }}
            />

            {/* Modal with sparkling letters background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[600px] max-w-[92vw] bg-white/95 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                margin: '0 auto',
                position: 'fixed',
                inset: 'auto'
              }}
            >
              <div className="modal-sparkles" aria-hidden>✨✨✨✨✨✨✨✨✨✨</div>
              <div className="modal-content p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="modal-header">
                    <h3 className="text-2xl font-semibold text-rose-800">
                      Memories — {selectedDate}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Write a memory for this day. Entries are stored securely.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 max-h-36 overflow-auto space-y-3 custom-scrollbar">
                  {notesList.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">
                      No previous memories for this day.
                    </p>
                  ) : (
                    notesList.map(n => (
                      <div key={n.id} className="p-3 bg-white/80 rounded-xl border border-rose-100">
                        <div className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-1 text-sm text-rose-800">{n.text}</div>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="text-xs text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Type a small memory — what you felt, a scent, a sound..."
                    className="memory-input-invite resize-none"
                  />
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Save Memory
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>,
          document.body
        )}
      </>
    </motion.div>
  );
};