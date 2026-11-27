// round2d.tsx — karakter "round-head" ala animasi keluarga viral:
// kepala bulat BESAR krem (~56% tinggi), wajah dot-eyes minimal, badan chubby
// kecil warna solid, outline cokelat hangat lembut. Interface sengaja sama
// dengan stick2d.tsx (Stick/StickFront/SeatedKid) -> scenes tinggal ganti import.
// Origin = titik kaki. Semua gerak dari prop (frame-driven oleh pemanggil).
import React from 'react';
import type {Face} from './stick2d';

export type RAccessory = 'cap' | 'driver' | 'bow' | 'tuft' | 'bun' | 'none' | 'black';

export const HEAD = '#FFFBF1';
export const HEAD_SHADE = '#F0DFC4';
export const INK = '#3A2A22';
export const OUT = '#4A362A';
export const GREY_HEAD = '#E3E4E6';
export const GREY_SHADE = '#C6C7CA';
export const GREY_BODY = '#3B3B42';
export const GREY_OUT = '#55565C';
export const HAIR = '#6B4630';

export const shade = (hex: string, f: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * f));
  const b = Math.min(255, Math.round((n & 255) * f));
  return `rgb(${r},${g},${b})`;
};

const Q = (x1: number, y1: number, x2: number, y2: number, bow: number) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bow;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

// ---------------- wajah profil (menghadap +x) ----------------
export const ProfileFaceR: React.FC<{cx: number; cy: number; R: number; face: Face}> = ({cx, cy, R, face}) => {
  const sw = R * 0.05;
  const ex = cx + R * 0.34, ey = cy - R * 0.03;
  const mx = cx + R * 0.50, my = cy + R * 0.30;
  const blushOp = face === 'happy' ? 0.55 : (face === 'worried' || face === 'scared') ? 0 : 0.35;
  return (
    <g stroke={INK} strokeWidth={sw} strokeLinecap="round" fill="none">
      {blushOp > 0 && <ellipse cx={cx + R * 0.24} cy={cy + R * 0.16} rx={R * 0.14} ry={R * 0.07} fill="#F0A18C" opacity={blushOp} stroke="none" />}
      {face === 'scared' ? (
        <>
          <ellipse cx={ex} cy={ey} rx={R * 0.105} ry={R * 0.135} fill="#FFFFFF" strokeWidth={sw * 0.8} />
          <circle cx={ex + R * 0.02} cy={ey} r={R * 0.05} fill={INK} stroke="none" />
        </>
      ) : (
        <ellipse cx={ex} cy={ey} rx={R * 0.052} ry={R * 0.08} fill={INK} stroke="none" />
      )}
      {(face === 'worried' || face === 'scared') && (
        <path d={`M ${cx + R * 0.08} ${ey - R * 0.27} L ${cx + R * 0.52} ${ey - R * 0.37}`} />
      )}
      {face === 'count' && <path d={`M ${cx + R * 0.10} ${ey - R * 0.31} L ${cx + R * 0.54} ${ey - R * 0.31}`} />}
      {face === 'solemn' && <path d={`M ${ex - R * 0.10} ${ey - R * 0.16} L ${ex + R * 0.10} ${ey - R * 0.16}`} />}
      {face === 'neutral' && <path d={`M ${mx - R * 0.11} ${my - R * 0.02} Q ${mx} ${my + R * 0.09} ${mx + R * 0.11} ${my - R * 0.02}`} />}
      {face === 'happy' && <path d={`M ${mx - R * 0.12} ${my - R * 0.03} Q ${mx} ${my + R * 0.14} ${mx + R * 0.12} ${my - R * 0.03}`} />}
      {face === 'worried' && <path d={`M ${mx - R * 0.10} ${my + R * 0.05} Q ${mx} ${my - R * 0.05} ${mx + R * 0.10} ${my + R * 0.05}`} />}
      {face === 'scared' && <circle cx={mx} cy={my} r={R * 0.075} />}
      {(face === 'count' || face === 'solemn') && <path d={`M ${mx - R * 0.09} ${my + R * 0.02} L ${mx + R * 0.09} ${my + R * 0.02}`} />}
    </g>
  );
};

