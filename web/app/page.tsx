"use client";

import { useState, useEffect } from "react";
import BriefCard from "./components/BriefCard";

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
    setError(null);
    fetch(`${API_URL}/api/brief/${selectedSlug}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setBrief(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedSlug]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Slope Signal
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Daily avalanche signal brief — based on public forecast data
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg px-4 py-3 mb-6 text-yellow-200 text-xs leading-relaxed">
          ⚠️ <strong>Not a safety tool.</strong> Slope Signal presents signals
          and risk factors from public avalanche forecast centers. It does not
          make go/no-go recommendations. Always consult your regional avalanche
          center and make your own informed decisions.
        </div>

        {/* Region selector */}
        <div className="mb-6">
          <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
            Zone
          </label>
          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} ({r.center} · {r.state})
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-zinc-400 text-sm text-center py-12">
            Loading brief...
          </div>
        )}
        {error && (
          <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && brief && <BriefCard brief={brief} />}
      </div>
    </main>
  );
}