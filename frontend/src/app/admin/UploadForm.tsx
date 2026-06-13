"use client";

import { useState } from "react";
import { UploadCloud, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

type UploadResult = {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
};

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setServerError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setServerError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setResult({
        inserted: data.inserted,
        skipped: data.skipped,
        errors: data.errors,
      });
      setFile(null); // Clear on success
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/50 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <UploadCloud className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="text-center">
            {file ? (
              <p className="text-sm font-medium text-zinc-200">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-200">No transactions found.</p>
                <p className="text-sm text-zinc-500 mt-1">Upload your first dataset to generate the analysis.</p>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" className="relative border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300">
              {file ? "Change File" : "Select CSV"}
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="bg-zinc-100 text-zinc-950 hover:bg-white"
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            )}
          </div>
        </div>
      </Card>

      {serverError && (
        <Card className="border-rose-900/50 bg-rose-950/20 p-4 flex gap-3 text-rose-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-sm">{serverError}</div>
        </Card>
      )}

      {result && (
        <Card className="border-emerald-900/50 bg-emerald-950/10 p-6 space-y-4">
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-medium text-emerald-400">Upload Processed Successfully</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded p-4 border border-zinc-800">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Inserted Rows</div>
              <div className="text-2xl font-semibold tabular-nums text-zinc-100">{result.inserted}</div>
            </div>
            <div className="bg-zinc-900 rounded p-4 border border-zinc-800">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Skipped Rows</div>
              <div className="text-2xl font-semibold tabular-nums text-zinc-100">{result.skipped}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Sample Errors</h4>
              <div className="max-h-40 overflow-y-auto rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="px-3 py-2 font-medium text-zinc-300 w-16">Row</th>
                      <th className="px-3 py-2 font-medium text-zinc-300">Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-3 py-2 tabular-nums">{e.row}</td>
                        <td className="px-3 py-2 text-rose-400">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
