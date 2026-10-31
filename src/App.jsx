import React, { useState, useRef } from 'react';
import {
  Upload, FileAudio, Volume2, Sparkles, Check,
  Copy, Globe, Key, Trash2, Play, Pause
} from 'lucide-react';

// ============================================================================
// 초기 설정
// ============================================================================
const DEFAULT_API_KEY = ""; // 우측 상단 [API 키 설정] 버튼을 통해 입력하세요.

const INITIAL_SUMMARY = {
  headline: "오디오 파일을 업로드하면 AI 한글 요약이 이곳에 표시됩니다.",
  threeLines: [
    "상단의 오디오 업로드 영역에 m4a, mp3, wav 등 음성 파일을 선택해 주세요.",
    "업로드된 오디오 데이터가 Gemini AI로 전송되어 정밀 분석됩니다.",
    "생성된 대본을 바탕으로 3줄 핵심 요약과 핵심 어휘를 바로 확인할 수 있습니다."
  ],
  facts: ["멀티모달 오디오 분석 엔진 적용됨", "파일 데이터 직접 처리 완료"],
  vocab: [
    { word: "multimodal", meaning: "멀티모달(텍스트·오디오 통합 처리)", example: "multimodal AI analysis" },
    { word: "transcript", meaning: "대본, 스크립트", example: "generated transcript" }
  ]
};

export default function App() {
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('scriptflow_api_key') || DEFAULT_API_KEY);
  const [showKeyModal, setShowKeyModal] = useState(false);

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSaveApiKey = (val) => {
    setUserApiKey(val);
    localStorage.setItem('scriptflow_api_key', val);
    setShowKeyModal(false);
    showToast("Gemini API 키가 저장되었습니다.");
  };

  // 파일을 Base64로 변환하는 헬퍼 함수
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // "data:audio/mp3;base64,xxxx..." 형식에서 순수 base64 데이터만 추출
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ============================================================================
  // 오디오 파일을 실제 Gemini API로 분석하는 함수
  // ============================================================================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);
    showToast(`"${file.name}" 음성 파일을 분석 중입니다...`);

    const keyToUse = userApiKey?.trim();
    if (!keyToUse) {
      showToast("우측 상단 [API 키 설정]에서 Gemini API 키를 먼저 입력해주세요.");
      setIsAnalyzing(false);
      return;
    }

    try {
      // 1. 오디오 파일을 Base64로 변환
      const base64Audio = await fileToBase64(file);

      // 2. Gemini 2.5 Flash 멀티모달 API 호출
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: file.type || "audio/mp3",
                  data: base64Audio
                }
              },
              {
                text: `이 오디오 파일(${file.name})의 내용을 청취하고 분석해주세요. 
주어진 음성 내용을 바탕으로 다음 사항을 작성하여 반드시 아래 JSON 구조로만 응답하세요:
1. 문장별 영어 스크립트와 각각의 자연스러운 한국어 번역 대조 목록 ("sentences")
2. 전체 내용에 대한 한국어 요약 헤드라인, 3줄 요약, 주요 팩트 및 핵심 어휘 ("summary")

반드시 아래 JSON 형식으로만 응답하세요:
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
}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("AI 분석 서버 통신 실패");
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("AI 응답 데이터가 없습니다.");
      }

      const parsedResult = JSON.parse(rawText);

      if (parsedResult && parsedResult.sentences && parsedResult.summary) {
        setCaptions(parsedResult.sentences);
        setSummary(parsedResult.summary);
        setCurrentSentenceIdx(0);
        showToast("오디오 파일 분석 및 대본 생성 완료!");
      } else {
        throw new Error("JSON 파싱 실패");
      }

    } catch (error) {
      console.error(error);
      showToast("오디오 분석 중 오류가 발생했습니다. API 키 또는 파일 형식을 확인해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {
        showToast("오디오 재생을 지원하지 않는 형식일 수 있습니다.");
      });
      setIsPlayingAudio(true);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

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
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-55 bg-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

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
                  Audio Analyzer
                </span>
              </h1>
              <p className="text-xs text-slate-400">오디오 업로드 · 실제 AI 음성 분석 · 한글 해석 · 3줄 요약</p>
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
              Google AI Studio에서 발급받은 무료 API 키(`AIzaSy...`)를 입력하세요. 오디오 파일 분석에 필수적입니다.
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

      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">오디오 파일 업로드 (m4a, mp3, wav 등)</h2>
              <p className="text-xs text-slate-400 mt-1">음성 파일을 선택하면 Gemini AI가 직접 청취하고 스크립트를 추출합니다.</p>
            </div>

            <label className="block w-full cursor-pointer bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl transition shadow">
              <span>{isAnalyzing ? "AI 음성 파일 분석 중..." : "음성 파일 선택하기"}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                  상단에서 음성 파일을 선택해 주세요.
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

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI 3줄 핵심 요약</span>
              </h2>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 border border-indigo-500/30">
              <span className="text-[11px] font-bold uppercase text-indigo-300">핵심 주제</span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">{summary.headline}</h3>
            </div>

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
