import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Instagram } from "lucide-react";

// --- Utility helpers --------------------------------------------------------
const TZID = "America/Phoenix"; // GCU is in Phoenix (no DST)

function pad(n: number) { return n.toString().padStart(2, "0"); }

function yyyymmdd(date: string) {
  const d = new Date(date + "T00:00:00");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
}

function makeDateTimeBlock(date: string, startClock: string, endClock: string) {
  // startClock / endClock like "18:00:00"
  const day = yyyymmdd(date);
  return {
    gStart: `${day}T${startClock.replaceAll(":", "")}`,
    gEnd: `${day}T${endClock.replaceAll(":", "")}`,
    icsStart: `DTSTART;TZID=${TZID}:${day}T${startClock.replaceAll(":", "")}`,
    icsEnd: `DTEND;TZID=${TZID}:${day}T${endClock.replaceAll(":", "")}`,
  };
}

function icsFile({
  title, description, location = "Grand Canyon University",
  date, start = "18:00:00", end = "19:00:00"
}: { title: string; description: string; location?: string; date: string; start?: string; end?: string; }) {
  const { icsStart, icsEnd } = makeDateTimeBlock(date, start, end);
  const uid = `${yyyymmdd(date)}-${title.replace(/\\s+/g, "-").toLowerCase()}@gcu-chemclub`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//GCU Chemistry Club//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    icsStart,
    icsEnd,
    `DTSTAMP:${yyyymmdd(date)}T000000Z`,
    `UID:${uid}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([lines], { type: "text/calendar;charset=utf-8" });
}

function downloadICS(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl({
  title, description, location = "Grand Canyon University",
  date, start = "18:00:00", end = "19:00:00"
}: { title: string; description: string; location?: string; date: string; start?: string; end?: string; }) {
  const { gStart, gEnd } = makeDateTimeBlock(date, start, end);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location,
    dates: `${gStart}/${gEnd}`,
    ctz: TZID,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// --- Data -------------------------------------------------------------------
const schedule113 = [
  { date: "2025-09-16", title: "CHM-113 • Quiz 1 Review" },
  { date: "2025-10-14", title: "CHM-113 • Quiz 2 Review" },
  { date: "2025-10-21", title: "CHM-113 • Exam 1 Review" },
  { date: "2025-11-12", title: "CHM-113 • Quiz 3 Review" },
  { date: "2025-12-02", title: "CHM-113 • Quiz 4 Review" },
  { date: "2025-12-09", title: "CHM-113 • Exam 2 Review" },
];

const schedule115 = [
  { date: "2025-09-23", title: "CHM-115 • Quiz 1 Review" },
  { date: "2025-10-14", title: "CHM-115 • Quiz 2 Review" },
  { date: "2025-10-21", title: "CHM-115 • Exam 1 Review" },
  { date: "2025-11-04", title: "CHM-115 • Quiz 3 Review" },
  { date: "2025-12-02", title: "CHM-115 • Quiz 4 Review" },
  { date: "2025-12-09", title: "CHM-115 • Exam 2 Review" },
];

// --- Background (CSS/SVG) ---------------------------------------------------
function Hex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6; // flat-top hex
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const d = `M ${pts.map(p => p.join(",")).join(" L ")} Z`;
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {pts.map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="rgba(255,255,255,0.12)" />
      ))}
    </g>
  );
}

function ChemistryBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "#0f2f39" }}>
      <svg className="w-full h-full opacity-40" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f2f39" stopOpacity="0"/>
            <stop offset="60%" stopColor="#0f2f39" stopOpacity="1"/>
          </linearGradient>
        </defs>
        <g>
          <Hex cx={1050} cy={120} r={100} />
          <Hex cx={860}  cy={240} r={90}  />
          <Hex cx={1060} cy={360} r={70}  />
          <Hex cx={920}  cy={520} r={80}  />
          <Hex cx={1140} cy={600} r={60}  />
          <Hex cx={200}  cy={140} r={70}  />
          <Hex cx={340}  cy={260} r={60}  />
        </g>
        <rect x="0" y="0" width="1200" height="800" fill="url(#fade)" />
      </svg>
    </div>
  );
}

// --- Rows -------------------------------------------------------------------
function EventRow({ event, location }: { event: { date: string; title: string }; location: string }) {
  const dateObj = new Date(event.date + "T00:00:00");
  const long = dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const description = `Chemistry Club review session (Location: ${location}).`;

  const onICS = () => {
    const blob = icsFile({ title: event.title, description, date: event.date, location });
    downloadICS(blob, `${event.title.replace(/\\s+/g, "_")}_${yyyymmdd(event.date)}.ics`);
  };
  const onGoogle = () => {
    window.open(googleCalendarUrl({ title: event.title, description, date: event.date, location }), "_blank");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 py-3 border-b border-white/20 text-white">
      <div className="md:col-span-3 font-medium">{long}</div>
      <div className="md:col-span-3 text-sm">6:00–7:00 PM</div>
      <div className="md:col-span-3 text-sm">{event.title.split(" • ")[1]}</div>
      <div className="md:col-span-3 flex flex-wrap gap-2 justify-end">
        <Button
          onClick={onGoogle}
          size="sm"
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white border border-white/20 text-xs whitespace-nowrap"
        >
          <CalendarPlus className="w-5 h-5 mr-2" />Add to Calendar
        </Button>
        <Button
          onClick={onICS}
          size="sm"
          className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs whitespace-nowrap"
        >
          .ics file
        </Button>
      </div>
    </div>
  );
}

// --- Page -------------------------------------------------------------------
export default function GcuChemClubSite() {
  return (
    <div className="relative min-h-screen text-white">
      <ChemistryBg />

      {/* Nav / Header */}
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold">GC</div>
          <span className="text-lg font-semibold tracking-wide">GCU Chemistry Club</span>
        </div>
        <a href="#schedule" className="text-sm hover:underline">Schedule</a>
      </header>

      {/* Intro */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl px-4"
        >
          <Card className="bg-white/5 border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-3xl md:text-4xl font-semibold">Review Sessions for General Chemistry</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-10 text-base leading-relaxed">
              The GCU Chemistry Club hosts focused, student-led review sessions for
              <span className="font-semibold"> CHM-113 (General Chemistry I)</span> and
              <span className="font-semibold"> CHM-115 (General Chemistry II)</span>. Each session recaps key concepts,
              works through representative problems, and answers your questions ahead of quizzes and exams.
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Tabs defaultValue="113" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-2xl text-white">
              <TabsTrigger value="113" className="text-white data-[state=active]:bg-white/20">CHM-113</TabsTrigger>
              <TabsTrigger value="115" className="text-white data-[state=active]:bg-white/20">CHM-115</TabsTrigger>
            </TabsList>

            <TabsContent value="113" className="mt-6">
              <Card className="bg-white/5 border-white/20 rounded-3xl">
                <CardHeader className="px-6 pt-6">
                  <CardTitle className="text-xl">General Chemistry I - Fall 2025</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xs uppercase tracking-wide mb-2">All sessions: 6:00–7:00 PM (Arizona) • Location: 57-130</div>
                  {schedule113.map((e) => (
                    <EventRow key={e.date + e.title} event={e} location="Building 57 Room 130 (57-130)" />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="115" className="mt-6">
              <Card className="bg-white/5 border-white/20 rounded-3xl">
                <CardHeader className="px-6 pt-6">
                  <CardTitle className="text-xl">General Chemistry II - Fall 2025</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xs uppercase tracking-wide mb-2">All sessions: 6:00–7:00 PM (Arizona) • Location: 57-131</div>
                  {schedule115.map((e) => (
                    <EventRow key={e.date + e.title} event={e} location="Building 57 Room 131 (57-131)" />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Instagram CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Card className="bg-gradient-to-r from-fuchsia-700/40 to-rose-700/40 border-white/20 rounded-3xl">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold mb-1">Follow us on Instagram for live updates</div>
                <p>Announcements, room locations, and last-minute changes are posted here.</p>
              </div>
              <a href="https://instagram.com/gcuchemclub" target="_blank" rel="noreferrer" className="inline-flex items-center">
                <Button size="lg" className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Instagram className="w-5 h-5 mr-2" />
                  @gcuchemclub
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <footer className="px-4 py-10 border-t border-white/20 text-center text-sm">
        © {new Date().getFullYear()} GCU Chemistry Club • Phoenix, AZ
      </footer>
    </div>
  );
}