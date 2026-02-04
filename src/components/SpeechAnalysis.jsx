import { CheckCircle, XCircle } from 'lucide-react';

const SpeechAnalysis = ({ transcript, answer, keywords }) => {
  if (!transcript) return null;

  const extractKeywords = (text) => {
    if (!text) return [];
    return text.split(/[,،\s]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 1);
  };

  const normalizeText = (text) => text.toLowerCase().replace(/[.,!?;:'"()\[\]{}]/g, '').replace(/\s+/g, ' ').trim();

  const analyzeKeywords = () => {
    const keywordList = extractKeywords(keywords);
    const normalizedTranscript = normalizeText(transcript);
    const matched = [], missed = [];
    keywordList.forEach(keyword => {
      if (normalizedTranscript.includes(keyword)) matched.push(keyword);
      else missed.push(keyword);
    });
    return { matched, missed, total: keywordList.length };
  };

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
  const keywordScore = keywordAnalysis ? Math.round((keywordAnalysis.matched.length / keywordAnalysis.total) * 100) : 0;
  const overallScore = keywords ? Math.round((similarity + keywordScore) / 2) : similarity;

  const getScoreColor = (score) => score >= 70 ? 'var(--ice-deep)' : score >= 40 ? 'var(--text-mid)' : 'var(--orchid-accent)';
  const getScoreBg = (score) => score >= 70 ? 'var(--ice)' : score >= 40 ? 'var(--cloud)' : 'var(--orchid)';

  return (
    <div className="space-y-2">
      {/* 인식된 텍스트 */}
      <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--cloud)', border: '1px solid var(--orchid)' }}>
        <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-light)' }}>인식된 답변</div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>{transcript}</p>
      </div>

      {/* 종합 점수 */}
      <div className="rounded-lg p-3" style={{ backgroundColor: getScoreBg(overallScore), border: '1px solid var(--orchid-dark)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-mid)' }}>종합 점수</span>
          <span className="text-lg font-bold" style={{ color: getScoreColor(overallScore) }}>{overallScore}점</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--orchid)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${overallScore}%`, backgroundColor: getScoreColor(overallScore) }} />
        </div>
      </div>

      {/* 상세 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg p-2" style={{ border: '1px solid var(--orchid)' }}>
          <div className="text-[10px]" style={{ color: 'var(--text-light)' }}>내용 유사도</div>
          <div className="text-sm font-bold" style={{ color: getScoreColor(similarity) }}>{similarity}%</div>
        </div>
        {keywordAnalysis && keywordAnalysis.total > 0 && (
          <div className="bg-white rounded-lg p-2" style={{ border: '1px solid var(--orchid)' }}>
            <div className="text-[10px]" style={{ color: 'var(--text-light)' }}>키워드 매칭</div>
            <div className="text-sm font-bold" style={{ color: getScoreColor(keywordScore) }}>{keywordAnalysis.matched.length}/{keywordAnalysis.total}</div>
          </div>
        )}
      </div>

      {/* 키워드 상세 */}
      {keywordAnalysis && keywordAnalysis.total > 0 && (
        <div className="bg-white rounded-lg p-2" style={{ border: '1px solid var(--orchid)' }}>
          <div className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-light)' }}>키워드</div>
          <div className="flex flex-wrap gap-1">
            {keywordAnalysis.matched.map((k, i) => (
              <span key={`m-${i}`} className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: 'var(--ice)', color: 'var(--ice-deep)' }}>
                <CheckCircle size={10} />{k}
              </span>
            ))}
            {keywordAnalysis.missed.map((k, i) => (
              <span key={`x-${i}`} className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: 'var(--cloud)', color: 'var(--text-light)' }}>
                <XCircle size={10} />{k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-center" style={{ color: 'var(--text-light)' }}>
        {overallScore >= 70 ? '훌륭합니다!' : overallScore >= 40 ? '좋아요, 조금 더 연습해보세요.' : '키워드를 더 포함해보세요.'}
      </div>
    </div>
  );
};

export default SpeechAnalysis;
