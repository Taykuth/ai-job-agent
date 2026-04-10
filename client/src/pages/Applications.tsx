import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { value: "interview", label: "Interview", color: "bg-amber-100 text-amber-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-700" },
];

const statusIcons: Record<string, React.ElementType> = {
  draft: FileText,
  applied: Clock,
  interview: TrendingUp,
  rejected: XCircle,
  offer: CheckCircle2,
};

export default function Applications() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: applications, isLoading } = trpc.application.list.useQuery();

  const updateStatusMutation = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.application.list.invalidate();
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.application.delete.useMutation({
    onSuccess: () => {
      utils.application.list.invalidate();
      utils.application.getUsage.invalidate();
      toast.success("Application deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter((a) => a.status === "applied").length || 0,
    interview: applications?.filter((a) => a.status === "interview").length || 0,
    offer: applications?.filter((a) => a.status === "offer").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your job applications.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Applied", value: stats.applied, color: "text-blue-600" },
            { label: "Interview", value: stats.interview, color: "text-amber-600" },
            { label: "Offer", value: stats.offer, color: "text-green-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <p className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-2">
            {applications.map((app) => {
              const StatusIcon = statusIcons[app.status] || FileText;
              const statusOpt = statusOptions.find((s) => s.value === app.status);
              return (
                <Card
                  key={app.id}
                  className="border border-border hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <StatusIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {app.jobTitle || "Untitled Position"}
                        </p>
                        {app.tailoredCv && (
                          <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                            CV
                          </Badge>
                        )}
                        {app.coverLetter && (
                          <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                            <FileText className="w-2.5 h-2.5" />
                            Letter
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">
                          {app.company || "Unknown Company"}
                        </p>
                        <span className="text-muted-foreground/40 text-xs">·</span>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={app.status}
                        onValueChange={(val) =>
                          updateStatusMutation.mutate({
                            id: app.id,
                            status: val as "draft" | "applied" | "interview" | "rejected" | "offer",
                          })
                        }
                      >
                        <SelectTrigger className="w-32 h-7 text-xs border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            <Badge
                              variant="secondary"
                              className={`text-xs capitalize ${statusOpt?.color}`}
                            >
                              {app.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${opt.color}`}
                              >
                                {opt.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Application</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this application and all generated
                              materials. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate({ id: app.id })}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
              No Applications Yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Start by creating your first application. Upload your CV and paste a job description
              to get tailored materials.
            </p>
            <Button onClick={() => navigate("/dashboard/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Application
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
