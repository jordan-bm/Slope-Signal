"use client";

const ZONE_LABELS: Record<string, { short: string; region: string }> = {
  "uac-salt-lake": { short: "SLC", region: "Salt Lake" },
  "uac-ogden": { short: "OGD", region: "Ogden" },
  "uac-provo": { short: "PRV", region: "Provo" },
  "uac-moab": { short: "MOB", region: "Moab" },
  "uac-uintas": { short: "UIN", region: "Uintas" },
  "uac-skyline": { short: "SKY", region: "Skyline" },
  "uac-logan": { short: "LOG", region: "Logan" },
};

const DANGER_COLORS: Record<number, string> = {
  1: "var(--danger-1)",
  2: "var(--danger-2)",
  3: "var(--danger-3)",
  4: "var(--danger-4)",
  5: "#ff6b6b",
};

const DANGER_LABELS: Record<number, string> = {
  1: "LOW",
  2: "MODERATE",
  3: "CONSIDERABLE",
  4: "HIGH",
  5: "EXTREME",
};

interface Region {
  id: number;
  slug: string;
  name: string;
  center: string;
  state: string;
}

interface Props {
  regions: Region[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  brief: any;
}

export default function ZoneSelector({ regions, selectedSlug, onSelect, brief }: Props) {
  const danger = brief?.danger_alpine;
  const dangerColor = danger ? DANGER_COLORS[danger] : "var(--slate-700)";
  const dangerLabel = danger ? DANGER_LABELS[danger] : null;

  return (
    <div>
      {/* Active zone danger display */}
      {brief && (
        <div
          className="rounded-lg mb-4 px-5 py-4 animate-in"
          style={{
            background: `linear-gradient(135deg, ${dangerColor}22, ${dangerColor}11)`,
            border: `1px solid ${dangerColor}55`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="mono text-xs mb-1" style={{ color: 'var(--slate-400)' }}>
                AVALANCHE DANGER · {brief.region.name.toUpperCase()} · {brief.forecast_date}
              </p>
              <h2
                className="display text-5xl md:text-7xl leading-none"
                style={{ color: dangerColor }}
              >
                {brief.danger_label}
              </h2>
              <p className="mono text-xs mt-2" style={{ color: 'var(--slate-400)' }}>
                ALPINE {brief.danger_alpine}/5 · TREELINE {brief.danger_treeline}/5 · BELOW {brief.danger_below_treeline}/5
              </p>
            </div>
            <div
                className="display leading-none select-none hidden md:block"
                style={{ color: dangerColor, fontSize: '6rem', opacity: 0.15 }}
            >
              {danger}
            </div>
          </div>
        </div>
      )}

      {/* Zone tabs */}
      <div className="flex flex-wrap gap-2 mt-4">
        {regions.map((region) => {
          const label = ZONE_LABELS[region.slug];
          const isSelected = region.slug === selectedSlug;
          return (
            <button
              key={region.slug}
              onClick={() => onSelect(region.slug)}
              className="rounded px-3 py-2 transition-all duration-150"
              style={{
                background: isSelected ? 'var(--slate-700)' : 'var(--slate-900)',
                border: isSelected ? '1px solid var(--slate-400)' : '1px solid var(--slate-700)',
                color: isSelected ? 'white' : 'var(--slate-400)',
                cursor: 'pointer',
              }}
            >
              <div className="mono text-xs font-bold">{label?.short ?? region.slug}</div>
              <div className="text-xs mt-0.5" style={{ fontFamily: 'Barlow, sans-serif' }}>
                {label?.region ?? region.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}