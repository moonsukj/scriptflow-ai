import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Radio,
  FileText,
  Tv,
  Bookmark,
  Settings,
  Check,
  Copy,
  ChevronRight,
  Globe,
  BookOpen,
  AlertCircle,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Key,
  Sliders,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// 1. 초기 설정 및 내장 라디오 뉴스 샘플 데이터
// ============================================================================
const DEFAULT_API_KEY = ''; // 여기에 Gemini API 키("AIzaSy...")를 직접 입력하거나 앱 내 설정 창에서 입력할 수 있습니다.

const RADIO_CHANNELS = [
  {
    id: 'econ',
    category: '글로벌 경제/금융',
    title: 'Fed Signals Cautious Approach on Interest Rates Amid Steady Growth',
    sentences: [
      {
        en: 'Good evening. Federal Reserve officials indicated today that they will maintain a patient approach toward further interest rate adjustments.',
        ko: '안녕하십니까. 연방준비제도 위원들은 오늘 추가적인 금리 조정에 대해 신중한 접근 방식을 유지할 것이라고 밝혔습니다.',
      },
      {
        en: 'Recent economic data shows resilient consumer spending and a stabilizing labor market across major sectors.',
        ko: '최근 경제 지표는 주요 부문 전반에 걸쳐 견고한 소비 지출과 안정화되고 있는 노동 시장을 보여주고 있습니다.',
      },
      {
        en: 'Wall Street responded positively, with major indices closing higher led by gains in technology and financial stocks.',
        ko: '월스트리트는 기술주와 금융주의 상승세에 힘입어 주요 지수가 상승 마감하며 긍정적으로 반응했습니다.',
      },
      {
        en: 'Analysts suggest that inflation expectations remain anchored, giving policymakers room to monitor upcoming quarterly reports.',
        ko: '분석가들은 인플레이션 기대치가 안정적으로 유지되고 있어 정책 입안자들이 향후 분기 보고서를 지켜볼 여유가 있다고 분석합니다.',
      },
    ],
    summary: {
      headline: '미 연준, 견고한 경제 성장세 속 금리 조정 신중론 유지',
      threeLines: [
        '연준 위원들이 추가 금리 조정에 대해 서두르지 않겠다는 입장을 표명함',
        '소비 지출과 고용 시장이 안정세를 유지하며 뉴욕 증시 주요 지수가 상승 마감함',
        '물가 상승 기대치가 안정적이어서 향후 분기 지표를 지켜보며 정책을 결정할 전망',
      ],
      facts: [
        '주요 동향: 연방준비제도(Fed) 통화정책 방향성 발표',
        '시장 반응: 기술주 및 금융주 중심 월스트리트 주요 지수 강세',
        '향후 전망: 분기별 경제 지표 및 인플레이션 추이 지속 모니터링',
      ],
      vocab: [
        {
          word: 'resilient',
          meaning: '회복력 있는, 견고한',
          example: 'resilient consumer spending (견고한 소비 지출)',
        },
        {
          word: 'stabilizing',
          meaning: '안정화되는',
          example: 'a stabilizing labor market (안정화되는 노동 시장)',
        },
        {
          word: 'remain anchored',
          meaning: '안정적으로 고정되어 있다',
          example: 'inflation expectations remain anchored',
        },
      ],
    },
  },
  {
    id: 'tech',
    category: 'AI & 실리콘밸리 테크',
    title: 'Next-Generation AI Agents Transform Enterprise Productivity',
    sentences: [
      {
        en: 'Welcome back to Tech Pulse. Major cloud providers unveiled new autonomous AI agents designed to handle complex enterprise workflows.',
        ko: '테크 펄스에 돌아오신 것을 환영합니다. 주요 클라우드 기업들이 복잡한 기업 업무를 처리하도록 설계된 새로운 자율형 AI 에이전트를 공개했습니다.',
      },
      {
        en: 'Unlike traditional chatbots, these systems can independently plan tasks, execute software tools, and verify security compliance.',
        ko: '기존 챗봇과 달리 이 시스템들은 스스로 업무를 계획하고 소프트웨어 도구를 실행하며 보안 규정 준수 여부를 검증할 수 있습니다.',
      },
      {
        en: 'Industry leaders emphasize that human oversight and robust cybersecurity frameworks remain essential for safe deployment.',
        ko: '업계 리더들은 안전한 배포를 위해 인간의 관리 감독과 강력한 사이버 보안 프레임워크가 여전히 필수적이라고 강조합니다.',
      },
      {
        en: 'Early adopters in banking and healthcare report up to a forty percent reduction in routine administrative processing time.',
        ko: '금융 및 헬스케어 분야의 초기 도입 기업들은 일상적인 행정 처리 시간이 최대 40%까지 단축되었다고 보고했습니다.',
      },
    ],
    summary: {
      headline: '차세대 자율형 AI 에이전트 확산, 금융·의료 등 기업 생산성 혁신',
      threeLines: [
        '글로벌 클라우드 기업들이 복잡한 실무를 자율 수행하는 차세대 AI 에이전트 공개',
        '단순 질의응답을 넘어 업무 계획 수립, 도구 실행, 보안 규정 검증까지 수행',
        '금융 및 의료 분야 초기 도입 기업에서 행정 처리 시간 최대 40% 단축 효과 확인',
      ],
      facts: [
        '핵심 기술: 스스로 계획하고 도구를 실행하는 자율형 AI 에이전트(Autonomous AI Agents)',
        '필수 요건: 인간의 관리 감독(Human oversight) 및 강력한 사이버 보안 체계',
        '도입 성과: 반복 행정 업무 시간 최대 40% 절감',
      ],
      vocab: [
        {
          word: 'unveil',
          meaning: '공개하다, 발표하다',
          example: 'unveiled new autonomous AI agents',
        },
        {
          word: 'compliance',
          meaning: '(법규·규정) 준수',
          example: 'verify security compliance (보안 규정 준수 검증)',
        },
        {
          word: 'oversight',
          meaning: '관리 감독',
          example: 'human oversight remains essential',
        },
      ],
    },
  },
  {
    id: 'world',
    category: '미국/글로벌 시사',
    title:
      'Major Metropolitan Cities Expand Green Transit and Smart Grid Initiatives',
    sentences: [
      {
        en: 'Cities across North America and Europe are accelerating investments in electric public transit and smart energy grids.',
        ko: '북미와 유럽 전역의 도시들이 친환경 대중교통과 스마트 에너지 그리드에 대한 투자를 가속화하고 있습니다.',
      },
      {
        en: 'Transportation authorities announced plans to replace aging commuter buses with zero-emission fleets over the next five years.',
        ko: '교통 당국은 향후 5년 동안 노후화된 통근 버스를 무공해 차량으로 교체하겠다는 계획을 발표했습니다.',
      },
      {
        en: 'Meanwhile, smart grid sensors are helping utilities balance peak electricity demand during extreme seasonal weather.',
        ko: '한편, 스마트 그리드 센서는 극단적인 계절 기후 속에서 전력 회사가 피크 전력 수요의 균형을 맞추는 데 도움을 주고 있습니다.',
      },
    ],
    summary: {
      headline:
        '북미·유럽 주요 대도시, 친환경 대중교통 및 스마트 전력망 투자 가속화',
      threeLines: [
        '북미와 유럽 주요 도시들이 친환경 대중교통 및 스마트 에너지망 구축 확대',
        '향후 5년간 노후 통근 버스를 무공해 친환경 차량으로 전면 교체 추진',
        '스마트 그리드 센서를 활용해 이상 기후 시 피크 전력 수요를 효율적으로 분산',
      ],
      facts: [
        '추진 지역: 북미 및 유럽 주요 대도시권',
        '교체 목표: 향후 5년 내 무공해(Zero-emission) 대중교통 차량 확대',
        '기대 효과: 도시 탄소 배출 저감 및 전력망 안정성 확보',
      ],
      vocab: [
        {
          word: 'accelerate',
          meaning: '가속화하다',
          example: 'accelerating investments in transit',
        },
        {
          word: 'zero-emission',
          meaning: '무공해의, 탄소 배출이 없는',
          example: 'zero-emission fleets (무공해 차량단)',
        },
        {
          word: 'peak demand',
          meaning: '최대(피크) 수요',
          example: 'balance peak electricity demand',
        },
      ],
    },
  },
];

