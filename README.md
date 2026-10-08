# 릴스 편집 규칙

토킹헤드 릴스(세로 1080×1920) 편집 규칙과 템플릿.
**편집 규칙 단일 출처 = [`SKILL.md`](SKILL.md)** (「확정 규격」 표 + 「절차」).

## 설치 (Claude Code 스킬로 쓰기)

```bash
git clone https://github.com/scalemaker-ship-it/reels-edit-rules.git ~/.claude/skills/릴스편집
```

설치 후 Claude Code에서 "릴스 편집해줘", "이 영상 릴스로 편집" 등으로 호출하면 이 규칙대로 편집한다.

## 폰트 설치 (macOS)

```bash
~/.claude/skills/릴스편집/install_fonts.sh
```

- **조선굴림체**: 레포 `fonts/` 에 포함 → 스크립트가 `~/Library/Fonts/` 로 바로 복사. (조선일보 무료 배포 서체 — 수정 없이 무상 재배포 허용. 원 배포처 https://event.chosun.com/100/100font.html)
- **부크크고딕**: 재배포 조건이 불명확해 레포에 넣지 않음. 스크립트가 공식 페이지 https://bookk.co.kr/font 를 열어 주니 zip 을 `~/Downloads` 에 받고 **스크립트를 한 번 더 실행**하면 자동으로 풀어서 설치.
- 설치 후 열려 있던 편집 프로그램은 재시작.

## 구성

| 파일 | 역할 |
|---|---|
| `SKILL.md` | 편집 규칙(확정 규격)·절차 |
| `template/transcribe.py` | faster-whisper medium 단어 단위 전사 → `words.json` |
| `template/prep_remotion.py` | KEEP(유지 구간)·SUBS(자막) 기준 컷 이어붙이기 + 1.05배속 + B롤 클립 + `data.json` 생성 (예시 편 값이 들어 있음 — 매 편 수정) |
| `template/Reel.tsx`, `Root.tsx`, `index.ts`, `package.json` | Remotion 컴포지션(자막·B롤 카드·키워드 스티커·예시 팝업·CTA 인포그래픽·효과음) |
| `template/*.wav` | 효과음 (whoosh·ding·click·tap·pop) |
| `install_fonts.sh`, `fonts/` | 폰트 설치 스크립트 + 조선굴림체 |

## 필요 환경

- ffmpeg (libass/drawtext 없어도 됨 — 텍스트는 Remotion이 그림)
- Python: `faster-whisper`, `Pillow`
- Node + Remotion
- 폰트: 조선굴림체 `ChosunGu.TTF`(자막), 부크크고딕 `BookkGothic_Bold/Light.ttf`(키워드 스티커) — 아래 「폰트 설치」

## 렌더

```bash
npx remotion render src/index.ts Reel out/<이름>.mp4 --concurrency=6
```
