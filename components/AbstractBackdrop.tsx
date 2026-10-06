import React from 'react';

/**
 * Latar abstrak neobrutalism (tampil mulai layar md; di mobile bentuk abstrak
 * ada di dalam hero): bentuk geometri datar, garis hitam tebal,
 * diletakkan di tepi layar supaya tidak mengganggu konten.
 * - Murni dekoratif (aria-hidden, pointer-events-none).
 * - Server component: tanpa state / hook.
 * - Gerak hanya pada 3 bentuk dan otomatis mati bila pengguna memilih
 *   "reduce motion" (lihat globals.css).
 */

const STROKE = 3;

type DriftStyle = React.CSSProperties & { [k in '--r' | '--dx' | '--dy']?: string };

export const AbstractBackdrop: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden md:block"
    >
      {/* Lingkaran besar bertarget — kanan atas */}
      <svg
        className="absolute nb-spin-slow"
        style={{ top: '7vh', right: '-120px', width: 340, height: 340 }}
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="48" fill="#8e7cff" stroke="#000" strokeWidth={STROKE / 3.4} />
        <circle cx="50" cy="50" r="31" fill="#ffd84d" stroke="#000" strokeWidth={STROKE / 3.4} />
        <circle cx="50" cy="50" r="14" fill="#ff6b6b" stroke="#000" strokeWidth={STROKE / 3.4} />
        <path d="M50 2 L50 98" stroke="#000" strokeWidth={STROKE / 3.4} />
      </svg>

      {/* Setengah lingkaran volt — kiri bawah */}
      <div
        className="absolute hidden sm:block"
        style={{
          left: '-70px',
          bottom: '9vh',
          width: 260,
          height: 130,
          background: '#b4ff39',
          border: `${STROKE}px solid #000`,
          borderBottom: 'none',
          borderRadius: '130px 130px 0 0',
          transform: 'rotate(-12deg)'
        }}
      />

      {/* Segitiga pink — kiri tengah */}
      <svg
        className="absolute nb-drift hidden md:block"
        style={{ left: '2vw', top: '38vh', width: 120, height: 110, ['--r' as string]: '-8deg', ['--dy' as string]: '-18px' } as DriftStyle}
        viewBox="0 0 120 110"
      >
        <polygon points="60,6 114,102 6,102" fill="#ff8ad8" stroke="#000" strokeWidth={STROKE} strokeLinejoin="miter" />
      </svg>

      {/* Zigzag biru bergaris — kanan tengah */}
      <svg
        className="absolute hidden md:block"
        style={{ right: '3vw', top: '58vh', width: 200, height: 60 }}
        viewBox="0 0 200 60"
        fill="none"
      >
        <polyline points="6,48 30,12 54,48 78,12 102,48 126,12 150,48 174,12 194,40" stroke="#000" strokeWidth={14} strokeLinejoin="miter" strokeLinecap="butt" />
        <polyline points="6,48 30,12 54,48 78,12 102,48 126,12 150,48 174,12 194,40" stroke="#4fd8ff" strokeWidth={7} strokeLinejoin="miter" strokeLinecap="butt" />
      </svg>

      {/* Blok garis diagonal — kanan bawah */}
      <div
        className="absolute nb-stripes nb-drift"
        style={{
          right: '5vw',
          bottom: '5vh',
          width: 110,
          height: 110,
          backgroundColor: '#fff',
          border: `${STROKE}px solid #000`,
          ['--r' as string]: '6deg',
          ['--dx' as string]: '10px',
          ['--dy' as string]: '0px'
        } as DriftStyle}
      />

      {/* Tambalan titik — kiri atas */}
      <div
        className="absolute nb-dots hidden sm:block"
        style={{ left: '4vw', top: '16vh', width: 126, height: 84, border: `${STROKE}px solid #000`, backgroundColor: '#fff' }}
      />

      {/* Tanda plus — tersebar */}
      <svg className="absolute" style={{ left: '46vw', top: '3vh', width: 34, height: 34 }} viewBox="0 0 34 34">
        <path d="M17 2 V32 M2 17 H32" stroke="#000" strokeWidth={7} />
      </svg>
      <svg className="absolute hidden sm:block" style={{ right: '28vw', bottom: '10vh', width: 28, height: 28 }} viewBox="0 0 34 34">
        <path d="M17 2 V32 M2 17 H32" stroke="#000" strokeWidth={7} />
      </svg>

      {/* Cincin kecil + titik solid */}
      <div
        className="absolute hidden md:block"
        style={{ left: '30vw', bottom: '4vh', width: 64, height: 64, borderRadius: '50%', border: `${STROKE + 3}px solid #000`, background: '#ff6b6b' }}
      />
      <div
        className="absolute"
        style={{ right: '16vw', top: '44vh', width: 22, height: 22, borderRadius: '50%', background: '#000' }}
      />
    </div>
  );
};
