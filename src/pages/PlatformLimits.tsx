import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TableProperties, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";

/**
 * Per-marketplace metadata requirements reference.
 *
 * WHY THIS PAGE EXISTS
 * This is the question contributors actually search for — how long a title each
 * marketplace allows, how many keywords, whether commas are permitted, what the
 * CSV columns are called — and no page on this site answered it. The values were
 * already encoded in the CSV exporter's column definitions; this page surfaces
 * them in a form a person can read and check.
 *
 * It is also the honest counterpart to the download and tool pages: each limit
 * is attributed to the marketplace's own documentation, and the page says
 * plainly that limits change and that the current official spec governs.
 */

import { PLATFORMS, FAILURES, LIMITS_LAST_CHECKED } from "@/data/platformLimits";

const PlatformLimits = () => (
  <div className="min-h-screen bg-background pt-24 pb-20 px-6">
    <Helmet>
      <title>Stock Metadata Limits by Marketplace — Titles & Keywords Reference | Tagyfy Pro</title>
      <meta
        name="description"
        content="Title length limits, keyword counts, CSV column names and common upload errors for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime and 123RF — with the official source linked for each."
      />
      <link rel="canonical" href="https://tagyfy.com/metadata-limits" />
    </Helmet>

    <JsonLd
      data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Metadata limits", path: "/metadata-limits" },
      ])}
    />

    <div className="max-w-5xl mx-auto">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 bg-accent-indigo-subtle border-accent-indigo-subtle">
          <TableProperties className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Reference
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground mb-6 tracking-tight">
          Metadata limits for every marketplace we support
        </h1>
        <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-3xl mx-auto">
          Title lengths, keyword counts, CSV column names and the errors that actually stop an
          upload. Kept in one table so you are not opening six help centres in six tabs.
        </p>
      </header>

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 mb-14 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-amber-500">
          <strong>Read this first.</strong> Marketplaces change their specifications without notice.
          The figures below were compiled from the sources linked on each card and were last checked
          in {LIMITS_LAST_CHECKED}. They are a starting point for planning a batch, not a substitute for the
          current official documentation — if your upload is rejected, the platform's own spec
          governs, not this page.
        </p>
      </div>

      {/* Platform cards */}
      <div className="space-y-8 mb-20">
        {PLATFORMS.map((p) => (
          <section
            key={p.name}
            className="rounded-3xl border border-card-primary bg-card-primary overflow-hidden"
          >
            <div className="h-1" style={{ background: p.accent }} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{p.name}</h2>
                <a
                  href={p.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  {p.source.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-tertiary mb-1">
                    Title limit
                  </dt>
                  <dd className="text-base font-bold text-foreground mb-2">{p.titleLimit}</dd>
                  <p className="text-sm leading-relaxed text-secondary">{p.titleNotes}</p>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-tertiary mb-1">
                    Keywords
                  </dt>
                  <dd className="text-base font-bold text-foreground mb-2">{p.keywordLimit}</dd>
                  <p className="text-sm leading-relaxed text-secondary">{p.keywordNotes}</p>
                </div>
              </dl>

              <div className="rounded-xl bg-background/40 border border-card-primary p-4 mb-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-tertiary mb-1">
                  CSV columns
                </p>
                <p className="text-xs font-mono text-foreground break-words">{p.csvFormat}</p>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wide text-tertiary mb-3">
                Worth knowing
              </h3>
              <ul className="space-y-2">
                {p.quirks.map((q) => (
                  <li key={q} className="flex gap-2.5 text-sm leading-relaxed text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* Failure modes */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center">
          When an upload fails, it is usually one of these five things
        </h2>
        <p className="text-sm text-secondary text-center mb-10 max-w-2xl mx-auto">
          Ordered by how often they actually occur, based on the support questions we receive.
        </p>
        <div className="space-y-4">
          {FAILURES.map(({ symptom, cause, fix }, i) => (
            <div key={symptom} className="rounded-2xl border border-card-primary bg-card-primary p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">{symptom}</h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    <strong className="text-foreground">Cause: </strong>
                    {cause}
                  </p>
                  <p className="text-sm leading-relaxed text-secondary">
                    <strong className="text-foreground">Fix: </strong>
                    {fix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <section className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-5">Related reading</h2>
        <ul className="space-y-3 text-sm">
          <li>
            <Link to="/blogs" className="text-primary underline font-semibold hover:text-primary/80">
              Contributor guides
            </Link>{" "}
            <span className="text-secondary">
              — how each marketplace weighs titles and keywords, and the rejection causes worth
              designing around.
            </span>
          </li>
          <li>
            <Link to="/tool" className="text-primary underline font-semibold hover:text-primary/80">
              Free browser tool
            </Link>{" "}
            <span className="text-secondary">
              — generate a title and keyword set for one image, then export it in the right format
              for the platform above.
            </span>
          </li>
          <li>
            <Link to="/faq" className="text-primary underline font-semibold hover:text-primary/80">
              FAQ
            </Link>{" "}
            <span className="text-secondary">
              — why embedded metadata is sometimes ignored, and what the trademark check does and
              does not cover.
            </span>
          </li>
          <li>
            <Link
              to="/editorial-policy"
              className="text-primary underline font-semibold hover:text-primary/80"
            >
              Editorial standards
            </Link>{" "}
            <span className="text-secondary">
              — how these figures were checked, and how to report one that is out of date.
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
);

export default PlatformLimits;
