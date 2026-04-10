import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import {
  FileText,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-lg text-foreground">JobAgent AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} size="sm">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCTA} size="sm">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-xs font-medium tracking-wide uppercase">
            AI-Powered Job Applications
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
            Land More Interviews,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.45 0.13 55), oklch(0.65 0.16 45))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Effortlessly
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your CV once. Get tailored applications for every job in minutes. Our AI crafts
            personalized CVs and cover letters that speak directly to each role — using only your
            real experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleCTA} className="text-base px-8 h-12">
              Start for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>
              See How It Works
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free plan includes 5 applications · No credit card required
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[
              { value: "2×", label: "More interviews" },
              { value: "< 5 min", label: "Per application" },
              { value: "100%", label: "Your real info" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-serif font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From CV upload to tailored application in four simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Upload Your CV",
                desc: "Upload your PDF or DOCX. Our AI extracts and understands your complete professional profile.",
              },
              {
                icon: Target,
                step: "02",
                title: "Paste the Job",
                desc: "Add the job link or paste the description. We analyze what the employer is really looking for.",
              },
              {
                icon: Sparkles,
                step: "03",
                title: "AI Tailors It",
                desc: "Get a customized CV and cover letter that highlights your most relevant experience for that role.",
              },
              {
                icon: BarChart3,
                step: "04",
                title: "Track & Win",
                desc: "Mark applications, track interview stages, and measure your success rate over time.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-primary bg-background border border-border rounded-full w-6 h-6 flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary/20">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Everything You Need to Land the Job
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI-Tailored CV",
                desc: "Every CV is rewritten to match the specific job requirements — highlighting your most relevant skills and experience.",
              },
              {
                icon: FileText,
                title: "Personalized Cover Letters",
                desc: "Compelling, authentic cover letters that connect your real background to what each employer needs.",
              },
              {
                icon: Shield,
                title: "No Hallucinations",
                desc: "Our AI strictly uses only your actual experience. Zero fabrication, zero risk of misrepresentation.",
              },
              {
                icon: BarChart3,
                title: "Application Tracker",
                desc: "Track every application from draft to offer. Know exactly where you stand at all times.",
              },
              {
                icon: Zap,
                title: "Instant Generation",
                desc: "Get your tailored CV and cover letter in under 60 seconds. Apply faster than the competition.",
              },
              {
                icon: CheckCircle2,
                title: "Download & Copy",
                desc: "Export your documents or copy them instantly. Ready to paste into any application form.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold text-foreground mb-1">Free</h3>
                <div className="text-4xl font-bold text-foreground mt-3">
                  $0
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "5 tailored applications",
                  "AI CV generation",
                  "AI cover letter generation",
                  "Application tracker",
                  "Download & copy",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={handleCTA}>
                Get Started Free
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-foreground border border-foreground rounded-2xl p-8 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full"
                style={{
                  background: "radial-gradient(circle, oklch(0.65 0.13 55), transparent)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <Badge className="mb-4 bg-primary text-primary-foreground text-xs">Most Popular</Badge>
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold text-background mb-1">Premium</h3>
                <div className="text-4xl font-bold text-background mt-3">
                  $19
                  <span className="text-base font-normal text-background/60">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited applications",
                  "AI CV generation",
                  "AI cover letter generation",
                  "Application tracker",
                  "Download & copy",
                  "Priority AI processing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-background">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCTA}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-foreground">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-background mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-background/70 text-lg mb-8">
            Join thousands of early-career professionals landing more interviews with AI-powered
            applications.
          </p>
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 h-12"
          >
            Start for Free Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-sm text-foreground">JobAgent AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JobAgent AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
