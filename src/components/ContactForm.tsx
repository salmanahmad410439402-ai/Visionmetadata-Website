import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Mail, MessageSquare, User } from "lucide-react";
import { analytics } from "@/lib/analytics";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, email: false, message: false });

  // Validation functions
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const getEmailError = () => {
    if (!email) return "Email is required";
    if (!isValidEmail(email)) return "Please enter a valid email";
    return null;
  };
  const getNameError = () => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return null;
  };
  const getMessageError = () => {
    if (!message) return "Message is required";
    if (message.length < 10) return "Message must be at least 10 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = getNameError();
    const emailError = getEmailError();
    const messageError = getMessageError();
    
    if (nameError || emailError || messageError) {
      setTouched({ name: true, email: true, message: true });
      setError("Please fix the errors above");
      analytics.trackError('contact-form-validation', 'Form has validation errors');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to send message");
      }
      
      // Track successful form submission
      analytics.trackFormSubmit('contact-form', {
        source: 'contact-page',
        timestamp: new Date().toISOString(),
      });

      setSuccess("✓ Message sent successfully! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setTouched({ name: false, email: false, message: false });
      
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      analytics.trackError('contact-form-submission', (err as Error).message);
      setError(`✗ ${(err as Error).message}`);
      setTimeout(() => setError(null), 6000);
    } finally {
      setLoading(false);
    }
  };


  const nameError = touched.name ? getNameError() : null;
  const emailError = touched.email ? getEmailError() : null;
  const messageError = touched.message ? getMessageError() : null;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Name
            </div>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched({ ...touched, name: true })}
            placeholder="Full name"
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 bg-background ${
              nameError ? "border-red-500/50 focus:ring-red-500/50" : "border-card-primary focus:ring-primary focus:border-primary"
            }`}
          />
          {nameError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {nameError}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Address
            </div>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched({ ...touched, email: true })}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 bg-background ${
              emailError ? "border-red-500/50 focus:ring-red-500/50" : "border-card-primary focus:ring-primary focus:border-primary"
            }`}
          />
          {emailError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {emailError}
            </div>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Message
            </div>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched({ ...touched, message: true })}
            placeholder="Tell us about your inquiry, feature request, or how we can help..."
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 bg-background resize-none ${
              messageError ? "border-red-500/50 focus:ring-red-500/50" : "border-card-primary focus:ring-primary focus:border-primary"
            }`}
            rows={5}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              {messageError && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {messageError}
                </div>
              )}
            </div>
            <span className="text-xs text-quaternary">{message.length} / 1000</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-300">{success}</p>
            <p className="text-xs text-green-300/70 mt-1">We'll get back to you within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">{error}</p>
            <p className="text-xs text-red-300/70 mt-1">If the issue persists, please contact us via WhatsApp.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm;