const TONE_OPTIONS = [
  {
    id: 'business',
    label: '비즈니스 발표',
    desc: '정중하고 설득력 있는 임원/실무 프레젠테이션 톤',
  },
  {
    id: 'casual',
    label: '일상 스몰토크',
    desc: '미국 현지에서 동료·이웃과 나누는 자연스러운 대화 톤',
  },
  {
    id: 'youtube',
    label: '유튜브/브이로그',
    desc: '친근하고 생동감 넘치는 오프닝 및 스토리 전달 톤',
  },
  {
    id: 'academic',
    label: '학술/컨퍼런스',
    desc: '논리적이고 격식 있는 전문 세미나 발표 톤',
  },
  {
    id: 'ted',
    label: 'TED 스토리텔링',
    desc: '청중의 몰입을 이끄는 감동적이고 호흡 있는 연설 톤',
  },
];

// ============================================================================
// 2. 메인 애플리케이션 컴포넌트
// ============================================================================
export default function App() {
  // 탭 상태: 'script' | 'radio' | 'prompter' | 'saved'
  const [activeTab, setActiveTab] = useState('radio');

  // API Key 상태 (LocalStorage 연동)
  const [userApiKey, setUserApiKey] = useState(
    () => localStorage.getItem('scriptflow_api_key') || DEFAULT_API_KEY
  );
  const [showKeyModal, setShowKeyModal] = useState(false);

  // --------------------------------------------------------------------------
  // [탭 1] 실시간 스크립트 작성 상태
  // --------------------------------------------------------------------------
  const [inputText, setInputText] = useState(
    '오늘 회의에 참석해 주셔서 감사합니다. 이번 프로젝트의 핵심 보안 전략과 향후 일정을 간략히 공유드리겠습니다.'
  );
  const [inputLang, setInputLang] = useState('ko-KR');
  const [selectedTone, setSelectedTone] = useState('business');
  const [vocabLevel, setVocabLevel] = useState('standard'); // easy | standard | advanced
  const [autoConvert, setAutoConvert] = useState(true);
  const [isRecordingScript, setIsRecordingScript] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [scriptResult, setScriptResult] = useState({
    mainScript:
      "Thank you all for joining today's meeting. / Let me briefly walk you through our core security strategy // and the upcoming timeline for this project.",
    koreanMeaning:
      '오늘 회의에 참석해 주신 모든 분께 감사드립니다. 이번 프로젝트의 핵심 보안 전략과 향후 일정을 간략히 설명해 드리겠습니다.',
    alternatives: [
      "I appreciate everyone taking the time to be here today. / I'd like to share a quick overview of our key security initiatives and schedule.",
      "Thanks for making it today. / Let's dive right into our main security roadmap // and what our next milestones look like.",
      'Welcome everyone. / Today, I will outline the foundational security framework for our project alongside the projected timeline.',
    ],
    coachingNote:
      "'공유드리겠습니다'를 직역한 'share' 대신 원어민 비즈니스 회의에서 자주 쓰이는 'walk you through(차근차근 설명하다)'를 사용하면 훨씬 자연스럽습니다.",
    vocabTips: [
      { word: 'walk someone through', meaning: '~에게 차근차근 설명하다' },
      { word: 'core strategy', meaning: '핵심 전략' },
      { word: 'upcoming timeline', meaning: '향후 일정' },
    ],
  });

  // --------------------------------------------------------------------------
  // [탭 2] 라디오 실시간 자막 & 한글 요약 상태
  // --------------------------------------------------------------------------
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [radioSpeed, setRadioSpeed] = useState(1.0);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [liveCaptions, setLiveCaptions] = useState(RADIO_CHANNELS[0].sentences);
  const [liveSummary, setLiveSummary] = useState(RADIO_CHANNELS[0].summary);

  // 외부 라디오 마이크 수신 상태
  const [isListeningExternalRadio, setIsListeningExternalRadio] =
    useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [captionFontSize, setCaptionFontSize] = useState('lg'); // md | lg | xl
  const [showBilingual, setShowBilingual] = useState(true);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [isSummarizingNews, setIsSummarizingNews] = useState(false);

  // --------------------------------------------------------------------------
  // [탭 3] 텔레프롬프터 상태
  // --------------------------------------------------------------------------
  const [prompterLines, setPrompterLines] = useState([
    "Thank you all for joining today's meeting.",
    'Let me briefly walk you through our core security strategy',
    'and the upcoming timeline for this project.',
  ]);
  const [activePrompterLine, setActivePrompterLine] = useState(0);
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState(3); // 1 ~ 5
  const [prompterFontSize, setPrompterFontSize] = useState(32);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [isShadowing, setIsShadowing] = useState(false);
  const [shadowingAccuracy, setShadowingAccuracy] = useState(null);
  const [spokenShadowText, setSpokenShadowText] = useState('');

  // --------------------------------------------------------------------------
  // [탭 4] 보관함 & 단어장 상태
  // --------------------------------------------------------------------------
  const [savedScripts, setSavedScripts] = useState([
    {
      id: 1,
      title: '프로젝트 보안 전략 킥오프 오프닝',
      en: "Thank you all for joining today's meeting. Let me briefly walk you through our core security strategy and the upcoming timeline.",
      ko: '오늘 회의에 참석해 주셔서 감사합니다. 핵심 보안 전략과 향후 일정을 간략히 설명드리겠습니다.',
      date: '2026.10',
    },
  ]);
  const [savedVocab, setSavedVocab] = useState([
    {
      word: 'walk someone through',
      meaning: '~에게 단계별로 설명하다',
      example: 'Let me walk you through our strategy.',
    },
    {
      word: 'resilient',
      meaning: '회복력 있는, 탄탄한',
      example: 'resilient consumer spending',
    },
    {
      word: 'remain anchored',
      meaning: '안정적으로 고정되다',
      example: 'inflation expectations remain anchored',
    },
  ]);
  const [toastMsg, setToastMsg] = useState('');

  // Refs
  const recognitionRef = useRef(null);
  const radioWordTimerRef = useRef(null);
  const prompterTimerRef = useRef(null);

  // 토스트 알림 함수
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // API 키 저장
  const handleSaveApiKey = (val) => {
    setUserApiKey(val);
    localStorage.setItem('scriptflow_api_key', val);
    setShowKeyModal(false);
    showToast('Gemini API 키가 저장되었습니다.');
  };

  // ============================================================================
  // 3. Gemini AI 호출 함수 (스크립트 변환 / 실시간 한줄 번역 / 뉴스 요약)
  // ============================================================================
  const callGeminiAPI = async (promptText, systemInstruction = '') => {
    const keyToUse = userApiKey?.trim();
    if (!keyToUse) {
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('API 호출 실패');
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return raw ? JSON.parse(raw) : null;
  };

  // [기능 1] 스크립트 AI 변환 실행
  const handleGenerateScript = async (sourceText = inputText) => {
    if (!sourceText.trim()) return;
    setIsGeneratingScript(true);

    try {
      const toneDesc =
        TONE_OPTIONS.find((t) => t.id === selectedTone)?.desc ||
        '자연스러운 영어';
      const prompt = `
입력 텍스트: "${sourceText}"
목표 톤앤매너: ${toneDesc}
어휘 수준: ${vocabLevel} (easy: 쉬운 기초 어휘, standard: 원어민 일상/비즈니스 표준, advanced: 고급 전문 어휘)

위 입력(한국어 또는 영어 초안)을 원어민이 실제로 말하는 자연스러운 영어 발표/대화 스크립트로 변환해 주세요.
짧은 호흡 위치에는 '/'를, 긴 호흡 위치에는 '//'를 포함해 주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "mainScript": "변환된 대표 영어 스크립트 (/ 및 // 포함)",
  "koreanMeaning": "대표 스크립트의 자연스러운 한국어 의미",
  "alternatives": ["대안 영어 표현 1", "대안 영어 표현 2", "대안 영어 표현 3"],
  "coachingNote": "핵심 표현 및 원어민 뉘앙스 팁 1~2문장(한국어)",
  "vocabTips": [
    {"word": "핵심 영단어/숙어 1", "meaning": "한국어 뜻"},
    {"word": "핵심 영단어/숙어 2", "meaning": "한국어 뜻"}
  ]
}`;

      const result = await callGeminiAPI(prompt);
      if (result && result.mainScript) {
        setScriptResult(result);
      } else {
        // API 키가 없을 때의 스마트 폴백
        showToast(
          '우측 상단 [API 키 설정]에 키를 등록하면 실시간 AI 맞춤 변환이 작동합니다.'
        );
      }
    } catch (e) {
      showToast('AI 응답 처리 중 오류가 발생했습니다. API 키를 확인해 주세요.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // [기능 2] 외부 라디오 영어 문장 실시간 한글 번역
  const translateSingleRadioSentence = async (englishSentence) => {
    try {
      const prompt = `다음 라디오 영어 뉴스 문장을 자연스러운 한국어 뉴스 문장으로 번역하고 JSON으로 반환하세요.
문장: "${englishSentence}"
형식: {"ko": "한국어 번역"}`;
      const res = await callGeminiAPI(prompt);
      return res?.ko || '실시간 번역 대기 중 (우측 상단 API 키를 확인하세요)';
    } catch {
      return '실시간 한글 번역 중...';
    }
  };

  // [기능 3] 누적된 라디오 영어 자막 전체 한글 요약 리포트 생성
  const handleSummarizeRadioNews = async () => {
    if (liveCaptions.length === 0) return;
    setIsSummarizingNews(true);
    try {
      const fullEnglishText = liveCaptions.map((c) => c.en).join(' ');
      const prompt = `
다음은 라디오에서 수신된 영어 뉴스 전체 스크립트입니다:
"${fullEnglishText}"

이 뉴스를 한국어로 분석하여 아래 JSON 구조로 응답하세요:
{
  "headline": "핵심 한글 뉴스 헤드라인 (1줄)",
  "threeLines": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
  "facts": ["주요 팩트 및 배경 1", "주요 팩트 및 배경 2", "주요 팩트 및 배경 3"],
  "vocab": [
    {"word": " 주요 영단어/숙어 1", "meaning": "뜻", "example": "뉴스 속 예문"},
    {"word": " 주요 영단어/숙어 2", "meaning": "뜻", "example": "뉴스 속 예문"},
    {"word": " 주요 영단어/숙어 3", "meaning": "뜻", "example": "뉴스 속 예문"}
  ]
}`;
      const res = await callGeminiAPI(prompt);
      if (res && res.headline) {
        setLiveSummary(res);
        showToast('실시간 뉴스 한글 요약이 갱신되었습니다.');
      } else {
        showToast(
          '기본 샘플 요약본이 표시됩니다. (실시간 AI 요약은 API 키 필요)'
        );
      }
    } catch {
      showToast('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSummarizingNews(false);
    }
  };

  // ============================================================================
  // 4. 내장 라디오 뉴스 오디오 재생 & 단어 단위(Word-by-Word) 실시간 타이핑 엔진
  // ============================================================================
  const stopRadioPlayback = () => {
    window.speechSynthesis?.cancel();
    if (radioWordTimerRef.current) clearInterval(radioWordTimerRef.current);
    setIsRadioPlaying(false);
    setCurrentWordIdx(-1);
  };

  const playBuiltInRadioSentence = (channelIdx, sentenceIdx) => {
    if (!('speechSynthesis' in window)) {
      showToast('이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel();
    if (radioWordTimerRef.current) clearInterval(radioWordTimerRef.current);

    const channel = RADIO_CHANNELS[channelIdx];
    if (!channel || sentenceIdx >= channel.sentences.length) {
      setIsRadioPlaying(false);
      setCurrentWordIdx(-1);
      return;
    }

    setCurrentSentenceIdx(sentenceIdx);
    const sentenceObj = channel.sentences[sentenceIdx];
    const words = sentenceObj.en.split(' ');
    setCurrentWordIdx(0);

    const utterance = new SpeechSynthesisUtterance(sentenceObj.en);
    utterance.lang = 'en-US';
    utterance.rate = radioSpeed;

    // 단어 경계 이벤트 또는 타이머 폴백으로 실시간 단어 하이라이트
    let wordCounter = 0;
    const approxMsPerWord = Math.max(180, 340 / radioSpeed);

    radioWordTimerRef.current = setInterval(() => {
      wordCounter++;
      if (wordCounter < words.length) {
        setCurrentWordIdx(wordCounter);
      }
    }, approxMsPerWord);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const upto = sentenceObj.en.slice(0, event.charIndex);
        const idx = upto.trim() ? upto.trim().split(/\s+/).length : 0;
        setCurrentWordIdx(idx);
      }
    };

    utterance.onend = () => {
      if (radioWordTimerRef.current) clearInterval(radioWordTimerRef.current);
      if (sentenceIdx + 1 < channel.sentences.length) {
        playBuiltInRadioSentence(channelIdx, sentenceIdx + 1);
      } else {
        setIsRadioPlaying(false);
        setCurrentWordIdx(-1);
      }
    };

    setIsRadioPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleBuiltInRadio = () => {
    if (isListeningExternalRadio) {
      stopExternalRadioMic();
    }
    if (isRadioPlaying) {
      stopRadioPlayback();
    } else {
      playBuiltInRadioSentence(selectedChannelIndex, currentSentenceIdx);
    }
  };

  const handleSelectChannel = (idx) => {
    stopRadioPlayback();
    setSelectedChannelIndex(idx);
    setCurrentSentenceIdx(0);
    setLiveCaptions(RADIO_CHANNELS[idx].sentences);
    setLiveSummary(RADIO_CHANNELS[idx].summary);
  };

  // ============================================================================
  // 5. 외부 라디오 소리 / 사용자 마이크 실시간 음성 인식 (Web Speech API)
  // ============================================================================
  const startExternalRadioMic = () => {
    stopRadioPlayback();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(
        '현재 브라우저는 실시간 음성 인식을 지원하지 않습니다. Chrome 또는 Safari를 사용해 주세요.'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const cleanEn = transcript.trim();
          if (cleanEn) {
            setInterimTranscript('');
            // 우선 영어 자막을 즉시 화면에 추가하고 비동기로 한글 번역 업데이트
            const newEntry = { en: cleanEn, ko: '한글 해석 생성 중...' };
            setLiveCaptions((prev) => {
              const updated = [...prev, newEntry];
              setCurrentSentenceIdx(updated.length - 1);
              return updated;
            });

            const koTranslated = await translateSingleRadioSentence(cleanEn);
            setLiveCaptions((prev) =>
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
      setIsListeningExternalRadio(false);
    };

    recognition.onend = () => {
      // 사용자가 수동으로 끄지 않았다면 연속 수신을 위해 재시작
      if (recognitionRef.current?.keepAlive) {
        try {
          recognition.start();
        } catch {
          setIsListeningExternalRadio(false);
        }
      } else {
        setIsListeningExternalRadio(false);
      }
    };

    recognition.keepAlive = true;
    recognitionRef.current = recognition;
    recognition.start();
    setIsListeningExternalRadio(true);
    showToast(
      '마이크 수신 시작: 라디오나 스피커의 영어 뉴스 소리를 들려주세요.'
    );
  };

  const stopExternalRadioMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.keepAlive = false;
      recognitionRef.current.stop();
    }
    setIsListeningExternalRadio(false);
    setInterimTranscript('');
  };

  // 스크립트 에디터용 음성 입력
  const toggleScriptVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    if (isRecordingScript) {
      recognitionRef.current?.stop();
      setIsRecordingScript(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = inputLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const updated = inputText ? `${inputText} ${text}` : text;
      setInputText(updated);
      if (autoConvert) {
        handleGenerateScript(updated);
      }
    };

    recognition.onend = () => setIsRecordingScript(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecordingScript(true);
  };

  // ============================================================================
  // 6. 텔레프롬프터 자동 스크롤 및 섀도잉(발음 정확도) 측정
  // ============================================================================
  useEffect(() => {
    if (isPrompterScrolling) {
      const intervalMs = Math.max(1500, 5500 - prompterSpeed * 800);
      prompterTimerRef.current = setInterval(() => {
        setActivePrompterLine((prev) => {
          if (prev + 1 < prompterLines.length) return prev + 1;
          setIsPrompterScrolling(false);
          return prev;
        });
      }, intervalMs);
    } else {
      clearInterval(prompterTimerRef.current);
    }
    return () => clearInterval(prompterTimerRef.current);
  }, [isPrompterScrolling, prompterSpeed, prompterLines.length]);

  const sendToPrompter = (rawText) => {
    const cleaned = rawText.replace(/\/\//g, '\n').replace(/\//g, '\n');
    const lines = cleaned
      .split(/(?<=[.?!])\s+|\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    setPrompterLines(lines.length > 0 ? lines : [rawText]);
    setActivePrompterLine(0);
    setActiveTab('prompter');
    showToast('텔레프롬프터로 대본을 불러왔습니다.');
  };

  const toggleShadowingCheck = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    if (isShadowing) {
      recognitionRef.current?.stop();
      setIsShadowing(false);
      return;
    }

    const targetSentence = prompterLines[activePrompterLine] || '';
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setSpokenShadowText(spoken);

      const targetWords = targetSentence
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
      const spokenWords = spoken
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      if (targetWords.length > 0) {
        const matched = targetWords.filter((w) =>
          spokenWords.includes(w)
        ).length;
        const score = Math.min(
          100,
          Math.round((matched / targetWords.length) * 100)
        );
        setShadowingAccuracy(score);
      }
    };

    recognition.onend = () => setIsShadowing(false);
    recognitionRef.current = recognition;
    setSpokenShadowText('');
    setShadowingAccuracy(null);
    recognition.start();
    setIsShadowing(true);
  };

  // 원어민 발음 듣기 (TTS)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\/+/g, ' ');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // 단어수 및 예상 발화 시간 계산
  const wordCount = scriptResult.mainScript
    ? scriptResult.mainScript
        .replace(/\/+/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  const estSeconds = Math.max(1, Math.round((wordCount / 130) * 60));

  const activeCaptionObj = liveCaptions[currentSentenceIdx] ||
    liveCaptions[liveCaptions.length - 1] || { en: '', ko: '' };
  const activeCaptionWords = activeCaptionObj.en
    ? activeCaptionObj.en.split(' ')
    : [];

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
          상단 헤더 및 네비게이션 탭
      ==================================================================== */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                ScriptFlow AI{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pro
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                실시간 라디오 영어 자막 · 한글 요약 · 스크립트 프롬프터
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{userApiKey ? 'API 키 설정됨' : 'API 키 설정'}</span>
          </button>
        </div>

        {/* 메인 4대 탭 */}
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto no-scrollbar border-t border-slate-800/60">
          {[
            { id: 'radio', label: '라디오 실시간 자막 & 요약', icon: Radio },
            { id: 'script', label: '실시간 스크립트 작성', icon: FileText },
            { id: 'prompter', label: '실전 텔레프롬프터', icon: Tv },
            { id: 'saved', label: '보관함 & 단어장', icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  active
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google AI Studio에서 발급받은 무료 API 키(`AIzaSy...`)를 입력하면
              스마트폰 브라우저에 안전하게 저장되어 실시간 번역과 3줄 뉴스
              요약이 작동합니다.
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
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">
        {/* ------------------------------------------------------------------
            [탭 2] 라디오 실시간 음성-텍스트 변환 자막 & 한글 요약
        ------------------------------------------------------------------ */}
        {activeTab === 'radio' && (
          <div className="space-y-6">
            {/* 상단 컨트롤 바: 내장 채널 선택 & 외부 라디오 마이크 수신 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    내장 영어 뉴스 채널
                  </span>
                  {RADIO_CHANNELS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChannel(idx)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        selectedChannelIndex === idx
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {ch.category}
                    </button>
                  ))}
                </div>

                {/* 재생 속도 조절 */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400">속도</span>
                  {[0.85, 1.0, 1.15].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setRadioSpeed(spd)}
                      className={`text-xs px-2 py-0.5 rounded ${
                        radioSpeed === spd
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 오디오 재생 & 외부 라디오 마이크 캡처 버튼 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={toggleBuiltInRadio}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow ${
                      isRadioPlaying
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {isRadioPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>
                      {isRadioPlaying
                        ? '내장 뉴스 일시정지'
                        : '내장 라디오 뉴스 재생'}
                    </span>
                  </button>

                  <button
                    onClick={
                      isListeningExternalRadio
                        ? stopExternalRadioMic
                        : startExternalRadioMic
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      isListeningExternalRadio
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isListeningExternalRadio ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {isListeningExternalRadio
                        ? '외부 라디오 수신 중지'
                        : '외부 라디오 소리 마이크 캡처'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBilingual(!showBilingual)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {showBilingual ? '영+한 동시 자막' : '영어 단독 자막'}
                  </button>
                  <button
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                    title="자막 전광판 확대/축소"
                  >
                    {cinemaMode ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 실시간 라디오 음성 -> 텍스트 변환 전광판 (Live Caption Monitor) */}
            <div
              className={`bg-gradient-to-b from-slate-900 to-slate-950 border-2 ${
                isRadioPlaying || isListeningExternalRadio
                  ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800'
              } rounded-2xl p-6 transition-all ${cinemaMode ? 'py-12' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRadioPlaying || isListeningExternalRadio
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-xs font-bold tracking-wider uppercase text-cyan-400">
                    LIVE AUDIO-TO-TEXT CAPTION MONITOR
                  </span>
                </div>

                {/* 글자 크기 스위치 */}
                <div className="flex items-center gap-1">
                  {['md', 'lg', 'xl'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setCaptionFontSize(sz)}
                      className={`text-xs px-2 py-0.5 rounded ${
                        captionFontSize === sz
                          ? 'bg-slate-700 text-white font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 현재 발화 중인 문장 단어 단위 하이라이트 */}
              <div className="space-y-3 min-h-[110px] flex flex-col justify-center">
                <p
                  className={`font-semibold leading-relaxed tracking-wide ${
                    captionFontSize === 'xl'
                      ? 'text-2xl md:text-3xl'
                      : captionFontSize === 'lg'
                      ? 'text-xl md:text-2xl'
                      : 'text-base md:text-lg'
                  }`}
                >
                  {isListeningExternalRadio && interimTranscript ? (
                    <span className="text-cyan-300">{interimTranscript}</span>
                  ) : (
                    activeCaptionWords.map((word, wIdx) => {
                      const isCurrent =
                        isRadioPlaying && wIdx === currentWordIdx;
                      const isSpoken = isRadioPlaying && wIdx < currentWordIdx;
                      return (
                        <span
                          key={wIdx}
                          className={`inline-block mr-2 transition-all duration-150 ${
                            isCurrent
                              ? 'text-slate-950 bg-cyan-400 px-1.5 py-0.5 rounded font-bold scale-105'
                              : isSpoken
                              ? 'text-cyan-200'
                              : 'text-slate-100'
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })
                  )}
                </p>

                {showBilingual && activeCaptionObj.ko && (
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
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>
                      실시간 뉴스 한/영 대본 ({liveCaptions.length}문장)
                    </span>
                  </h2>
                  <button
                    onClick={() =>
                      sendToPrompter(liveCaptions.map((c) => c.en).join(' '))
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
                  >
                    텔레프롬프터로 낭독 연습 →
                  </button>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {liveCaptions.map((item, idx) => {
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
                          <span className="text-xs font-mono text-cyan-400 font-bold">
                            #{idx + 1}
                          </span>
                          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                        <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
                          {item.en}
                        </p>
                        {showBilingual && (
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            {item.ko}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isSummarizingNews ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {isSummarizingNews ? '요약 중...' : 'AI 요약 갱신'}
                    </span>
                  </button>
                </div>

                {/* 헤드라인 */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 border border-indigo-500/30">
                  <span className="text-[11px] font-bold uppercase text-indigo-300">
                    헤드라인
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {liveSummary.headline}
                  </h3>
                </div>

                {/* 3줄 핵심 요약 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">
                    3줄 핵심 요약
                  </h4>
                  <ul className="space-y-2">
                    {liveSummary.threeLines?.map((line, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-cyan-400 font-bold">
                          {i + 1}.
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 시사 핵심 영단어 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">
                    뉴스 핵심 어휘 · 표현
                  </h4>
                  <div className="space-y-2">
                    {liveSummary.vocab?.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-300">
                              {v.word}
                            </span>
                            <span className="text-xs text-slate-300">
                              {v.meaning}
                            </span>
                          </div>
                          {v.example && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {v.example}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSavedVocab((prev) => [...prev, v]);
                            showToast(
                              `'${v.word}' 단어가 단어장에 저장되었습니다.`
                            );
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="단어장에 추가"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            [탭 1] 실시간 영어 스크립트 작성 스튜디오
        ------------------------------------------------------------------ */}
        {activeTab === 'script' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 좌측: 한국어/영어 입력 및 톤앤매너 설정 */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>음성/텍스트 입력</span>
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={inputLang}
                    onChange={(e) => setInputLang(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="ko-KR">한국어로 말하기</option>
                    <option value="en-US">영어로 말하기</option>
                  </select>
                  <button
                    onClick={toggleScriptVoiceInput}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isRecordingScript
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {isRecordingScript ? (
                      <MicOff className="w-3.5 h-3.5" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isRecordingScript
                        ? '음성 인식 중...'
                        : '음성으로 말하기'}
                    </span>
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="전달하고 싶은 내용을 한국어나 영어로 편하게 적어주세요..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />

              {/* 톤앤매너 선택 */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  발표/대화 톤앤매너
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedTone === t.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 및 변환 버튼 */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">어휘 수준:</span>
                  {['easy', 'standard', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setVocabLevel(lvl)}
                      className={`text-xs px-2.5 py-1 rounded-lg ${
                        vocabLevel === lvl
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl === 'easy'
                        ? '쉬움'
                        : lvl === 'standard'
                        ? '원어민 표준'
                        : '고급'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleGenerateScript(inputText)}
                  disabled={isGeneratingScript}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs shadow hover:opacity-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGeneratingScript
                      ? 'AI 변환 중...'
                      : '영어 스크립트 변환'}
                  </span>
                </button>
              </div>
            </div>

            {/* 우측: 변환된 영어 스크립트 및 원어민 대안 표현 */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase">
                    완성된 영어 스크립트
                  </span>
                  <span className="text-xs text-slate-400">
                    ({wordCount}단어 · 약 {estSeconds}초)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => speakText(scriptResult.mainScript)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"
                    title="원어민 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scriptResult.mainScript);
                      showToast('스크립트가 클립보드에 복사되었습니다.');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="복사하기"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sendToPrompter(scriptResult.mainScript)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                  >
                    프롬프터 연습
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-base md:text-lg font-semibold text-white leading-relaxed">
                  {scriptResult.mainScript}
                </p>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                  {scriptResult.koreanMeaning}
                </p>
              </div>

              {/* 원어민 대안 표현 3선 */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">
                  클릭하여 교체 가능한 원어민 대안 표현
                </h4>
                <div className="space-y-2">
                  {scriptResult.alternatives?.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setScriptResult((prev) => ({
                          ...prev,
                          mainScript: alt,
                        }))
                      }
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer text-xs text-slate-200 leading-relaxed transition"
                    >
                      <span className="text-cyan-400 font-bold mr-2">
                        대안 {idx + 1}.
                      </span>
                      {alt}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 원어민 코칭 노트 */}
              {scriptResult.coachingNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  <strong className="block mb-1 text-amber-300">
                    💡 원어민 표현 코칭
                  </strong>
                  {scriptResult.coachingNote}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            [탭 3] 실전 텔레프롬프터 & 아나운서 섀도잉
        ------------------------------------------------------------------ */}
        {activeTab === 'prompter' && (
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                    isPrompterScrolling
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  {isPrompterScrolling ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>
                    {isPrompterScrolling
                      ? '자동 스크롤 일시정지'
                      : '프롬프터 시작'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsPrompterScrolling(false);
                    setActivePrompterLine(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  title="처음으로"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleShadowingCheck}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                    isShadowing
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>
                    {isShadowing
                      ? '발음 채점 중...'
                      : '현재 문장 소리내어 읽고 정확도 체크'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <span className="text-slate-400">속도</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={prompterSpeed}
                    onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                    className="w-20 accent-cyan-400"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-slate-400">글자 크기</span>
                  <input
                    type="range"
                    min="22"
                    max="44"
                    value={prompterFontSize}
                    onChange={(e) =>
                      setPrompterFontSize(Number(e.target.value))
                    }
                    className="w-20 accent-cyan-400"
                  />
                </label>
                <button
                  onClick={() => setMirrorMode(!mirrorMode)}
                  className={`px-2.5 py-1 rounded-lg border ${
                    mirrorMode
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  거울 반전
                </button>
              </div>
            </div>

            {/* 섀도잉 발음 일치도 피드백 */}
            {shadowingAccuracy !== null && (
              <div className="p-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-between">
                <div className="text-xs space-y-1">
                  <div className="text-indigo-300 font-bold">
                    내 발화 인식 결과: "{spokenShadowText}"
                  </div>
                  <div className="text-slate-400">
                    문장 어휘 일치도 점수가 산출되었습니다.
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-cyan-400">
                  {shadowingAccuracy}%
                </div>
              </div>
            )}

            {/* 텔레프롬프터 스크린 */}
            <div
              className={`bg-black border-2 border-slate-800 rounded-3xl p-8 md:p-12 min-h-[380px] flex flex-col justify-center space-y-6 relative overflow-hidden ${
                mirrorMode ? 'scale-x-[-1]' : ''
              }`}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">
                ▶ EYE LEVEL
              </div>
              {prompterLines.map((line, idx) => {
                const active = idx === activePrompterLine;
                return (
                  <p
                    key={idx}
                    onClick={() => setActivePrompterLine(idx)}
                    style={{ fontSize: `${prompterFontSize}px` }}
                    className={`cursor-pointer transition-all duration-300 font-bold leading-snug text-center ${
                      active
                        ? 'text-cyan-300 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            [탭 4] 나만의 보관함 & 단어장
        ------------------------------------------------------------------ */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>저장된 스크립트 ({savedScripts.length})</span>
              </h2>
              <div className="space-y-3">
                {savedScripts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">
                        {s.title}
                      </span>
                      <button
                        onClick={() => sendToPrompter(s.en)}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        프롬프터로 열기
                      </button>
                    </div>
                    <p className="text-sm text-white">{s.en}</p>
                    <p className="text-xs text-slate-400">{s.ko}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>북마크 시사·비즈니스 영단어장 ({savedVocab.length})</span>
              </h2>
              <div className="space-y-2.5">
                {savedVocab.map((v, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-300">
                          {v.word}
                        </span>
                        <span className="text-xs text-slate-300">
                          {v.meaning}
                        </span>
                      </div>
                      {v.example && (
                        <p className="text-xs text-slate-500 mt-1">
                          {v.example}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => speakText(v.word)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          화면 하단 고정 실시간 라디오 라이브 자막 바 (Floating Live Ticker)
      ==================================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2.5 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              LIVE CAPTION
            </span>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">
                {interimTranscript || activeCaptionObj.en}
              </p>
              <p className="text-[11px] text-amber-300/90 truncate">
                {activeCaptionObj.ko}
              </p>
            </div>
          </div>
          <button
            onClick={toggleBuiltInRadio}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shrink-0"
          >
            {isRadioPlaying ? '일시정지' : '라디오 재생'}
          </button>
        </div>
      </div>
    </div>
  );
}
