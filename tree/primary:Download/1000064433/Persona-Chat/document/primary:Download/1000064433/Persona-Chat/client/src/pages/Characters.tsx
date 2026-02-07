import { useState } from "react";
import { useCharacters, useCreateCharacter, useDeleteCharacter } from "@/hooks/use-characters";
import { useCreateConversation } from "@/hooks/use-chat";
import { CharacterCard } from "@/components/character/CharacterCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Character } from "@shared/schema";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  personalityPrompt: z.string().min(10, "Personality prompt must be at least 10 characters"),
});

type CreateFormData = z.infer<typeof createSchema>;

export default function Characters() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: characters, isLoading } = useCharacters();
  const createCharacter = useCreateCharacter();
  const deleteCharacter = useDeleteCharacter();
  const createConversation = useCreateConversation();

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const filteredCharacters = characters?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: CreateFormData) => {
    try {
      await createCharacter.mutateAsync(data);
      toast({ title: "Success", description: "Character created successfully!" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleChat = async (character: Character) => {
    try {
      const chat = await createConversation.mutateAsync({
        title: character.name,
        characterId: character.id
      });
      setLocation(`/chat/${chat.id}`);
    } catch (error) {
      toast({
        title: "Error starting chat",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Characters</h1>
          <p className="text-muted-foreground mt-1">Choose a personality to start chatting</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search characters..." 
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Character</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="e.g. Albert Einstein" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Input id="description" {...form.register("description")} placeholder="Physicist and genius" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt">Personality Prompt</Label>
                  <Textarea 
                    id="prompt" 
                    {...form.register("personalityPrompt")} 
                    placeholder="Describe how this AI should behave..."
                    className="min-h-[100px]"
                  />
                  {form.formState.errors.personalityPrompt && (
                    <p className="text-sm text-destructive">{form.formState.errors.personalityPrompt.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCharacter.isPending}>
                    {createCharacter.isPending ? "Creating..." : "Create Character"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCharacters?.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No characters found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters?.map((char) => (
            <CharacterCard 
              key={char.id} 
              character={char} 
              onChat={handleChat}
              onDelete={char.isSystem ? undefined : (id) => deleteCharacter.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
