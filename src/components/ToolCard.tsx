import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/data/tools';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

const ToolCard = ({ tool, index }: ToolCardProps) => {
  return (
    <article
      className="glass rounded-2xl p-6 card-glow animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      dir="rtl"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
          tool.gradient
        )}>
          {tool.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold text-foreground">{tool.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{tool.description}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
            {tool.category}
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "border",
              tool.price === 'مجاني' 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            )}
          >
            {tool.price}
          </Badge>
        </div>
        
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2"
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            زيارة الموقع
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};

export default ToolCard;
