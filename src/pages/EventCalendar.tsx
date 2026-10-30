import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Flame,
  Sparkles,
  Search,
  Copy,
  Check,
  AlertTriangle,
  Camera,
  PenTool,
  Video,
  Clock,
  RotateCcw,
  BellRing,
  ArrowUpRight,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";
import { hasDecidedConsent } from "@/lib/consent";
import {
  EVENT_CATEGORIES,
  MONTH_NAMES,
  findEventsNearDate,
  resolveAllEvents,
  type EventCategory,
  type ResolvedStockEvent,
} from "@/data/stockEvents";
import { toast } from "sonner";

const EVENT_CALENDAR_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tagyfy Pro Stock Contributor Event & Upload Lead-Time Calendar",
  url: "https://tagyfy.com/event-calendar",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern browser",
  description:
    "Year-round event calendar and upload lead-time planner for Adobe Stock, Shutterstock, and Freepik contributors. Search by date or month for commercial briefs, photo/vector/video concepts, and trademark-safe keywords.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const SESSION_POPUP_KEY = "tagyfy_event_radar_seen_v1";

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DemandBadge({ level }: { level: ResolvedStockEvent["demandLevel"] }) {
  return (
    <Badge
      variant="outline"
      className={
        level === "Peak"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-500 text-[10px] font-bold"
          : level === "High"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px] font-bold"
            : "border-sky-500/40 bg-sky-500/10 text-sky-500 text-[10px] font-bold"
      }
    >
      {level} Demand
    </Badge>
  );
}

