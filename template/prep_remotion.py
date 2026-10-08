import json, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1080,1920
FONTS=os.path.expanduser("~/Library/Fonts")
FONT=f"{FONTS}/BookkGothic_Bold.ttf"
words=[w for s in json.load(open("words.json")) for w in s["words"]]
# 유지 구간(메인 원본 시각) — 반복 테이크(28.6~36.2, 54.2~59.9)는 버리고 마지막 테이크만
# 무음 공격적 삭제(-33dB, 0.2s 이상 쉼 제거, 앞뒤 0.05s) — 문장 안 짧은 쉼까지 컷
KEEP=[(1.20,3.47),(3.66,7.92),(8.20,10.10),(14.28,17.50),(21.94,23.88),(40.40,44.90),(48.05,52.72),(62.21,66.46),(71.24,73.34),(73.76,76.46)]
# 자막(원본 시각 기준 시작~끝, 표기 교정 반영)
SUBS=[
 (0.72,3.02,"와, 저 이거 알고"),
 (3.02,5.20,"카페나 지하철에서도"),
 (5.20,6.54,"보고서도 작성하고"),
 (6.54,8.08,"이미지도 제작하고"),
 (8.08,10.30,"심지어 영상 편집까지 합니다"),
 (14.30,15.84,"클로드코드가 처음이라면"),
 (15.84,17.92,"이 명령어 꼭 기억하세요"),
 (21.90,24.22,"바로 /rc 인데요"),
 (40.40,42.00,"컴퓨터 클로드코드 창에서"),
 (42.00,45.22,"/rc를 치면 연결 링크가 떠요"),
 (47.95,49.70,"폰에서 클로드 앱을 켜고"),
 (49.70,51.08,"코드 탭에 들어가면"),
 (51.08,52.90,"그 작업물이 바로 이어집니다"),
 (62.24,63.90,"대신 컴퓨터는 켜두세요"),
 (63.90,66.46,"작업물은 컴퓨터가 이어가는 거거든요"),
 (71.22,73.50,"폰으로 클로드코드 하는 세팅 방법"),
 (73.50,75.22,"정리본은 댓글에 rc 달면"),
 (75.22,76.42,"보내드릴게요!"),
]
def to_out(t):
    # 잘린 구간의 시각은 다음 유지 구간 시작으로 붙인다
    off=0
    for a,b in KEEP:
        if t<a: return off
        if t<=b: return off+(t-a)
        off+=b-a
    return off
total=sum(b-a for a,b in KEEP)
os.makedirs("tmp",exist_ok=True)
# 1) 메인 컷 이어붙이기 (1080x1920)
parts=[]
for i,(a,b) in enumerate(KEEP):
    f=f"tmp/seg{i}.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(a),"-to",str(b),"-i","main.mp4",
      "-vf",f"scale={W}:{H}:flags=lanczos,fps=30","-af","aresample=48000",
      "-c:v","libx264","-preset","fast","-crf","18","-c:a","aac","-b:a","192k",f],check=True)
    parts.append(f)
open("tmp/list.txt","w").write("".join(f"file '{os.path.basename(p)}'\n" for p in parts))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","tmp/list.txt","-c","copy","tmp/base.mp4"],check=True)
# 2) B롤
D0,D1=to_out(40.40),to_out(45.22)   # 터미널 /rc
E0,E1=to_out(47.95),to_out(52.90)   # 폰 연결
# 화면 기록: 1.8~8.45s 를 D 구간 길이에 맞춰 속도 조정, 둥근 카드
dlen=D1-D0; sspd=(8.45-1.8)/dlen
subprocess.run(["ffmpeg","-v","error","-y","-ss","1.8","-to","8.45","-i","broll_screen.mov",
  "-vf",f"setpts=PTS/{sspd},scale=960:-2:flags=lanczos,fps=30","-an","-c:v","libx264","-crf","16","tmp/screen.mp4"],check=True)
# 폰 화면: 알림(40~48.6)+코드 탭·세션(53.2~61.5) → E 구간에 맞춰 빠르게
elen=E1-E0
subprocess.run(["ffmpeg","-v","error","-y","-i","broll_phone.mp4","-filter_complex",
  "[0:v]trim=40:48.6,setpts=PTS-STARTPTS[a];[0:v]trim=53.2:61.5,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[c];"
  f"[c]setpts=PTS/{(8.6+8.3)/elen},crop=1180:1320:0:140,scale=600:-2:flags=lanczos,fps=30[o]",
  "-map","[o]","-an","-c:v","libx264","-crf","16","tmp/phone.mp4"],check=True)
# 카드 마스크(둥근 모서리) PNG
cw=960; ch=int(round(452*cw/708/2)*2)
m=Image.new("L",(cw,ch),0); ImageDraw.Draw(m).rounded_rectangle([0,0,cw-1,ch-1],radius=28,fill=255); m.save("tmp/mask.png")
pw=600; phh=int(round(1320*600/1180/2)*2)
m2=Image.new("L",(pw,phh),0); ImageDraw.Draw(m2).rounded_rectangle([0,0,pw-1,phh-1],radius=22,fill=255); m2.save("tmp/mask2.png")

import shutil
SP=1.05
P="rm/public"
subprocess.run(["ffmpeg","-v","error","-y","-i","tmp/base.mp4","-filter_complex","[0:v]setpts=PTS/1.05[v];[0:a]atempo=1.05[a]",
  "-map","[v]","-map","[a]","-c:v","libx264","-crf","18","-preset","fast","-c:a","aac","-b:a","192k",f"{P}/base.mp4"],check=True)
for n in ["screen","phone"]:
    subprocess.run(["ffmpeg","-v","error","-y","-i",f"tmp/{n}.mp4","-vf","setpts=PTS/1.05","-an","-c:v","libx264","-crf","16",f"{P}/{n}.mp4"],check=True)
shutil.copy(f"{FONTS}/BookkGothic_Bold.ttf",f"{P}/BookkGothic_Bold.ttf")
shutil.copy(f"{FONTS}/BookkGothic_Light.ttf",f"{P}/BookkGothic_Light.ttf")
data={"total":total/SP,"D":[D0/SP,D1/SP],"E":[E0/SP,E1/SP],
      "subs":[{"a":to_out(a)/SP,"b":to_out(b)/SP,"t":t} for a,b,t in SUBS],
      "rc":[to_out(22.26)/SP,to_out(24.22)/SP]}
json.dump(data,open(f"{P}/data.json","w"),ensure_ascii=False,indent=1)
print(json.dumps(data,ensure_ascii=False)[:400])
