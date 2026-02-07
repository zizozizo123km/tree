import { useRef, useState, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className="p-4 bg-background/80 backdrop-blur-md border-t border-border z-10"
    >
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-secondary/50 p-2 rounded-3xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-300">
        <div className="flex items-center justify-center h-10 w-10 text-muted-foreground ml-1">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxRows={5}
          placeholder={placeholder || "Type a message..."}
          className="flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 py-2.5 px-0 text-base placeholder:text-muted-foreground/70"
          disabled={disabled}
        />

        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || disabled}
          className="h-10 w-10 rounded-full shrink-0 transition-transform active:scale-95 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          <Send className="w-5 h-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-muted-foreground">
          AI may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </form>
  );
}
