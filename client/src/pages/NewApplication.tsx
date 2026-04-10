import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight, Loader2, AlertCircle, Lock } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function NewApplication() {
  const [, navigate] = useLocation();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedCvId, setSelectedCvId] = useState<string>("");

  const { data: cvs } = trpc.cv.list.useQuery();
  const { data: usage } = trpc.application.getUsage.useQuery();

  const parsedCvs = cvs?.filter((cv) => cv.parsedJson) || [];

  const createMutation = trpc.application.create.useMutation({
    onSuccess: (data) => {
      toast.success("Application created! Now generate your tailored materials.");
      navigate(`/dashboard/applications/${data.id}`);
    },
    onError: (err) => {
      if (err.message.includes("Free plan")) {
        toast.error(err.message, {
          action: {
            label: "Upgrade",
            onClick: () => navigate("/dashboard/upgrade"),
          },
        });
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description");
      return;
    }
    createMutation.mutate({
      cvId: selectedCvId ? parseInt(selectedCvId) : undefined,
      jobTitle: jobTitle || undefined,
      company: company || undefined,
      jobUrl: jobUrl || undefined,
      jobDescription,
    });
  };

  const canCreate = usage?.canCreate ?? true;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 py-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">New Application</h1>
          <p className="text-muted-foreground mt-1">
            Enter the job details and select your CV to generate tailored materials.
          </p>
        </div>

        {!canCreate && (
          <Card className="border border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Free plan limit reached</p>
                <p className="text-xs text-muted-foreground">
                  You've used all 5 free applications. Upgrade to Premium for unlimited access.
                </p>
              </div>
              <Button size="sm" onClick={() => navigate("/dashboard/upgrade")}>
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job URL (optional)</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  placeholder="https://linkedin.com/jobs/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here. The more detail, the better the AI can tailor your application..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {jobDescription.length} characters — minimum 50 required
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Select CV</CardTitle>
            </CardHeader>
            <CardContent>
              {parsedCvs.length === 0 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    No parsed CVs available.{" "}
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => navigate("/dashboard/cvs")}
                    >
                      Upload and parse a CV
                    </button>{" "}
                    first to enable AI tailoring.
                  </p>
                </div>
              ) : (
                <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a CV..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedCvs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id.toString()}>
                        {cv.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={createMutation.isPending || !canCreate}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Application...
              </>
            ) : (
              <>
                Create Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
