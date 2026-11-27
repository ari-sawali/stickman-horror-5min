// stick2d.tsx — stickman SVG 2D: profil (jalan/duduk) + tampak depan.
// Semua gerak dari prop (frame-driven oleh pemanggil). Origin = titik kaki.
import React from 'react';

export type Face = 'neutral' | 'worried' | 'scared' | 'count' | 'solemn' | 'happy';
export type Accessory = 'cap' | 'driver' | 'bow' | 'tuft' | 'none' | 'black';

export interface StickProps {
  x: number; y: number; h: number;          // posisi kaki + tinggi (px)
  color?: string;                            // warna garis
  accent?: string;
  accessory?: Accessory;
  face?: Face;
  flip?: boolean;                            // true = menghadap kiri
  walk?: number;                             // fase jalan (radian), undefined = berdiri
  armPose?: 'swing' | 'down' | 'wheel' | 'knock' | 'tally';
  knockP?: number;                           // 0..1 progres ayunan ketuk (utk armPose knock)
  lean?: number;                             // derajat condong badan
  bob?: number;                              // offset napas/idle (px)
  opacity?: number;
}

const Q = (x1: number, y1: number, x2: number, y2: number, bow: number) => {
  const mx = (x1 + x2) / 2 + bow, my = (y1 + y2) / 2;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

export const Stick: React.FC<StickProps> = (p) => {
  const h = p.h, col = p.accessory === 'black' ? '#0B0B0E' : (p.color ?? '#23232E');
  const w = p.accessory === 'black' ? h * 0.052 : h * 0.042;   // ketebalan garis
  const headR = h * 0.115, hipY = -h * 0.50, shY = -h * 0.76, headCY = -h * 0.875;
  const walking = p.walk !== undefined;
  const ph = p.walk ?? 0;
  const bob = (p.bob ?? 0) + (walking ? Math.abs(Math.sin(ph)) * h * 0.012 : 0);
  const lean = (p.lean ?? (walking ? 4 : 0)) * Math.PI / 180;

  // kaki: kaki A = depan (searah hadap), B = belakang
  const leg = (phase: number) => {
    const fx = Math.sin(phase) * h * 0.30;
    const fy = -Math.max(0, Math.sin(phase + Math.PI / 2)) * h * 0.055;
    return {fx, fy};
  };
  const lA = walking ? leg(ph) : {fx: h * 0.07, fy: 0};
  const lB = walking ? leg(ph + Math.PI) : {fx: -h * 0.07, fy: 0};
  // lengan ayun berlawanan kaki
  const armSwing = (phase: number) => Math.sin(phase) * h * 0.20;
  const handA = walking ? {x: armSwing(ph + Math.PI), y: -h * 0.30} : {x: h * 0.05, y: -h * 0.28};
  const handB = walking ? {x: armSwing(ph), y: -h * 0.30} : {x: -h * 0.05, y: -h * 0.28};

  let hA = handA, hB = handB;
  if (p.armPose === 'down') { hA = {x: h * 0.06, y: -h * 0.27}; hB = {x: -h * 0.06, y: -h * 0.27}; }
  if (p.armPose === 'wheel') { hA = {x: h * 0.24, y: -h * 0.52}; hB = {x: h * 0.17, y: -h * 0.44}; }
  if (p.armPose === 'tally') { hA = {x: h * 0.20, y: -h * 0.38}; hB = {x: h * 0.10, y: -h * 0.30}; }
  if (p.armPose === 'knock') {
    const k = p.knockP ?? 0; // 0 = siap, 1 = menyentuh pintu
    hA = {x: h * (0.16 + 0.13 * k), y: -h * (0.86 - 0.05 * k)};
    hB = {x: -h * 0.05, y: -h * 0.28};
  }

  const hipX = Math.sin(lean) * h * 0.26, shX = Math.sin(lean) * h * 0.52;
  const headX = Math.sin(lean) * h * 0.60;
  const black = p.accessory === 'black';

  return (
    <g transform={`translate(${p.x},${p.y - bob}) scale(${p.flip ? -1 : 1},1)`} opacity={p.opacity ?? 1}>
      {/* kaki belakang */}
      <path d={Q(hipX, hipY, lB.fx, lB.fy, h * 0.05)} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" opacity={black ? 1 : 0.72} />
      {/* lengan belakang */}
      <path d={Q(shX, shY, hB.x, hB.y, -h * 0.05)} stroke={col} strokeWidth={w * 0.92} fill="none" strokeLinecap="round" opacity={black ? 1 : 0.72} />
      {/* badan */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={col} strokeWidth={w} strokeLinecap="round" />
      {/* kaki depan */}
      <path d={Q(hipX, hipY, lA.fx, lA.fy, h * 0.05)} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" />
      {/* lengan depan */}
      <path d={Q(shX, shY, hA.x, hA.y, -h * 0.05)} stroke={col} strokeWidth={w * 0.92} fill="none" strokeLinecap="round" />
      {/* kepala */}
      <circle cx={headX} cy={headCY} r={headR} fill={black ? '#0B0B0E' : 'none'} stroke={col} strokeWidth={w} />
      {!black && <ProfileFace cx={headX} cy={headCY} r={headR} face={p.face ?? 'neutral'} col={col} />}
      {!black && p.accessory && p.accessory !== 'none' && (
        <AccessoryDraw kind={p.accessory} cx={headX} cy={headCY} r={headR} accent={p.accent ?? '#C8372D'} />
      )}
      {black && <circle cx={headX} cy={headCY} r={headR * 1.02} fill="#0B0B0E" />}
    </g>
  );
};

const ProfileFace: React.FC<{cx: number; cy: number; r: number; face: Face; col: string}> = ({cx, cy, r, face, col}) => {
  const ex = cx + r * 0.42, ey = cy - r * 0.08;
  const mx = cx + r * 0.52, my = cy + r * 0.38;
  const sw = r * 0.13;
  return (
    <g stroke={col} strokeWidth={sw} strokeLinecap="round" fill="none">
      <circle cx={ex} cy={ey} r={sw * 0.62} fill={col} stroke="none" />
      {(face === 'worried' || face === 'scared') && (
        <path d={`M ${ex - r * 0.28} ${ey - r * 0.42} L ${ex + r * 0.22} ${ey - r * 0.30}`} />
      )}
      {face === 'count' && <path d={`M ${ex - r * 0.30} ${ey - r * 0.40} L ${ex + r * 0.24} ${ey - r * 0.40}`} />}
      {face === 'neutral' && <path d={`M ${mx - r * 0.16} ${my} L ${mx + r * 0.10} ${my}`} />}
      {face === 'happy' && <path d={`M ${mx - r * 0.18} ${my - r * 0.06} Q ${mx} ${my + r * 0.14} ${mx + r * 0.16} ${my - r * 0.06}`} />}
      {face === 'worried' && <path d={`M ${mx - r * 0.16} ${my + r * 0.08} Q ${mx} ${my - r * 0.10} ${mx + r * 0.16} ${my + r * 0.08}`} />}
      {face === 'scared' && <circle cx={mx} cy={my} r={r * 0.13} />}
      {face === 'count' && <path d={`M ${mx - r * 0.15} ${my} L ${mx + r * 0.12} ${my}`} />}
      {face === 'solemn' && <path d={`M ${mx - r * 0.15} ${my + r * 0.03} L ${mx + r * 0.12} ${my + r * 0.03}`} />}
    </g>
  );
};

const AccessoryDraw: React.FC<{kind: Accessory; cx: number; cy: number; r: number; accent: string}> = ({kind, cx, cy, r, accent}) => {
  if (kind === 'cap') return (
    <g>
      <path d={`M ${cx - r * 0.95} ${cy - r * 0.28} A ${r * 1.02} ${r * 1.02} 0 0 1 ${cx + r * 0.95} ${cy - r * 0.28} Z`} fill={accent} />
      <path d={`M ${cx + r * 0.55} ${cy - r * 0.30} L ${cx + r * 1.55} ${cy - r * 0.16} L ${cx + r * 0.55} ${cy - r * 0.05} Z`} fill={accent} />
    </g>
  );
  if (kind === 'driver') return (
    <g>
      <path d={`M ${cx - r * 0.98} ${cy - r * 0.30} L ${cx + r * 0.98} ${cy - r * 0.30} L ${cx + r * 0.88} ${cy - r * 0.78} L ${cx - r * 0.88} ${cy - r * 0.78} Z`} fill="#2E3D59" />
      <path d={`M ${cx + r * 0.60} ${cy - r * 0.32} L ${cx + r * 1.6} ${cy - r * 0.20} L ${cx + r * 0.60} ${cy - r * 0.08} Z`} fill="#2E3D59" />
      <rect x={cx - r * 0.98} y={cy - r * 0.38} width={r * 1.96} height={r * 0.12} fill="#C9A227" />
    </g>
  );
  if (kind === 'bow') return (
    <g fill={accent}>
      <path d={`M ${cx + r * 0.28} ${cy - r * 0.78} L ${cx + r * 0.95} ${cy - r * 1.12} L ${cx + r * 0.92} ${cy - r * 0.42} Z`} />
      <path d={`M ${cx + r * 0.28} ${cy - r * 0.78} L ${cx - r * 0.30} ${cy - r * 1.10} L ${cx - r * 0.18} ${cy - r * 0.44} Z`} />
      <circle cx={cx + r * 0.28} cy={cy - r * 0.78} r={r * 0.17} />
    </g>
  );
  if (kind === 'tuft') return (
    <g stroke="#23232E" strokeWidth={r * 0.13} strokeLinecap="round" fill="none">
      <path d={`M ${cx - r * 0.4} ${cy - r * 0.82} Q ${cx - r * 0.2} ${cy - r * 1.25} ${cx} ${cy - r * 0.9}`} />
      <path d={`M ${cx + r * 0.1} ${cy - r * 0.9} Q ${cx + r * 0.35} ${cy - r * 1.28} ${cx + r * 0.5} ${cy - r * 0.8}`} />
    </g>
  );
  return null;
};

// Tampak depan (reveal) — wajah penuh dua mata.
export const StickFront: React.FC<{
  x: number; y: number; h: number; color?: string; accent?: string;
  accessory?: Accessory; face?: Face; tilt?: number; opacity?: number; sweat?: boolean;
}> = (p) => {
  const h = p.h, col = p.accessory === 'black' ? '#0B0B0E' : (p.color ?? '#23232E');
  const w = p.accessory === 'black' ? h * 0.052 : h * 0.042;
  const headR = h * 0.115, hipY = -h * 0.50, shY = -h * 0.76, headCY = -h * 0.875;
  const black = p.accessory === 'black';
  return (
    <g transform={`translate(${p.x},${p.y})`} opacity={p.opacity ?? 1}>
      <line x1={-h * 0.02} y1={hipY} x2={-h * 0.10} y2={0} stroke={col} strokeWidth={w} strokeLinecap="round" />
      <line x1={h * 0.02} y1={hipY} x2={h * 0.10} y2={0} stroke={col} strokeWidth={w} strokeLinecap="round" />
      <line x1={0} y1={hipY} x2={0} y2={shY} stroke={col} strokeWidth={w} strokeLinecap="round" />
      <path d={Q(0, shY, -h * 0.13, -h * 0.30, -h * 0.03)} stroke={col} strokeWidth={w * 0.92} fill="none" strokeLinecap="round" />
      <path d={Q(0, shY, h * 0.13, -h * 0.30, h * 0.03)} stroke={col} strokeWidth={w * 0.92} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${p.tilt ?? 0} 0 ${headCY})`}>
        <circle cx={0} cy={headCY} r={headR} fill={black ? '#0B0B0E' : 'none'} stroke={col} strokeWidth={w} />
        {!black && <FrontFace cy={headCY} r={headR} face={p.face ?? 'neutral'} col={col} />}
        {!black && p.accessory && p.accessory !== 'none' && (
          <AccessoryDraw kind={p.accessory} cx={0} cy={headCY} r={headR} accent={p.accent ?? '#C8372D'} />
        )}
        {p.sweat && (
          <path d={`M ${headR * 1.15} ${headCY - headR * 0.2} q ${headR * 0.22} ${headR * 0.4} 0 ${headR * 0.52} q ${-headR * 0.22} ${-0.12 * headR} 0 ${-headR * 0.52}`} fill="#8FD3E8" />
        )}
      </g>
    </g>
  );
};

const FrontFace: React.FC<{cy: number; r: number; face: Face; col: string}> = ({cy, r, face, col}) => {
  const sw = r * 0.13, ey = cy - r * 0.10, my = cy + r * 0.42;
  const scared = face === 'scared';
  return (
    <g stroke={col} strokeWidth={sw} strokeLinecap="round" fill="none">
      {scared ? (
        <>
          <circle cx={-r * 0.38} cy={ey} r={r * 0.20} fill="#FFF" />
          <circle cx={r * 0.38} cy={ey} r={r * 0.20} fill="#FFF" />
          <circle cx={-r * 0.38} cy={ey} r={r * 0.08} fill={col} stroke="none" />
          <circle cx={r * 0.38} cy={ey} r={r * 0.08} fill={col} stroke="none" />
        </>
      ) : (
        <>
          <circle cx={-r * 0.38} cy={ey} r={sw * 0.62} fill={col} stroke="none" />
          <circle cx={r * 0.38} cy={ey} r={sw * 0.62} fill={col} stroke="none" />
        </>
      )}
      {(face === 'worried' || face === 'scared') && (
        <>
          <path d={`M ${-r * 0.62} ${ey - r * 0.44} L ${-r * 0.16} ${ey - r * 0.30}`} />
          <path d={`M ${r * 0.62} ${ey - r * 0.44} L ${r * 0.16} ${ey - r * 0.30}`} />
        </>
      )}
      {face === 'neutral' && <path d={`M ${-r * 0.16} ${my} L ${r * 0.16} ${my}`} />}
      {face === 'happy' && <path d={`M ${-r * 0.2} ${my - r * 0.05} Q 0 ${my + r * 0.16} ${r * 0.2} ${my - r * 0.05}`} />}
      {face === 'worried' && <path d={`M ${-r * 0.17} ${my + r * 0.07} Q 0 ${my - r * 0.10} ${r * 0.17} ${my + r * 0.07}`} />}
      {face === 'scared' && <circle cx={0} cy={my} r={r * 0.14} />}
      {face === 'solemn' && <path d={`M ${-r * 0.16} ${my + r * 0.02} L ${r * 0.16} ${my + r * 0.02}`} />}
      {face === 'count' && <path d={`M ${-r * 0.16} ${my} L ${r * 0.16} ${my}`} />}
    </g>
  );
};

// Kepala + bahu anak duduk (terlihat di atas sandaran kursi bus)
export const SeatedKid: React.FC<{
  x: number; y: number; s: number; accent: string; accessory?: Accessory; face?: Face; black?: boolean;
}> = ({x, y, s, accent, accessory, face, black}) => {
  const col = black ? '#0B0B0E' : '#23232E';
  const r = 34 * s;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M ${-r * 1.15} ${r * 1.5} Q 0 ${r * 0.55} ${r * 1.15} ${r * 1.5} L ${r * 1.15} ${r * 2.2} L ${-r * 1.15} ${r * 2.2} Z`} fill={black ? '#0B0B0E' : accent} opacity={black ? 1 : 0.9} />
      <circle cx={0} cy={0} r={r} fill={black ? '#0B0B0E' : 'none'} stroke={col} strokeWidth={r * 0.13} />
      {!black && <ProfileFace cx={0} cy={0} r={r} face={face ?? 'neutral'} col={col} />}
      {!black && accessory && accessory !== 'none' && <AccessoryDraw kind={accessory} cx={0} cy={0} r={r} accent={accent} />}
    </g>
  );
};
