import { Bot, Sparkles, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Agent {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    avatar_url?: string;
    is_official?: boolean;
}

const AgentCard = ({ agent }: { agent: Agent }) => {
    return (
        <div className="group relative bg-[#1a1a2e]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-neon-purple/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] overflow-hidden flex flex-col h-full">

            {/* خلفية جمالية خفيفة */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-purple/10 transition-colors" />

            {/* الرأس: الأيقونة والاسم */}
            <div className="relative flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                        {agent.avatar_url ? (
                            <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <Bot className="w-7 h-7 text-neon-purple" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {agent.name}
                            {agent.is_official && <ShieldCheck className="w-4 h-4 text-blue-400" aria-label="وكيل رسمي" />}
                        </h3>
                        <span className="text-xs text-gray-400">{agent.category}</span>
                    </div>
                </div>
            </div>

            {/* الوصف */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                {agent.description}
            </p>

            {/* القدرات (Tags) - اختياري، يمكن جلبه من capabilities JSON */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 font-normal">
                    ذكاء اصطناعي
                </Badge>
                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 font-normal">
                    تحليل فوري
                </Badge>
            </div>

            {/* الأزرار */}
            <div className="relative mt-auto pt-4 border-t border-white/5 flex gap-3">
                <Link to={`/workflow/new?agent=${agent.slug}`} className="flex-1">
                    <Button
                        className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-bold group-hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
                    >
                        <Sparkles className="w-4 h-4 ml-2" /> تحدث الآن
                    </Button>
                </Link>
                <Link to={`/agent/${agent.slug}`}>
                    <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 text-gray-300">
                        <ArrowUpRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default AgentCard;
