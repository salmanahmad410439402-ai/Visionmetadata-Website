import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, TableProperties, Clock, ShieldCheck } from "lucide-react";
import { BLOG_POSTS } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURED_SLUGS = [
  "iptc-xmp-exif-metadata-explained-stock-contributors",
  "stock-csv-upload-formatting-troubleshooting-guide",
  "hidden-visual-trademarks-stock-photography-illustrations-audit",
  "adobe-stock-similar-content-rejection-portfolio-curation-guide",
  "preparing-eps-svg-vector-files-for-stock-agencies",
  "w8ben-tax-withholding-payout-guide-international-stock-contributors",
];

const ContributorKnowledgeSection = () => {
  const featuredGuides = FEATURED_SLUGS.map((slug) =>
    BLOG_POSTS.find((p) => p.slug === slug)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section
      aria-labelledby="knowledge-base-heading"
      className="py-20 px-6 border-t border-border/60 bg-background/60"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              Practitioner Documentation · {BLOG_POSTS.length} Original Guides
            </div>
            <h2
              id="knowledge-base-heading"
              className="text-3xl sm:text-4xl font-black text-foreground tracking-tight"
            >
              Stock Contributor Knowledge Base &amp; Reference
            </h2>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              In-depth technical guides written from real stock portfolio workflows — covering IPTC/XMP file standards, 6-agency CSV rules, visual trademark audits, vector pre-flight checks, and tax withholding. Reviewed under our{" "}
              <Link to="/editorial-policy" className="text-primary underline hover:text-primary/80">
                editorial standards
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/metadata-limits">
              <Button variant="outline" className="rounded-xl font-bold gap-2 border-border/80">
                <TableProperties className="w-4 h-4 text-primary" />
                6-Agency Limits Table
              </Button>
            </Link>
            <Link to="/blogs">
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2">
                Browse All {BLOG_POSTS.length} Guides
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Flagship Reference Banner */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-primary/25 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Need exact title character limits, keyword minimums, BOM rules, and CSV column headers?
              </h3>
              <p className="text-xs sm:text-sm text-secondary">
                Compare Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF side by side with links to each marketplace&apos;s official documentation.
              </p>
            </div>
          </div>
          <Link
            to="/metadata-limits"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            Open Limits Reference <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Featured Technical Guides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredGuides.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-2xl border border-border/80 hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between"
            >
              <Link
                to={`/blog/${post.slug}`}
                className="p-6 h-full flex flex-col justify-between gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] px-2.5 py-0.5"
                    >
                      {post.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <span className="text-xs font-bold text-primary inline-flex items-center gap-1 pt-2 border-t border-border/50 group-hover:translate-x-0.5 transition-transform">
                  Read technical guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContributorKnowledgeSection;
