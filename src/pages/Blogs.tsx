import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  BookOpen, 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Share2, 
  Sparkles, 
  ShieldAlert, 
  Tag, 
  Download,
  Bookmark,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "sonner";

const Blogs = () => {
  const ref = useReveal();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("post");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedLink, setCopiedLink] = useState(false);

  // Active selected blog post (if any)
  const currentPost = useMemo(() => {
    if (!activeSlug) return null;
    return BLOG_POSTS.find(p => p.slug === activeSlug || p.id === activeSlug) || null;
  }, [activeSlug]);

  // Filtered blog list
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.subtitle.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        post.tags.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectPost = (slug: string) => {
    setSearchParams({ post: slug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (post: BlogPost) => {
    const url = `${window.location.origin}/blogs?post=${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ─── SCENARIO A: SINGLE ARTICLE READER VIEW ─── */}
        {currentPost ? (
          <article className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Back button & Breadcrumb */}
            <div className="flex items-center justify-between gap-4 mb-8 pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
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
                  <p className="text-sm font-bold text-foreground">{currentPost.author.name}</p>
                  <p className="text-xs text-muted-foreground">{currentPost.author.role}</p>
                </div>
              </div>
            </div>

            {/* Article Intro Excerpt */}
            <div className="bg-muted/20 border-l-4 border-primary rounded-r-2xl p-5 sm:p-6 mb-10 text-sm sm:text-base leading-relaxed text-foreground font-medium">
              {currentPost.content.intro}
            </div>

            {/* Article Sections */}
            <div className="space-y-12 mb-14">
              {currentPost.content.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-start gap-3">
                    <span className="text-primary opacity-80">{idx + 1}.</span>
                    <span>{section.heading.replace(/^\d+\.\s*/, "")}</span>
                  </h2>

                  {section.subheading && (
                    <p className="text-sm sm:text-base font-semibold text-primary/90">
                      {section.subheading}
                    </p>
                  )}

                  <div className="space-y-3 text-sm sm:text-base text-secondary leading-relaxed">
                    {section.body.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Warning Callout Box */}
                  {section.warning && (
                    <div className="rounded-2xl bg-destructive/10 border border-destructive/25 p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-destructive">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                      <div>
                        <strong className="font-bold block mb-0.5">Critical Compliance Warning:</strong>
                        <span className="text-destructive/90">{section.warning}</span>
                      </div>
                    </div>
                  )}

                  {/* Pro Tip Callout Box */}
                  {section.tip && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-emerald-400">
                      <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                      <div>
                        <strong className="font-bold block mb-0.5">Expert Pro Tip:</strong>
                        <span className="text-emerald-300/90">{section.tip}</span>
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
                            ✅ 185-Char Optimized Title:
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
                          💡 {section.example.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

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
                      <span className="leading-snug">{item}</span>
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
        ) : (
          /* ─── SCENARIO B: ALL BLOGS DIRECTORY VIEW ─── */
          <div className="space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" />
                Contributor Academy & Insights
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                Stock Contributor <span className="text-gradient-flow">Knowledge Base</span>
              </h1>

              <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
                In-depth guides, marketplace compliance rules, and advanced metadata SEO strategies to help you scale your passive stock earnings safely.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {["All", "Compliance & Safety", "SEO & Metadata"].map(cat => (
                  <button
                    key={cat}
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

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles & guides..."
                  className="pl-9 text-xs rounded-xl bg-background/70 border-border/80 h-9"
                />
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => handleSelectPost(post.slug)}
                  className="glass-panel rounded-3xl p-6 sm:p-8 border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-[0_0_35px_hsl(var(--primary)/0.2)]"
                >
                  <div className="space-y-4">
                    {/* Meta header */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-[11px]">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3 font-medium">
                      {post.summary}
                    </p>

                    {/* Tag list */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{post.author.avatar}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{post.author.name}</span>
                    </div>

                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="text-base font-semibold text-foreground">No articles match your search query.</p>
                <p className="text-xs text-muted-foreground">Try searching with different terms or selecting "All".</p>
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                  Reset Filters
                </Button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Blogs;
