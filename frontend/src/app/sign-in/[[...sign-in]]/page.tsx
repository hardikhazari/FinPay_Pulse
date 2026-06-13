import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <SignIn />
    </div>
  );
}