// ---------------- wajah depan (dua mata) ----------------
export const FrontFaceR: React.FC<{cy: number; R: number; face: Face}> = ({cy, R, face}) => {
  const sw = R * 0.05;
  const ey = cy - R * 0.03, my = cy + R * 0.30;
  const blushOp = face === 'happy' ? 0.6 : (face === 'worried' || face === 'scared') ? 0 : 0.35;
  const eye = (s: number) => {
    const ex = s * R * 0.33;
    if (face === 'scared') return (
      <g key={s}>
        <ellipse cx={ex} cy={ey} rx={R * 0.105} ry={R * 0.135} fill="#FFFFFF" stroke={INK} strokeWidth={sw * 0.8} />
        <circle cx={ex} cy={ey} r={R * 0.05} fill={INK} stroke="none" />
      </g>
    );
    if (face === 'happy') return (
      <path key={s} d={`M ${ex - R * 0.10} ${ey + R * 0.03} Q ${ex} ${ey - R * 0.11} ${ex + R * 0.10} ${ey + R * 0.03}`} />
    );
    return <ellipse key={s} cx={ex} cy={ey} rx={R * 0.052} ry={R * 0.08} fill={INK} stroke="none" />;
  };
  return (
    <g stroke={INK} strokeWidth={sw} strokeLinecap="round" fill="none">
      {blushOp > 0 && (
        <>
          <ellipse cx={-R * 0.55} cy={cy + R * 0.16} rx={R * 0.14} ry={R * 0.07} fill="#F0A18C" opacity={blushOp} stroke="none" />
          <ellipse cx={R * 0.55} cy={cy + R * 0.16} rx={R * 0.14} ry={R * 0.07} fill="#F0A18C" opacity={blushOp} stroke="none" />
        </>
      )}
      {eye(-1)}{eye(1)}
      {(face === 'worried' || face === 'scared') && (
        <>
          <path d={`M ${-R * 0.50} ${ey - R * 0.22} L ${-R * 0.16} ${ey - R * 0.34}`} />
          <path d={`M ${R * 0.50} ${ey - R * 0.22} L ${R * 0.16} ${ey - R * 0.34}`} />
        </>
      )}
      {face === 'count' && (
        <>
          <path d={`M ${-R * 0.46} ${ey - R * 0.31} L ${-R * 0.20} ${ey - R * 0.31}`} />
          <path d={`M ${R * 0.46} ${ey - R * 0.31} L ${R * 0.20} ${ey - R * 0.31}`} />
        </>
      )}
      {face === 'solemn' && (
        <>
          <path d={`M ${-R * 0.43} ${ey - R * 0.16} L ${-R * 0.23} ${ey - R * 0.16}`} />
          <path d={`M ${R * 0.43} ${ey - R * 0.16} L ${R * 0.23} ${ey - R * 0.16}`} />
        </>
      )}
      {face === 'neutral' && <path d={`M ${-R * 0.11} ${my - R * 0.02} Q 0 ${my + R * 0.09} ${R * 0.11} ${my - R * 0.02}`} />}
      {face === 'happy' && <path d={`M ${-R * 0.13} ${my - R * 0.03} Q 0 ${my + R * 0.15} ${R * 0.13} ${my - R * 0.03}`} />}
      {face === 'worried' && <path d={`M ${-R * 0.10} ${my + R * 0.05} Q 0 ${my - R * 0.05} ${R * 0.10} ${my + R * 0.05}`} />}
      {face === 'scared' && <circle cx={0} cy={my} r={R * 0.075} />}
      {(face === 'count' || face === 'solemn') && <path d={`M ${-R * 0.09} ${my + R * 0.02} L ${R * 0.09} ${my + R * 0.02}`} />}
    </g>
  );
};

