# make_cues.py — ONE timing source. Reads vo/segN.wav durations + story.py -> src/cues.json
import json, subprocess, sys
sys.path.insert(0, '.')
from story import SEGMENTS

FPS = 30
GAP = 0.55
HEAD = 0.4
TAIL = 10.0
EXTRA_GAP = {14: 3.0, 19: 2.5, 22: 2.0}   # scored pauses after these segments

def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
                                          'format=duration', '-of', 'csv=p=0', p]).decode().strip())

segs, t = [], HEAD
for i, s in enumerate(SEGMENTS, 1):
    d = dur(f'vo/seg{i}.wav')
    segs.append(dict(i=i, start=round(t, 3), dur=round(d, 3), text=s['text'],
                     scene=s['scene'], face=s['face'], face2=s['face2']))
    t += d + GAP + EXTRA_GAP.get(i, 0.0)
total = t - GAP + TAIL
S = {s['i']: s for s in segs}

# one shot per segment; shot holds through the gap (anti-blip)
shots = []
for i, s in enumerate(segs):
    end = segs[i + 1]['start'] if i + 1 < len(segs) else total
    shots.append(dict(id=s['i'], seg=s['i'], start=round(0.0 if i == 0 else s['start'], 3),
                      end=round(end, 3), scene=s['scene']))

# knock events (absolute seconds): seg -> list of offsets (fraction of seg dur)
KNOCKS = {1: [0.55], 2: [0.82], 4: [0.30, 0.78], 7: [0.22, 0.45, 0.68],
          10: [0.18, 0.38, 0.58, 0.78], 13: [0.16, 0.32, 0.48, 0.64, 0.80],
          14: [0.42], 19: [0.30], 23: [0.38, 0.93]}
knocks = []
for seg_i, offs in KNOCKS.items():
    for o in offs:
        knocks.append(round(S[seg_i]['start'] + S[seg_i]['dur'] * o, 3))
# seg14 finale: every wall knocks — burst at end of segment
burst0 = S[14]['start'] + S[14]['dur'] * 0.86
knocks += [round(burst0 + k * 0.22, 3) for k in range(6)]
knocks.sort()

sfx = []
def add(tt, ty, **kw): sfx.append(dict(t=round(tt, 3), type=ty, **kw))
for k in knocks: add(k, 'knock', gain=0.8)
for k in [burst0 + k * 0.22 for k in range(6)]: add(k, 'knockback', gain=0.5, pan=(-0.6 if k % 2 else 0.6))
add(S[15]['start'] + 0.1, 'sting', gain=0.6)
add(burst0, 'sting', gain=0.55)
add(S[17]['start'] + S[17]['dur'] * 0.25, 'hisslong', gain=0.30)
add(S[18]['start'] + 0.1, 'whoosh', d=0.5, gain=0.4)
# running steps seg18 first half
x = S[18]['start'] + 0.15
while x < S[18]['start'] + 2.6: add(x, 'step', gain=0.4); x += 0.30
add(S[20]['start'] + S[20]['dur'] * 0.9, 'bell', f=660, gain=0.3)
add(total - TAIL + 1.2, 'knock', gain=0.7)
add(total - 0.6, 'thud', gain=0.4)
for sh in shots[1:]: add(sh['start'] - 0.16, 'whoosh', d=0.32, gain=0.22)

amb = [dict(t0=0.0, t1=round(total, 3), type='wind', gain=0.05)]

# captions: per SENTENCE, timed proportionally by word count within the segment
import re
chunks = []
for s in segs:
    sents = [x.strip() for x in re.split(r'(?<=[.!?])\s+', s['text']) if x.strip()]
    words_total = max(1, len(s['text'].split()))
    acc = 0.0
    for sent in sents:
        w = len(sent.split())
        t0 = s['start'] + s['dur'] * (acc / words_total)
        acc += w
        t1 = s['start'] + s['dur'] * (acc / words_total)
        chunks.append(dict(seg=s['i'], t0=round(t0, 3), t1=round(t1, 3), text=sent))

music = dict(bpm=56, final=round(total - 1.2, 3))
cues = dict(dur=round(total, 3), fps=FPS, segs=segs, shots=shots,
            ev=dict(knocks=knocks, endcard_at=round(total - TAIL, 3), black_at=round(total - 0.55, 3)),
            amb=amb, sfx=sfx, chunks=chunks, music=music)
json.dump(cues, open('src/cues.json', 'w'), indent=1)
print(f"cues ok: dur={total:.2f}s segs={len(segs)} knocks={len(knocks)} chunks={len(chunks)}")
