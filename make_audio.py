# make_audio.py — bed musik gelisah (music box + pluck rendah, Dm), VO (Liam +3 st),
# ambience bus/angin, SFX sintetis. Membaca src/cues.json saja. Output raw_mix.wav.
import numpy as np, json
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
np.random.seed(23)
SR = 44100
cues = json.load(open('src/cues.json'))
DUR = cues['dur']
N = int(DUR * SR) + SR
bed = np.zeros((N, 2)); vox = np.zeros((N, 2)); sfx = np.zeros((N, 2)); amb = np.zeros((N, 2))

def tt(d): return np.arange(int(d * SR)) / SR
def place(buf, sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    n = min(len(sig), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * 1.4142; r = np.sin((pan + 1) * np.pi / 4) * 1.4142
    buf[i:i+n, 0] += sig[:n] * gain * l; buf[i:i+n, 1] += sig[:n] * gain * r
def filt(x, kind, f, order=3): return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)
def noise(d): return np.random.randn(int(d * SR))
def sweep_noise(d, f0, f1, q=1.6):
    x = noise(d); out = np.zeros_like(x); W = 2048; H = 1024; win = np.hanning(W); nch = max(1, len(x) // H - 1)
    for k in range(nch):
        s = k * H; fc = f0 * (f1 / f0) ** (k / max(1, nch - 1)); segx = x[s:s+W]
        if len(segx) < W: break
        out[s:s+W] += filt(segx, 'band', [max(60, fc / q), min(SR / 2 - 500, fc * q)], 2) * win
    return out / (np.max(np.abs(out)) + 1e-9)

# ---------- VO (gain-match per segmen ke RMS -20 dBFS) ----------
for s in cues['segs']:
    sr, data = wavfile.read(f"vo/seg{s['i']}.wav")
    assert sr == SR
    if data.dtype == np.int16: data = data.astype(np.float64) / 32768.0
    if data.ndim == 2: data = data.mean(axis=1)
    rms = np.sqrt(np.mean(data ** 2)) + 1e-9
    gain = (10 ** (-20 / 20)) / rms
    place(vox, data * gain, s['start'])

# ---------- bed: music box gelisah + pluck ----------
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def freq(name, octv):
    n = NOTE[name[0]] + (1 if name[1:2] == '#' else -1 if name[1:2] == 'b' else 0)
    midi = 12 * (octv + 1) + n
    return 440 * 2 ** ((midi - 69) / 12)
def musicbox(f, d=1.7):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.0)
    s += 0.45 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 5.2)
    s += 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 8.5)
    return s * 0.5
def pluck(f, d=1.1):
    t = tt(d)
    return sum((1 / n ** 1.5) * np.sin(2 * np.pi * f * n * t) * np.exp(-t * (5 + 2.5 * n)) for n in range(1, 6)) * 0.6
def lowpiano(f, d=2.8):
    t = tt(d)
    s = sum((1 / n ** 1.3) * np.sin(2 * np.pi * f * n * t) * np.exp(-t * (1.1 + 0.5 * n)) for n in range(1, 6))
    return s * np.minimum(1, t / 0.012) * 0.8

CHORDS = [  # (nama, [nada music box], root rendah)
    ('Dm', ['D', 'F', 'A'], 'D'), ('Bb', ['Bb', 'D', 'F'], 'Bb'),
    ('Dm', ['D', 'F', 'A'], 'D'), ('A', ['A', 'C#', 'E'], 'A'),
    ('Dm', ['D', 'F', 'A'], 'D'), ('Bb', ['Bb', 'D', 'F'], 'Bb'),
    ('Dm', ['D', 'F', 'A'], 'D'), ('A', ['A', 'C#', 'E'], 'A'),
]
BAR = 60.0 / cues['music']['bpm'] * 4  # ~4.29s
FINAL = cues['music']['final']
bar_i = 0
t0 = 0.0
while t0 < FINAL:
    name, tones, root = CHORDS[bar_i % len(CHORDS)]
    pat = [0, 1, 2, 1]
    for k, ti in enumerate(pat):
        tt0 = t0 + k * (BAR / 4)
        if tt0 >= FINAL: break
        f = freq(tones[ti], 5)
        place(bed, musicbox(f), tt0, ((k % 3) - 1) * 0.25, 0.42)
        place(bed, musicbox(f * 1.004), tt0 + 0.014, ((k % 3) - 1) * 0.25, 0.15)  # detune creep
    if bar_i % 2 == 1:
        place(bed, pluck(freq(tones[0], 3)), t0 + BAR * 0.5, -0.2, 0.30)         # pluck gelisah
        place(bed, pluck(freq(tones[2], 3)), t0 + BAR * 0.75, 0.2, 0.24)
    place(bed, lowpiano(freq(root, 1), 3.4), t0, 0, 0.44)
    t0 += BAR; bar_i += 1
# pad napas sangat rendah
tp = tt(DUR)
pad = (np.sin(2 * np.pi * freq('D', 1) * tp) + 0.6 * np.sin(2 * np.pi * freq('A', 1) * tp)) \
    * (0.045 + 0.018 * np.sin(2 * np.pi * tp / 11.0))
place(bed, pad, 0, 0, 0.5)

