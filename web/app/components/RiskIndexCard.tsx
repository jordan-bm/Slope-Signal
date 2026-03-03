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
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-orange-400";
  return "text-green-400";
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 80) return "High";
  if (confidence >= 50) return "Moderate";
  return "Low";
}

export default function RiskIndexCard({ riskIndex }: Props) {
  const { score, factors, confidence } = riskIndex;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-4">

      {/* Score header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
            Risk Index
          </div>
          <div className={`text-4xl font-bold ${scoreColor(score)}`}>
            {score}
            <span className="text-lg text-zinc-500 font-normal"> / 100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
            Confidence
          </div>
          <div className="text-lg font-semibold text-zinc-300">
            {confidenceLabel(confidence)}
            <span className="text-sm text-zinc-500 font-normal">
              {" "}({confidence}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-5">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 70
              ? "bg-red-500"
              : score >= 40
              ? "bg-orange-500"
              : "bg-green-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Factor breakdown */}
      <div className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
        Why this score
      </div>
      <div className="space-y-3">
        {factors.map((factor) => (
          <div key={factor.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-zinc-300">{factor.name}</span>
              <span className="text-sm font-mono text-zinc-400">
                {factor.points}/{factor.max_points}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1 mb-1">
              <div
                className="h-1 rounded-full bg-blue-500"
                style={{
                  width: `${(factor.points / factor.max_points) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-zinc-500">{factor.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}