import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../components/Header";
import SongCard from "../components/SongCard";
import { MOCK_RECENTLY_PLAYED } from "../lib/mockData";

export default function Playlist() {
  const router = useRouter();
  const { access_token, mock } = router.query;

  const [recentSongs, setRecentSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [recError, setRecError] = useState(null);
  const isMock = mock === "true";

  // Fetch recently played songs
  useEffect(() => {
    if (!router.isReady) return;

    if (isMock) {
      setRecentSongs(MOCK_RECENTLY_PLAYED);
      setLoadingRecent(false);
      return;
    }

    if (!access_token) {
      router.replace("/");
      return;
    }

    async function fetchRecent() {
      try {
        const res = await fetch("/api/spotify", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch songs");
        setRecentSongs(data.tracks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRecent(false);
      }
    }

    fetchRecent();
  }, [router.isReady, access_token, isMock]);

  // Generate recommendations
  async function generateRecommendations() {
    if (recentSongs.length === 0) return;
    setLoadingRecs(true);
    setRecError(null);
    setRecommendations([]);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songs: recentSongs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get recommendations");
      setRecommendations(data.recommendations);
    } catch (err) {
      setRecError(err.message);
    } finally {
      setLoadingRecs(false);
    }
  }

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Your Vibe Playlist — vibe.fm</title>
      </Head>

      <Header showLogout onLogout={handleLogout} />

      <main className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto">
        {/* Background glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 80% 20%, rgba(200,146,42,0.05) 0%, transparent 60%)",
          }}
        />

        {/* Page header */}
        <div className="mb-12 pt-4">
          <p
            className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--ember)" }}
          >
            {isMock ? "Sample Session" : "Your Spotify Session"}
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-black"
            style={{ color: "var(--cream)" }}
          >
            Your listening<br />
            <em style={{ color: "var(--ember)" }}>vibe</em>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Recently Played */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-body font-semibold text-xs tracking-widest uppercase opacity-50"
                style={{ color: "var(--cream)" }}>
                Recently Played
              </h2>
              {recentSongs.length > 0 && (
                <span className="font-mono text-xs" style={{ color: "var(--ember)" }}>
                  {recentSongs.length} tracks
                </span>
              )}
            </div>

            {loadingRecent ? (
              <LoadingSkeleton count={6} />
            ) : error ? (
              <ErrorBox message={error} />
            ) : recentSongs.length === 0 ? (
              <EmptyState message="No recent songs found." />
            ) : (
              <div className="space-y-2">
                {recentSongs.map((song, i) => (
                  <SongCard key={song.id} song={song} index={i} />
                ))}
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-body font-semibold text-xs tracking-widest uppercase opacity-50"
                style={{ color: "var(--cream)" }}>
                AI Recommendations
              </h2>
              {recommendations.length > 0 && (
                <span className="font-mono text-xs" style={{ color: "var(--ember)" }}>
                  {recommendations.length} tracks
                </span>
              )}
            </div>

            {recommendations.length === 0 && !loadingRecs ? (
              <div
                className="flex flex-col items-center justify-center text-center p-10 rounded-xl"
                style={{
                  border: "1px dashed rgba(200,146,42,0.25)",
                  minHeight: 280,
                }}
              >
                {/* Waveform icon idle */}
                <div className="mb-6 opacity-30">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="16" width="4" height="16" rx="2" fill="var(--ember)" />
                    <rect x="12" y="10" width="4" height="28" rx="2" fill="var(--ember)" />
                    <rect x="20" y="6" width="4" height="36" rx="2" fill="var(--ember)" />
                    <rect x="28" y="10" width="4" height="28" rx="2" fill="var(--ember)" />
                    <rect x="36" y="16" width="4" height="16" rx="2" fill="var(--ember)" />
                    <rect x="2" y="23" width="44" height="2" rx="1" fill="var(--ember)" opacity="0.3" />
                  </svg>
                </div>
                <p className="font-body text-sm opacity-40 mb-6" style={{ color: "var(--cream)" }}>
                  Ready to discover what's next for you.
                </p>
                <GenerateButton
                  onClick={generateRecommendations}
                  disabled={recentSongs.length === 0 || loadingRecent}
                />
                {recError && (
                  <p className="mt-4 text-xs font-body" style={{ color: "#ff6b6b" }}>
                    {recError}
                  </p>
                )}
              </div>
            ) : loadingRecs ? (
              <div
                className="flex flex-col items-center justify-center text-center p-10 rounded-xl"
                style={{
                  border: "1px solid rgba(200,146,42,0.15)",
                  minHeight: 280,
                }}
              >
                <div className="loading-wave mb-4">
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                </div>
                <p className="font-body text-sm opacity-50 mt-4" style={{ color: "var(--cream)" }}>
                  Claude is reading your vibe…
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {recommendations.map((song, i) => (
                    <SongCard
                      key={`rec-${i}`}
                      song={song}
                      index={i}
                      isRecommendation
                    />
                  ))}
                </div>
                <button
                  onClick={generateRecommendations}
                  className="w-full py-3 rounded-lg font-body text-xs tracking-wider uppercase transition-all duration-200 hover:opacity-80"
                  style={{
                    border: "1px solid rgba(200,146,42,0.3)",
                    color: "var(--ember)",
                  }}
                >
                  Regenerate
                </button>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function GenerateButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-6 py-3 rounded-full font-body font-semibold text-sm tracking-wide transition-all duration-300 disabled:opacity-40"
      style={{
        background: "var(--ember)",
        color: "var(--coal)",
      }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--ember)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1l1.5 4.5H14l-3.75 2.75L11.75 13 8 10.25 4.25 13l1.5-4.75L2 5.5h4.5L8 1z"
          fill="currentColor"
        />
      </svg>
      Generate Playlist
    </button>
  );
}

function LoadingSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="w-6 h-3 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="w-12 h-12 rounded flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded w-3/4" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="h-2.5 rounded w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div
      className="p-4 rounded-lg text-sm font-body"
      style={{
        background: "rgba(220,50,50,0.08)",
        border: "1px solid rgba(220,50,50,0.2)",
        color: "#ff6b6b",
      }}
    >
      {message}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 opacity-40 font-body text-sm"
      style={{ color: "var(--cream)" }}>
      {message}
    </div>
  );
}
