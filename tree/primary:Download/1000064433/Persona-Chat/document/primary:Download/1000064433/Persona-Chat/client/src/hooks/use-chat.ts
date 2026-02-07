import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useConversations() {
  return useQuery({
    queryKey: [api.conversations.list.path],
    queryFn: async () => {
      const res = await fetch(api.conversations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return api.conversations.list.responses[200].parse(await res.json());
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: [api.conversations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.conversations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return api.conversations.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: false, // We'll update manually via streaming
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; characterId?: number }) => {
      const res = await fetch(api.conversations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create conversation");
      return api.conversations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.conversations.delete.path, { id });
      const res = await fetch(url, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}

// Custom hook for streaming chat messages
export function useChatStream(conversationId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsStreaming(true);
    
    // Optimistic update
    const userMessage = {
      id: Date.now(), // Temporary ID
      conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    
    const tempAssistantMessageId = Date.now() + 1;
    const initialAssistantMessage = {
      id: tempAssistantMessageId,
      conversationId,
      role: 'assistant',
      content: '', // Start empty
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(
      [api.conversations.get.path, conversationId],
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...(old.messages || []), userMessage, initialAssistantMessage]
        };
      }
    );

    try {
      const url = buildUrl(api.conversations.messages.create.path, { id: conversationId });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to send message');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.content) {
                assistantContent += data.content;
                
                // Update the temporary assistant message with new content
                queryClient.setQueryData(
                  [api.conversations.get.path, conversationId],
                  (old: any) => {
                    if (!old) return old;
                    const messages = [...old.messages];
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg.id === tempAssistantMessageId) {
                      lastMsg.content = assistantContent;
                    }
                    return { ...old, messages };
                  }
                );
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again.",
        variant: "destructive"
      });
      // Revert optimistic updates on error (simplified for brevity: typically we'd rollback)
    } finally {
      setIsStreaming(false);
      // Invalidate to get the real DB IDs and consistent state
      queryClient.invalidateQueries({ queryKey: [api.conversations.get.path, conversationId] });
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] }); // To update snippet if we had one
    }
  }, [conversationId, queryClient, toast]);

  return { sendMessage, isStreaming };
}
