import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Share2,
  Sparkles,
  ShieldAlert,
  Download,
  Bookmark,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, BlogPost as BlogPostType } from "@/data/blogPosts";
import { toast } from "sonner";

/**
 * Parses and formats text, replacing markdown links ([text](url)),
 * bold (**text**), and italic (*text*) with native React elements.
 * (Same function used in Blogs.tsx)
 */
function renderFormattedText(text: string): React.ReactNode {
  if (!text) return "";

  const hasFormatting = text.includes("![") || text.includes("[") || text.includes("**") || text.includes("*");
  if (!hasFormatting) return text;

  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const linkText = match[2];
      const linkUrl = match[3];
      const isInternal = linkUrl.startsWith("/");

      parts.push(
        isInternal ? (
          <Link
            key={`l-${key++}`}
            to={linkUrl}
            className="text-primary underline font-bold hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {linkText}
          </Link>
        ) : (
          <a
            key={`l-${key++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline font-bold hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {linkText}
          </a>
        )
      );
    } else if (match[4]) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold text-foreground">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      parts.push(
        <em key={`i-${key++}`} className="italic font-medium text-foreground/90">
          {match[5]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  const currentPost = useMemo(() => {
    if (!slug) return null;
    return BLOG_POSTS.find(p => p.slug === slug) || null;
  }, [slug]);

  const handleShare = (post: BlogPostType) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // 404 - post not found
  if (!currentPost) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
        <Helmet>
          <title>Article Not Found | Tagyfy Pro</title>
          <meta name="description" content="The requested blog article could not be found." />
        </Helmet>
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-20">
          <h1 className="text-3xl font-black text-foreground">Article Not Found</h1>
          <p className="text-muted-foreground">The blog post you're looking for doesn't exist or has been moved.</p>
          <Button variant="outline" onClick={() => navigate("/blogs")} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
      <Helmet>
        <title>{currentPost.title} | Tagyfy Pro Blog</title>
        <meta name="description" content={currentPost.summary} />
        <meta property="og:title" content={currentPost.title} />
        <meta property="og:description" content={currentPost.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://tagyfy.com/blog/${currentPost.slug}`} />
        <meta name="twitter:title" content={currentPost.title} />
        <meta name="twitter:description" content={currentPost.summary} />
        <link rel="canonical" href={`https://tagyfy.com/blog/${currentPost.slug}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <article className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between gap-4 mb-8 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/blogs")}
              className="gap-2 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(currentPost)}
              className="gap-2 rounded-xl border-border/80 text-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share Guide"}</span>
            </Button>
          </div>

          {/* Article Header Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-border/80 mb-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 text-xs">
                {currentPost.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentPost.readTime}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {currentPost.publishDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4 leading-tight">
              {currentPost.title}
            </h1>

            <p className="text-base sm:text-lg text-secondary leading-relaxed font-medium mb-6">
              {currentPost.subtitle}
            </p>

            {/* Author Strip */}
            <div className="flex items-center gap-3 pt-6 border-t border-border/50">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-lg">
                {currentPost.author.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Written by {currentPost.author.name}</p>
                <p className="text-xs text-muted-foreground">{currentPost.author.role}</p>
              </div>
            </div>
          </div>

          {/* Article Intro Excerpt */}
          <div className="bg-muted/20 border-l-4 border-primary rounded-r-2xl p-5 sm:p-6 mb-10 text-sm sm:text-base leading-relaxed text-foreground font-medium space-y-3 shadow-inner">
            {currentPost.content.intro.split("\n\n").map((para, idx) => (
              <p key={idx}>{renderFormattedText(para)}</p>
            ))}
          </div>

          {/* Article Sections */}
          <div className="space-y-12 mb-14">
            {currentPost.content.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-start gap-3">
                  <span className="text-primary opacity-80">{idx + 1}.</span>
                  <span>{section.heading.replace(/^\d+\.\s*/, "").replace(/^Truth #\d+:\s*/, "").replace(/^Mistake #\d+:\s*/, "")}</span>
                </h2>

                {section.subheading && (
                  <p className="text-sm sm:text-base font-semibold text-primary/90">
                    {renderFormattedText(section.subheading)}
                  </p>
                )}

                <div className="space-y-3 text-sm sm:text-base text-secondary leading-relaxed">
                  {section.body.map((paragraph, pIdx) => {
                    if (paragraph.startsWith("### ")) {
                      return (
                        <h3 key={pIdx} className="text-base sm:text-lg font-bold text-foreground pt-3 text-primary">
                          {renderFormattedText(paragraph.replace(/^###\s*/, ""))}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith("• ") || paragraph.startsWith("- ")) {
                      return (
                        <div key={pIdx} className="flex items-start gap-2.5 pl-2 text-foreground/90 font-medium">
                          <span className="text-primary font-bold">•</span>
                          <span>{renderFormattedText(paragraph.replace(/^[•-]\s*/, ""))}</span>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('"') && paragraph.endsWith('"') && paragraph.length < 160) {
                      return (
                        <div key={pIdx} className="p-3 bg-muted/40 rounded-xl border border-border/50 font-mono text-xs text-foreground/90 my-2">
                          {paragraph}
                        </div>
                      );
                    }
                    return <p key={pIdx}>{renderFormattedText(paragraph)}</p>;
                  })}
                </div>

                {/* Warning Callout Box */}
                {section.warning && (
                  <div className="rounded-2xl bg-destructive/10 border border-destructive/25 p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-destructive">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                    <div>
                      <strong className="font-bold block mb-0.5">Critical Compliance Warning:</strong>
                      <span className="text-destructive/90">{renderFormattedText(section.warning)}</span>
                    </div>
                  </div>
                )}

                {/* Pro Tip Callout Box */}
                {section.tip && (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-emerald-400">
                    <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <strong className="font-bold block mb-0.5">Expert Pro Tip:</strong>
                      <span className="text-emerald-300/90">{renderFormattedText(section.tip)}</span>
                    </div>
                  </div>
                )}

                {/* Example Comparison Box */}
                {section.example && (
                  <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Practical Real-World Example
                    </div>

                    {section.example.badTitle && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs">
                        <span className="font-bold text-destructive flex items-center gap-1.5 mb-1">
                          ❌ Poorly Optimized Title:
                        </span>
                        <p className="text-muted-foreground font-mono">{section.example.badTitle}</p>
                      </div>
                    )}

                    {section.example.goodTitle && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                          ✅ Winning Optimized Title:
                        </span>
                        <p className="text-foreground font-mono font-medium">{section.example.goodTitle}</p>
                      </div>
                    )}

                    {section.example.badKeywords && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs">
                        <span className="font-bold text-destructive flex items-center gap-1.5 mb-1">
                          ❌ Repetitive Keyword Spamming:
                        </span>
                        <p className="text-muted-foreground font-mono">{section.example.badKeywords.join(", ")}</p>
                      </div>
                    )}

                    {section.example.goodKeywords && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                          ✅ High-Information Density Keywords:
                        </span>
                        <p className="text-foreground font-mono font-medium">{section.example.goodKeywords.join(", ")}</p>
                      </div>
                    )}

                    {section.example.explanation && (
                      <p className="text-xs text-secondary italic">
                        💡 {renderFormattedText(section.example.explanation)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Article Conclusion */}
          {currentPost.content.conclusion && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-border/80 mb-10 space-y-3 shadow-sm bg-card/40">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                Key Takeaways
              </h3>
              {currentPost.content.conclusion.split("\n\n").map((cPara, cIdx) => (
                <p key={cIdx} className="text-sm sm:text-base text-secondary leading-relaxed font-medium">
                  {renderFormattedText(cPara)}
                </p>
              ))}
            </div>
          )}

          {/* Conclusion & Actionable Checklist */}
          {currentPost.content.checklist && currentPost.content.checklist.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-primary/30 mb-12 shadow-xl bg-primary/5">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Actionable Checklist Before Submitting
              </h3>
              <p className="text-xs sm:text-sm text-secondary mb-5">
                Follow these essential checks to guarantee compliance and maximize search impressions:
              </p>

              <div className="space-y-2.5">
                {currentPost.content.checklist.map((item, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 text-primary text-xs font-bold">
                      ✓
                    </div>
                    <span className="leading-snug">{renderFormattedText(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Conversion CTA Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-border/80 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Automate Your Metadata with Tagyfy Pro
            </h3>
            <p className="text-xs sm:text-sm text-secondary max-w-lg mx-auto leading-relaxed">
              Generate 180–190 character titles, auto-sniff trademarks, rank weighted keywords, and embed metadata directly into your files in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/tool" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-xl bg-gradient-flow text-white font-bold px-6 shadow-md">
                  Try Free Online Web Tool
                </Button>
              </Link>
              <a
                href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.3.6/Tagyfy_Pro_1.3.6_x64-setup.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl border-border/80 font-bold px-6">
                  <Download className="w-4 h-4 mr-2 text-primary" />
                  Download Windows App
                </Button>
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
