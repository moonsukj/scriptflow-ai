import React, { useState, useRef } from 'react';

export default function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // 환경 변수 또는 직접 입력할 Gemini API 키
  const apiKey = ""; 

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isM4a = file.name.toLowerCase().endsWith('.m4a') || file.type.includes('audio');
    if (!isM4a) {
      setError('M4A 오디오 파일만 업로드할 수 있습니다.');
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript('');
    setError('');
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const generateTranscript = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError('');

    try {
      const base64Audio = await fileToBase64(audioFile);
      const mimeType = audioFile.type || 'audio/mp4';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: '이 오디오 파일의 내용을 정확하게 받아적어 스크립트로 만들어주세요. 가독성이 좋게 문단을 나누어 작성하고, 불필요한 인사말이나 부연 설명 없이 오직 스크립트 내용만 출력해주세요.',
                  },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('스크립트 생성 요청에 실패했습니다. API 키나 파일 용량을 확인해주세요.');
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (resultText) {
        setTranscript(resultText);
      } else {
        setError('음성에서 텍스트를 추출하지 못했습니다.');
      }
    } catch (err) {
      setError(err.message || '스크립트를 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">M4A 오디오 플레이어 & 스크립트</h1>
          <p className="text-sm text-gray-500 mt-1">
            M4A 파일을 업로드하여 음성을 듣고 텍스트 스크립트를 추출하세요.
          </p>
        </div>

        {/* 파일 업로드 영역 */}
        <div>
          <input
            type="file"
            accept=".m4a,audio/mp4,audio/x-m4a"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 transition flex flex-col items-center justify-center gap-2 text-gray-600"
          >
            <span className="font-medium text-base">
              {audioFile ? audioFile.name : '클릭하여 M4A 파일 선택'}
            </span>
            <span className="text-xs text-gray-400">지원 형식: .m4a</span>
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* 오디오 재생 및 스크립트 추출 버튼 */}
        {audioUrl && (
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <audio controls src={audioUrl} className="w-full" />
            <button
              onClick={generateTranscript}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition"
            >
              {isLoading ? '스크립트 생성 중...' : '스크립트 만들기'}
            </button>
          </div>
        )}

        {/* 스크립트 출력 영역 */}
        {transcript && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">추출된 스크립트</h2>
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition"
              >
                {copied ? '복사 완료!' : '전체 복사'}
              </button>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
