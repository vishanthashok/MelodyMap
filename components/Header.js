import Link from "next/link";

export default function Header({ showLogout, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{
        background: "linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%)",
      }}
    >
      <Link href="/" className="flex items-center gap-3 group">
        {/* Vinyl icon */}
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 rounded-full border-2 border-ember group-hover:border-gold transition-colors duration-300"
            style={{ background: "radial-gradient(circle, #1a1a1a 30%, #2a2a2a 100%)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-ember group-hover:bg-gold transition-colors duration-300" />
            </div>
          </div>
        </div>
        <span className="font-display text-xl font-bold tracking-tight"
          style={{ color: "var(--cream)" }}>
          vibe<span style={{ color: "var(--ember)" }}>.</span>fm
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {showLogout && (
          <button
            onClick={onLogout}
            className="text-sm font-body font-medium tracking-wider uppercase opacity-60 hover:opacity-100 transition-opacity duration-200"
            style={{ color: "var(--cream)", letterSpacing: "0.1em" }}
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
