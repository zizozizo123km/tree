import { useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useConversation, useChatStream } from "@/hooks/use-chat";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const id = parseInt(params?.id || "0");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: conversation, isLoading } = useConversation(id);
  const { sendMessage, isStreaming } = useChatStream(id);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages, isStreaming]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Conversation not found.</p>
      </div>
    );
  }

  const messages = conversation.messages || [];

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center gap-3 sticky top-0 z-10">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {conversation.title[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground">{conversation.title}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 md:px-6">
        <div className="max-w-3xl mx-auto py-6 flex flex-col justify-end min-h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center opacity-50 pb-20">
              <div>
                <p className="text-lg font-medium">No messages yet.</p>
                <p className="text-sm">Say hello to start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id || idx}
                content={msg.content}
                role={msg.role as "user" | "assistant"}
                createdAt={msg.createdAt}
                isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
              />
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
