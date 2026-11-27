import subprocess, sys, time, os
sys.path.insert(0,'.')
from story import SEGMENTS
VOICE="TX3LPaxmHKxFdv7VOQHJ"  # Liam
HELPER=os.path.expanduser("~/workspace/custom-connectors/custom.elevenlabs/bin/elevenlabs.py")
fails=0
for i,s in enumerate(SEGMENTS,1):
    out_mp3=f"vo/seg{i}.mp3"; out_wav=f"vo/seg{i}.wav"
    if os.path.exists(out_wav): print("skip",i); continue
    open(f"vo_text/seg{i}.txt","w").write(s['text'])
    for attempt in range(4):
        r=subprocess.run(["python3",HELPER,"tts","--voice-id",VOICE,"--text-file",f"vo_text/seg{i}.txt","--out",out_mp3,"--language","en","--stability","0.55"],capture_output=True,text=True)
        if r.returncode==0 and os.path.exists(out_mp3): break
        print(f"seg{i} attempt{attempt} FAILED rc={r.returncode} out={r.stdout[-200:]} err={r.stderr[-300:]}")
        if "429" in (r.stdout+r.stderr): print("429 -> wait 30s"); time.sleep(30); fails+=1
        else: time.sleep(8)
    else:
        print("SEG FAILED PERMANENTLY",i); sys.exit(1)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",out_mp3,"-ar","44100","-ac","1",out_wav],check=True)
    d=subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out_wav]).decode().strip()
    print(f"seg{i} ok dur={d}",flush=True)
    time.sleep(2)
print("429-events:",fails)
