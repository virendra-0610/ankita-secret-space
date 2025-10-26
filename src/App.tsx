import React from 'react';
import { motion } from 'framer-motion';

export default function AnkitaGardenPage() {
  return (
    <div className="relative min-h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-pink-100 via-blue-100 to-rose-100">
      <main className="flex-1 flex flex-col items-center justify-center">
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
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
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
          <div className="inline-block bg-blue-100/40 backdrop-blur-sm py-8 px-12 shadow-lg rounded-lg border border-white/30">
            <p className="text-lg md:text-1xl text-blue-800 font-mono tracking-tight max-w-2xl mx-auto text-center leading-relaxed">
              Welcome{' '}
              <motion.span
                className="relative inline-block bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold"
                animate={{
                  textShadow: [
                    "0 0 4px #f10c0cff",
                    "0 0 11px #abc61fff",
                    "0 0 19px #1f2a92ff",
                    "0 0 40px #ff1493",
                    "0 0 80px #ff69b4",
                    "0 0 90px #ff69b4",
                    "0 0 100px #ff1493",
                    "0 0 150px #ff69b4"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Ankita
              </motion.span>! <br/>
              This is your secret space, for the moments you need to stop running — 
              a quiet corner that remembers your breath. Write when you wish, 
              listen when you need, and know this place was made so you can{' '}
              <motion.span
                className="relative inline-block bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-transparent bg-clip-text font-bold"
                animate={{
                  textShadow: [
                    "0 0 4px #fff",
                    "0 0 11px #fff",
                    "0 0 19px #d51616ff",
                    "0 0 40px #f0f",
                    "0 0 80px #0ff",
                    "0 0 90px #0ff",
                    "0 0 100px rgba(8, 132, 132, 1)",
                    "0 0 150px #0ff"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                pause
              </motion.span>. <br/> 
              — Made with care.
            </p>
          </div>
        </div>

        {/* Sparkling button - fixed centering */}
        <div className="w-full flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="mt-10 relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 px-6 py-3 rounded-full font-mono text-lg shadow-md hover:shadow-blue-400/60 transition-all overflow-hidden"
          >
            <span>Dive in</span>
            <span>→</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </div>
      </main>
    </div>
  );
}