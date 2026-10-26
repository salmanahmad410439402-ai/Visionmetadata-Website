import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  ArrowRight,
  TableProperties,
  ClipboardCheck,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/data/blogPosts";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";

export function formatBlogDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  }
  return dateStr;
}

const Blogs = () => {
  const [searchParams] = useSearchParams();
  const legacySlug = searchParams.get("post");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
    return ["All", ...unique];
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.subtitle.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Redirect any legacy /blogs?post=<slug> link to its canonical /blog/<slug> URL
  if (legacySlug) {
    const matched = BLOG_POSTS.find(
      (p) => p.slug === legacySlug || p.id === legacySlug
    );
    return (
      <Navigate to={matched ? `/blog/${matched.slug}` : "/blogs"} replace />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
      <Helmet>
        <title>Blog — Stock Contributor Knowledge Base | Tagyfy Pro</title>
        <meta
          name="description"
          content="Practical guides for stock media contributors: how marketplaces review titles and keywords, IPTC/XMP standards, releases, vector pre-flight checks, and compliance rules."
        />
        <meta property="og:title" content="Stock Contributor Knowledge Base | Tagyfy Pro" />
        <meta
          property="og:description"
          content="Practical guides for stock media contributors: how marketplaces review titles and keywords, IPTC/XMP standards, releases, and compliance rules."
        />
        <meta property="og:url" content="https://tagyfy.com/blogs" />
        <link rel="canonical" href="https://tagyfy.com/blogs" />
      </Helmet>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blogs" },
        ])}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Contributor Knowledge Base · {BLOG_POSTS.length} Guides
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Stock Contributor <span className="text-gradient-flow">Knowledge Base</span>
          </h1>

          <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
            Practitioner-written guides on stock metadata standards, IPTC/XMP file embedding,
            model and property releases, vector preparation, and marketplace compliance rules.
            Every article is written and reviewed by Salman Ahmad under our{" "}
            <Link to="/editorial-policy" className="text-primary underline hover:text-primary/80">
              editorial standards
            </Link>
            .
          </p>
        </header>

        {/* Reference & Free Utility Strip */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/metadata-limits"
            className="glass-panel rounded-2xl p-4 border border-border/80 hover:border-primary/50 transition-colors flex items-start gap-3"
          >
            <TableProperties className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                6-Marketplace Limits Table
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Title caps, keyword counts, and CSV headers with official links.
              </p>
            </div>
          </Link>

          <Link
            to="/metadata-checker"
            className="glass-panel rounded-2xl p-4 border border-border/80 hover:border-primary/50 transition-colors flex items-start gap-3"
          >
            <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Free Metadata &amp; Trademark Checker
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Validate titles, tag priority, and brand names with no API key.
              </p>
            </div>
          </Link>

          <Link
            to="/editorial-policy"
            className="glass-panel rounded-2xl p-4 border border-border/80 hover:border-primary/50 transition-colors flex items-start gap-3"
          >
            <FileCheck2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Editorial &amp; Corrections Policy
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                How sources are verified and how to report an outdated rule.
              </p>
            </div>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles & guides..."
              aria-label="Search articles and guides"
              className="pl-9 text-xs rounded-xl bg-background/70 border-border/80 h-9"
            />
          </div>
        </div>

        {/* Crawlable <article> + <Link to="/blog/:slug"> Directory Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-3xl border border-border/80 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_35px_hsl(var(--primary)/0.2)]"
            >
              <Link
                to={`/blog/${post.slug}`}
                className="p-6 sm:p-8 h-full flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-[11px]"
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={post.publishDate}>
                          {formatBlogDate(post.publishDate)}
                        </time>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3 font-medium">
                    {post.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm" aria-hidden="true">
                      {post.author.avatar}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Written by {post.author.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {post.author.role}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-base font-semibold text-foreground">
              No articles match your search query.
            </p>
            <p className="text-xs text-muted-foreground">
              Try searching with different terms or selecting &ldquo;All&rdquo;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
