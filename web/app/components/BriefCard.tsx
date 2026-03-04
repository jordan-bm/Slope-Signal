"use client";

import RiskIndexCard from "./RiskIndexCard";

const PROBLEM_ICONS: Record<string, string> = {
  "wind slab": "💨",
  "storm slab": "🌨",
  "wet slab": "💧",
  "wet avalanche": "💧",
  "persistent slab": "⚠️",
  "deep slab": "🔻",
  "loose dry": "❄️",
  "loose wet": "💦",
  "cornice": "🏔",
  "gliding": "📐",
};

function getProblemIcon(problemText: string): string {
  if (!problemText) return "⚡";
  const lower = problemText.toLowerCase();
  for (const [key, icon] of Object.entries(PROBLEM_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "⚡";
}

function ProblemBadge({ label, description }: { label: string; description: string }) {
  if (!label) return null;
  const icon = getProblemIcon(label);
  return (
    <div
      className="rounded-lg px-4 py-3 flex-1 min-w-0"
      style={{ background: 'var(--slate-800)', border: '1px solid var(--slate-700)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="mono text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      </div>
      {description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--slate-400)' }}>
          {description.slice(0, 120)}{description.length > 120 ? '...' : ''}
        </p>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-5 py-4"
      style={{ background: 'var(--slate-900)', border: '1px solid var(--slate-700)' }}
    >
      <div className="mono text-xs mb-3 pb-2" style={{ color: 'var(--slate-400)', borderBottom: '1px solid var(--slate-700)' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

interface Props {
  brief: any;
}

export default function BriefCard({ brief }: Props) {
  const problems = brief.problems || {};
  const fetchedDate = brief.fetched_at
    ? new Date(brief.fetched_at).toLocaleString()
    : "Unknown";

  const problem1 = problems.avalanche_problem_1;
  const problem1Desc = problems.avalanche_problem_1_description;
  const problem2 = problems.avalanche_problem_2;
  const problem2Desc = problems.avalanche_problem_2_description;
  const problem3 = problems.avalanche_problem_3;
  const problem3Desc = problems.avalanche_problem_3_description;

  const hasProblems = problem1 || problem2 || problem3;

  return (
    <div className="space-y-4">

      {/* Avalanche Problems */}
      {hasProblems && (
        <div className="animate-in animate-in-delay-1">
          <Section label="AVALANCHE PROBLEMS">
            <div className="flex flex-wrap gap-3">
              {problem1 && <ProblemBadge label={problem1} description={problem1Desc} />}
              {problem2 && <ProblemBadge label={problem2} description={problem2Desc} />}
              {problem3 && <ProblemBadge label={problem3} description={problem3Desc} />}
            </div>
          </Section>
        </div>
      )}

      {/* Risk Index */}
      <div className="animate-in animate-in-delay-2">
        <RiskIndexCard riskIndex={brief.risk_index} />
      </div>

      {/* Bottom Line */}
      {problems.bottom_line && (
        <div className="animate-in animate-in-delay-3">
          <Section label="BOTTOM LINE">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--slate-200)' }}>
              {problems.bottom_line}
            </p>
          </Section>
        </div>
      )}

      {/* Current Conditions */}
      {brief.discussion && (
        <div className="animate-in animate-in-delay-4">
          <Section label="CURRENT CONDITIONS">
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--slate-200)' }}>
              {brief.discussion}
            </p>
          </Section>
        </div>
      )}

      {/* Recent Activity */}
      {problems.recent_activity && (
        <div className="animate-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <Section label="RECENT ACTIVITY">
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--slate-200)' }}>
              {problems.recent_activity}
            </p>
          </Section>
        </div>
      )}

      {/* Special Announcement */}
      {problems.special_announcement && (
        <div className="animate-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
          <div
            className="rounded-lg px-5 py-4"
            style={{ background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.3)' }}
          >
            <div className="mono text-xs mb-2" style={{ color: 'var(--danger-3)' }}>
              ⚠ SPECIAL ANNOUNCEMENT
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--slate-200)' }}>
              {problems.special_announcement}
            </p>
          </div>
        </div>
      )}

      {/* Mountain Weather */}
      {problems.mountain_weather && (
        <div className="animate-in" style={{ animationDelay: '0.7s', opacity: 0 }}>
          <Section label="MOUNTAIN WEATHER">
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--slate-200)' }}>
              {problems.mountain_weather}
            </p>
          </Section>
        </div>
      )}

      {/* Footer */}
      <div className="mono text-xs text-right py-2" style={{ color: 'var(--slate-400)' }}>
        FORECAST DATE: {brief.forecast_date} · FETCHED: {fetchedDate}
      </div>
    </div>
  );
}