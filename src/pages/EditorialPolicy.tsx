import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, RefreshCw, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { JsonLd, editorialPolicySchema, breadcrumbSchema } from "@/lib/structuredData";

/**
 * Editorial standards page.
 *
 * AdSense's "low value content" review looks for authentic, high-quality
 * information and evidence of ongoing curation. Part of making that visible is
 * stating who writes the content, how it is checked, when it was last reviewed
 * and how corrections are handled. This page is that statement, and it is
 * linked from every article and from the footer.
 */

const principles = [
  {
    icon: UserCheck,
    title: "Written by a practitioner, not a content farm",
    body: "The guides on this site are written by Salman Ahmad, a stock contributor and logo designer who works with these marketplaces directly. Content is produced in small batches around real workflow problems, not mass-generated to fill keyword gaps.",
  },
  {
    icon: CheckCircle2,
    title: "Claims are limited to what can be supported",
    body: "Where a marketplace publishes a rule — a title length limit, a keyword cap, a category requirement — we state it and link to the source. Where the basis is our own experience, we say so. We do not promise approval, search position or income, because no tool controls those outcomes.",
  },
  {
    icon: ShieldCheck,
    title: "No invented screenshots, stats or reviews",
    body: "We do not publish fabricated testimonials, invented download counts, or screenshots of results we did not obtain. Product capability claims describe features that exist in the released build; if a feature is removed, the claim is removed with it.",
  },
  {
    icon: RefreshCw,
    title: "Content is revisited, not abandoned",
    body: "Marketplace rules change. When a rule we have written about changes, the affected article is revised and its revision date updated. Guides that describe an older build of the software are updated alongside the release, or clearly marked as applying to an older version.",
  },
];

const EditorialPolicy = () => (
  <div className="min-h-screen bg-background pt-28 pb-20 px-6">
    <Helmet>
      <title>Editorial Standards & Corrections | Tagyfy Pro</title>
      <meta
        name="description"
        content="How the guides and documentation on tagyfy.com are researched, written, reviewed and corrected — including our policy on accuracy, sources, product claims and AI assistance."
      />
      <link rel="canonical" href="https://tagyfy.com/editorial-policy" />
    </Helmet>

    <JsonLd
      data={[
        editorialPolicySchema(),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Editorial standards", path: "/editorial-policy" },
        ]),
      ]}
    />
    <div className="max-w-3xl mx-auto">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 bg-accent-indigo-subtle border-accent-indigo-subtle">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Editorial Standards
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground mb-6 tracking-tight">
          How content on this site is researched, written and corrected
        </h1>
        <p className="text-base sm:text-lg text-secondary leading-relaxed">
          A short, specific statement of what you can expect from the guides,
          documentation and product copy published at tagyfy.com.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Last reviewed: October 2026
        </p>
      </header>

      <section className="space-y-6 mb-16">
        {principles.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm leading-relaxed text-secondary">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          How AI is used, and how it is not
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-secondary">
          <p>
            Tagyfy Pro is itself an AI-assisted tool, so it would be inconsistent to pretend AI
            plays no part in producing this website. Our position is:
          </p>
          <ul className="space-y-3 pl-1">
            <li className="flex gap-3">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Assistance, not authorship.</strong> Drafting,
                spelling and structural editing may involve AI tools. The subject matter, the
                examples and the judgements in each guide come from the author&apos;s own work with
                these marketplaces, and every published piece is read and edited by a person before
                it goes live.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">No volume publishing.</strong> We do not
                generate articles in bulk to capture search terms. A page is published because it
                answers a question that contributors actually ask, not because a keyword list
                suggested a topic.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Verifiable over impressive.</strong> If a claim
                about a marketplace rule cannot be checked against that marketplace&apos;s own
                documentation, it is written as a personal observation or it is left out.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Disclosure is expected of you too.</strong> Many
                marketplaces require generative-AI content to be declared on submission. The
                software can add the relevant disclosure keywords to a batch, but the decision about
                what to declare is the contributor&apos;s, and our guides say so explicitly.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Corrections</h2>
        <div className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-secondary">
              <p>
                If something on this site is wrong, out of date, or stated with more confidence than
                the evidence supports, tell us. Include the page address and what you believe is
                incorrect.
              </p>
              <p>
                Factual errors in guides and documentation are corrected, and the page&apos;s
                revision date is updated at the same time. If a product claim turns out to be
                unsupportable, the claim is removed rather than softened.
              </p>
              <p>
                Requests and corrections go through the{" "}
                <Link to="/contact" className="text-primary underline hover:text-primary/80">
                  Contact page
                </Link>
                . We do not run comments or guest posts, so there is no user-generated content on
                this site to moderate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Who we are</h2>
        <p className="text-sm leading-relaxed text-secondary mb-4">
          This site and the Tagyfy Pro software are built and maintained by the same person who
          writes the guides. There is no separate content team and no agency producing pages on our
          behalf. Background on the project is on the{" "}
          <Link to="/about" className="text-primary underline hover:text-primary/80">
            About page
          </Link>
          , and how your data and files are handled is set out in the{" "}
          <Link to="/privacy-policy" className="text-primary underline hover:text-primary/80">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-xs text-muted-foreground">
          Revision history: this page was first published in October 2026 and is reviewed whenever a
          marketplace changes a rule we write about.
        </p>
      </section>
    </div>
  </div>
);

export default EditorialPolicy;
