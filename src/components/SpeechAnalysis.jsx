import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SpeechAnalysis = ({ transcript, answer, keywords }) => {
  if (!transcript) return null;

  // 키워드 추출 (쉼표, 공백으로 분리)
  const extractKeywords = (text) => {
    if (!text) return [];
    return text
      .split(/[,،\s]+/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 1);
  };

  // 텍스트 정규화
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 키워드 매칭 분석
  const analyzeKeywords = () => {
    const keywordList = extractKeywords(keywords);
    const normalizedTranscript = normalizeText(transcript);

    const matched = [];
    const missed = [];

    keywordList.forEach(keyword => {
      if (normalizedTranscript.includes(keyword)) {
        matched.push(keyword);
      } else {
        missed.push(keyword);
      }
    });

    return { matched, missed, total: keywordList.length };
  };

  // 전체 유사도 계산 (Jaccard 유사도)
  const calculateSimilarity = () => {
    const transcriptWords = new Set(normalizeText(transcript).split(' ').filter(w => w.length > 1));
    const answerWords = new Set(normalizeText(answer).split(' ').filter(w => w.length > 1));

    const intersection = new Set([...transcriptWords].filter(x => answerWords.has(x)));
    const union = new Set([...transcriptWords, ...answerWords]);

    if (union.size === 0) return 0;
    return Math.round((intersection.size / union.size) * 100);
  };

  const keywordAnalysis = keywords ? analyzeKeywords() : null;
  const similarity = calculateSimilarity();

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return <CheckCircle className="text-emerald-500" size={20} />;
    if (score >= 40) return <AlertCircle className="text-yellow-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  };

  const keywordScore = keywordAnalysis ? Math.round((keywordAnalysis.matched.length / keywordAnalysis.total) * 100) : 0;
  const overallScore = keywords ? Math.round((similarity + keywordScore) / 2) : similarity;

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* 인식된 텍스트 */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
          🎤 인식된 답변
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{transcript}</p>
      </div>

      {/* 종합 점수 */}
      <div className={`rounded-lg p-4 border-2 ${getScoreBg(overallScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getScoreIcon(overallScore)}
            <span className="font-semibold text-gray-700">종합 점수</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}점
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallScore >= 70 ? 'bg-emerald-500' : overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* 상세 분석 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">내용 유사도</div>
          <div className={`text-lg font-bold ${getScoreColor(similarity)}`}>{similarity}%</div>
        </div>
        {keywordAnalysis && keywordAnalysis.total > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">키워드 매칭</div>
            <div className={`text-lg font-bold ${getScoreColor(keywordScore)}`}>
              {keywordAnalysis.matched.length}/{keywordAnalysis.total}
            </div>
          </div>
        )}
      </div>

      {/* 키워드 상세 */}
      {keywordAnalysis && keywordAnalysis.total > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs font-semibold text-gray-500 mb-2">키워드 분석</div>
          <div className="flex flex-wrap gap-1.5">
            {keywordAnalysis.matched.map((k, i) => (
              <span key={`m-${i}`} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <CheckCircle size={10} />{k}
              </span>
            ))}
            {keywordAnalysis.missed.map((k, i) => (
              <span key={`x-${i}`} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <XCircle size={10} />{k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 피드백 */}
      <div className="text-xs text-gray-500 text-center">
        {overallScore >= 70 ? '훌륭합니다! 핵심 내용을 잘 포함했어요.' :
         overallScore >= 40 ? '좋아요! 몇 가지 키워드를 더 포함해보세요.' :
         '키워드와 핵심 내용을 더 연습해보세요.'}
      </div>
    </div>
  );
};

export default SpeechAnalysis;
