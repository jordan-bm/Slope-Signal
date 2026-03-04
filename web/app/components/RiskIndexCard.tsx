interface RiskFactor {
  name: string;
  points: number;
  max_points: number;
  reason: string;
}

interface RiskIndex {
  score: number;
  factors: RiskFactor[];
  confidence: number;
}

interface Props {
  riskIndex: RiskIndex;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--danger-4)";
  if (score >= 40) return "var(--danger-3)";
  if (score >= 20) return "var(--danger-2)";
  return "var(--danger-1)";
}

function scoreBg(score: number): string {
  if (score >= 70) return "rgba(255,31,31,0.08)";
  if (score >= 40) return "rgba(255,140,0,0.08)";
  if (score >= 20) return "rgba(255,242,0,0.06)";
  return "rgba(80,200,120,0.08)";
}

function scoreBorder(score: number): string {
  if (score >= 70) return "rgba(255,31,31,0.3)";
  if (score >= 40) return "rgba(255,140,0,0.3)";
  if (score >= 20) return "rgba(255,242,0,0.2)";
  return "rgba(80,200,120,0.3)";
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 80) return "HIGH";
  if (confidence >= 50) return "MODERATE";
  return "LOW";
}

export default function RiskIndexCard({ riskIndex }: Props) {
  const { score, factors, confidence } = riskIndex;
  const color = scoreColor(score);

  return (
    <div
      className="rounded-lg px-5 py-4"
      style={{
        background: scoreBg(score),
        border: `1px solid ${scoreBorder(score)}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="mono text-xs mb-1" style={{ color: 'var(--slate-400)' }}>
            RISK INDEX
          </div>
          <div className="display leading-none" style={{ color, fontSize: '4rem' }}>
            {score}
            <span className="text-2xl ml-1" style={{ color: 'var(--slate-400)' }}>/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-xs mb-1" style={{ color: 'var(--slate-400)' }}>
            CONFIDENCE
          </div>
          <div className="mono text-lg font-bold" style={{ color }}>
            {confidenceLabel(confidence)}
          </div>
          <div className="mono text-xs" style={{ color: 'var(--slate-400)' }}>
            {confidence}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-full h-1.5 mb-5" style={{ background: 'var(--slate-800)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      {/* Factors */}
      <div className="mono text-xs mb-3" style={{ color: 'var(--slate-400)' }}>
        SIGNAL BREAKDOWN
      </div>
      <div className="space-y-3">
        {factors.map((factor) => (
          <div key={factor.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs" style={{ color: 'var(--slate-200)', fontFamily: 'Barlow, sans-serif' }}>
                {factor.name}
              </span>
              <span className="mono text-xs" style={{ color: factor.points > 0 ? color : 'var(--slate-400)' }}>
                {factor.points}/{factor.max_points}
              </span>
            </div>
            <div className="rounded-full h-1" style={{ background: 'var(--slate-800)' }}>
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${(factor.points / factor.max_points) * 100}%`,
                  background: factor.points > 0 ? color : 'transparent',
                }}
              />
            </div>
            <div className="mono text-xs mt-0.5" style={{ color: 'var(--slate-400)', fontSize: '10px' }}>
              {factor.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}