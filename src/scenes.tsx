// scenes.tsx — "The Seventh Knock", LANDSCAPE 1920x1080 native layout.
// Frame-driven everywhere: drifting clouds, flicker, bob, walk, knock ripples.
import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import cues from './cues.json';
import {Round, RoundFront} from './round2d';
import type {Face} from './stick2d';

export const FPS = 30;
export const lin = (f: number, a: number, b: number, x = 0, y = 1) =>
  interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});

const rnd = (seed: number) => { const x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); };
const STARS = Array.from({length: 90}, (_, i) => ({x: rnd(i + 1) * 1920, y: rnd(i + 31) * 480, r: 1.5 + rnd(i + 61) * 2.2, p: rnd(i + 91) * 6.28}));
const GY = 905; // ground line

export interface ShotProps {seg: number; scene: number; face: Face; face2: Face; durF: number; start: number}

const Stars: React.FC<{f: number}> = ({f}) => (
  <g>{STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF6D8" opacity={0.35 + 0.3 * Math.sin(f * 0.05 + s.p)} />)}</g>
);
const Clouds: React.FC<{f: number; dark?: boolean}> = ({f, dark}) => {
  const col = dark ? '#232C4E' : '#46538A';
  return (<g fill={col}>{[0, 1, 2].map((i) => {
    const x = ((f * (0.22 + i * 0.07) + i * 700) % 2300) - 200;
    const y = 70 + i * 80;
    return (<g key={i}><ellipse cx={x} cy={y} rx={150} ry={40} /><ellipse cx={x + 80} cy={y + 12} rx={110} ry={32} /><ellipse cx={x - 85} cy={y + 14} rx={95} ry={28} /></g>);
  })}</g>);
};
const Shadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (<ellipse cx={x} cy={y} rx={w} ry={w * 0.15} fill="#000" opacity={0.22} />);
const KnockRipples: React.FC<{start: number; f: number; x: number; y: number}> = ({start, f, x, y}) => {
  const t = start + f / FPS;
  return (<g>{cues.ev.knocks.filter((k) => t - k > 0 && t - k < 0.65).map((k, i) => {
    const p = (t - k) / 0.65;
    return (<g key={i}><circle cx={x} cy={y} r={20 + p * 120} fill="none" stroke="#FFD98A" strokeWidth={5 * (1 - p)} opacity={0.75 * (1 - p)} />
      <circle cx={x} cy={y} r={10 + p * 64} fill="none" stroke="#FFF3D0" strokeWidth={3 * (1 - p)} opacity={0.6 * (1 - p)} /></g>);
  })}</g>);
};
const Tally: React.FC<{n: number; x: number; y: number; col?: string; s?: number}> = ({n, x, y, col = '#D8C9A8', s = 1}) => (
  <g stroke={col} strokeWidth={6 * s} strokeLinecap="round">
    {Array.from({length: n}, (_, i) => {
      const gx = x + Math.floor(i / 5) * 88 * s, gi = i % 5;
      return gi < 4
        ? <line key={i} x1={gx + gi * 19 * s} y1={y} x2={gx + gi * 19 * s - 4 * s} y2={y + 56 * s} />
        : <line key={i} x1={gx - 7 * s} y1={y + 43 * s} x2={gx + 68 * s} y2={y + 11 * s} />;
    })}
  </g>
);
const HouseShape: React.FC<{x: number; y: number; s: number; glow: number; f: number}> = ({x, y, s, glow, f}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-300} y={-430} width={600} height={430} fill="#5D4A38" />
    <path d="M -345 -430 L 0 -650 L 345 -430 Z" fill="#3E2F24" />
    <rect x={-52} y={-190} width={104} height={190} fill="#332619" />
    {[-190, 95].map((wx, i) => (
      <g key={i}><rect x={wx} y={-365} width={115} height={125} fill={glow > 0 ? `rgba(255,${150 + Math.round(60 * Math.sin(f * 0.6 + i * 2))},60,${0.55 + glow * 0.45})` : '#FFE9A8'} stroke="#332619" strokeWidth={8} />
      <line x1={wx + 57} y1={-365} x2={wx + 57} y2={-240} stroke="#332619" strokeWidth={6} /></g>
    ))}
    <rect x={165} y={-565} width={54} height={115} fill="#4A382A" />
  </g>
);

