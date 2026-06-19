import { UploadForm } from "./UploadForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Data Upload</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Upload raw transaction datasets to populate the analytics engine. 
          The backend will automatically bulk-insert valid rows and report any issues.
        </p>
      </div>

      <UploadForm />
    </div>
  );
}
