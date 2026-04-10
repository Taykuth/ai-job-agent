import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CVs() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState<number | null>(null);
  const [previewCV, setPreviewCV] = useState<{
    id: number;
    parsedJson: string | null;
    fileName: string;
  } | null>(null);

  const { data: cvs, isLoading } = trpc.cv.list.useQuery();

  const uploadMutation = trpc.cv.upload.useMutation({
    onSuccess: () => {
      utils.cv.list.invalidate();
      toast.success("CV uploaded successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const parseMutation = trpc.cv.parse.useMutation({
    onSuccess: () => {
      utils.cv.list.invalidate();
      toast.success("CV parsed successfully");
      setParsingId(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setParsingId(null);
    },
  });

  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      utils.cv.list.invalidate();
      toast.success("CV deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFile = async (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, DOC, or TXT file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          fileBase64: base64,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleParse = async (cvId: number) => {
    setParsingId(cvId);
    await parseMutation.mutateAsync({ cvId });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My CVs</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your CVs. Parse them with AI to enable tailored applications.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-accent/30"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading your CV...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                <Upload className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Drop your CV here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOCX, DOC, or TXT — up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CV List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : cvs && cvs.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Uploaded CVs
            </h2>
            {cvs.map((cv) => (
              <Card key={cv.id} className="border border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{cv.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(cv.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cv.parsedJson ? (
                      <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Parsed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Not parsed
                      </Badge>
                    )}
                    {cv.parsedJson && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          setPreviewCV({
                            id: cv.id,
                            parsedJson: cv.parsedJson,
                            fileName: cv.fileName,
                          })
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {!cv.parsedJson && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleParse(cv.id)}
                        disabled={parsingId === cv.id}
                        className="h-8 text-xs"
                      >
                        {parsingId === cv.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          "Parse with AI"
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: cv.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No CVs uploaded yet. Upload your first CV above.
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewCV} onOpenChange={() => setPreviewCV(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{previewCV?.fileName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {previewCV?.parsedJson && (() => {
              try {
                const data = JSON.parse(previewCV.parsedJson);
                return (
                  <div className="space-y-4 pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                        <p className="text-sm font-medium">{data.fullName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                        <p className="text-sm font-medium">{data.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-sm font-medium">{data.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                        <p className="text-sm font-medium">{data.location || "—"}</p>
                      </div>
                    </div>
                    {data.skills?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {data.skills.map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.experience?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Experience</p>
                        <div className="space-y-2">
                          {data.experience.map((exp: { title: string; company: string; duration: string }, i: number) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{exp.title}</span>
                              <span className="text-muted-foreground"> at {exp.company}</span>
                              <span className="text-muted-foreground text-xs ml-2">({exp.duration})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.education?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Education</p>
                        <div className="space-y-1">
                          {data.education.map((edu: { degree: string; institution: string; year: string }, i: number) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{edu.degree}</span>
                              <span className="text-muted-foreground"> — {edu.institution} ({edu.year})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              } catch {
                return <p className="text-sm text-muted-foreground">Could not display parsed data.</p>;
              }
            })()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
