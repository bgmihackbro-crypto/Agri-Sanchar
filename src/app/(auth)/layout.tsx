import { Sprout } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-primary">
        <Sprout className="h-8 w-8" />
        <h1 className="font-headline">Agri-Sanchar</h1>
      </div>
      {children}
    </div>
  );
}
