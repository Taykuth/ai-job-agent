import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Plus,
  Sparkles,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  offer: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: usage } = trpc.application.getUsage.useQuery();
  const { data: applications } = trpc.application.list.useQuery();
  const { data: cvs } = trpc.cv.list.useQuery();

  const recentApps = applications?.slice(0, 5) || [];
  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter((a) => a.status === "applied").length || 0,
    interview: applications?.filter((a) => a.status === "interview").length || 0,
    offer: applications?.filter((a) => a.status === "offer").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your job applications and generate tailored materials.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>

        {/* Usage Banner */}
        {usage && usage.plan === "free" && (
          <div className="bg-accent border border-accent-foreground/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-accent-foreground">
                  Free Plan — {usage.used}/{usage.limit} applications used
                </p>
                <p className="text-xs text-accent-foreground/70">
                  Upgrade to Premium for unlimited applications
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/upgrade")}
              className="shrink-0"
            >
              Upgrade
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Applications", value: stats.total, icon: FileText, color: "text-foreground" },
            { label: "Applied", value: stats.applied, icon: Clock, color: "text-blue-600" },
            { label: "Interviews", value: stats.interview, icon: TrendingUp, color: "text-amber-600" },
            { label: "Offers", value: stats.offer, icon: CheckCircle2, color: "text-green-600" },
          ].map((stat) => (
            <Card key={stat.label} className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-3xl font-serif font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-10"
                onClick={() => navigate("/dashboard/new")}
              >
                <Plus className="w-4 h-4 text-primary" />
                New Application
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-10"
                onClick={() => navigate("/dashboard/cvs")}
              >
                <Upload className="w-4 h-4 text-primary" />
                Upload CV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-10"
                onClick={() => navigate("/dashboard/applications")}
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                View All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="border border-border md:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => navigate("/dashboard/applications")}
              >
                View all
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentApps.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate("/dashboard/new")}
                  >
                    Create your first application
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.jobTitle || "Untitled Position"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.company || "Unknown Company"}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs capitalize shrink-0 ml-2 ${statusColors[app.status]}`}
                        variant="secondary"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CV Status */}
        {cvs !== undefined && cvs.length === 0 && (
          <Card className="border border-dashed border-border bg-secondary/20">
            <CardContent className="p-8 text-center">
              <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Upload Your CV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your CV to start generating tailored applications.
              </p>
              <Button onClick={() => navigate("/dashboard/cvs")}>
                Upload CV
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
