import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl bg-card/80 backdrop-blur-xl border-border/50 relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to access your characters and conversations.
        </p>

        <Button 
          size="lg" 
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25" 
          onClick={handleLogin}
        >
          Login with Replit
        </Button>
        
        <p className="mt-6 text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}
