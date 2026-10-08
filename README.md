# 릴스 편집 규칙

토킹헤드 릴스(세로 1080×1920) 편집 규칙과 템플릿.
**편집 규칙 단일 출처 = [`SKILL.md`](SKILL.md)** (「확정 규격」 표 + 「절차」).

## 설치 (Claude Code 스킬로 쓰기)

```bash
git clone https://github.com/scalemaker-ship-it/reels-edit-rules.git ~/.claude/skills/릴스편집
```

설치 후 Claude Code에서 "릴스 편집해줘", "이 영상 릴스로 편집" 등으로 호출하면 이 규칙대로 편집한다.

## 구성

| 파일 | 역할 |
|---|---|
| `SKILL.md` | 편집 규칙(확정 규격)·절차 |
| `template/transcribe.py` | faster-whisper medium 단어 단위 전사 → `words.json` |
| `template/prep_remotion.py` | KEEP(유지 구간)·SUBS(자막) 기준 컷 이어붙이기 + 1.05배속 + B롤 클립 + `data.json` 생성 (예시 편 값이 들어 있음 — 매 편 수정) |
| `template/Reel.tsx`, `Root.tsx`, `index.ts`, `package.json` | Remotion 컴포지션(자막·B롤 카드·키워드 스티커·예시 팝업·CTA 인포그래픽·효과음) |
| `template/*.wav` | 효과음 (whoosh·ding·click·tap·pop) |

## 필요 환경

- ffmpeg (libass/drawtext 없어도 됨 — 텍스트는 Remotion이 그림)
- Python: `faster-whisper`, `Pillow`
- Node + Remotion
- 폰트(레포에 포함 안 함, `~/Library/Fonts/` 에 직접 설치): 조선굴림체 `ChosunGu.TTF`, 부크크고딕 `BookkGothic_Bold/Light.ttf`

## 렌더

```bash
npx remotion render src/index.ts Reel out/<이름>.mp4 --concurrency=6
```
