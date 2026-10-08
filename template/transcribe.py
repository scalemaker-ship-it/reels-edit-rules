import json
from faster_whisper import WhisperModel
m=WhisperModel("medium",device="cpu",compute_type="int8")
segs,_=m.transcribe("main.mp4",language="ko",word_timestamps=True,beam_size=5,vad_filter=False,
  initial_prompt="클로드코드, 슬래시 알씨, /rc, 숏폼, 지하철, 카페, Code 탭, 정리본")
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"s":w.start,"e":w.end,"w":w.word} for w in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}",flush=True)
json.dump(out,open("words.json","w"),ensure_ascii=False,indent=1)
