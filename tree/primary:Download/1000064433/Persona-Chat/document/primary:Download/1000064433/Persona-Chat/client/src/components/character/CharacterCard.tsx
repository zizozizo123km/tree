import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Trash2 } from "lucide-react";
import type { Character } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface CharacterCardProps {
  character: Character;
  onChat: (character: Character) => void;
  onDelete?: (id: number) => void;
}

export function CharacterCard({ character, onChat, onDelete }: CharacterCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === character.userId;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
            <AvatarImage src={character.avatar || undefined} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
              {character.name[0]}
            </AvatarFallback>
          </Avatar>
          {character.isSystem && (
            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-background shadow-sm">
              OFFICIAL
            </span>
          )}
        </div>
        
        <div className="space-y-2 w-full">
          <h3 className="font-display font-bold text-lg leading-tight truncate">
            {character.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {character.description || "Ready to chat!"}
          </p>
        </div>

        <div className="w-full pt-2 flex gap-2">
          <Button 
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20" 
            onClick={() => onChat(character)}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          
          {isOwner && onDelete && (
            <Button 
              variant="outline" 
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => {
                if(confirm("Delete this character?")) onDelete(character.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
    </Card>
  );
}
