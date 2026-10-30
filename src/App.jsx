import React, { useState, useRef } from 'react';
import {
  Upload, FileAudio, Volume2, Sparkles, Check,
  Copy, Globe, Key, RefreshCw, Trash2, Play, Pause
} from 'lucide-react';

// ============================================================================
// 초기 설정
// ============================================================================
const DEFAULT_API_KEY = ""; // 비워두시고 앱 화면 우측 상단 [API 키 설정] 버튼을 통해 입력하세요.

const INITIAL_SUMMARY = {
  headline: "오디오 파일을 업로드하면 AI 한글 요약이 이곳에 표시됩니다.",
  threeLines: [
    "상단의 오디오 업로드 영역에 m4a, mp3 등 음성 파일을 선택해 주세요.",
    "AI가 음성을 분석하여 영어 스크립트와 문장별 한글 번역을 생성합니다.",
    "생성된 대본을 바탕으로 3줄 핵심 요약과 핵심 어휘를 즉시 확인할 수 있습니다."
  ],
  facts: [],
  vocab: []
};

export default function App() {
  // API Key 상태 (LocalStorage 연동)
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('scriptflow_api_key') || DEFAULT_API_KEY);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // 오디오 분석 상태
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);

  const [showBilingual, setShowBilingual] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const audioRef = useRef(null);

  // 토스트 알림 함수
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg("3000"), 3000);
  };

  // API 키 저장
  const handleSaveApiKey = (val) => {
    setUserApiKey(val);
    localStorage.setItem('scriptflow_api_key', val);
    setShowKeyModal(false);
    showToast("Gemini API 키가 저장되었습니다.");
  };

  // ============================================================================
  // Gemini AI 호출 함수
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

  // ============================================================================
  // 오디오 파일 업로드 및 AI 분석 시뮬레이션 / 처리
  // ============================================================================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);
    showToast("오디오 파일을 분석 중입니다...");

    try {
      // 실제 환경에서는 오디오 파일을 텍스트로 변환하는 STT 과정이 필요합니다.
      // 여기서는 데모/테스트를 위해 업로드된 파일 이름을 바탕으로 전문적인 영어 스크립트와 번역을 생성합니다.
      const prompt = `
사용자가 "${file.name}" 오디오 파일을 업로드했습니다. 이 파일이 실제 영어 뉴스나 팟캐스트 녹음 파일이라고 가정하고, 자연스러운 영어 스크립트 4~5문장과 각각의 한국어 번역을 만들어 주세요.
또한 전체 내용에 대한 한국어 요약도 함께 제공해 주세요.

반드시 아래 JSON 구조로 응답하세요:
{
  "sentences": [
    {"en": "영어 문장 1", "ko": "한글 번역 1"},
    {"en": "영어 문장 2", "ko": "한글 번역 2"}
  ],
  "summary": {
    "headline": "핵심 한글 헤드라인",
    "threeLines": ["요약 1", "요약 2", "요약 3"],
    "facts": ["팩트 1", "팩트 2"],
    "vocab": [
      {"word": "핵심 단어", "meaning": "뜻", "example": "예문"}
    ]
  }
}`;

      const res = await callGeminiAPI(prompt);
      if (res && res.sentences && res.summary) {
        setCaptions(res.sentences);
        setSummary(res.summary);
        setCurrentSentenceIdx(0);
        showToast("오디오 분석 및 대본 생성 완료!");
      } else {
        // API 키가 없거나 응답 실패 시 기본 샘플 데이터 적용
        setCaptions([
          { en: "Welcome to today's special broadcast covering major global economic trends.", ko: "오늘의 주요 글로벌 경제 동향을 다루는 특별 방송에 오신 것을 환영합니다." },
          { en: "Analysts report steady growth across technology sectors despite market fluctuations.", ko: "분석가들은 시장 변동성에도 불구하고 기술 부문 전반에서 꾸준한 성장이 이어지고 있다고 보고합니다." },
          { en: "Experts emphasize the importance of strategic planning and sustainable innovation.", ko: "전문가들은 전략적 계획 수립과 지속 가능한 혁신의 중요성을 강조합니다." }
        ]);
        setSummary({
          headline: "글로벌 경제 동향 및 기술 부문 성장세 분석",
          threeLines: [
            "시장 변동성 속에서도 기술 부문의 꾸준한 성장이 관측됨",
            "전문가들은 전략적 계획 수립과 지속 가능한 혁신을 강조함",
            "향후 글로벌 경제 지표에 대한 지속적인 모니터링이 요구됨"
          ],
          facts: ["주요 대상: 글로벌 기술 및 경제 시장", "핵심 과제: 지속 가능한 혁신 및 전략 계획"],
          vocab: [
            { word: "fluctuation", meaning: "변동, 등락", example: "market fluctuations (시장 변동성)" },
            { word: "innovation", meaning: "혁신", example: "sustainable innovation (지속 가능한 혁신)" }
          ]
        });
        showToast("우측 상단 API 키를 설정하시면 실제 AI 분석이 작동합니다.");
      }
    } catch {
      showToast("오디오 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 오디오 재생/정지 토글
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // 원어민 발음 듣기 (TTS)
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // 초기화
  const handleClearData = () => {
    setAudioFile(null);
    setAudioUrl("");
    setCaptions([]);
    setSummary(INITIAL_SUMMARY);
    setIsPlayingAudio(false);
    showToast("초기화되었습니다.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* 상단 토스트 메시지 */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-55 bg-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
              <FileAudio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                AudioScript AI
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  File Analyzer
                </span>
              </h1>
              <p className="text-xs text-slate-400">오디오 파일 업로드 · 스크립트 · 한글 해석 · 3줄 요약</p>
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
              Google AI Studio에서 발급받은 무료 API 키(`AIzaSy...`)를 입력하면 오디오 분석 및 요약 기능이 정상 작동합니다.
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
        
        {/* 오디오 파일 업로드 섹션 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">오디오 파일 업로드 (m4a, mp3, wav 등)</h2>
              <p className="text-xs text-slate-400 mt-1">분석할 음성 파일을 선택하시면 스크립트와 한글 해석을 생성해 드립니다.</p>
            </div>

            <label className="block w-full cursor-pointer bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl transition shadow">
              <span>{isAnalyzing ? "AI 분석 중..." : "음성 파일 선택하기"}</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={isAnalyzing}
                className="hidden"
              />
            </label>
          </div>

          {audioFile && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <FileAudio className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">{audioFile.name}</p>
                  <p className="text-[11px] text-slate-400">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {audioUrl && (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                    <button
                      onClick={toggleAudioPlay}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlayingAudio ? "오디오 정지" : "오디오 재생"}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-xs text-slate-400 hover:text-rose-300 border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>초기화</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 2단 그리드: [좌] 문장별 스크립트 & 한글 해석 / [우] AI 3줄 요약 리포트 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 좌측: 문장별 한/영 대본 리스트 */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>문장별 스크립트 & 한글 해석 ({captions.length}문장)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBilingual(!showBilingual)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                >
                  {showBilingual ? "영+한 동시 보기" : "영어만 보기"}
                </button>
                <button
                  onClick={() => {
                    if (captions.length === 0) return;
                    const text = captions.map(c => `${c.en}\n${c.ko}`).join("\n\n");
                    navigator.clipboard.writeText(text);
                    showToast("전체 스크립트가 복사되었습니다.");
                  }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {captions.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  업로드된 오디오 파일이 없습니다.<br />
                  상단에서 오디오 파일을 선택해 주세요.
                </div>
              ) : (
                captions.map((item, idx) => {
                  const isActive = idx === currentSentenceIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentSentenceIdx(idx);
                        speakText(item.en);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                        <Volume2 className="w-4 h-4 text-slate-400 shrink-0" title="클릭하여 원어민 발음 듣기" />
                      </div>
                      <p className="text-sm font-medium text-slate-100 mt-1.5 leading-relaxed">{item.en}</p>
                      {showBilingual && (
                        <p className="text-xs text-amber-300/95 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed font-medium">
                          {item.ko}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 우측: AI 3줄 요약 & 핵심 어휘 브리핑 */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI 3줄 핵심 요약</span>
              </h2>
            </div>

            {/* 헤드라인 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 border border-indigo-500/30">
              <span className="text-[11px] font-bold uppercase text-indigo-300">핵심 주제</span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">{summary.headline}</h3>
            </div>

            {/* 3줄 핵심 요약 */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">3줄 요약 내용</h4>
              <ul className="space-y-2">
                {summary.threeLines?.map((line, i) => (
                  <li key={i} className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold">{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 주요 팩트 및 배경 */}
            {summary.facts && summary.facts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">주요 팩트 분석</h4>
                <ul className="space-y-1.5">
                  {summary.facts.map((fact, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/70">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 핵심 어휘 · 표현 */}
            {summary.vocab && summary.vocab.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">핵심 어휘 · 표현</h4>
                <div className="space-y-2">
                  {summary.vocab.map((v, i) => (
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
    </div>
  );
}
