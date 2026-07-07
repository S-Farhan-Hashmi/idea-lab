/**
 * SVGRefrigerator — Pure SVG/CSS animated pharmaceutical refrigerator
 * Reacts live to: doorStatus, overallHealth, fridgeTemp, buzzer
 * No images. Pure vectors and CSS animations.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function SVGRefrigerator({
  doorStatus = 'closed',
  overallHealth = 'SAFE',
  fridgeTemp = 4.2,
  buzzer = false,
  size = 280,
}) {
  const isOpen = doorStatus === 'open';

  // Status → visual tokens
  const statusMap = {
    SAFE:     { outline: '#00D68F', glow: 'rgba(0, 214, 143, 0.18)', dimGlow: 'rgba(0, 214, 143, 0.06)', label: 'SAFE', ledColor: '#00D68F' },
    WARNING:  { outline: '#F5A623', glow: 'rgba(245, 166, 35, 0.18)', dimGlow: 'rgba(245, 166, 35, 0.06)', label: 'CAUTION', ledColor: '#F5A623' },
    CRITICAL: { outline: '#FF3B30', glow: 'rgba(255, 59, 48, 0.25)', dimGlow: 'rgba(255, 59, 48, 0.08)', label: 'ALARM', ledColor: '#FF3B30' },
  };
  const st = statusMap[overallHealth] || statusMap.SAFE;

  const w = size;
  const h = size * 1.5;

  // Body proportions
  const bx = w * 0.1;
  const by = h * 0.04;
  const bw = w * 0.8;
  const bh = h * 0.92;
  const br = 16; // corner radius

  // Freezer compartment top (25% of body)
  const freezerH = bh * 0.26;
  // Fridge compartment
  const fridgeY = by + freezerH + 6;
  const fridgeH = bh - freezerH - 6;

  return (
    <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
      {/* Status glow halo behind the unit */}
      <motion.div
        animate={{
          boxShadow: overallHealth === 'CRITICAL'
            ? `0 0 60px 20px ${st.glow}, 0 0 120px 40px ${st.dimGlow}`
            : `0 0 40px 10px ${st.glow}, 0 0 80px 20px ${st.dimGlow}`,
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '10%', left: '15%', right: '15%', bottom: '5%',
          borderRadius: '50%',
          pointerEvents: 'none',
          filter: 'blur(2px)',
        }}
      />

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Metallic body gradient */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1A1A1F" />
            <stop offset="8%"   stopColor="#242428" />
            <stop offset="50%"  stopColor="#1E1E23" />
            <stop offset="92%"  stopColor="#242428" />
            <stop offset="100%" stopColor="#161619" />
          </linearGradient>

          {/* Freezer panel */}
          <linearGradient id="freezerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="#1F1F24" />
            <stop offset="100%" stopColor="#17171B" />
          </linearGradient>

          {/* Door gradient — movable */}
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="#1D1D22" />
            <stop offset="30%" stopColor="#252529" />
            <stop offset="70%" stopColor="#222227" />
            <stop offset="100%" stopColor="#1A1A1F" />
          </linearGradient>

          {/* Inner glow when door open */}
          <radialGradient id="interiorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor={`${st.outline}20`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Status top LED strip gradient */}
          <linearGradient id="ledStripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={`${st.outline}00`} />
            <stop offset="50%"  stopColor={`${st.outline}CC`} />
            <stop offset="100%" stopColor={`${st.outline}00`} />
          </linearGradient>

          {/* Clip paths */}
          <clipPath id="bodyClip">
            <rect x={bx} y={by} width={bw} height={bh} rx={br} />
          </clipPath>
          <clipPath id="fridgeClip">
            <rect x={bx} y={fridgeY} width={bw} height={fridgeH} rx={0} />
          </clipPath>
        </defs>

        {/* ── Body shell ───────────────────────────────── */}
        <rect
          x={bx} y={by} width={bw} height={bh} rx={br}
          fill="url(#bodyGrad)"
          stroke={st.outline}
          strokeWidth={1.2}
          strokeOpacity={0.5}
        />

        {/* Side edge highlights */}
        <line x1={bx+1.5} y1={by+br} x2={bx+1.5} y2={by+bh-br} stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} />
        <line x1={bx+bw-1.5} y1={by+br} x2={bx+bw-1.5} y2={by+bh-br} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} />

        {/* Top specular highlight */}
        <rect
          x={bx} y={by} width={bw} height={3} rx={br/2}
          fill="rgba(255,255,255,0.08)"
        />

        {/* ── Status LED strip at very top ─────────────── */}
        <rect
          x={bx + bw*0.15} y={by + 8} width={bw*0.7} height={2} rx={1}
          fill="url(#ledStripGrad)"
          opacity={0.9}
        />

        {/* ── Freezer compartment ───────────────────────── */}
        <rect
          x={bx + 4} y={by + 4} width={bw - 8} height={freezerH - 4} rx={12}
          fill="url(#freezerGrad)"
          stroke="rgba(255,255,255,0.06)" strokeWidth={1}
        />
        {/* Freezer vents */}
        {[0.25, 0.45, 0.65].map((f, i) => (
          <line
            key={i}
            x1={bx + bw*f} y1={by + freezerH*0.35}
            x2={bx + bw*f} y2={by + freezerH*0.75}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeLinecap="round"
          />
        ))}
        {/* Freezer label */}
        <text
          x={bx + bw/2} y={by + freezerH * 0.55}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="400"
          fill="rgba(255,255,255,0.2)" letterSpacing="2"
        >
          FREEZE
        </text>

        {/* Divider bar between freezer and fridge */}
        <rect
          x={bx} y={by + freezerH} width={bw} height={6}
          fill="#0F0F12"
        />
        <line
          x1={bx + 8} y1={by + freezerH + 3}
          x2={bx + bw - 8} y2={by + freezerH + 3}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1}
        />

        {/* ── Fridge compartment interior (visible when open) ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Interior back wall */}
              <rect
                x={bx + 4} y={fridgeY} width={bw - 8} height={fridgeH - 4}
                fill="#0C1410"
                clipPath="url(#fridgeClip)"
              />
              {/* Interior ambient light */}
              <rect
                x={bx + 4} y={fridgeY} width={bw - 8} height={fridgeH - 4}
                fill="url(#interiorGlow)"
                clipPath="url(#fridgeClip)"
              />
              {/* Interior LED strip top */}
              <rect
                x={bx + 10} y={fridgeY + 6} width={bw - 20} height={3} rx={1.5}
                fill={st.outline} opacity={0.7}
              />
              {/* Shelves */}
              {[0.32, 0.56, 0.78].map((f, i) => (
                <g key={i}>
                  <rect
                    x={bx + 8} y={fridgeY + fridgeH * f} width={bw - 16} height={3} rx={1}
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(255,255,255,0.06)" strokeWidth={0.5}
                  />
                </g>
              ))}
              {/* Vaccine vials silhouettes on shelves */}
              {[
                { shelf: 0.32, vials: [0.2, 0.32, 0.44, 0.56, 0.68] },
                { shelf: 0.56, vials: [0.15, 0.27, 0.39, 0.51, 0.63, 0.75] },
              ].map(({ shelf, vials }, si) =>
                vials.map((x, vi) => (
                  <rect
                    key={`${si}-${vi}`}
                    x={bx + bw * x} y={fridgeY + fridgeH * shelf - 18}
                    width={6} height={18} rx={3}
                    fill={`${st.outline}40`}
                    stroke={`${st.outline}60`} strokeWidth={0.5}
                  />
                ))
              )}
              {/* Temperature display inside */}
              <text
                x={bx + bw * 0.55} y={fridgeY + fridgeH * 0.92}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontFamily="'JetBrains Mono', monospace"
                fill={`${st.outline}80`} letterSpacing="1"
              >
                {fridgeTemp?.toFixed(1)}°C
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Main door panel (animated open/close) ────── */}
        <motion.g
          animate={{ rotateY: isOpen ? -62 : 0, x: isOpen ? w * 0.15 : 0 }}
          transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
          style={{ transformOrigin: `${bx}px ${fridgeY + fridgeH/2}px`, transformStyle: 'preserve-3d' }}
        >
          {/* Door body */}
          <rect
            x={bx + 2} y={fridgeY + 1} width={bw - 4} height={fridgeH - 5} rx={6}
            fill="url(#doorGrad)"
            stroke={isOpen ? `${st.outline}40` : 'rgba(255,255,255,0.07)'}
            strokeWidth={1}
          />

          {/* Door top edge highlight */}
          <rect
            x={bx + 6} y={fridgeY + 3} width={bw - 12} height={2} rx={1}
            fill="rgba(255,255,255,0.06)"
          />

          {/* Door branding panel */}
          <rect
            x={bx + bw*0.12} y={fridgeY + fridgeH * 0.25}
            width={bw * 0.76} height={fridgeH * 0.42}
            rx={8}
            fill="rgba(0,0,0,0.25)"
            stroke="rgba(255,255,255,0.04)" strokeWidth={0.5}
          />

          {/* Brand mark */}
          <text
            x={bx + bw/2} y={fridgeY + fridgeH * 0.36}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
            fill="rgba(255,255,255,0.25)" letterSpacing="3"
          >
            PHARMACEUTICAL
          </text>
          <text
            x={bx + bw/2} y={fridgeY + fridgeH * 0.44}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="14" fontFamily="'JetBrains Mono', monospace" fontWeight="400"
            fill="rgba(255,255,255,0.45)" letterSpacing="2"
          >
            ColdChain
          </text>
          <text
            x={bx + bw/2} y={fridgeY + fridgeH * 0.52}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontFamily="'JetBrains Mono', monospace"
            fill="rgba(255,255,255,0.18)" letterSpacing="2"
          >
            WHO PQS COMPLIANT
          </text>

          {/* Door handle */}
          <rect
            x={bx + bw * 0.84} y={fridgeY + fridgeH * 0.42}
            width={6} height={fridgeH * 0.16}
            rx={3}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.2)" strokeWidth={0.5}
          />
          {/* Handle highlight */}
          <rect
            x={bx + bw * 0.845} y={fridgeY + fridgeH * 0.43}
            width={2} height={fridgeH * 0.04}
            rx={1}
            fill="rgba(255,255,255,0.3)"
          />

          {/* Magnetic seal indicator strip (bottom of door) */}
          <rect
            x={bx + 6} y={fridgeY + fridgeH - 10} width={bw - 12} height={3} rx={1.5}
            fill={isOpen ? 'rgba(255,59,48,0.2)' : 'rgba(0,214,143,0.15)'}
            stroke={isOpen ? 'rgba(255,59,48,0.3)' : 'rgba(0,214,143,0.25)'} strokeWidth={0.5}
          />
        </motion.g>

        {/* ── Status LEDs (bottom left corner of unit) ── */}
        {/* Online indicator */}
        <motion.circle
          cx={bx + 16} cy={by + bh - 16}
          r={4}
          fill={st.ledColor}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: overallHealth === 'CRITICAL' ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 5px ${st.ledColor})` }}
        />
        <text
          x={bx + 26} y={by + bh - 12}
          fontSize="7" fontFamily="'JetBrains Mono', monospace"
          fill="rgba(255,255,255,0.3)" letterSpacing="1"
        >
          SYS
        </text>

        {/* Buzzer indicator */}
        {buzzer && (
          <motion.circle
            cx={bx + 52} cy={by + bh - 16}
            r={4}
            fill="var(--alarm)"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 5px var(--alarm))' }}
          />
        )}

        {/* Door status LED */}
        <motion.circle
          cx={bx + bw - 16} cy={by + bh - 16}
          r={4}
          fill={isOpen ? 'var(--alarm)' : 'var(--safe)'}
          animate={{ opacity: isOpen ? [1, 0.3, 1] : 1 }}
          transition={isOpen ? { duration: 1, repeat: Infinity } : {}}
          style={{ filter: isOpen ? 'drop-shadow(0 0 5px var(--alarm))' : 'drop-shadow(0 0 5px var(--safe))' }}
        />
        <text
          x={bx + bw - 26} y={by + bh - 12}
          textAnchor="end"
          fontSize="7" fontFamily="'JetBrains Mono', monospace"
          fill="rgba(255,255,255,0.3)" letterSpacing="1"
        >
          DOOR
        </text>

        {/* ── Model plate ───────────────────────────────── */}
        <rect
          x={bx + bw*0.12} y={by + bh - 28}
          width={bw * 0.4} height={12} rx={2}
          fill="rgba(0,0,0,0.3)"
        />
        <text
          x={bx + bw*0.32} y={by + bh - 21}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="6" fontFamily="'JetBrains Mono', monospace"
          fill="rgba(255,255,255,0.2)" letterSpacing="1"
        >
          SN: CCM-2025-001
        </text>

        {/* ── Status outline border (animated by health) ── */}
        <motion.rect
          x={bx} y={by} width={bw} height={bh} rx={br}
          fill="none"
          stroke={st.outline}
          strokeWidth={1.5}
          animate={{
            opacity: overallHealth === 'CRITICAL' ? [0.7, 0.2, 0.7] : [0.4, 0.15, 0.4],
          }}
          transition={{ duration: overallHealth === 'CRITICAL' ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* OPEN indicator badge */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              top: '42%',
              right: -52,
              background: 'var(--alarm-dim)',
              border: '1px solid var(--alarm-glow)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '9px',
              fontWeight: 600,
              color: 'var(--alarm)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            DOOR OPEN
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