// ---------------- aksesori ----------------
const AccProfile: React.FC<{kind: RAccessory; cx: number; cy: number; R: number; accent: string}> = ({kind, cx, cy, R, accent}) => {
  const sw = Math.max(1.8, R * 0.045);
  if (kind === 'cap') return (
    <g>
      <path d={`M ${cx - R * 0.99} ${cy - R * 0.10} A ${R} ${R} 0 0 1 ${cx + R * 0.99} ${cy - R * 0.10} Z`} fill={accent} stroke={OUT} strokeWidth={sw} />
      <ellipse cx={cx + R * 1.04} cy={cy - R * 0.05} rx={R * 0.44} ry={R * 0.095} fill={shade(accent, 0.9)} stroke={OUT} strokeWidth={sw * 0.9} />
      <circle cx={cx} cy={cy - R * 0.99} r={R * 0.07} fill={shade(accent, 0.9)} />
    </g>
  );
  if (kind === 'driver') return (
    <g>
      <path d={`M ${cx - R * 0.97} ${cy - R * 0.14} L ${cx - R * 0.76} ${cy - R * 0.64} Q ${cx} ${cy - R * 0.76} ${cx + R * 0.76} ${cy - R * 0.64} L ${cx + R * 0.97} ${cy - R * 0.14} Z`} fill="#2E3D59" stroke={OUT} strokeWidth={sw} />
      <rect x={cx - R * 0.945} y={cy - R * 0.235} width={R * 1.89} height={R * 0.085} fill="#C9A227" />
      <ellipse cx={cx + R * 1.02} cy={cy - R * 0.06} rx={R * 0.42} ry={R * 0.09} fill="#24304A" stroke={OUT} strokeWidth={sw * 0.9} />
    </g>
  );
  if (kind === 'bow') return (
    <g transform={`translate(${cx + R * 0.46},${cy - R * 0.84})`} fill={accent} stroke={OUT} strokeWidth={sw * 0.9}>
      <path d={`M 0 0 L ${-R * 0.34} ${-R * 0.20} L ${-R * 0.30} ${R * 0.22} Z`} />
      <path d={`M 0 0 L ${R * 0.36} ${-R * 0.18} L ${R * 0.32} ${R * 0.24} Z`} />
      <circle cx={0} cy={0} r={R * 0.115} />
    </g>
  );
  if (kind === 'bun') return (
    <g>
      <path d={`M ${cx - R * 0.62} ${cy - R * 0.70} A ${R} ${R} 0 0 1 ${cx + R * 0.78} ${cy - R * 0.50}`} stroke={HAIR} strokeWidth={R * 0.11} fill="none" strokeLinecap="round" opacity={0.85} />
      <circle cx={cx + R * 0.55} cy={cy - R * 0.90} r={R * 0.30} fill={HAIR} stroke={OUT} strokeWidth={sw * 0.9} />
      <path d={`M ${cx + R * 0.42} ${cy - R * 1.03} Q ${cx + R * 0.55} ${cy - R * 1.11} ${cx + R * 0.68} ${cy - R * 1.03}`} stroke="#8A6248" strokeWidth={R * 0.05} fill="none" strokeLinecap="round" />
    </g>
  );
  if (kind === 'tuft') return (
    <g stroke="#5A4232" strokeWidth={R * 0.085} strokeLinecap="round" fill="none">
      <path d={`M ${cx - R * 0.30} ${cy - R * 0.88} Q ${cx - R * 0.34} ${cy - R * 1.22} ${cx - R * 0.10} ${cy - R * 1.16}`} />
      <path d={`M ${cx + R * 0.05} ${cy - R * 0.97} Q ${cx + R * 0.10} ${cy - R * 1.30} ${cx + R * 0.30} ${cy - R * 1.18}`} />
      <path d={`M ${cx + R * 0.38} ${cy - R * 0.86} Q ${cx + R * 0.52} ${cy - R * 1.12} ${cx + R * 0.62} ${cy - R * 0.98}`} />
    </g>
  );
  return null;
};

