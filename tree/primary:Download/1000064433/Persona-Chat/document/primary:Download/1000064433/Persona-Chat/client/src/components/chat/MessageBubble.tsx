import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant";
  createdAt: string | Date;
  isStreaming?: boolean;
}

export function MessageBubble({ content, role, createdAt, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-white dark:bg-zinc-800 text-foreground rounded-tl-none border border-border/50"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && !isUser && (
          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse" />
        )}
        <div 
          className={cn(
            "text-[10px] mt-1 opacity-70",
            isUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {format(new Date(createdAt), "h:mm a")}
        </div>
      </div>
    </motion.div>
  );
}