export const SceneView: React.FC<ShotProps> = (p) => {
  const f = useCurrentFrame();
  const prog = Math.min(1, f / Math.max(1, p.durF));
  const face: Face = prog < 0.52 ? p.face : p.face2;
  const bob = Math.sin(f * 0.09) * 4;
  const walkPh = f * 0.32;
  const seg = p.seg;
  const nightNo: Record<number, number> = {1: 1, 4: 2, 7: 3, 10: 4, 13: 5, 19: 6};

  if (p.scene === 1) { // bedroom night, wide
    const lamp = 0.82 + 0.18 * Math.sin(f * 0.7) * Math.sin(f * 0.13);
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#2A3358" />
      <rect x={1330} y={110} width={430} height={400} fill="#141B36" stroke="#0E1430" strokeWidth={14} />
      <circle cx={1560} cy={250} r={66} fill="#F7E8B0" /><circle cx={1540} cy={235} r={10} fill="#E8D48F" /><circle cx={1590} cy={285} r={8} fill="#E8D48F" />
      <rect x={1330} y={302} width={430} height={13} fill="#0E1430" /><rect x={1538} y={110} width={13} height={400} fill="#0E1430" />
      <Stars f={f} />
      <rect x={0} y={860} width={1920} height={220} fill="#3B2C20" />
      <rect x={90} y={330} width={290} height={530} fill="#33406E" stroke="#232C52" strokeWidth={10} />
      <circle cx={345} cy={600} r={12} fill="#C9A227" />
      {/* bed left-center */}
      <g><rect x={520} y={700} width={700} height={80} rx={24} fill="#7A4A3A" />
        <rect x={520} y={762} width={700} height={110} rx={18} fill="#C9D4E8" />
        <rect x={545} y={712} width={210} height={66} rx={28} fill="#FFF6E8" />
        <rect x={520} y={700} width={64} height={185} rx={20} fill="#5D382B" /></g>
      {/* lamp right */}
      <rect x={1660} y={760} width={150} height={24} fill="#5D382B" />
      <circle cx={1735} cy={690} r={50} fill="#FFD98A" opacity={lamp} />
      <rect x={1728} y={736} width={13} height={52} fill="#5D382B" />
      <Shadow x={420} y={918} w={115} />
      {seg === 23
        ? <Round x={420} y={GY} h={420} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} armPose="knock" knockP={0.5 + 0.5 * Math.sin(f * 0.25)} />
        : <RoundFront x={420} y={GY} h={430} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} sweat={face === 'scared'} tilt={Math.sin(f * 0.05) * 2} />}
      <KnockRipples start={p.start} f={f} x={235} y={560} />
    </svg>);
  }
  if (p.scene === 2) { // hallway / wall, wide
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#4A3B57" />
      {Array.from({length: 48}, (_, i) => <circle key={i} cx={70 + (i % 12) * 160} cy={110 + Math.floor(i / 12) * 210} r={9} fill="#5D4C6E" />)}
      <rect x={1080} y={130} width={720} height={730} fill="#6E5A44" stroke="#54432F" strokeWidth={12} />
      {Array.from({length: 8}, (_, i) => <line key={i} x1={1140 + i * 82} y1={150} x2={1140 + i * 82} y2={840} stroke="#5D4A36" strokeWidth={5} />)}
      <rect x={0} y={860} width={1920} height={220} fill="#33261D" />
      {nightNo[seg] && <Tally n={nightNo[seg]} x={1180} y={250} />}
      {seg === 15 ? (<>
        <Shadow x={1000} y={922} w={165} />
        <RoundFront x={1000} y={GY} h={610} accessory="black" />
        <RoundFront x={420} y={GY} h={370} shirt="#F2B134" accent="#C8372D" accessory="tuft" face="scared" sweat tilt={-3} />
      </>) : (<>
        <Shadow x={640} y={918} w={115} />
        <Round x={640} y={GY} h={420} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} armPose={seg === 14 ? 'knock' : 'down'} knockP={0.5 + 0.5 * Math.sin(f * 0.3)} lean={seg === 2 ? 7 : 0} />
      </>)}
      <KnockRipples start={p.start} f={f} x={1440} y={480} />
    </svg>);
  }
  if (p.scene === 3) { // kitchen, wide
    const sun = lin(f, 0, p.durF, -26, 26);
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#F3E3C2" />
      <rect x={1300} y={120} width={400} height={330} fill="#BFE0EE" stroke="#8A6B48" strokeWidth={14} />
      <circle cx={1500 + sun} cy={230} r={54} fill="#FFD93C" />
      <rect x={120} y={150} width={300} height={220} rx={14} fill="#D9B98A" stroke="#8A6B48" strokeWidth={8} />
      <rect x={0} y={850} width={1920} height={230} fill="#C89B6A" />
      <rect x={260} y={690} width={1400} height={52} rx={16} fill="#8A5A34" />
      {[-560, -190, 190, 560].map((dx, i) => <rect key={i} x={960 + dx - 20} y={742} width={40} height={190} fill="#6E4526" />)}
      <ellipse cx={620} cy={668} rx={86} ry={24} fill="#FFF" /><ellipse cx={620} cy={660} rx={62} ry={16} fill="#E8B04B" />
      <ellipse cx={1300} cy={668} rx={86} ry={24} fill="#FFF" /><ellipse cx={1300} cy={660} rx={62} ry={16} fill="#E8B04B" />
      <Shadow x={470} y={862} w={100} /><Shadow x={1450} y={862} w={105} /><Shadow x={960} y={862} w={95} />
      <RoundFront x={470} y={850} h={440} shirt="#3FA08C" accessory="bun" face={seg === 10 ? 'worried' : 'happy'} />
      <RoundFront x={1450} y={850} h={470} shirt="#5B84AE" accessory="tuft" face={seg === 10 ? 'solemn' : 'happy'} />
      <RoundFront x={960} y={850 + bob * 0.4} h={400} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} sweat={seg === 10 && face === 'scared'} />
    </svg>);
  }
  if (p.scene === 4) { // library, wide
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#4E3B2C" />
      {[60, 420, 1320, 1680 - 180].map((bx, bi) => bi < 4 ? (<g key={bi}>
        <rect x={bx} y={120} width={300} height={640} fill="#5D4630" stroke="#3B2A1A" strokeWidth={10} />
        {[0, 1].map((sh) => (<g key={sh}><rect x={bx + 14} y={430 + sh * 300} width={272} height={15} fill="#3B2A1A" />
          {Array.from({length: 7}, (_, i) => <rect key={i} x={bx + 26 + i * 37} y={185 + sh * 300 + (i % 3) * 8} width={27} height={238 - (i % 3) * 8} fill={['#B5543F', '#4F79A8', '#C9A227', '#5F9E6E', '#8A5FA0', '#D07B3F', '#54707E'][(i + bi + sh) % 7]} />)}
        </g>))}
      </g>) : null)}
      <rect x={0} y={850} width={1920} height={230} fill="#3A2A1C" />
      <rect x={740} y={250} width={440} height={300} rx={16} fill="#101418" stroke="#C9C9C9" strokeWidth={9} />
      <rect x={762} y={272} width={396} height={256} fill="#1E2E26" />
      {Array.from({length: 5}, (_, i) => <rect key={i} x={786} y={306 + i * 44} width={lin(f, 10 + i * 16, 40 + i * 16, 0, 320 - (i % 3) * 60)} height={20} fill="#9FE8B8" opacity={0.85} />)}
      <Shadow x={470} y={862} w={105} /><Shadow x={1500} y={862} w={95} />
      <RoundFront x={470} y={850} h={450} shirt="#8A5FA0" accessory="bun" face={seg === 6 ? 'solemn' : 'neutral'} />
      <Round x={1500} y={850} h={400} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} flip />
    </svg>);
  }
  if (p.scene === 6) { // basement, wide
    const flame = 0.8 + 0.25 * Math.sin(f * 0.9) + 0.1 * Math.sin(f * 2.3);
    const torchOn = seg >= 16;
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#191922" />
      {Array.from({length: 12}, (_, i) => <rect key={i} x={80 + i * 160} y={0} width={10} height={1080} fill="#20202B" />)}
      <path d="M 100 90 L 1500 90 Q 1580 90 1580 170 L 1580 420" stroke="#3E4A55" strokeWidth={42} fill="none" />
      <path d="M 320 0 L 320 300 Q 320 380 400 380 L 900 380" stroke="#333D47" strokeWidth={30} fill="none" />
      <rect x={0} y={880} width={1920} height={200} fill="#101016" />
      <g transform="translate(1560,880)"><rect x={-175} y={-560} width={350} height={560} rx={30} fill="#37404A" stroke="#232A31" strokeWidth={10} />
        <rect x={-98} y={-430} width={196} height={230} rx={16} fill="#14100C" />
        <path d={`M 0 -215 Q ${-38 * flame} ${-300 * flame} 0 ${-395 * flame} Q ${40 * flame} ${-300 * flame} 0 -215`} fill="#FF8B2A" opacity={0.92} />
        <path d={`M 0 -225 Q ${-18 * flame} ${-275 * flame} 0 ${-330 * flame} Q ${20 * flame} ${-275 * flame} 0 -225`} fill="#FFD93C" />
        <circle cx={-125} cy={-90} r={17} fill="#7EE787" opacity={0.7 + 0.3 * Math.sin(f * 0.2)} /></g>
      {seg === 17 && <ellipse cx={1470} cy={520} rx={130 + 30 * Math.sin(f * 0.3)} ry={26} fill="#B8E986" opacity={0.16 + 0.05 * Math.sin(f * 0.5)} />}
      {torchOn && <polygon points={`620,${640 + bob} 1420,${470 + 50 * Math.sin(f * 0.11)} 1420,${800 + 50 * Math.sin(f * 0.11)}`} fill="#FFE9A8" opacity={0.13 + 0.03 * Math.sin(f * 1.7)} />}
      <Shadow x={560} y={892} w={115} />
      {seg === 11
        ? <><RoundFront x={560} y={880} h={460} shirt="#5B84AE" accessory="tuft" face={face} />
            <RoundFront x={250} y={880} h={390} shirt="#F2B134" accent="#C8372D" accessory="tuft" face="neutral" /></>
        : <Round x={560} y={880} h={430} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} walk={prog < 0.3 ? walkPh : undefined} sweat={face === 'scared'} />}
    </svg>);
  }
  if (p.scene === 7) { // bathroom mirror, wide
    const fog = lin(f, p.durF * 0.45, p.durF * 0.95, 0, 0.55);
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#BCD8D2" />
      {Array.from({length: 6}, (_, r) => Array.from({length: 11}, (_, c) => <rect key={`${r}-${c}`} x={c * 176 + 3} y={r * 176 + 3} width={170} height={170} fill={(r + c) % 2 ? '#C8E2DC' : '#B2CFC8'} />))}
      <rect x={560} y={90} width={800} height={620} rx={24} fill="#8FB6E8" stroke="#6E7B84" strokeWidth={15} />
      <g opacity={prog < 0.5 ? 0.22 : lin(f, p.durF * 0.5, p.durF * 0.7, 0.22, 0.95)}>
        <RoundFront x={1150} y={690} h={520} accessory="black" />
      </g>
      <RoundFront x={790} y={695} h={560} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={prog < 0.5 ? 'neutral' : 'scared'} />
      <ellipse cx={960} cy={400} rx={390} ry={300} fill="#FFFFFF" opacity={fog} />
      <rect x={0} y={880} width={1920} height={200} fill="#7FA8A0" />
      <rect x={740} y={760} width={440} height={130} rx={28} fill="#FFFFFF" stroke="#6E7B84" strokeWidth={8} />
      <ellipse cx={960} cy={786} rx={155} ry={32} fill="#DDEBE8" />
      <Shadow x={300} y={892} w={100} />
      <RoundFront x={300} y={880} h={320} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} sweat />
    </svg>);
  }
  if (p.scene === 8) { // attic, wide
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#3A2C20" />
      <path d="M 0 480 L 960 60 L 1920 480 L 1920 380 L 960 -40 L 0 380 Z" fill="#2C2016" />
      <line x1={960} y1={40} x2={960} y2={620} stroke="#241A10" strokeWidth={26} />
      <circle cx={960} cy={250} r={80} fill="#FFE9A8" opacity={0.15} /><circle cx={960} cy={250} r={32} fill="#FFD93C" opacity={0.9} />
      {Array.from({length: 18}, (_, i) => <circle key={i} cx={140 + rnd(i + 3) * 1640} cy={180 + ((f * (0.4 + rnd(i) * 0.5) + rnd(i + 9) * 620) % 640)} r={3.4} fill="#E8DCC2" opacity={0.5} />)}
      <rect x={0} y={870} width={1920} height={210} fill="#2A1E14" />
      <g transform={`translate(880,${430 + Math.sin(f * 0.04) * 5}) rotate(${Math.sin(f * 0.05) * 1.6})`}>
        <rect x={-200} y={-265} width={400} height={520} rx={12} fill="#EDE4CE" stroke="#8A7A5C" strokeWidth={8} />
        <circle cx={0} cy={-100} r={98} fill="#F7E8B0" /><circle cx={0} cy={-107} r={72} fill="#FFEFC4" />
        <g opacity={prog < 0.55 ? 0 : lin(f, p.durF * 0.55, p.durF * 0.75)} stroke="#201408" strokeWidth={9} strokeLinecap="round">
          <line x1={-64} y1={-172} x2={64} y2={-36} /><line x1={64} y1={-172} x2={-64} y2={-36} /></g>
        {Array.from({length: 9}, (_, i) => <circle key={i} cx={-140 + i * 35} cy={175} r={10} fill="#E86A4A" opacity={0.9} />)}
      </g>
      <rect x={130} y={660} width={340} height={210} rx={14} fill="#6E4F30" stroke="#4A3420" strokeWidth={9} />
      <rect x={130} y={612} width={340} height={64} rx={14} fill="#7D5B38" stroke="#4A3420" strokeWidth={9} />
      <Shadow x={1520} y={882} w={100} />
      <Round x={1520} y={870} h={400} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} flip armPose="tally" />
    </svg>);
  }
  if (p.scene === 9) { // fire night street, wide
    const flash = Math.sin(f * 0.55) > 0;
    return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#141A30" /><Stars f={f} />
      <rect width={1920} height={340} fill={flash ? '#FF3B30' : '#3B82F6'} opacity={0.10} />
      <HouseShape x={960} y={800} s={1.05} glow={seg === 18 ? 0.25 : 0.85} f={f} />
      <rect x={0} y={800} width={1920} height={280} fill="#232030" />
      <rect x={0} y={800} width={1920} height={22} fill="#3A3648" />
      <Shadow x={380} y={902} w={100} /><Shadow x={800} y={902} w={110} /><Shadow x={1180} y={902} w={100} /><Shadow x={1560} y={902} w={95} />
      <RoundFront x={380} y={890} h={430} shirt="#3FA08C" accessory="bun" face="worried" />
      <RoundFront x={545} y={890} h={245} shirt="#F28BB4" accessory="bow" accent="#F28BB4" face="neutral" />
      <RoundFront x={800} y={890 + bob * 0.3} h={405} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} sweat={seg === 18} />
      <RoundFront x={1180} y={890} h={465} shirt="#5B84AE" accessory="tuft" face={face} />
      {seg === 18 && <g>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={300 + i * 330} cy={200 + 36 * Math.sin(f * 0.3 + i)} r={10} fill="#FFB35C" opacity={0.8} />)}</g>}
    </svg>);
  }
  // scene 10 — dawn / resolution, wide
  const dawn = lin(f, 0, p.durF, 0, 0.35);
  return (<svg width={1920} height={1080} viewBox="0 0 1920 1080">
    <rect width={1920} height={1080} fill="#2E3D5C" />
    <rect width={1920} height={1080} fill="#F2A65A" opacity={0.25 + dawn} />
    <circle cx={1560} cy={330 - dawn * 160} r={84} fill="#FFD93C" />
    <Clouds f={f} />
    <HouseShape x={620} y={810} s={1.0} glow={0} f={f} />
    <rect x={0} y={810} width={1920} height={270} fill="#4C4438" />
    {seg === 20 && (<g><rect x={1250} y={180} width={520} height={520} fill="#6E5A44" stroke="#54432F" strokeWidth={10} />
      <Tally n={23} x={1300} y={250} s={0.92} />
      <text x={1510} y={620} textAnchor="middle" fontFamily="Pop" fontWeight={900} fontSize={58} fill="#FFD98A">LISTEN</text></g>)}
    {seg === 21 && (<g transform={`translate(1420,${450 + Math.sin(f * 0.05) * 5})`}>
      <rect x={-185} y={-245} width={370} height={490} rx={12} fill="#EDE4CE" stroke="#8A7A5C" strokeWidth={8} />
      <RoundFront x={0} y={115} h={325} shirt="#7A7A85" face="happy" /></g>)}
    <Shadow x={seg === 20 || seg === 21 ? 1000 : 1180} y={902} w={105} />
    <RoundFront x={seg === 20 || seg === 21 ? 1000 : 1180} y={890} h={425} shirt="#F2B134" accent="#C8372D" accessory="tuft" face={face} />
    {seg === 22 && <><Shadow x={1560} y={902} w={90} />
    <RoundFront x={1560} y={890} h={375} shirt="#F28BB4" accessory="bow" accent="#F28BB4" face="happy" />
    <RoundFront x={830} y={890} h={445} shirt="#3FA08C" accessory="bun" face="happy" /></>}
  </svg>);
};
