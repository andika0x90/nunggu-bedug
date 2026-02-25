import { Hono } from "hono";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/prayer-times", (c) => {
  const lat = parseFloat(c.req.query("lat") || "");
  const lng = parseFloat(c.req.query("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod.MoonsightingCommittee();
  const now = new Date();
  const times = new PrayerTimes(coords, now, params);

  return c.json({
    date: now.toISOString(),
    imsak: times.fajr.toISOString(),
    fajr: times.fajr.toISOString(),
    sunrise: times.sunrise.toISOString(),
    dhuhr: times.dhuhr.toISOString(),
    asr: times.asr.toISOString(),
    maghrib: times.maghrib.toISOString(),
    isha: times.isha.toISOString(),
  });
});

export default app;
