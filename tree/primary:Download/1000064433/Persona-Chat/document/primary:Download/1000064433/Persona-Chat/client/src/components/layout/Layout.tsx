import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/Login";
import { Loader2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex w-80 shrink-0" />

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar onClose={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/80 backdrop-blur shadow-sm border border-border"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <main className="flex-1 h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
