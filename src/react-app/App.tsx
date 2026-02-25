import { useState, useEffect, useRef } from "react";
import { usePrayerTimes, PrayerData } from "./hooks/usePrayerTimes";

function IslamicPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,2 78,20 78,60 40,78 2,60 2,20" fill="none" stroke="#7a4f2a" strokeWidth="1" />
            <polygon points="40,14 66,27 66,53 40,66 14,53 14,27" fill="none" stroke="#7a4f2a" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="4" fill="none" stroke="#7a4f2a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic)" />
      </svg>
    </div>
  );
}

function TopWave() {
  return (
    <div className="relative z-10 w-full overflow-hidden h-16">
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,80 L0,40 Q360,0 720,40 Q1080,80 1440,20 L1440,80 Z" fill="#b8763a" opacity="0.12" />
      </svg>
    </div>
  );
}

function Header() {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px w-10 bg-[#b8763a] opacity-50" />
        <span className="text-[#b8763a] text-[11px] tracking-[0.35em] uppercase font-semibold">Ramadan Kareem</span>
        <div className="h-px w-10 bg-[#b8763a] opacity-50" />
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-[#2c1a0e] leading-none tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
        Nunggu<span className="text-[#b8763a] italic">Bedug</span>
      </h1>
      <p className="text-[#9a7c5f] text-sm mt-2.5 tracking-wide">Hitung Mundur Buka Puasa</p>
    </header>
  );
}

function CountdownCard({
  countdown,
  countdownLabel,
  locationText,
  locationError,
  retry,
}: {
  countdown: ReturnType<typeof usePrayerTimes>["countdown"];
  countdownLabel: string;
  locationText: string;
  locationError: boolean;
  retry: () => void;
}) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#2c1a0e] rounded-[2rem] p-7 mb-4 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(184,118,58,0.3) 0%, transparent 65%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b8763a] to-transparent opacity-30" />

      <p className="text-center text-[#b8763a] text-[11px] tracking-[0.3em] uppercase font-semibold mb-5">{countdownLabel}</p>

      {countdown.isBuka ? (
        <div className="text-center py-4">
          <p className="text-3xl font-black text-[#e0a855]" style={{ fontFamily: "'Playfair Display', serif" }}>
            🌙 Selamat Berbuka! 🌙
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-center gap-1 mb-6">
          {(
            [
              { id: "hours", val: countdown.hours, label: "Jam" },
              { sep: true },
              { id: "minutes", val: countdown.minutes, label: "Menit" },
              { sep: true },
              { id: "seconds", val: countdown.seconds, label: "Detik" },
            ] as const
          ).map((item, i) =>
            "sep" in item ? (
              <span
                key={i}
                className="text-[4rem] font-black text-[#b8763a] leading-none mt-2 transition-opacity duration-300"
                style={{ fontFamily: "'Playfair Display', serif", opacity: blink ? 1 : 0.15 }}
              >
                :
              </span>
            ) : (
              <div key={item.id} className="flex flex-col items-center min-w-[80px] md:min-w-[90px]">
                <span
                  className="text-[4.5rem] md:text-[5rem] font-black text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', serif", fontVariantNumeric: "tabular-nums" }}
                >
                  {item.val}
                </span>
                <span className="text-[#6b5040] text-[10px] tracking-[0.2em] uppercase mt-1.5">{item.label}</span>
              </div>
            )
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: countdown.progress + "%", background: "linear-gradient(90deg,#6b4020,#b8763a,#e8a84a)" }}
          />
        </div>
        <p className="text-center text-[#6b5040] text-xs">{countdown.progressLabel}</p>
      </div>

      {/* Location */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
        <p className="text-[#6b5040] text-xs">{locationText}</p>
        {locationError && (
          <button onClick={retry} className="text-[10px] bg-[#b8763a] text-white px-2.5 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity cursor-pointer">
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

const PRAYER_META = [
  { key: "imsak", name: "Imsak", icon: "🌛" },
  { key: "fajr", name: "Subuh", icon: "🌤️" },
  { key: "sunrise", name: "Terbit", icon: "🌄" },
  { key: "dhuhr", name: "Dzuhur", icon: "☀️" },
  { key: "asr", name: "Ashar", icon: "🌥️" },
  { key: "maghrib", name: "Maghrib", icon: "🌅" },
  { key: "isha", name: "Isya", icon: "🌃" },
] as const;

function ScheduleCard({ prayerData, formatTime }: { prayerData: PrayerData | null; formatTime: (s: string) => string }) {
  const now = new Date();
  const nextIdx = prayerData ? PRAYER_META.findIndex((p) => new Date(prayerData[p.key as keyof PrayerData]) > now) : -1;

  return (
    <div className="bg-white/60 backdrop-blur border border-[#ead9be] rounded-[2rem] p-5 mb-4 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-0.5 h-5 bg-[#b8763a] rounded-full" />
        <h2 className="text-base font-bold text-[#2c1a0e] tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          Jadwal Sholat Hari Ini
        </h2>
      </div>

      {!prayerData ? (
        <div className="text-center text-[#9a7c5f] text-sm py-6">Memuat jadwal sholat...</div>
      ) : (
        <div className="space-y-0.5">
          {PRAYER_META.map((p, i) => {
            const timeStr = prayerData[p.key as keyof PrayerData];
            const isPast = new Date(timeStr) < now;
            const isNext = i === nextIdx;
            return (
              <div
                key={p.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isNext ? "bg-[#2c1a0e]" : isPast ? "opacity-30" : "hover:bg-[#f5ede0]"}`}
              >
                <span className="text-lg w-6 text-center">{p.icon}</span>
                <span className={`flex-1 text-sm font-medium ${isNext ? "text-white" : "text-[#2c1a0e]"}`}>{p.name}</span>
                {isNext && <span className="text-[9px] bg-[#b8763a] text-white px-2 py-0.5 rounded-full tracking-wider uppercase font-bold">Berikutnya</span>}
                <span className={`font-bold text-sm ${isNext ? "text-[#e0a855]" : "text-[#b8763a]"}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {formatTime(timeStr)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DoaCard() {
  return (
    <div className="mb-4 rounded-[2rem] p-7 text-center shadow-xl" style={{ background: "linear-gradient(135deg,#b8763a,#7a4520)" }}>
      <p className="text-white/90 text-2xl leading-loose mb-3 font-serif" dir="rtl">
        اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
      </p>
      <p className="text-white/70 text-sm italic mb-1.5">Allahumma laka shumtu wa 'ala rizqika aftartu</p>
      <p className="text-white/50 text-xs">"Ya Allah, untuk-Mu aku berpuasa, dan dengan rezeki-Mu aku berbuka."</p>
    </div>
  );
}

function BedugOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-5">
      <div className="bg-[#faf6ef] border border-[#ead9be] rounded-[2rem] p-8 text-center max-w-sm w-full shadow-2xl">
        <div className="text-5xl mb-5">🥁</div>
        <h2 className="text-2xl font-black text-[#2c1a0e] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Waktunya Buka!
        </h2>
        <p className="text-[#9a7c5f] text-sm mb-6 leading-relaxed">Selamat berbuka, semoga puasamu diterima Allah SWT.</p>
        <button onClick={onClose} className="bg-[#2c1a0e] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-[#b8763a] transition-colors cursor-pointer">
          Tutup
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { prayerData, countdown, countdownLabel, locationText, locationError, formatTime, retry } = usePrayerTimes();
  const [showBedug, setShowBedug] = useState(false);
  const shownBedugRef = useRef(false);

  useEffect(() => {
    if (countdown.isBuka && !shownBedugRef.current) {
      shownBedugRef.current = true;
      setShowBedug(true);
    }
  }, [countdown.isBuka]);

  return (
    <div className="min-h-screen bg-[#faf6ef] text-[#2c1a0e] relative overflow-x-hidden">
      <IslamicPattern />
      <TopWave />
      <main className="relative z-10 max-w-lg mx-auto px-5 pb-16 -mt-2">
        <Header />
        <CountdownCard countdown={countdown} countdownLabel={countdownLabel} locationText={locationText} locationError={locationError} retry={retry} />
        <ScheduleCard prayerData={prayerData} formatTime={formatTime} />
        {countdown.isBuka && <DoaCard />}
      </main>
      {showBedug && <BedugOverlay onClose={() => setShowBedug(false)} />}
    </div>
  );
}
