import React, { useState, useRef } from 'react';
import {
  Mic, MicOff, Volume2, Sparkles, Radio, Check,
  Copy, Globe, Maximize2, Minimize2, Key, RefreshCw, Trash2
} from 'lucide-react';

// ============================================================================
// 초기 설정
// ============================================================================
const DEFAULT_API_KEY = ""; // 비워두시고 앱 화면 우측 상단 [API 키 설정] 버튼을 통해 입력하세요.

const INITIAL_SUMMARY = {
  headline: "라디오 영어 뉴스를 들려주시면 AI 한글 요약이 이곳에 표시됩니다.",
  threeLines: [
    "상단의 [라디오 음성 실시간 수신 시작] 버튼을 눌러 마이크를 켜주세요.",
    "라디오나 스피커에서 나오는 영어 뉴스가 실시간 문장으로 변환되고 한글로 번역됩니다.",
    "뉴스 대본이 쌓인 후 [AI 요약 갱신] 버튼을 누르면 3줄 핵심 요약과 어휘가 정리됩니다."
  ],
  facts: [],
  vocab: []
};

export default function App() {
  // API Key 상태 (LocalStorage 연동)
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('scriptflow_api_key') || DEFAULT_API_KEY);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // 실시간 자막 & 한글 요약 상태
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [liveCaptions, setLiveCaptions] = useState([]);
  const [liveSummary, setLiveSummary] = useState(INITIAL_SUMMARY);

  // 외부 라디오 마이크 수신 상태
  const [isListeningRadio, setIsListeningRadio] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [captionFontSize, setCaptionFontSize] = useState('lg'); // md | lg | xl
  const [showBilingual, setShowBilingual] = useState(true);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [isSummarizingNews, setIsSummarizingNews] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const recognitionRef = useRef(null);

  // 토스트 알림 함수
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // API 키 저장
  const handleSaveApiKey = (val) => {
    setUserApiKey(val);
    localStorage.setItem('scriptflow_api_key', val);
    setShowKeyModal(false);
    showToast("Gemini API 키가 저장되었습니다.");
  };

  // ============================================================================
  // Gemini AI 호출 함수 (실시간 한줄 번역 / 뉴스 3줄 요약)
  // ============================================================================
  const callGeminiAPI = async (promptText) => {
    const keyToUse = userApiKey?.trim();
    if (!keyToUse) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("API 호출 실패");
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return raw ? JSON.parse(raw) : null;
  };

  // 외부 라디오 영어 문장 실시간 한글 번역
  const translateSingleRadioSentence = async (englishSentence) => {
    try {
      const prompt = `다음 라디오 영어 뉴스 문장을 자연스러운 한국어 뉴스 문장으로 번역하고 JSON으로 반환하세요.
문장: "${englishSentence}"
형식: {"ko": "한국어 번역"}`;
      const res = await callGeminiAPI(prompt);
      return res?.ko || "실시간 번역 대기 중 (우측 상단 API 키 설정을 확인하세요)";
    } catch {
      return "실시간 한글 번역 실패 (API 키를 확인하세요)";
    }
  };

  // 누적된 라디오 영어 자막 전체 한글 요약 리포트 생성
  const handleSummarizeRadioNews = async () => {
    if (liveCaptions.length === 0) {
      showToast("아직 수신된 영어 뉴스 자막이 없습니다.");
      return;
    }
    setIsSummarizingNews(true);
    try {
      const fullEnglishText = liveCaptions.map(c => c.en).join(" ");
      const prompt = `
다음은 라디오에서 수신된 영어 뉴스 전체 스크립트입니다:
"${fullEnglishText}"

이 뉴스를 한국어로 분석하여 아래 JSON 구조로 응답하세요:
{
  "headline": "핵심 한글 뉴스 헤드라인 (1줄)",
  "threeLines": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
  "facts": ["주요 팩트 및 배경 1", "주요 팩트 및 배경 2", "주요 팩트 및 배경 3"],
  "vocab": [
    {"word": "주요 영단어/숙어 1", "meaning": "뜻", "example": "뉴스 속 예문"},
    {"word": "주요 영단어/숙어 2", "meaning": "뜻", "example": "뉴스 속 예문"},
    {"word": "주요 영단어/숙어 3", "meaning": "뜻", "example": "뉴스 속 예문"}
  ]
}`;
      const res = await callGeminiAPI(prompt);
      if (res && res.headline) {
        setLiveSummary(res);
        showToast("실시간 뉴스 한글 요약이 완료되었습니다.");
      } else {
        showToast("우측 상단 [API 키 설정]에 키를 등록하면 AI 실시간 요약이 작동합니다.");
      }
    } catch {
      showToast("요약 생성 중 오류가 발생했습니다. API 키를 확인해 주세요.");
    } finally {
      setIsSummarizingNews(false);
    }
  };

  // ============================================================================
  // 외부 라디오 소리 실시간 음성 인식 (Web Speech API)
  // ============================================================================
  const startRadioMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("현재 브라우저는 실시간 음성 인식을 지원하지 않습니다. Chrome 또는 Safari를 사용해 주세요.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const cleanEn = transcript.trim();
          if (cleanEn) {
            setInterimTranscript("");
            const newEntry = { en: cleanEn, ko: "한글 번역 생성 중..." };
            setLiveCaptions(prev => {
              const updated = [...prev, newEntry];
              setCurrentSentenceIdx(updated.length - 1);
              return updated;
            });

            const koTranslated = await translateSingleRadioSentence(cleanEn);
            setLiveCaptions(prev =>
              prev.map((item, idx) =>
                idx === prev.length - 1 && item.en === cleanEn
                  ? { ...item, ko: koTranslated }
                  : item
              )
            );
          }
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      setIsListeningRadio(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current?.keepAlive) {
        try {
          recognition.start();
        } catch {
          setIsListeningRadio(false);
        }
      } else {
        setIsListeningRadio(false);
      }
    };

    recognition.keepAlive = true;
    recognitionRef.current = recognition;
    recognition.start();
    setIsListeningRadio(true);
    showToast("마이크 수신 시작: 라디오나 스피커의 영어 뉴스 소리를 들려주세요.");
  };

  const stopRadioMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.keepAlive = false;
      recognitionRef.current.stop();
    }
    setIsListeningRadio(false);
    setInterimTranscript("");
    showToast("라디오 음성 수신이 중지되었습니다.");
  };

  // 문장 클릭 시 원어민 발음 다시 듣기 (TTS)
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // 대본 초기화
  const handleClearCaptions = () => {
    setLiveCaptions([]);
    setCurrentSentenceIdx(0);
    setInterimTranscript("");
    setLiveSummary(INITIAL_SUMMARY);
    showToast("자막 및 요약 기록을 초기화했습니다.");
  };

  const activeCaptionObj = liveCaptions[currentSentenceIdx] || liveCaptions[liveCaptions.length - 1] || { en: "", ko: "" };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* 상단 토스트 메시지 */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          상단 헤더
      ==================================================================== */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-cyan-400 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                RadioCaption AI
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Live Receiver
                </span>
              </h1>
              <p className="text-xs text-slate-400">라디오 영어 뉴스 실시간 음성 인식 · 한글 번역 · 3줄 요약</p>
            </div>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{userApiKey ? "API 키 설정됨" : "API 키 설정"}</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          API 키 입력 모달
      ==================================================================== */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Gemini API 키 설정
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white text-sm">닫기</button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google AI Studio에서 발급받은 무료 API 키(`AIzaSy...`)를 입력하면 스마트폰 브라우저에 안전하게 저장되어 실시간 한글 번역과 3줄 뉴스 요약이 작동합니다.
            </p>
            <input
              type="password"
              defaultValue={userApiKey}
              id="api-key-input"
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById('api-key-input').value;
                  handleSaveApiKey(val);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          메인 콘텐츠 영역
      ==================================================================== */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {/* 상단 컨트롤 바: 실시간 마이크 캡처 및 표시 옵션 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={isListeningRadio ? stopRadioMic : startRadioMic}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold border transition shadow-lg ${
                isListeningRadio
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-rose-600/20'
                  : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-cyan-500/20'
              }`}
            >
              {isListeningRadio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListeningRadio ? "라디오 음성 수신 중지 (수신 중...)" : "라디오 음성 실시간 수신 시작"}</span>
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">
              {isListeningRadio
                ? "현재 마이크로 들어오는 영어 라디오 음성을 실시간 텍스트로 변환하고 있습니다."
                : "버튼을 누르고 스마트폰/PC 마이크 가까이 라디오 소리를 들려주세요."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBilingual(!showBilingual)}
              className="text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              {showBilingual ? "영+한 동시 자막" : "영어 단독 자막"}
            </button>
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="자막 전광판 확대/축소"
            >
              {cinemaMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 실시간 라디오 음성 -> 텍스트 변환 전광판 (Live Caption Monitor) */}
        <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border-2 ${
          isListeningRadio ? 'border-rose-500/60 shadow-lg shadow-rose-500/10' : 'border-slate-800'
        } rounded-2xl p-6 transition-all ${cinemaMode ? 'py-12' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isListeningRadio ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
              }`} />
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-400">
                {isListeningRadio ? "LIVE RADIO AUDIO RECEIVING..." : "LIVE AUDIO-TO-TEXT CAPTION MONITOR"}
              </span>
            </div>

            {/* 글자 크기 스위치 */}
            <div className="flex items-center gap-1">
              {['md', 'lg', 'xl'].map(sz => (
                <button
                  key={sz}
                  onClick={() => setCaptionFontSize(sz)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    captionFontSize === sz ? 'bg-slate-700 text-white font-bold' : 'text-slate-500'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 현재 인식 중인 실시간 영어 텍스트 & 한글 번역 */}
          <div className="space-y-3 min-h-[110px] flex flex-col justify-center">
            <p className={`font-semibold leading-relaxed tracking-wide ${
              captionFontSize === 'xl' ? 'text-2xl md:text-3xl' : captionFontSize === 'lg' ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
            }`}>
              {interimTranscript ? (
                <span className="text-cyan-300">{interimTranscript}</span>
              ) : activeCaptionObj.en ? (
                <span className="text-slate-100">{activeCaptionObj.en}</span>
              ) : (
                <span className="text-slate-500 text-base">
                  상단의 [라디오 음성 실시간 수신 시작] 버튼을 누르면 라디오에서 나오는 영어 음성이 실시간 텍스트로 이곳에 나타납니다.
                </span>
              )}
            </p>

            {showBilingual && activeCaptionObj.ko && !interimTranscript && (
              <p className="text-sm md:text-base text-amber-300/95 font-medium pt-2 border-t border-slate-800/80">
                {activeCaptionObj.ko}
              </p>
            )}
          </div>
        </div>

        {/* 하단 2단 그리드: [좌] 실시간 누적 한/영 스크립트 대본 / [우] AI 한글 뉴스 3줄 요약 리포트 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측: 문장별 한/영 대본 리스트 */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>실시간 수신 한/영 대본 ({liveCaptions.length}문장)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (liveCaptions.length === 0) return;
                    const text = liveCaptions.map(c => `${c.en}\n${c.ko}`).join("\n\n");
                    navigator.clipboard.writeText(text);
                    showToast("전체 한/영 대본이 복사되었습니다.");
                  }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>대본 복사</span>
                </button>
                <button
                  onClick={handleClearCaptions}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>비우기</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {liveCaptions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  아직 수신된 영어 뉴스 문장이 없습니다.<br />
                  마이크 수신을 켜고 영어 라디오 방송을 들려주세요.
                </div>
              ) : (
                liveCaptions.map((item, idx) => {
                  const isActive = idx === currentSentenceIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentSentenceIdx(idx);
                        speakText(item.en);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                        <Volume2 className="w-4 h-4 text-slate-400 shrink-0" title="클릭하여 문장 발음 다시 듣기" />
                      </div>
                      <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">{item.en}</p>
                      {showBilingual && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.ko}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 우측: AI 한글 요약 & 핵심 어휘 브리핑 */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI 뉴스 한글 요약 브리핑</span>
              </h2>
              <button
                onClick={handleSummarizeRadioNews}
                disabled={isSummarizingNews}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSummarizingNews ? 'animate-spin' : ''}`} />
                <span>{isSummarizingNews ? "요약 중..." : "AI 요약 갱신"}</span>
              </button>
            </div>

            {/* 헤드라인 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 border border-indigo-500/30">
              <span className="text-[11px] font-bold uppercase text-indigo-300">헤드라인</span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">{liveSummary.headline}</h3>
            </div>

            {/* 3줄 핵심 요약 */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">3줄 핵심 요약</h4>
              <ul className="space-y-2">
                {liveSummary.threeLines?.map((line, i) => (
                  <li key={i} className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold">{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 주요 팩트 및 배경 */}
            {liveSummary.facts && liveSummary.facts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">주요 팩트 분석</h4>
                <ul className="space-y-1.5">
                  {liveSummary.facts.map((fact, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/70">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 시사 핵심 영단어 */}
            {liveSummary.vocab && liveSummary.vocab.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">뉴스 핵심 어휘 · 표현</h4>
                <div className="space-y-2">
                  {liveSummary.vocab.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => speakText(v.word)}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 cursor-pointer hover:border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-300">{v.word}</span>
                          <span className="text-xs text-slate-300">{v.meaning}</span>
                        </div>
                        {v.example && <p className="text-[11px] text-slate-500 mt-0.5">{v.example}</p>}
                      </div>
                      <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ====================================================================
          화면 하단 고정 실시간 라디오 라이브 자막 바 (Floating Live Ticker)
      ==================================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2.5 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border shrink-0 ${
              isListeningRadio
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isListeningRadio ? "ON AIR" : "STANDBY"}
            </span>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">
                {interimTranscript || activeCaptionObj.en || "라디오 음성 수신 대기 중..."}
              </p>
              <p className="text-[11px] text-amber-300/90 truncate">
                {activeCaptionObj.ko || ""}
              </p>
            </div>
          </div>
          <button
            onClick={isListeningRadio ? stopRadioMic : startRadioMic}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 ${
              isListeningRadio
                ? 'bg-rose-600 text-white'
                : 'bg-cyan-500 text-slate-950'
            }`}
          >
            {isListeningRadio ? "수신 중지" : "마이크 켜기"}
          </button>
        </div>
      </div>
    </div>
  );
}
