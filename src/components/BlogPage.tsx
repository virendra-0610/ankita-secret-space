import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';
import '../styles/blog.css';
import { MusicPanel } from './MusicPanel';

// Temporary background colors until images are added
const BACKGROUND_COLORS = [
  'from-rose-200 to-pink-200',
  'from-blue-200 to-purple-200',
  'from-green-200 to-emerald-200',
  'from-amber-200 to-yellow-200',
  'from-violet-200 to-indigo-200'
];

const bgPositions = BACKGROUND_COLORS.map(() => ({
  top: Math.random() * 70 + 15,
  left: Math.random() * 70 + 15,
  rotate: Math.random() * 360,
}));

interface BlogPageProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });

export const BlogPage: React.FC<BlogPageProps> = ({ audioRef, currentTrack }) => {
  const [date, setDate] = useState<Value>(new Date());

  const handleDateChange = (
    value: Value,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setDate(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-screen w-screen overflow-hidden"
    >
      {/* Gradient Backgrounds instead of images */}
      {BACKGROUND_COLORS.map((gradient, i) => (
        <motion.div
          key={i}
          className={`absolute blur-md bg-gradient-to-br ${gradient}`}
          style={{
            width: '350px',
            height: '350px',
            top: `${bgPositions[i].top}%`,
            left: `${bgPositions[i].left}%`,
            transform: `rotate(${bgPositions[i].rotate}deg)`,
            opacity: 0.15,
            borderRadius: '40%',
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [
              `${bgPositions[i].rotate}deg`, 
              `${bgPositions[i].rotate + 20}deg`,
              `${bgPositions[i].rotate}deg`
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex h-full w-full bg-gradient-to-br from-pink-50/95 via-rose-50/95 to-white/95">
        {/* Calendar Section */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            <h1 className="text-3xl text-rose-800 mb-6">A Quiet Garden</h1>
            
            <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <Calendar
                onChange={handleDateChange}
                value={date}
                minDate={new Date(1994, 9, 31)}
                maxDate={new Date(2095, 9, 31)}
                className="blog-calendar"
                formatMonthYear={(locale, date) => {
                  return `${monthFormatter.format(date)} ${date.getFullYear()}`;
                }}
              />
            </div>
          </div>
        </div>

        {/* Music Panel */}
        <MusicPanel audioRef={audioRef} currentTrack={currentTrack} />
      </div>
    </motion.div>
  );
};