const AccFront: React.FC<{kind: RAccessory; cx: number; cy: number; R: number; accent: string}> = ({kind, cx, cy, R, accent}) => {
  const sw = Math.max(1.8, R * 0.045);
  if (kind === 'cap' || kind === 'driver') {
    const col = kind === 'driver' ? '#2E3D59' : accent;
    const brim = kind === 'driver' ? '#24304A' : shade(accent, 0.9);
    return (
      <g>
        {kind === 'driver' ? (
          <path d={`M ${cx - R * 0.97} ${cy - R * 0.14} L ${cx - R * 0.76} ${cy - R * 0.64} Q ${cx} ${cy - R * 0.76} ${cx + R * 0.76} ${cy - R * 0.64} L ${cx + R * 0.97} ${cy - R * 0.14} Z`} fill={col} stroke={OUT} strokeWidth={sw} />
        ) : (
          <path d={`M ${cx - R * 0.99} ${cy - R * 0.10} A ${R} ${R} 0 0 1 ${cx + R * 0.99} ${cy - R * 0.10} Z`} fill={col} stroke={OUT} strokeWidth={sw} />
        )}
        {kind === 'driver' && <rect x={cx - R * 0.945} y={cy - R * 0.235} width={R * 1.89} height={R * 0.085} fill="#C9A227" />}
        <path d={`M ${cx - R * 1.0} ${cy - R * 0.05} Q ${cx} ${cy + R * 0.11} ${cx + R * 1.0} ${cy - R * 0.05} L ${cx + R * 1.0} ${cy - R * 0.16} Q ${cx} ${cy} ${cx - R * 1.0} ${cy - R * 0.16} Z`} fill={brim} />
      </g>
    );
  }
  return <AccProfile kind={kind} cx={cx} cy={cy} R={R} accent={accent} />;
};

// ---------------- badan (dipakai profil & depan) ----------------
const Torso: React.FC<{h: number; shirt: string; black?: boolean}> = ({h, shirt, black}) => {
  const tY = -h * 0.475, tB = -h * 0.145, tW = h * 0.148, hh = tB - tY;
  return (
    <g>
      <rect x={-tW} y={tY + h * 0.016} width={tW * 2} height={hh} rx={h * 0.075} fill={shade(shirt, 0.84)} />
      <rect x={-tW} y={tY} width={tW * 2} height={hh} rx={h * 0.075} fill={shirt} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(2, h * 0.011)} />
      {!black && <ellipse cx={0} cy={tY + h * 0.012} rx={h * 0.052} ry={h * 0.02} fill={HEAD} opacity={0.9} />}
    </g>
  );
};

const Leg: React.FC<{hipX: number; hipY: number; fx: number; fy: number; h: number; pants: string; dark?: boolean; black?: boolean}> =
({hipX, hipY, fx, fy, h, pants, dark, black}) => {
  const col = dark ? shade(pants, 0.8) : pants;
  return (
    <g>
      <path d={Q(hipX, hipY, fx, fy - h * 0.03, h * 0.02)} stroke={col} strokeWidth={h * 0.08} fill="none" strokeLinecap="round" />
      <ellipse cx={fx + h * 0.014} cy={fy - h * 0.013} rx={h * 0.05} ry={h * 0.019} fill={black ? '#26262C' : '#5C4033'} />
    </g>
  );
};

const Arm: React.FC<{sx: number; sy: number; hx: number; hy: number; h: number; shirt: string; skin: string; dark?: boolean; black?: boolean}> =
({sx, sy, hx, hy, h, shirt, skin, dark, black}) => (
  <g>
    <path d={Q(sx, sy, hx, hy, h * 0.025)} stroke={dark ? shade(shirt, 0.84) : shirt} strokeWidth={h * 0.07} fill="none" strokeLinecap="round" />
    <circle cx={hx} cy={hy} r={h * 0.033} fill={skin} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(1.4, h * 0.007)} />
  </g>
);

// ---------------- karakter profil ----------------
export interface RoundProps {
  x: number; y: number; h: number;
  color?: string;
  accent?: string;
  shirt?: string;
  pants?: string;
  accessory?: RAccessory;
  face?: Face;
  flip?: boolean;
  walk?: number;
  armPose?: 'swing' | 'down' | 'wheel' | 'knock' | 'tally';
  knockP?: number;
  lean?: number;
  bob?: number;
  opacity?: number;
}

