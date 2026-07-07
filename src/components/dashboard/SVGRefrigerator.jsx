/**
 * SVGRefrigerator — Ultra-realistic Glass-Door Pharmaceutical Refrigerator
 * Exactly matching the commercial medical UI screenshot
 * Reacts live to: doorStatus, overallHealth, fridgeTemp, buzzer
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, ShieldCheck } from 'lucide-react';

export default function SVGRefrigerator({
  doorStatus = 'closed',
  overallHealth = 'SAFE',
  fridgeTemp = 4.7,
  buzzer = false,
  size = 320,
}) {
  const isOpen = doorStatus === 'open';

  // Status tokens
  const statusMap = {
    SAFE:     { outline: '#00D68F', glow: 'rgba(0, 214, 143, 0.25)', dimGlow: 'rgba(0, 214, 143, 0.08)', label: 'SAFE', ledColor: '#00D68F' },
    WARNING:  { outline: '#F5A623', glow: 'rgba(245, 166, 35, 0.25)', dimGlow: 'rgba(245, 166, 35, 0.08)', label: 'CAUTION', ledColor: '#F5A623' },
    CRITICAL: { outline: '#FF3B30', glow: 'rgba(255, 59, 48, 0.35)', dimGlow: 'rgba(255, 59, 48, 0.12)', label: 'ALARM', ledColor: '#FF3B30' },
  };
  const st = statusMap[overallHealth] || statusMap.SAFE;

  const w = size;
  const h = size * 1.55;

  // Body proportions
  const bx = w * 0.1;
  const by = h * 0.03;
  const bw = w * 0.8;
  const bh = h * 0.94;
  const br = 16; // corner radius

  // Top digital header compartment (approx 15% of body)
  const topH = bh * 0.14;
  // Main glass door compartment
  const doorY = by + topH + 6;
  const doorH = bh - topH - 18; // 12px for bottom kickplate
  const kickY = by + bh - 12;

  return (
    <div style={{ position: 'relative', width: w, height: h, flexShrink: 0, margin: '0 auto' }}>
      {/* ── Center Radial Emerald Glow (Behind Unit) ──────── */}
      <motion.div
        animate={{
          boxShadow: overallHealth === 'CRITICAL'
            ? `0 0 80px 30px ${st.glow}, 0 0 160px 60px ${st.dimGlow}`
            : `0 0 60px 20px ${st.glow}, 0 0 120px 40px ${st.dimGlow}`,
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '15%', left: '10%', right: '10%', bottom: '10%',
          borderRadius: '50%',
          pointerEvents: 'none',
          filter: 'blur(20px)',
          background: `radial-gradient(circle at center, ${st.glow} 0%, transparent 70%)`,
        }}
      />

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', position: 'relative', zIndex: 2 }}
      >
        <defs>
          {/* Dark Brushed Metallic Frame */}
          <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#111318" />
            <stop offset="6%"   stopColor="#202430" />
            <stop offset="15%"  stopColor="#161922" />
            <stop offset="50%"  stopColor="#13161F" />
            <stop offset="85%"  stopColor="#161922" />
            <stop offset="94%"  stopColor="#202430" />
            <stop offset="100%" stopColor="#0D0F14" />
          </linearGradient>

          {/* Top Header Panel Gradient */}
          <linearGradient id="topPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1A1E29" />
            <stop offset="100%" stopColor="#0E1117" />
          </linearGradient>

          {/* Glass Door Reflection */}
          <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="30%"  stopColor="rgba(255, 255, 255, 0.02)" />
            <stop offset="31%"  stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Interior Cyan/Blue LED Glow */}
          <radialGradient id="interiorLight" cx="50%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="rgba(56, 189, 248, 0.25)" />
            <stop offset="50%"  stopColor="rgba(56, 189, 248, 0.1)" />
            <stop offset="100%" stopColor="rgba(10, 15, 24, 0.95)" />
          </radialGradient>

          <clipPath id="doorClip">
            <rect x={bx + 6} y={doorY + 6} width={bw - 12} height={doorH - 12} rx={6} />
          </clipPath>
        </defs>

        {/* ── Main Outer Chassis ───────────────────────── */}
        <rect
          x={bx} y={by} width={bw} height={bh} rx={br}
          fill="url(#metalBody)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={1.5}
        />

        {/* Outer Shadow/Bezel highlight */}
        <rect
          x={bx + 2} y={by + 2} width={bw - 4} height={bh - 4} rx={br - 2}
          stroke="rgba(0, 0, 0, 0.6)"
          strokeWidth={2}
        />

        {/* ── Top Header Display Panel ─────────────────── */}
        <rect
          x={bx + 6} y={by + 6} width={bw - 12} height={topH - 6} rx={8}
          fill="url(#topPanelGrad)"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={1}
        />

        {/* Brand Logo in Top Panel (Left) */}
        <g transform={`translate(${bx + 16}, ${by + topH * 0.4})`}>
          <circle cx="8" cy="8" r="8" fill="rgba(0, 214, 143, 0.15)" />
          <text x="22" y="11" fontSize="11" fontWeight="700" fill="#E5E7EB" fontFamily="var(--font-sans)" letterSpacing="-0.3">
            ColdChain
          </text>
        </g>

        {/* Digital Readout Screen in Top Panel (Right) */}
        <rect
          x={bx + bw - 90} y={by + 12} width={76} height={topH - 18} rx={6}
          fill="#06080C"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1}
        />
        <text
          x={bx + bw - 52} y={by + topH * 0.52}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fontFamily="var(--font-mono)"
          fill="#F3F4F6"
        >
          {fridgeTemp?.toFixed(1)}°C
        </text>
        <circle cx={bx + bw - 24} cy={by + topH * 0.52} r="3" fill={st.ledColor} />

        {/* ── Divider Line ─────────────────────────────── */}
        <line
          x1={bx + 4} y1={doorY - 3}
          x2={bx + bw - 4} y2={doorY - 3}
          stroke="#06080C" strokeWidth={3}
        />

        {/* ── Interior & Glass Door Area ───────────────── */}
        <g clipPath="url(#doorClip)">
          {/* Back wall with Cyan Interior Lighting */}
          <rect
            x={bx + 6} y={doorY + 6} width={bw - 12} height={doorH - 12}
            fill="#080C14"
          />
          <rect
            x={bx + 6} y={doorY + 6} width={bw - 12} height={doorH - 12}
            fill="url(#interiorLight)"
          />

          {/* Top Interior LED Strip */}
          <rect
            x={bx + 20} y={doorY + 8} width={bw - 40} height={3} rx={1.5}
            fill="#38BDF8" opacity={0.8}
            style={{ filter: 'drop-shadow(0 0 6px #38BDF8)' }}
          />

          {/* Circulation Fan at Top Center Back Wall */}
          <g transform={`translate(${bx + bw / 2}, ${doorY + doorH * 0.22})`}>
            <circle cx="0" cy="0" r="22" fill="#0E1422" stroke="rgba(56, 189, 248, 0.3)" strokeWidth={1.5} />
            <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="5" fill="#1E293B" />
            {/* Fan Blades */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <line
                key={i}
                x1="0" y1="0"
                x2={Math.cos(deg * Math.PI / 180) * 14}
                y2={Math.sin(deg * Math.PI / 180) * 14}
                stroke="rgba(56, 189, 248, 0.4)" strokeWidth={2} strokeLinecap="round"
              />
            ))}
          </g>

          {/* 3 Realistic Wire Shelves */}
          {[0.4, 0.62, 0.82].map((f, i) => (
            <g key={i}>
              {/* Shelf shadow */}
              <rect
                x={bx + 12} y={doorY + doorH * f + 4} width={bw - 24} height={4} rx={2}
                fill="rgba(0, 0, 0, 0.6)"
              />
              {/* Shelf metallic bar */}
              <rect
                x={bx + 12} y={doorY + doorH * f} width={bw - 24} height={4} rx={2}
                fill="#334155"
                stroke="rgba(255, 255, 255, 0.2)" strokeWidth={0.5}
              />
              {/* Wire grid details */}
              {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((wf, wi) => (
                <line
                  key={wi}
                  x1={bx + 12 + (bw - 24) * wf} y1={doorY + doorH * f}
                  x2={bx + 12 + (bw - 24) * wf} y2={doorY + doorH * f + 4}
                  stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1}
                />
              ))}
            </g>
          ))}
        </g>

        {/* ── Glass Door Frame & Handle ────────────────── */}
        <motion.g
          animate={{ rotateY: isOpen ? -65 : 0, x: isOpen ? w * 0.15 : 0 }}
          transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
          style={{ transformOrigin: `${bx + 6}px ${doorY + doorH / 2}px`, transformStyle: 'preserve-3d' }}
        >
          {/* Glass door border frame */}
          <rect
            x={bx + 6} y={doorY + 6} width={bw - 12} height={doorH - 12} rx={8}
            fill="url(#glassReflection)"
            stroke={isOpen ? `${st.outline}80` : 'rgba(255, 255, 255, 0.18)'}
            strokeWidth={2}
          />

          {/* Inner dark bezel */}
          <rect
            x={bx + 12} y={doorY + 12} width={bw - 24} height={doorH - 24} rx={4}
            fill="none"
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth={3}
          />

          {/* Subtle Green/Safe Outer Glow on Door Border */}
          <rect
            x={bx + 6} y={doorY + 6} width={bw - 12} height={doorH - 12} rx={8}
            fill="none"
            stroke={st.outline}
            strokeWidth={1.5}
            opacity={0.6}
            style={{ filter: `drop-shadow(0 0 6px ${st.outline})` }}
          />

          {/* Sleek Vertical Door Handle on Right Side */}
          <rect
            x={bx + bw - 22} y={doorY + doorH * 0.35} width={8} height={doorH * 0.3} rx={4}
            fill="#1E293B"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth={1}
            style={{ filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.5))' }}
          />
          {/* Handle metallic highlight */}
          <line
            x1={bx + bw - 18} y1={doorY + doorH * 0.38}
            x2={bx + bw - 18} y2={doorY + doorH * 0.62}
            stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1.5} strokeLinecap="round"
          />
        </motion.g>

        {/* ── Bottom Kickplate / Vents ─────────────────── */}
        <rect
          x={bx + 8} y={kickY} width={bw - 16} height={10} rx={2}
          fill="#0B0D13"
        />
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((vf, vi) => (
          <line
            key={vi}
            x1={bx + bw * vf} y1={kickY + 2}
            x2={bx + bw * vf} y2={kickY + 8}
            stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1.5} strokeLinecap="round"
          />
        ))}

        {/* Refrigerator Feet */}
        <rect x={bx + 16} y={by + bh} width={16} height={6} rx={2} fill="#0A0D14" />
        <rect x={bx + bw - 32} y={by + bh} width={16} height={6} rx={2} fill="#0A0D14" />

        {/* Floor Glow Reflection */}
        <ellipse
          cx={bx + bw / 2} cy={by + bh + 8} rx={bw * 0.6} ry={8}
          fill={st.glow} opacity={0.5}
          style={{ filter: 'blur(8px)' }}
        />
      </svg>
    </div>
  );
}
