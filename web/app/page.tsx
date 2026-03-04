"use client";
import { useState, useEffect } from "react";
import BriefCard from "./components/BriefCard";
import ZoneSelector from "./components/ZoneSelector";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
interface Region {
  id: number;
  slug: string;
  name: string;
  center: string;
  state: string;
}
export default function Home() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefLoaded, setBriefLoaded] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/api/regions`)
      .then((r) => r.json())
      .then((data) => {
        setRegions(data);
        if (data.length > 0) setSelectedSlug(data[0].slug);
      })
      .catch(() => setError("Could not load regions. Is the API running?"));
  }, []);
  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);
    setBriefLoaded(false);
    setError(null);
    fetch(`${API_URL}/api/brief/${selectedSlug}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setBrief(data);
        setLoading(false);
        setTimeout(() => setBriefLoaded(true), 50);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedSlug]);
  return (
    <main className="min-h-screen" style={{ background: 'var(--slate-950)' }}>
      {/* Header */}
      <header style={{ background: 'var(--slate-900)', borderBottom: '1px solid var(--slate-700)' }} className="sticky top-0 z-50">
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--danger-3)' }}>
              ⛰
            </div>
            <div>
              <h1 className="display text-white text-xl leading-none">Slope Signal</h1>
              <p className="mono text-xs" style={{ color: 'var(--slate-400)' }}>UAC · UTAH AVALANCHE CENTER</p>
            </div>
          </div>
          <div className="mono text-xs" style={{ color: 'var(--slate-400)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </header>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem' }}>
        {/* Disclaimer */}
        <div className="mb-6 px-4 py-3 rounded" style={{ background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.3)' }}>
          <p className="mono text-xs" style={{ color: 'var(--danger-3)' }}>
            ⚠ NOT A SAFETY TOOL — Slope Signal presents signals from public UAC forecast data. Always consult utahavalanchecenter.org and make your own informed decisions.
          </p>
        </div>
        {/* Zone selector */}
        <ZoneSelector
          regions={regions}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          brief={brief}
        />
        {/* Content */}
        <div className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="mono text-sm" style={{ color: 'var(--slate-400)' }}>
                FETCHING FORECAST...
              </div>
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded mono text-sm" style={{ background: 'rgba(255,31,31,0.1)', border: '1px solid rgba(255,31,31,0.3)', color: 'var(--danger-4)' }}>
              ERROR: {error}
            </div>
          )}
          {!loading && !error && brief && (
            <div className={briefLoaded ? 'animate-in' : 'opacity-0'}>
              <BriefCard brief={brief} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}