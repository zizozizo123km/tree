import { useCharacters } from "@/hooks/use-characters";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: characters } = useCharacters();

  // Pick a few featured characters (first 3)
  const featured = characters?.slice(0, 3) || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
          <MessageCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
          Chat with anyone, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            anytime.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Create custom AI personalities or chat with pre-made characters. 
          Experience fluid, lifelike conversations powered by advanced AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/characters">
            <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
              Explore Characters <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/characters">
             <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-2">
              Create Your Own
            </Button>
          </Link>
        </div>
      </motion.div>

      {featured.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 w-full"
        >
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Featured Characters
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((char) => (
              <Link key={char.id} href="/characters">
                <div className="bg-card hover:bg-accent/50 p-4 rounded-xl border border-border transition-colors cursor-pointer text-left flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {char.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{char.name}</div>
                    <div className="text-xs text-muted-foreground truncate w-32">
                      {char.description}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
