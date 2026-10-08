#!/bin/bash
# 릴스 편집에 필요한 폰트 설치 (macOS)
# - 조선굴림체(ChosunGu.TTF): 조선일보 무료 배포 서체(무수정·무상 재배포 허용) → 레포에 포함, 그대로 복사
# - 부크크고딕(BookkGothic_Bold/Light.ttf): 재배포 불가 → 공식 페이지에서 직접 받아야 함
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/Library/Fonts"
mkdir -p "$DEST"

if [ -f "$DEST/ChosunGu.TTF" ]; then
  echo "✓ 조선굴림체 이미 설치됨"
else
  cp "$DIR/fonts/ChosunGu.TTF" "$DEST/" && echo "✓ 조선굴림체 설치 완료"
fi

missing=0
for f in BookkGothic_Bold.ttf BookkGothic_Light.ttf; do
  if [ -f "$DEST/$f" ]; then echo "✓ $f 이미 설치됨"; else echo "✗ $f 없음"; missing=1; fi
done

if [ $missing = 1 ]; then
  # 내려받은 zip 이 ~/Downloads 에 있으면 자동으로 풀어서 설치
  zip=$(ls -t "$HOME"/Downloads/*[Bb]ookk*.zip "$HOME"/Downloads/*부크크*.zip 2>/dev/null | head -1 || true)
  if [ -n "$zip" ]; then
    tmp=$(mktemp -d); unzip -q -o "$zip" -d "$tmp"
    find "$tmp" -iname "BookkGothic_*.ttf" -exec cp {} "$DEST/" \;
    rm -rf "$tmp"
  fi
  if [ -f "$DEST/BookkGothic_Bold.ttf" ] && [ -f "$DEST/BookkGothic_Light.ttf" ]; then
    echo "✓ 부크크고딕 설치 완료 ($zip)"
  else
    echo ""
    echo "→ 부크크고딕을 받아주세요: https://bookk.co.kr/font"
    echo "  zip 을 ~/Downloads 에 받은 뒤 이 스크립트를 다시 실행하면 자동 설치됩니다."
    open "https://bookk.co.kr/font" 2>/dev/null || true
    exit 1
  fi
fi
echo "모든 폰트 준비 완료"
