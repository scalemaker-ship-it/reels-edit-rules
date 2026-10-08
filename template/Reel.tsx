import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import data from "../public/data.json";

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const SUB_Y = 1300; // 입술이 보이도록 턱 아래쪽

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("BookkB", `url(${staticFile("BookkGothic_Bold.ttf")})`),
      new FontFace("BookkL", `url(${staticFile("BookkGothic_Light.ttf")})`),
      new FontFace("ChosunGu", `url(${staticFile("ChosunGu.ttf")})`),
    ];
    Promise.all(faces.map((x) => x.load())).then((ls) => {
      ls.forEach((l) => document.fonts.add(l));
      continueRender(h);
    });
  }, [h]);
};

// 줌 펀치: 훅 시작·/rc 순간에 살짝 확대 후 복귀
const usePunch = () => {
  const frame = useCurrentFrame();
  const hits = [0, data.rc[0]];
  let s = 1;
  for (const h of hits) {
    const d = frame - f(h);
    if (d >= 0 && d < 18) s = Math.max(s, interpolate(d, [0, 4, 18], [1.0, 1.08, 1.0], { extrapolateRight: "clamp" }));
  }
  return s;
};

const Sub: React.FC<{ text: string }> = ({ text }) => {
  // 등장 애니메이션 없음(사용자 요청) · 조선굴림체 자간 -1
  const size = text.length > 17 ? Math.max(46, 64 - (text.length - 17) * 2.4) : 64;
  return (
    <div style={{ position: "absolute", top: SUB_Y, width: "100%", display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div style={{ background: "white", color: "#111", fontFamily: "ChosunGu", fontSize: size,
        padding: "16px 28px 14px", whiteSpace: "nowrap", letterSpacing: -1 }}>{text}</div>
    </div>
  );
};

const RcSticker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 7, stiffness: 180 } });
  const wob = Math.sin(frame / 3) * 3 * Math.max(0, 1 - frame / 30);
  return (
    <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "BookkB", fontSize: 200, color: "white", padding: "6px 56px 0",
        background: "linear-gradient(135deg,#1e2a78,#6d3ff5)", borderRadius: 40, letterSpacing: -4,
        boxShadow: "0 18px 50px rgba(80,30,200,0.55)",
        transform: `scale(${interpolate(sp, [0, 1], [0.2, 1])}) rotate(${-4 + wob}deg)` }}>/rc</div>
    </div>
  );
};

const ScreenCard: React.FC = () => {
  // /rc 치는 터미널 화면 — 폰 카드처럼 자막 바로 아래
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", top: SUB_Y + 64, left: 160, width: 760, borderRadius: 20, overflow: "hidden",
      boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      transform: `translateY(${interpolate(sp, [0, 1], [220, 0])}px)`, opacity: sp }}>
      <OffthreadVideo src={staticFile("screen.mp4")} muted style={{ width: 760, display: "block" }} />
    </div>
  );
};

const PhoneCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", top: SUB_Y + 64, left: 300, width: 480, borderRadius: 20, overflow: "hidden",
      boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      transform: `translateY(${interpolate(sp, [0, 1], [260, 0])}px) rotate(${interpolate(sp, [0, 1], [6, 0])}deg)`, opacity: sp }}>
      <OffthreadVideo src={staticFile("phone.mp4")} muted style={{ width: 480, display: "block" }} />
    </div>
  );
};

// 초반 예시 작업물 팝업 — 상단에 클릭 효과음과 함께 떴다 사라짐
const ExamplePop: React.FC<{ kind: "report" | "image" | "video"; label: string; dur: number }> = ({ kind, label, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const out = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = kind === "video" ? 300 : kind === "image" ? 600 : 480;
  const media =
    kind === "video" ? <OffthreadVideo src={staticFile("ex_video.mp4")} muted style={{ width: w, display: "block" }} /> :
    <img src={staticFile(kind === "report" ? "ex_report.jpg" : "ex_image.jpg")} style={{ width: w, display: "block" }} />;
  return (
    <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center",
      opacity: Math.min(sp, out), transform: `scale(${interpolate(sp, [0, 1], [0.6, 1]) * interpolate(out, [0, 1], [0.85, 1])}) rotate(${interpolate(sp, [0, 1], [-5, -2])}deg)` }}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "white", padding: 8,
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}>
        <div style={{ borderRadius: 12, overflow: "hidden" }}>{media}</div>
        <div style={{ position: "absolute", top: 18, left: 18, background: "#6d3ff5", color: "white",
          fontFamily: "ChosunGu", fontSize: 30, letterSpacing: -1, padding: "6px 14px", borderRadius: 10 }}>{label}</div>
      </div>
    </div>
  );
};

