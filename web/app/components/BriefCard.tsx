import RiskIndexCard from "./RiskIndexCard";

const DANGER_COLORS: Record<number, string> = {
  1: "bg-green-700 text-green-100",
  2: "bg-yellow-600 text-yellow-100",
  3: "bg-orange-600 text-orange-100",
  4: "bg-red-700 text-red-100",
  5: "bg-red-950 text-red-100",
};

interface Props {
  brief: any;
}

export default function BriefCard({ brief }: Props) {
  const dangerColor =
    DANGER_COLORS[brief.danger_alpine] || "bg-zinc-700 text-zinc-100";
  const fetchedDate = brief.fetched_at
    ? new Date(brief.fetched_at).toLocaleString()
    : "Unknown";

  return (
    <div className="space-y-5">

      {/* Danger rating */}
      <div className={`rounded-lg px-5 py-4 ${dangerColor}`}>
        <div className="text-xs uppercase tracking-widest opacity-75 mb-1">
          Avalanche Danger
        </div>
        <div className="text-3xl font-bold">{brief.danger_label}</div>
        <div className="text-sm opacity-75 mt-1">
          Alpine · Treeline · Below Treeline — {brief.danger_alpine}/5
        </div>
      </div>

      {/* Risk Index */}
      <RiskIndexCard riskIndex={brief.risk_index} />

      {/* Bottom line */}
      {brief.problems?.bottom_line && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Bottom Line
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">
            {brief.problems.bottom_line}
          </p>
        </div>
      )}

      {/* Discussion */}
      {brief.discussion && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Current Conditions
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {brief.discussion}
          </p>
        </div>
      )}

      {/* Recent activity */}
      {brief.problems?.recent_activity && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Recent Activity
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {brief.problems.recent_activity}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-zinc-500 text-right pt-2">
        Forecast date: {brief.forecast_date} · Fetched: {fetchedDate}
      </div>
    </div>
  );
}