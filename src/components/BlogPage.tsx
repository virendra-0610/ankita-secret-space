import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';
import '../styles/blog.css';
import { MusicPanel } from './MusicPanel';
import { loadAllNotes, saveNoteForDate, deleteNote } from '../utils/secureStore';

// slideshow image list (public folder)
const SLIDES = [
  '/images/backgrounds/bg1.jpg',
  '/images/backgrounds/bg2.jpg',
  '/images/backgrounds/bg3.jpg',
  '/images/backgrounds/bg4.jpg',
  '/images/backgrounds/bg5.jpg',
];

// Define Value type for react-calendar
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BlogPageProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
}

export const BlogPage: React.FC<BlogPageProps> = ({ audioRef, currentTrack }) => {
  const [date, setDate] = useState<Value>(new Date());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [notesList, setNotesList] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      (async () => {
        const all = await loadAllNotes();
        setNotesList(all[selectedDate] || []);
      })();
    }
  }, [selectedDate]);

  const handleDateChange = (
    value: Value,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setDate(value);
  };

  const onClickDay = (d: Date) => {
    const iso = d.toISOString().slice(0,10);
    setSelectedDate(iso);
    setDraft('');
  };

  const handleSave = async () => {
    if (!selectedDate || !draft.trim()) return;
    const arr = await saveNoteForDate(selectedDate, draft.trim());
    setNotesList(arr);
    setDraft('');
  };

  const handleDelete = async (id: string) => {
    if (!selectedDate) return;
    const arr = await deleteNote(selectedDate, id);
    setNotesList(arr);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-screen w-screen overflow-hidden">
      {/* slideshow fullscreen blurred background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {SLIDES.map((src, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 bg-center bg-cover blur-md"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === slideIndex ? 0.55 : 0,
              transform: i === slideIndex ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 1s ease, transform 6s ease'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full w-full bg-gradient-to-br from-pink-50/70 via-rose-50/50 to-white/70">
        <div className="flex-1 p-6 flex flex-col">
          {/* header with left-rotating flower and typewriter Pause centered */}
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-4 flex items-center gap-4 text-3xl text-rose-800">
            <motion.span initial={{ rotate: 0 }} animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="inline-block text-2xl">❀</motion.span>
            <span className="font-mono tracking-widest">Project</span>
            <span style={{ fontFamily: 'Courier, monospace', letterSpacing: '0.08em' }} className="ml-2">Pause</span>
          </motion.h1>

          {/* calendar + notes layout */}
          <div className="flex gap-6 h-full">
            {/* Calendar column */}
            <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  minDate={new Date(1994, 9, 31)}
                  maxDate={new Date(2095, 9, 31)}
                  className="blog-calendar"
                  onClickDay={onClickDay}
                />
              </div>
            </div>

            {/* Notes column: shows when a date selected */}
            <div className="w-96 bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col">
              {selectedDate ? (
                <>
                  <div className="mb-3 text-sm text-rose-700 font-medium">Notes for {selectedDate}</div>

                  <div className="flex-1 overflow-auto mb-3 space-y-3">
                    {notesList.length === 0 && <div className="text-sm text-gray-600">No entries yet.</div>}
                    {notesList.map(n => (
                      <div key={n.id} className="p-3 bg-white/60 rounded-md shadow-sm flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                          <div className="text-sm text-rose-800">{n.text}</div>
                        </div>
                        <button onClick={() => handleDelete(n.id)} className="ml-3 text-xs text-red-600">Delete</button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/30">
                    <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write memory..." className="w-full h-24 p-2 rounded-md text-sm" />
                    <div className="mt-2 flex gap-2">
                      <button onClick={handleSave} className="px-3 py-2 rounded bg-rose-500 text-white">Save</button>
                      <button onClick={() => { setDraft(''); }} className="px-3 py-2 rounded border">Clear</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                  <div className="mb-2">Select a date on the calendar</div>
                  <div className="text-xs">You can add multiple memories per day — saved securely.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* centered music box column (10% smaller) */}
        <div className="w-[18%] flex items-center justify-center p-6"> 
          <MusicPanel audioRef={audioRef} currentTrack={currentTrack} />
        </div>
      </div>
    </motion.div>
  );
};