const EventCalendar = () => {
  const navigate = useNavigate();

  // Compute all events dynamically relative to visitor's current date
  const allResolvedEvents = useMemo(() => resolveAllEvents(new Date()), []);

  // Upcoming events (within next 60 days) & Upload-Now events (6–12 week buyer window)
  const happeningSoonEvents = useMemo(
    () => allResolvedEvents.filter((ev) => ev.daysUntil <= 60).slice(0, 8),
    [allResolvedEvents]
  );

  const uploadNowEvents = useMemo(
    () =>
      allResolvedEvents
        .filter((ev) => ev.inUploadWindowNow)
        .sort((a, b) => {
          const rank = { Peak: 0, High: 1, Steady: 2 };
          if (rank[a.demandLevel] !== rank[b.demandLevel]) {
            return rank[a.demandLevel] - rank[b.demandLevel];
          }
          return a.daysUntil - b.daysUntil;
        }),
    [allResolvedEvents]
  );

  // Automatic Upcoming Events Radar dialog (opens once per browser session after cookie consent is decided)
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarTab, setRadarTab] = useState<"soon" | "upload">("soon");

  useEffect(() => {
    const maybeOpenRadar = () => {
      if (!hasDecidedConsent()) return;
      try {
        const alreadySeen = sessionStorage.getItem(SESSION_POPUP_KEY);
        if (!alreadySeen) {
          setRadarOpen(true);
          sessionStorage.setItem(SESSION_POPUP_KEY, "1");
        }
      } catch {
        setRadarOpen(true);
      }
    };

    maybeOpenRadar();
    window.addEventListener("tagyfy:consent", maybeOpenRadar);
    return () => window.removeEventListener("tagyfy:consent", maybeOpenRadar);
  }, []);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [pickedDateIso, setPickedDateIso] = useState<string>("");
  const [onlyUploadWindow, setOnlyUploadWindow] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<"upcoming" | "calendar">("upcoming");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Event counts per month for quick-month selector badges
  const monthCounts = useMemo(() => {
    const counts = new Array(12).fill(0);
    for (const ev of allResolvedEvents) {
      const m = ev.nextDate.getMonth(); // 0..11
      counts[m]++;
    }
    return counts;
  }, [allResolvedEvents]);

  // Filtered events list
  const filteredEvents = useMemo(() => {
    let base: Array<ResolvedStockEvent & { dayDistance?: number }> = allResolvedEvents;

    // 1. Exact Date Picker (±14 days around chosen date, exact matches first)
    if (pickedDateIso) {
      const parts = pickedDateIso.split("-").map(Number);
      if (parts.length === 3 && parts[1] >= 1 && parts[2] >= 1) {
        base = findEventsNearDate(allResolvedEvents, parts[1], parts[2], 14);
      }
    } else if (selectedMonth !== "all") {
      base = base.filter(
        (ev) => ev.nextDate.getMonth() + 1 === selectedMonth || ev.month === selectedMonth
      );
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      base = base.filter((ev) => ev.category === selectedCategory);
    }

    // 3. Upload-window-now toggle
    if (onlyUploadWindow) {
      base = base.filter((ev) => ev.inUploadWindowNow);
    }

    // 4. Text search across name, intro, ideas, regions, dateLabel, and keywords
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (ev) =>
          ev.name.toLowerCase().includes(q) ||
          ev.intro.toLowerCase().includes(q) ||
          ev.dateLabel.toLowerCase().includes(q) ||
          ev.photoIdea.toLowerCase().includes(q) ||
          ev.vectorIdea.toLowerCase().includes(q) ||
          ev.videoIdea.toLowerCase().includes(q) ||
          ev.regions.some((r) => r.toLowerCase().includes(q)) ||
          ev.safeKeywords.some((k) => k.toLowerCase().includes(q)) ||
          MONTH_NAMES[ev.month - 1].toLowerCase().includes(q)
      );
    }

    // 5. Sort order (preserve proximity order when a specific date is picked)
    if (pickedDateIso) {
      return base;
    }
    if (sortMode === "calendar") {
      return [...base].sort((a, b) =>
        a.month !== b.month ? a.month - b.month : a.day - b.day
      );
    }
    return [...base].sort((a, b) => a.daysUntil - b.daysUntil);
  }, [
    allResolvedEvents,
    pickedDateIso,
    selectedMonth,
    selectedCategory,
    onlyUploadWindow,
    searchQuery,
    sortMode,
  ]);

  const handleCopyKeywords = (ev: ResolvedStockEvent) => {
    const text = ev.safeKeywords.join(", ");
    navigator.clipboard?.writeText(text);
    setCopiedId(ev.id);
    toast.success(`Copied ${ev.safeKeywords.length} safe keywords for "${ev.name}"`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleUseInAiGenerator = (ev: ResolvedStockEvent) => {
    const year = ev.nextDate.getFullYear();
    const targetName = `${ev.name} ${year}`;
    try {
      localStorage.setItem("tagyfy_event_enabled", "true");
      localStorage.setItem("tagyfy_event_name", targetName);
    } catch {
      // ignore storage errors in restricted privacy modes
    }
    toast.success(`Activated Event Targeting for "${targetName}"`);
    navigate("/tool");
  };

  const handleJumpToEvent = (ev: ResolvedStockEvent) => {
    setRadarOpen(false);
    // Clear filters so target event is guaranteed visible
    setSearchQuery("");
    setSelectedMonth("all");
    setSelectedCategory("all");
    setPickedDateIso("");
    setOnlyUploadWindow(false);
    setHighlightedId(ev.id);

    setTimeout(() => {
      const el = document.getElementById(`event-card-${ev.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    setTimeout(() => setHighlightedId(null), 3500);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMonth("all");
    setSelectedCategory("all");
    setPickedDateIso("");
    setOnlyUploadWindow(false);
    setSortMode("upcoming");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedMonth !== "all" ||
    selectedCategory !== "all" ||
    Boolean(pickedDateIso) ||
    onlyUploadWindow;

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
      <Helmet>
        <title>
          Stock Contributor Event Calendar &amp; Upload Planner — Adobe Stock &amp; Shutterstock | Tagyfy Pro
        </title>
        <meta
          name="description"
          content="Search seasonal holidays, commercial sales, and global awareness days by date or month. Includes Adobe Stock upload lead times, photo/vector/video concepts, trademark warnings, and copy-ready safe keywords."
        />
        <link rel="canonical" href="https://tagyfy.com/event-calendar" />
      </Helmet>

      <JsonLd
        data={[
          EVENT_CALENDAR_SCHEMA,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Stock Event Calendar", path: "/event-calendar" },
          ]),
        ]}
      />

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* AUTO-OPENING UPCOMING EVENTS & UPLOAD-NOW RADAR DIALOG                */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Dialog open={radarOpen} onOpenChange={setRadarOpen}>
        <DialogContent className="max-w-2xl max-h-[86vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider">
              <BellRing className="w-3.5 h-3.5" />
              Live Contributor Event Radar
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground">
              Upcoming Events &amp; What to Upload Right Now
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Automatically calculated from today&apos;s date. Check events happening next, or switch to{" "}
              <strong>Prime Upload Window</strong> to see what Adobe Stock buyers will search 6–10 weeks from now.
            </DialogDescription>
          </DialogHeader>

          {/* Popup Tabs */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRadarTab("soon")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                radarTab === "soon"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Happening Next ({happeningSoonEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setRadarTab("upload")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                radarTab === "upload"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Upload Window Open Now ({uploadNowEvents.slice(0, 8).length})
            </button>
          </div>

          {/* Popup Event List */}
          <div className="space-y-2.5 pt-2">
            {(radarTab === "soon" ? happeningSoonEvents : uploadNowEvents.slice(0, 8)).map(
              (ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-border/80 bg-background/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{ev.name}</span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {ev.daysUntil === 0
                          ? "Today!"
                          : ev.daysUntil === 1
                            ? "Tomorrow"
                            : `In ${ev.daysUntil} days`}
                      </Badge>
                      <DemandBadge level={ev.demandLevel} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <strong className="text-foreground/80">
                        {formatShortDate(ev.nextDate)}:
                      </strong>{" "}
                      {ev.intro}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleJumpToEvent(ev)}
                      className="h-8 rounded-xl text-xs"
                    >
                      View Brief
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUseInAiGenerator(ev)}
                      className="h-8 rounded-xl text-xs gap-1"
                    >
                      AI Tag
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <span>Tip: Search any exact date or month on the full calendar behind this window.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRadarOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Explore Full Calendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <CalendarIcon className="w-3.5 h-3.5" />
            Stock Contributor Seasonal Planner · {allResolvedEvents.length} High-Demand Events
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Stock Contributor <span className="text-gradient-flow">Event Calendar</span>
          </h1>

          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Search any <strong>date</strong>, <strong>month</strong>, or <strong>seasonal theme</strong> to discover
            high-converting commercial holidays, awareness days, buyer content ideas for photos/vectors/videos,
            trademark-safe keywords, and ideal Adobe Stock upload lead times.
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setRadarTab("soon");
                setRadarOpen(true);
              }}
              className="rounded-xl gap-2 font-bold shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Upcoming Events Radar ({happeningSoonEvents.length})
            </Button>

            <Button
              type="button"
              size="sm"
              variant={onlyUploadWindow ? "default" : "outline"}
              onClick={() => setOnlyUploadWindow((v) => !v)}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {onlyUploadWindow
                ? `Showing Prime Upload Window (${uploadNowEvents.length})`
                : `Filter: Upload Window Open Now (${uploadNowEvents.length})`}
            </Button>
          </div>
        </header>

        {/* Inline "Prime Upload Window Right Now" Strip (Always crawlable & immediately visible) */}
        <section className="glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/25 bg-emerald-500/[0.03] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Create &amp; Upload Now (6–10 Weeks Ahead of Peak Buyer Searches)
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Agencies &amp; corporate buyers download seasonal stock weeks before the event date
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {uploadNowEvents.slice(0, 4).map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleJumpToEvent(ev)}
                className="text-left rounded-2xl border border-border/80 bg-background/70 p-3.5 hover:border-emerald-500/50 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold text-emerald-500">
                    In {ev.daysUntil} days
                  </span>
                  <DemandBadge level={ev.demandLevel} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                  {ev.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatShortDate(ev.nextDate)} · {ev.category}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Search by Date, Month, Keyword & Category Controls */}
        <section className="glass-panel rounded-3xl p-5 sm:p-6 border border-border/80 space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Keyword Search */}
            <div className="lg:col-span-5 space-y-1.5">
              <label
                htmlFor="ec-search"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Search Event, Theme, Region, or Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="ec-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Black Friday, Ramadan, Earth Day, coffee, vector sale..."
                  className="pl-9 rounded-xl bg-background/80 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Exact Date Picker */}
            <div className="lg:col-span-3 space-y-1.5">
              <label
                htmlFor="ec-date"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Search by Date (±14 Days)
              </label>
              <Input
                id="ec-date"
                type="date"
                value={pickedDateIso}
                onChange={(e) => {
                  setPickedDateIso(e.target.value);
                  if (e.target.value) setSelectedMonth("all");
                }}
                className="rounded-xl bg-background/80 text-xs font-mono"
              />
            </div>

            {/* Category Selector */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="ec-category"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Category
              </label>
              <select
                id="ec-category"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as EventCategory | "all")
                }
                className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-medium text-foreground"
              >
                <option value="all">All Categories</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="ec-sort"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Sort Order
              </label>
              <select
                id="ec-sort"
                value={sortMode}
                onChange={(e) =>
                  setSortMode(e.target.value as "upcoming" | "calendar")
                }
                disabled={Boolean(pickedDateIso)}
                className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-medium text-foreground disabled:opacity-50"
              >
                <option value="upcoming">Next Upcoming First</option>
                <option value="calendar">Jan → Dec Order</option>
              </select>
            </div>
          </div>

          {/* 12-Month Quick Filter Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Browse by Month
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth("all");
                  setPickedDateIso("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedMonth === "all" && !pickedDateIso
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-background/70 border border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                All Year ({allResolvedEvents.length})
              </button>
              {MONTH_NAMES.map((mName, idx) => {
                const mNum = idx + 1;
                const active = selectedMonth === mNum && !pickedDateIso;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(mNum);
                      setPickedDateIso("");
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-background/70 border border-border/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mName.slice(0, 3)}{" "}
                    <span className="opacity-70 text-[10px]">({monthCounts[idx]})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Showing <span className="text-primary font-black">{filteredEvents.length}</span>{" "}
            {filteredEvents.length === 1 ? "stock event" : "stock events"}
            {pickedDateIso ? ` within ±14 days of ${pickedDateIso}` : ""}
            {selectedMonth !== "all" ? ` in ${MONTH_NAMES[selectedMonth - 1]}` : ""}
          </p>
          <span className="text-xs text-muted-foreground">
            Click <strong>Use Event in AI Generator</strong> to pre-fill Dual-Strategy Event Targeting in{" "}
            <Link to="/tool" className="text-primary underline">
              /tool
            </Link>
          </span>
        </div>

        {/* Event Cards List */}
        {filteredEvents.length === 0 ? (
          <div className="glass-panel rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-base font-bold text-foreground">
              No events matched your current search or date filter.
            </p>
            <p className="text-xs text-muted-foreground">
              Try clearing the exact date filter or searching a broader term such as &quot;sale&quot;, &quot;health&quot;,
              or &quot;holiday&quot;.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
              Show All {allResolvedEvents.length} Events
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredEvents.map((ev) => {
              const isHighlighted = highlightedId === ev.id;
              return (
                <article
                  key={ev.id}
                  id={`event-card-${ev.id}`}
                  className={`glass-panel rounded-3xl p-6 border transition-all space-y-5 ${
                    isHighlighted
                      ? "border-primary ring-2 ring-primary/40 shadow-xl"
                      : "border-border/80 hover:border-primary/35"
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20 text-[11px] font-bold">
                          {formatShortDate(ev.nextDate)}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {ev.daysUntil === 0
                            ? "Happening Today"
                            : ev.daysUntil === 1
                              ? "Tomorrow"
                              : `In ${ev.daysUntil} days`}
                        </Badge>
                        {typeof ev.dayDistance === "number" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold"
                          >
                            {ev.dayDistance === 0
                              ? "Exact Date Match"
                              : `${ev.dayDistance}d from picked date`}
                          </Badge>
                        )}
                        <DemandBadge level={ev.demandLevel} />
                        <Badge variant="secondary" className="text-[11px]">
                          {ev.category}
                        </Badge>
                        {ev.inUploadWindowNow && (
                          <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold gap-1">
                            <Flame className="w-3 h-3" />
                            Upload Window Open Now
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-foreground">
                        {ev.name}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          {ev.dateLabel}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Upload ~{ev.leadWeeks} weeks ahead
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                          {ev.regions.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKeywords(ev)}
                        className="rounded-xl text-xs font-semibold gap-1.5"
                      >
                        {copiedId === ev.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Copy Safe Keywords
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUseInAiGenerator(ev)}
                        className="rounded-xl text-xs font-bold gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Use Event in AI Generator
                      </Button>
                    </div>
                  </div>

                  {/* Event Introduction */}
                  <p className="text-sm text-secondary leading-relaxed">{ev.intro}</p>

                  {/* 3-Column Photo / Vector / Video Ideas */}
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3.5 space-y-1">
                      <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                        <Camera className="w-3.5 h-3.5 text-primary" />
                        Photo Brief
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{ev.photoIdea}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3.5 space-y-1">
                      <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                        <PenTool className="w-3.5 h-3.5 text-emerald-500" />
                        Vector &amp; Illustration Brief
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{ev.vectorIdea}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3.5 space-y-1">
                      <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                        <Video className="w-3.5 h-3.5 text-amber-500" />
                        Footage &amp; Motion Brief
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{ev.videoIdea}</p>
                    </div>
                  </div>

                  {/* Optional Trademark Warning */}
                  {ev.trademarkNote && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Marketplace IP &amp; Trademark Caution:</strong> {ev.trademarkNote}
                      </span>
                    </div>
                  )}

                  {/* Safe Keywords Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Recommended Trademark-Safe Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.safeKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs px-2.5 py-1 rounded-lg border border-border/70 bg-background/70 text-secondary font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Practitioner Strategy Guide (SEO + Helpful Content Context) */}
        <section className="glass-panel rounded-3xl p-6 sm:p-10 border border-border/80 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            How Stock Contributors Maximize Seasonal Event Sales on Adobe Stock
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-secondary leading-relaxed">
            <div>
              <h3 className="font-bold text-foreground mb-2">
                1. Upload 6 to 10 weeks before the event
              </h3>
              <p>
                Marketing agencies, bloggers, and retail designers build holiday campaigns long before the calendar date
                arrives — and moderation queues take days to clear. Uploading Christmas or Black Friday assets in
                September gives your files time to index and collect early downloads that boost search visibility.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">
                2. Combine event tags with evergreen keywords
              </h3>
              <p>
                Place specific event terms (such as <em>world environment day</em> or <em>ramadan kareem</em>) in your
                title and first 10 keyword slots, then use slots 11–49 for evergreen visual concepts (<em>renewable
                energy</em>, <em>family dinner</em>, <em>copy space</em>) so the asset keeps selling all year.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">
                3. Validate metadata &amp; convert across 6 portals
              </h3>
              <p>
                Before uploading your seasonal batch, run your titles and tags through our{" "}
                <Link to="/metadata-checker" className="text-primary underline">
                  Stock Metadata &amp; CSV Checker
                </Link>{" "}
                to catch accidental brand names, then export spreadsheets for all six agencies in the{" "}
                <Link to="/stock-csv-converter" className="text-primary underline">
                  Multi-Agency CSV Converter
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventCalendar;
