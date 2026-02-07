import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useConversations, useDeleteConversation } from "@/hooks/use-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, LogOut, MoreVertical, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  className?: string;
  onClose?: () => void; // For mobile drawer closing
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();

  const isActive = (path: string) => location === path;

  return (
    <div className={cn("flex flex-col h-full bg-secondary/30 border-r border-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-foreground">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              AI
            </span>
            ChatGenius
          </Link>
        </div>
        
        <Link href="/characters">
          <Button className="w-full justify-start gap-2 shadow-sm" size="lg" onClick={onClose}>
            <Plus className="w-5 h-5" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Conversations
          </h4>
          
          {isLoading ? (
            <div className="space-y-2 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              <p>No conversations yet.</p>
              <p className="mt-1">Start a new chat to begin!</p>
            </div>
          ) : (
            conversations?.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive(`/chat/${chat.id}`) 
                    ? "bg-background shadow-sm ring-1 ring-border" 
                    : "hover:bg-background/50 hover:shadow-sm"
                )}
              >
                <Link 
                  href={`/chat/${chat.id}`} 
                  className="absolute inset-0 z-0"
                  onClick={onClose}
                />
                
                <Avatar className="h-10 w-10 border border-border/50 bg-white dark:bg-zinc-800">
                  <AvatarFallback className="text-xs">
                    {chat.title.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 z-10 pointer-events-none">
                  <div className="font-medium text-sm truncate text-foreground">
                    {chat.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div className="z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this conversation?")) {
                            deleteConversation.mutate(chat.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