export const Round: React.FC<RoundProps> = (p) => {
  const h = p.h;
  const black = p.accessory === 'black';
  const shirt = black ? GREY_BODY : (p.shirt ?? p.accent ?? '#7A9CC4');
  const pants = black ? '#2E2E34' : (p.pants ?? '#54483C');
  const skin = black ? GREY_HEAD : HEAD;
  const R = h * 0.28, headCY = -h + R;
  const walking = p.walk !== undefined;
  const ph = p.walk ?? 0;
  const bob = (p.bob ?? 0) * (black ? 0.35 : 1) + (walking ? Math.abs(Math.sin(ph)) * h * 0.012 : 0);
  const leanDeg = p.lean ?? (walking ? 4 : 0);

  const hipY = -h * 0.16;
  const lift = (phase: number) => -Math.max(0, Math.sin(phase + Math.PI / 2)) * h * 0.05;
  const legF = walking ? {fx: Math.sin(ph) * h * 0.15, fy: lift(ph)} : {fx: h * 0.068, fy: 0};
  const legB = walking ? {fx: Math.sin(ph + Math.PI) * h * 0.15, fy: lift(ph + Math.PI)} : {fx: -h * 0.068, fy: 0};

  const shY = -h * 0.435;
  const swingAmp = black ? 0.35 : 1;
  let handF = {x: h * 0.185, y: -h * 0.205}, handB = {x: -h * 0.185, y: -h * 0.205};
  if (walking) {
    handF = {x: h * 0.185 + Math.sin(ph + Math.PI) * h * 0.085 * swingAmp, y: -h * 0.21};
    handB = {x: -h * 0.185 + Math.sin(ph) * h * 0.085 * swingAmp, y: -h * 0.21};
  }
  if (p.armPose === 'wheel') { handF = {x: h * 0.235, y: -h * 0.50}; handB = {x: h * 0.165, y: -h * 0.425}; }
  if (p.armPose === 'tally') { handF = {x: h * 0.20, y: -h * 0.36}; handB = {x: h * 0.10, y: -h * 0.29}; }
  if (p.armPose === 'knock') {
    const k = p.knockP ?? 0;
    handF = {x: h * (0.24 + 0.10 * k), y: -h * (0.55 + 0.05 * k)};
    handB = {x: -h * 0.17, y: -h * 0.21};
  }

  return (
    <g transform={`translate(${p.x},${p.y - bob}) scale(${p.flip ? -1 : 1},1)`} opacity={p.opacity ?? 1}>
      <g transform={`rotate(${leanDeg} 0 0)`}>
        <Arm sx={-h * 0.13} sy={shY} hx={handB.x} hy={handB.y} h={h} shirt={shirt} skin={skin} dark black={black} />
        <Leg hipX={-h * 0.055} hipY={hipY} fx={legB.fx} fy={legB.fy} h={h} pants={pants} dark black={black} />
        <Torso h={h} shirt={shirt} black={black} />
        <Leg hipX={h * 0.055} hipY={hipY} fx={legF.fx} fy={legF.fy} h={h} pants={pants} black={black} />
        <Arm sx={h * 0.13} sy={shY} hx={handF.x} hy={handF.y} h={h} shirt={shirt} skin={skin} black={black} />
        {/* kepala: bayangan lembut di bawah + lingkaran utama */}
        <circle cx={0} cy={headCY + h * 0.016} r={R} fill={black ? GREY_SHADE : HEAD_SHADE} />
        <circle cx={0} cy={headCY} r={R} fill={black ? GREY_HEAD : HEAD} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(2, h * 0.011)} />
        {!black && <ProfileFaceR cx={0} cy={headCY} R={R} face={p.face ?? 'neutral'} />}
        {!black && p.accessory && p.accessory !== 'none' && (
          <AccProfile kind={p.accessory} cx={0} cy={headCY} R={R} accent={p.accent ?? '#C8372D'} />
        )}
      </g>
    </g>
  );
};

