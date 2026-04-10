import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Crown,
  Loader2,
  Settings,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const freeFeatures = [
  "5 tailored applications",
  "AI CV generation",
  "AI cover letter generation",
  "Application tracker",
  "Download & copy",
];

const premiumFeatures = [
  "Unlimited applications",
  "AI CV generation",
  "AI cover letter generation",
  "Application tracker",
  "Download & copy",
  "Priority AI processing",
  "Early access to new features",
];

export default function Upgrade() {
  const { user } = useAuth();
  const { data: usage } = trpc.application.getUsage.useQuery();

  const isPremium = user?.plan === "premium";

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const portalMutation = trpc.stripe.getPortalUrl.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUpgrade = () => {
    checkoutMutation.mutate({ origin: window.location.origin });
  };

  const handleManageBilling = () => {
    portalMutation.mutate({ origin: window.location.origin });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-2">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-xs uppercase tracking-wide">
            Pricing
          </Badge>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            {isPremium ? "You're on Premium" : "Upgrade to Premium"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isPremium
              ? "Enjoy unlimited applications and all premium features."
              : "Unlock unlimited applications and accelerate your job search."}
          </p>
        </div>

        {/* Current Usage */}
        {!isPremium && usage && (
          <div className="bg-accent border border-accent-foreground/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                <div>
                  <p className="text-sm font-medium text-accent-foreground">
                    Free Plan Usage
                  </p>
                  <p className="text-xs text-accent-foreground/70">
                    {usage.used} of {usage.limit} applications used
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-accent-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(((usage.used || 0) / (usage.limit || 5)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-accent-foreground/70">
                  {usage.used}/{usage.limit}
                </span>
              </div>
            </div>
          </div>
        )}

        {isPremium && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Crown className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-1">Premium Active</h3>
            <p className="text-sm text-green-700 mb-4">
              You have unlimited access to all features. Keep applying!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Manage Billing
            </Button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={`border ${!isPremium ? "border-primary" : "border-border"}`}>
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-serif font-bold text-foreground">Free</h3>
                  {!isPremium && (
                    <Badge variant="secondary" className="text-xs">Current Plan</Badge>
                  )}
                </div>
                <div className="text-3xl font-bold text-foreground">
                  $0
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                {isPremium ? "Free Plan" : "Current Plan"}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border border-foreground bg-foreground relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, oklch(0.65 0.13 55), transparent)",
                transform: "translate(40%, -40%)",
              }}
            />
            <CardContent className="p-6 relative">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-serif font-bold text-background">Premium</h3>
                  <Badge className="text-xs bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-background">
                  $19
                  <span className="text-sm font-normal text-background/60">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-background">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <Button className="w-full bg-primary text-primary-foreground" disabled>
                  <Crown className="w-4 h-4 mr-2" />
                  Active
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleUpgrade}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {checkoutMutation.isPending ? "Preparing checkout..." : "Upgrade to Premium"}
                  {!checkoutMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          {[
            {
              q: "What counts as an application?",
              a: "Each time you create a new application (with a job description) counts toward your limit. Regenerating CV or cover letter for an existing application does not count.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes, you can cancel your Premium subscription at any time. You'll retain access until the end of your billing period.",
            },
            {
              q: "Is my CV data secure?",
              a: "Your CV is stored securely and only used to generate tailored applications for you. We never share your data with third parties.",
            },
          ].map((faq) => (
            <div key={faq.q} className="border border-border rounded-xl p-4">
              <p className="font-medium text-foreground text-sm mb-1">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
