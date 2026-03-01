import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'library', icon: '♪', label: 'Library' },
  { id: 'playlists', icon: '≡', label: 'Playlists' },
  { id: 'upload', icon: '↑', label: 'Upload' },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full py-6 px-3 z-20"
      style={{
        background: 'rgba(10, 10, 18, 0.85)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            boxShadow: '0 0 20px rgba(168,85,247,0.5)',
          }}
        >
          ♫
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-base tracking-tight text-white whitespace-nowrap"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AURA<span style={{ color: '#a855f7' }}>WAVE</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              onHoverStart={() => setHovered(item.id)}
              onHoverEnd={() => setHovered(null)}
              whileTap={{ scale: 0.96 }}
              className="relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left w-full"
              style={{
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))'
                  : hovered === item.id
                  ? 'rgba(255,255,255,0.05)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: 'linear-gradient(to bottom, #a855f7, #ec4899)' }}
                />
              )}
              <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="mt-4 mx-auto flex items-center justify-center w-8 h-8 rounded-full"
        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
      >
        <motion.span animate={{ rotateY: collapsed ? 180 : 0 }} style={{ display: 'inline-block' }}>
          ‹
        </motion.span>
      </motion.button>
    </motion.aside>
  );
}