// 마지막 CTA — 세팅 정리본 미리보기 인포그래픽(자막 아래)
const STEPS = [
  ["클로드코드 설치", "설치 가이드대로 컴퓨터에 설치"],
  ["/rc 입력", "클로드코드 창에 /rc → 연결 링크"],
  ["폰에서 이어서", "Claude 앱 → Code 탭 → 세션 선택"],
  ["컴퓨터는 켜두기", "작업은 내 컴퓨터에서 실행 (Pro 이상)"],
];
const GuideCard: React.FC<{ commentAt: number }> = ({ commentAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const cm = spring({ frame: frame - commentAt, fps, config: { damping: 9, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", top: SUB_Y + 84, left: 150, width: 780,
      transform: `translateY(${interpolate(sp, [0, 1], [260, 0])}px)`, opacity: sp }}>
      <div style={{ background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", fontFamily: "ChosunGu", letterSpacing: -1 }}>
        <div style={{ background: "linear-gradient(120deg,#1e2a78,#6d3ff5)", color: "white", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 36 }}>폰으로 클로드코드 세팅 정리본</span>
          <span style={{ fontSize: 22, background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: 10 }}>DM 발송</span>
        </div>
        <div style={{ padding: "14px 28px 20px" }}>
          {STEPS.map(([t, d], i) => {
            const st = spring({ frame: frame - 8 - i * 7, fps, config: { damping: 14, stiffness: 180 } });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, padding: "11px 0",
                borderTop: i ? "1px solid #ecebf5" : "none", opacity: st, transform: `translateX(${interpolate(st, [0, 1], [40, 0])}px)` }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: "#6d3ff5", color: "white", fontSize: 28,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 34, color: "#111" }}>{t}</div>
                  <div style={{ fontSize: 24, color: "#686b82", marginTop: 2 }}>{d}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 34, color: "#149e61", opacity: st }}>✓</div>
              </div>
            );
          })}
        </div>
      </div>
      {frame >= commentAt ? (
        <div style={{ position: "absolute", bottom: -34, right: -36, transform: `scale(${interpolate(cm, [0, 1], [0.3, 1])}) rotate(6deg)`, opacity: cm }}>
          <div style={{ background: "#fee500", color: "#191600", fontFamily: "ChosunGu", fontSize: 40, letterSpacing: -1,
            padding: "12px 24px", borderRadius: 26, boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>💬 rc</div>
        </div>
      ) : null}
    </div>
  );
};

export const Reel: React.FC = () => {
  useFonts();
  const punch = usePunch();
  const [d0, d1] = data.D, [e0, e1] = data.E, [r0, r1] = data.rc;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <OffthreadVideo src={staticFile("base.mp4")} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>

      <Sequence from={f(d0)} durationInFrames={f(d1 - d0)}><ScreenCard /></Sequence>
      <Sequence from={f(e0)} durationInFrames={f(e1 - e0)}><PhoneCard /></Sequence>
      <Sequence from={f(r0)} durationInFrames={f(r1 - r0) + 4}><RcSticker /></Sequence>
      {([[2, "report", "보고서"], [3, "image", "이미지 제작"], [4, "video", "영상 편집"]] as const).map(([i, k, l]) => {
        const dur = f(data.subs[i].b) - f(data.subs[i].a);
        return (
          <React.Fragment key={k}>
            <Sequence from={f(data.subs[i].a)} durationInFrames={dur}><ExamplePop kind={k} label={l} dur={dur} /></Sequence>
            <Sequence from={f(data.subs[i].a)} durationInFrames={f(0.3)}><Audio src={staticFile("click.wav")} volume={0.75} /></Sequence>
          </React.Fragment>
        );
      })}

      {(() => {
        const n = data.subs.length, a = data.subs[n - 3].a, b = data.subs[n - 1].b;
        return <Sequence from={f(a)} durationInFrames={f(b) - f(a) + 12}><GuideCard commentAt={f(data.subs[n - 2].a) - f(a)} /></Sequence>;
      })()}
      <Sequence from={f(data.subs[data.subs.length - 2].a)} durationInFrames={8}><Audio src={staticFile("pop.wav")} volume={0.4} /></Sequence>
      {data.subs.map((s, i) => (
        <Sequence key={i} from={f(s.a)} durationInFrames={Math.max(1, f(s.b) - f(s.a))}><Sub text={s.t} /></Sequence>
      ))}
      {/* 효과음 — 대사 주요 포인트에만 */}
      <Sequence from={0} durationInFrames={f(0.5)}><Audio src={staticFile("whoosh.wav")} volume={0.45} /></Sequence>
      <Sequence from={f(r0)} durationInFrames={f(1.1)}><Audio src={staticFile("ding.wav")} volume={0.45} /></Sequence>
      <Sequence from={f(data.subs[9].a + 0.55)} durationInFrames={f(0.3)}><Audio src={staticFile("click.wav")} volume={0.7} /></Sequence>
      <Sequence from={f(e0)} durationInFrames={f(0.5)}><Audio src={staticFile("whoosh.wav")} volume={0.5} /></Sequence>
      <Sequence from={f(data.subs[12].a)} durationInFrames={8}><Audio src={staticFile("pop.wav")} volume={0.35} /></Sequence>
      <Sequence from={f(data.subs[data.subs.length - 1].a)} durationInFrames={f(1.1)}><Audio src={staticFile("ding.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
