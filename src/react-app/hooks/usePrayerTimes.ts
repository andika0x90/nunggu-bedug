import { useState, useEffect, useRef } from "react";

export interface PrayerData {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface CountdownState {
  hours: string;
  minutes: string;
  seconds: string;
  progress: number;
  progressLabel: string;
  isBuka: boolean;
}

export function usePrayerTimes() {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: "--",
    minutes: "--",
    seconds: "--",
    progress: 0,
    progressLabel: "Menghitung perjalanan puasa...",
    isBuka: false,
  });
  const [locationText, setLocationText] = useState("📍 Mendeteksi lokasi...");
  const [locationError, setLocationError] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState("Mendeteksi lokasi...");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifSentRef = useRef(false);

  function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function tick(data: PrayerData) {
    const now = new Date();
    const maghrib = new Date(data.maghrib);
    const fajr = new Date(data.fajr);

    if (now >= maghrib) {
      setCountdown((prev) => ({
        ...prev,
        isBuka: true,
        progress: 100,
        progressLabel: "Sudah waktunya berbuka!",
      }));
      setCountdownLabel("Sudah waktunya buka puasa");
      if (!notifSentRef.current) {
        notifSentRef.current = true;
        if (Notification.permission === "granted") {
          new Notification("🥁 Bedug! Waktunya Buka Puasa!", {
            body: "Allahumma laka shumtu...",
          });
        }
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const diff = maghrib.getTime() - now.getTime();
    const totalFast = maghrib.getTime() - fajr.getTime();
    const elapsed = now.getTime() - fajr.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalFast) * 100));

    setCountdown({
      hours: String(Math.floor(diff / 3600000)).padStart(2, "0"),
      minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
      seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      progress,
      progressLabel: `${Math.floor(progress)}% perjalanan puasa hari ini`,
      isBuka: false,
    });
    setCountdownLabel("Menuju Maghrib · " + formatTime(data.maghrib));

    if (diff < 5 * 60 * 1000 && !notifSentRef.current) {
      notifSentRef.current = true;
      if (Notification.permission === "granted") {
        new Notification("🌅 5 Menit Lagi Buka Puasa!", {
          body: "Siapkan menu berbukamu!",
        });
      }
    }
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Lokasi Kamu";
      setLocationText(`📍 ${city}`);
    } catch {
      setLocationText(`📍 ${lat.toFixed(2)}, ${lng.toFixed(2)}`);
    }
  }

  async function fetchPrayerTimes(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/prayer-times?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("API error");
      const data: PrayerData = await res.json();
      setPrayerData(data);
      if (intervalRef.current) clearInterval(intervalRef.current);
      tick(data);
      intervalRef.current = setInterval(() => tick(data), 1000);
    } catch {
      setCountdownLabel("Gagal memuat jadwal sholat.");
    }
  }

  function getLocation() {
    setLocationError(false);
    setLocationText("📍 Mendeteksi lokasi...");
    if (!navigator.geolocation) {
      setLocationText("❌ Geolocation tidak didukung.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchPrayerTimes(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      () => {
        setLocationText("❌ Gagal mendapatkan lokasi.");
        setLocationError(true);
        setCountdownLabel("Izinkan akses lokasi untuk memulai.");
      }
    );
  }

  useEffect(() => {
    async function init() {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      getLocation();
    }
    init();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    prayerData,
    countdown,
    countdownLabel,
    locationText,
    locationError,
    formatTime,
    retry: getLocation,
  };
}