// ---------------- karakter tampak depan (reveal) ----------------
export const RoundFront: React.FC<{
  x: number; y: number; h: number; color?: string; accent?: string; shirt?: string; pants?: string;
  accessory?: RAccessory; face?: Face; tilt?: number; opacity?: number; sweat?: boolean;
}> = (p) => {
  const h = p.h;
  const black = p.accessory === 'black';
  const shirt = black ? GREY_BODY : (p.shirt ?? p.accent ?? '#7A9CC4');
  const pants = black ? '#2E2E34' : (p.pants ?? '#54483C');
  const skin = black ? GREY_HEAD : HEAD;
  const R = h * 0.28, headCY = -h + R;
  const hipY = -h * 0.16, shY = -h * 0.435;
  return (
    <g transform={`translate(${p.x},${p.y})`} opacity={p.opacity ?? 1}>
      <Arm sx={-h * 0.13} sy={shY} hx={-h * 0.195} hy={-h * 0.21} h={h} shirt={shirt} skin={skin} dark black={black} />
      <Leg hipX={-h * 0.055} hipY={hipY} fx={-h * 0.068} fy={0} h={h} pants={pants} dark black={black} />
      <Torso h={h} shirt={shirt} black={black} />
      <Leg hipX={h * 0.055} hipY={hipY} fx={h * 0.068} fy={0} h={h} pants={pants} black={black} />
      <Arm sx={h * 0.13} sy={shY} hx={h * 0.195} hy={-h * 0.21} h={h} shirt={shirt} skin={skin} black={black} />
      <g transform={`rotate(${p.tilt ?? 0} 0 ${headCY})`}>
        <circle cx={0} cy={headCY + h * 0.016} r={R} fill={black ? GREY_SHADE : HEAD_SHADE} />
        <circle cx={0} cy={headCY} r={R} fill={black ? GREY_HEAD : HEAD} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(2, h * 0.011)} />
        {!black && <FrontFaceR cy={headCY} R={R} face={p.face ?? 'neutral'} />}
        {!black && p.accessory && p.accessory !== 'none' && (
          <AccFront kind={p.accessory} cx={0} cy={headCY} R={R} accent={p.accent ?? '#C8372D'} />
        )}
        {p.sweat && !black && (
          <path d={`M ${R * 1.10} ${headCY - R * 0.28} q ${R * 0.20} ${R * 0.38} 0 ${R * 0.50} q ${-R * 0.20} ${-R * 0.12} 0 ${-R * 0.50}`} fill="#9FD3E8" />
        )}
      </g>
    </g>
  );
};

// ---------------- kepala + bahu anak duduk (di atas sandaran kursi bus) ----------------
export const SeatedRound: React.FC<{
  x: number; y: number; s: number; accent: string; accessory?: RAccessory; face?: Face; black?: boolean;
}> = ({x, y, s, accent, accessory, face, black}) => {
  const R = 44 * s;
  const shirt = black ? GREY_BODY : accent;
  const torso = `M ${-1.30 * R} ${2.30 * R} L ${-1.30 * R} ${1.02 * R} Q ${-1.30 * R} ${0.40 * R} ${-0.52 * R} ${0.38 * R} L ${0.52 * R} ${0.38 * R} Q ${1.30 * R} ${0.40 * R} ${1.30 * R} ${1.02 * R} L ${1.30 * R} ${2.30 * R} Z`;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={torso} transform={`translate(0,${R * 0.05})`} fill={shade(shirt, 0.84)} />
      <path d={torso} fill={shirt} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(2, R * 0.05)} />
      <circle cx={0} cy={R * 0.05} r={R} fill={black ? GREY_SHADE : HEAD_SHADE} />
      <circle cx={0} cy={0} r={R} fill={black ? GREY_HEAD : HEAD} stroke={black ? GREY_OUT : OUT} strokeWidth={Math.max(2, R * 0.05)} />
      {!black && <ProfileFaceR cx={0} cy={0} R={R} face={face ?? 'neutral'} />}
      {!black && accessory && accessory !== 'none' && (
        <AccProfile kind={accessory} cx={0} cy={0} R={R} accent={accent} />
      )}
    </g>
  );
};
