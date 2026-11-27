import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame, staticFile, Easing, delayRender, continueRender} from 'remotion';
import cues from './cues.json';
import {SceneView, lin} from './scenes';
import type {Face} from './stick2d';

export const FPS = 30, W = 1920, H = 1080;
const fr = (s: number) => Math.round(s * FPS);
const spr = (frame: number, delay = 0, damping = 11, stiffness = 170) =>
  spring({frame: Math.max(0, frame - delay), fps: FPS, config: {damping, stiffness, mass: 0.7}});

export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([
      new FontFace('Pop', `url(${staticFile('pop-900.woff2')})`, {weight: '900'}).load(),
      new FontFace('Pop', `url(${staticFile('pop-600.woff2')})`, {weight: '600'}).load(),
    ]).then((fs) => { fs.forEach((x) => (document as any).fonts.add(x)); continueRender(h); })
      .catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

const Cam: React.FC<{durF: number; seed: number; children: React.ReactNode}> = ({durF, seed, children}) => {
  const f = useCurrentFrame();
  const z = lin(f, 0, durF, 1.02, 1.09 + (seed % 3) * 0.012);
  const fx = 960 + ((seed * 67) % 200) - 100, fy = 560 + ((seed * 41) % 120) - 60;
  const tx = z * (960 - fx), ty = z * (540 - fy) * 0.5;
  const dip = Math.min(interpolate(f, [0, 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
                       interpolate(f, [durF - 7, durF], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{opacity: dip}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const OUTLINE = '3px 3px 0 #140D08, -3px 3px 0 #140D08, 3px -3px 0 #140D08, -3px -3px 0 #140D08, 0 6px 0 #140D08, 0 -3px 0 #140D08, 3px 0 0 #140D08, -3px 0 0 #140D08';

const KineticWords: React.FC<{text: string; frame: number; delay?: number; size: number; color: string}> =
({text, frame, delay = 0, size, color}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: size * 0.25, fontFamily: 'Pop', fontWeight: 900, fontSize: size, lineHeight: 1.05, color}}>
    {text.split(' ').map((w, i) => {
      const p = spr(frame, delay + i * 3, 10, 190);
      return (<span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12}}>
        <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 6}deg)`}}>{w}</span></span>);
    })}
  </div>
);

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const endF = fr(cues.shots[0].end - cues.shots[0].start);
  const out = lin(f, endF - 12, endF, 1, 0);
  return (
    <AbsoluteFill style={{opacity: out, zIndex: 12}}>
      <div style={{position: 'absolute', top: 84, left: 60, right: 60, textAlign: 'center'}}>
        <div style={{fontFamily: 'Pop', fontWeight: 600, fontSize: 38, letterSpacing: 12, color: '#C9A227', textShadow: OUTLINE, opacity: lin(f, 2, 12)}}>A STORY IN 23 KNOCKS</div>
        <div style={{marginTop: 22}}><KineticWords text="THE SEVENTH" frame={f} delay={8} size={92} color="#FFFFFF" /></div>
        <div style={{marginTop: 4}}><KineticWords text="KNOCK" frame={f} delay={15} size={128} color="#FFC93C" /></div>
      </div>
    </AbsoluteFill>
  );
};

// captions: per SENTENCE, top band
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const ch = cues.chunks.find((c) => t >= c.t0 && t < c.t1);
  if (!ch || ch.seg === 1) return null;
  if (t >= cues.ev.endcard_at) return null;
  const local = Math.round((t - ch.t0) * FPS);
  const p = spr(local, 0, 12, 200);
  return (
    <div style={{position: 'absolute', bottom: 44, left: 190, right: 190, textAlign: 'center', zIndex: 15}}>
      <span style={{display: 'inline-block', fontFamily: 'Pop', fontWeight: 900, fontSize: 47, lineHeight: 1.18,
        color: '#FFFFFF', textShadow: OUTLINE, background: 'rgba(8,6,16,0.55)', borderRadius: 18, padding: '10px 26px',
        transform: `scale(${0.94 + 0.06 * p})`}}>{ch.text}</span>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const cardF = fr(cues.ev.endcard_at);
  if (f < cardF) return null;
  const lf = f - cardF;
  const p = spr(lf, 0, 12, 160);
  return (
    <AbsoluteFill style={{zIndex: 16}}>
      <AbsoluteFill style={{background: '#07070F', opacity: lin(lf, 0, 12, 0, 0.62)}} />
      <div style={{position: 'absolute', top: 300, left: 60, right: 60, textAlign: 'center', transform: `scale(${0.9 + 0.1 * p})`, opacity: lin(lf, 0, 9)}}>
        <div style={{fontFamily: 'Pop', fontWeight: 900, fontSize: 96, lineHeight: 1.06, color: '#FFFFFF', textShadow: OUTLINE}}>THE SEVENTH<br /><span style={{color: '#FFC93C'}}>KNOCK</span></div>
        <div style={{marginTop: 40, fontFamily: 'Pop', fontWeight: 600, fontSize: 42, lineHeight: 1.3, color: '#E8DCC2'}}>The count stops<br />when somebody listens.</div>
        <div style={{marginTop: 54, fontFamily: 'Pop', fontWeight: 600, fontSize: 33, letterSpacing: 5, color: '#C9A227'}}>KNOCK ONCE. THEN LISTEN.</div>
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const total = fr(cues.dur);
  return (
    <AbsoluteFill style={{background: '#141126'}}>
      <Audio src={staticFile('mix.wav')} />
      {cues.shots.map((sh) => {
        const seg = cues.segs[sh.seg - 1];
        const from = fr(sh.start), durF = fr(sh.end - sh.start);
        return (
          <Sequence key={sh.id} from={from} durationInFrames={durF}>
            <Cam durF={durF} seed={sh.id}>
              <SceneView seg={sh.seg} scene={sh.scene} face={seg.face as Face} face2={seg.face2 as Face} durF={durF} start={sh.start} />
            </Cam>
          </Sequence>
        );
      })}
      <Sequence from={0} durationInFrames={fr(cues.shots[0].end)}><Title /></Sequence>
      <Captions />
      <EndCard />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(4,3,10,0.40) 100%)', zIndex: 18, pointerEvents: 'none'}} />
      <svg width={W} height={H} style={{position: 'absolute', zIndex: 19, pointerEvents: 'none', opacity: 0.045}}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#gr)" />
      </svg>
      <AbsoluteFill style={{background: '#000', opacity: lin(frame, total - 16, total), zIndex: 20}} />
      <AbsoluteFill style={{background: '#000', opacity: lin(frame, 0, 6, 1, 0), zIndex: 20}} />
    </AbsoluteFill>
  );
};
