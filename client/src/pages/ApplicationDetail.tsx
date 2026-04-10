import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Mail,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { value: "interview", label: "Interview", color: "bg-amber-100 text-amber-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-700" },
];

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ApplicationDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const id = parseInt(params.id);

  const { data: app, isLoading } = trpc.application.getById.useQuery({ id });

  const generateCVMutation = trpc.application.generateTailoredCV.useMutation({
    onSuccess: () => {
      utils.application.getById.invalidate({ id });
      toast.success("Tailored CV generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateCLMutation = trpc.application.generateCoverLetter.useMutation({
    onSuccess: () => {
      utils.application.getById.invalidate({ id });
      toast.success("Cover letter generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.application.getById.invalidate({ id });
      utils.application.list.invalidate();
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!app) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Application not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard/applications")}>
            Back to Applications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStatus = statusOptions.find((s) => s.value === app.status);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 py-2">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 -ml-2"
            onClick={() => navigate("/dashboard/applications")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-serif font-bold text-foreground truncate">
              {app.jobTitle || "Untitled Position"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {app.company || "Unknown Company"}
              {app.jobUrl && (
                <>
                  {" · "}
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Job Posting
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="shrink-0">
            <Select
              value={app.status}
              onValueChange={(val) =>
                updateStatusMutation.mutate({
                  id: app.id,
                  status: val as "draft" | "applied" | "interview" | "rejected" | "offer",
                })
              }
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue>
                  <Badge
                    variant="secondary"
                    className={`text-xs capitalize ${currentStatus?.color}`}
                  >
                    {app.status}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <Badge variant="secondary" className={`text-xs ${opt.color}`}>
                      {opt.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="cv" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cv" className="gap-2">
              <FileText className="w-3.5 h-3.5" />
              Tailored CV
            </TabsTrigger>
            <TabsTrigger value="cover" className="gap-2">
              <Mail className="w-3.5 h-3.5" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="job" className="gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Job Details
            </TabsTrigger>
          </TabsList>

          {/* Tailored CV Tab */}
          <TabsContent value="cv" className="space-y-4">
            <Card className="border border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Tailored CV</CardTitle>
                <div className="flex items-center gap-2">
                  {app.tailoredCv && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => copyToClipboard(app.tailoredCv!, "Tailored CV")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() =>
                          downloadMarkdown(
                            app.tailoredCv!,
                            `tailored-cv-${app.jobTitle || "application"}.md`
                          )
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => generateCVMutation.mutate({ applicationId: app.id })}
                    disabled={generateCVMutation.isPending}
                  >
                    {generateCVMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : app.tailoredCv ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate CV
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {app.tailoredCv ? (
                  <div className="prose prose-sm max-w-none bg-secondary/20 rounded-xl p-6">
                    <Streamdown>{app.tailoredCv}</Streamdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Generate Your Tailored CV
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                      Our AI will rewrite your CV to highlight the most relevant experience for
                      this specific role — using only your real information.
                    </p>
                    <Button
                      onClick={() => generateCVMutation.mutate({ applicationId: app.id })}
                      disabled={generateCVMutation.isPending}
                    >
                      {generateCVMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Tailored CV
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover" className="space-y-4">
            <Card className="border border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Cover Letter</CardTitle>
                <div className="flex items-center gap-2">
                  {app.coverLetter && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => copyToClipboard(app.coverLetter!, "Cover letter")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() =>
                          downloadMarkdown(
                            app.coverLetter!,
                            `cover-letter-${app.jobTitle || "application"}.md`
                          )
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => generateCLMutation.mutate({ applicationId: app.id })}
                    disabled={generateCLMutation.isPending}
                  >
                    {generateCLMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : app.coverLetter ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Letter
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {app.coverLetter ? (
                  <div className="prose prose-sm max-w-none bg-secondary/20 rounded-xl p-6">
                    <Streamdown>{app.coverLetter}</Streamdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Generate Your Cover Letter
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                      A compelling, personalized cover letter that connects your real experience
                      to what this employer needs.
                    </p>
                    <Button
                      onClick={() => generateCLMutation.mutate({ applicationId: app.id })}
                      disabled={generateCLMutation.isPending}
                    >
                      {generateCLMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Cover Letter
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Details Tab */}
          <TabsContent value="job">
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/20 rounded-xl p-6">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {app.jobDescription}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
