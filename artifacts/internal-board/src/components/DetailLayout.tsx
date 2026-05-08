import { Sidebar } from "@/components/Sidebar";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface DetailLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DetailLayout({ title, description, actions, children }: DetailLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Content Board
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
              )}
            </div>
            <div className="flex gap-2">{actions}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DetailToolbarButton({ children }: { children: ReactNode }) {
  return (
    <Button variant="outline" size="sm" className="h-9 text-xs font-medium">
      {children}
    </Button>
  );
}