# ducking bed di bawah VO
duck = np.ones(N)
for s in cues['segs']:
    a = int((s['start'] - 0.12) * SR); b = int((s['start'] + s['dur'] + 0.18) * SR)
    a = max(0, a); b = min(N, b)
    ramp = int(0.15 * SR)
    segd = np.full(b - a, 0.42)
    segd[:ramp] = np.linspace(1.0, 0.42, ramp)
    segd[-ramp:] = np.linspace(0.42, 1.0, ramp)
    duck[a:b] = np.minimum(duck[a:b], segd)
bed *= duck[:, None]

# ---------- ambience ----------
def engine(d, far=False):
    t = tt(d)
    base = 46 if far else 52
    rumble = filt(noise(d), 'low', 130 if far else 190, 2)
    wob = 0.75 + 0.25 * np.sin(2 * np.pi * 8.5 * t) + 0.12 * np.sin(2 * np.pi * 23 * t)
    tone = np.sin(2 * np.pi * base * t) * 0.5 + np.sin(2 * np.pi * base * 2.02 * t) * 0.2
    env = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6)
    return (rumble * 0.55 + tone) * wob * env * (0.5 if far else 0.8)
def wind(d):
    x = sweep_noise(d, 300, 700)
    t = tt(d)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * t / 6.5) * np.sin(2 * np.pi * t / 2.7 + 1.0)
    env = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
    return filt(x, 'low', 900, 2) * lfo * env
for a in cues['amb']:
    d = a['t1'] - a['t0']
    if a['type'] == 'engine': place(amb, engine(d), a['t0'], 0, a['gain'] * 2.2)
    elif a['type'] == 'engine_far': place(amb, engine(d, far=True), a['t0'], 0, a['gain'] * 2.2)
    elif a['type'] == 'wind': place(amb, wind(d), a['t0'], 0, a['gain'] * 2.4)

# ---------- SFX ----------
def hisslong():
    d = 2.6; x = sweep_noise(d, 6000, 3800, 1.1)
    return x * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 1.2
def hiss():
    d = 0.55; x = sweep_noise(d, 5200, 1400, 1.2)
    return x * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 1.5
def step():
    t = tt(0.13)
    return (filt(noise(0.13), 'low', 480, 2) * np.exp(-t * 38) * 0.9
            + np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t * 30)) / SR) * np.exp(-t * 42) * 0.5)
def tally():
    t = tt(0.055)
    return filt(noise(0.055), 'band', [2400, 5200], 2) * np.exp(-t * 60) * 0.8
def knock(hollow=False):
    t = tt(0.5 if hollow else 0.32)
    f0 = 118 if hollow else 185
    body = np.sin(2 * np.pi * f0 * t) * np.exp(-t * (5.5 if hollow else 16))
    body += 0.6 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t * (7 if hollow else 22))
    click = filt(noise(0.03), 'band', [900, 3000], 2) * np.exp(-tt(0.03) * 90)
    out = body * 0.95; out[:len(click)] += click * 0.7
    if hollow:  # resonansi berongga: gema pelan detune
        echo = np.sin(2 * np.pi * (f0 * 0.5) * t) * np.exp(-t * 3.2) * 0.4
        out = out + echo
    return out
def sting():
    t = tt(2.4)
    s = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 1.1) + np.sin(2 * np.pi * 58.27 * t) * np.exp(-t * 1.1)
    for sig, gn in ((lowpiano(freq('D', 1), 2.2), 0.7), (lowpiano(freq('F', 2), 2.0), 0.3)):
        s[:len(sig)] += sig * gn
    sweep = np.sin(2 * np.pi * np.cumsum(280 - 210 * (t / 2.4)) / SR) * np.exp(-t * 2.2) * 0.4
    return (s + sweep) * 0.8
def bell(f, d=1.4):
    t = tt(d); s = 0
    for m, aa, k in [(1, 1, 3), (2.76, .5, 5), (5.4, .3, 8), (8.93, .15, 12)]:
        s = s + aa * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k)
    return s * 0.6
def thud():
    t = tt(.35); return np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t * 25)) / SR) * np.exp(-t * 12) + filt(noise(.35), 'low', 700, 2) * np.exp(-t * 45) * 0.6
def tick():
    return filt(noise(.025), 'high', 3400, 2) * np.exp(-tt(.025) * 170)
def whoosh(d):
    x = sweep_noise(d, 300, 4600)
    return x * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 2

for e in cues['sfx']:
    t, ty, g, d = e['t'], e['type'], e.get('gain', .8), e.get('d')
    p = e.get('pan', 0)
    if ty == 'hiss': place(sfx, hiss(), t, p, g)
    elif ty == 'hisslong': place(sfx, hisslong(), t, p, g)
    elif ty == 'step': place(sfx, step(), t, p, g)
    elif ty == 'tally': place(sfx, tally(), t, p, g)
    elif ty == 'knock': place(sfx, knock(), t, p, g)
    elif ty == 'knockback': place(sfx, knock(hollow=True), t, p, g)
    elif ty == 'sting': place(sfx, sting(), t, p, g)
    elif ty == 'bell': place(sfx, bell(e.get('f', 1318)), t, p, g)
    elif ty == 'thud': place(sfx, thud(), t, p, g)
    elif ty == 'tick': place(sfx, tick(), t, p, g)
    elif ty == 'whoosh': place(sfx, whoosh(d or .4), t, p, g)

n = int(DUR * SR)
mix = np.tanh(vox * 1.0 + bed * 0.62 + amb * 0.9 + sfx * 0.95)[:n]
fo = int(.7 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
with __import__('wave').open('raw_mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('audio ok', n / SR, 'dtk')
