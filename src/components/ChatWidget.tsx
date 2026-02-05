import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك في العثور على الأدوات المناسبة اليوم؟ 🤖" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("chat-agent", {
                body: { query: userMsg },
            });

            if (error) throw error;

            if (data?.reply) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
            } else {
                throw new Error("No reply received");
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "عذراً، واجهت مشكلة في الاتصال. حاول مرة أخرى لاحقاً. 😓" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-4">
            {/* Chat Window */}
            <div
                className={cn(
                    "w-[90vw] sm:w-[350px] h-[500px] bg-background/95 backdrop-blur-xl border border-neon-purple/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-left",
                    isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-10 pointer-events-none h-0"
                )}
            >
                {/* Header */}
                <div className="p-4 bg-neon-purple/10 border-b border-neon-purple/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">المساعد الذكي</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                متصل الآن
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    msg.role === "user" ? "self-end ml-auto flex-row-reverse" : "self-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                        msg.role === "user"
                                            ? "bg-primary/20 border-primary/30"
                                            : "bg-neon-purple/20 border-neon-purple/30"
                                    )}
                                >
                                    {msg.role === "user" ? (
                                        <User className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-neon-purple" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted/50 border border-white/5 rounded-tl-sm"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-neon-purple" />
                                </div>
                                <div className="bg-muted/50 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-muted/5">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="اسأل عن أداة..."
                            className="bg-background/50 border-white/10 focus-visible:ring-neon-purple/50"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="bg-neon-purple hover:bg-neon-purple/80 text-white shrink-0"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 ml-0.5" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Floating Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                    "rounded-full h-14 w-14 shadow-lg transition-all duration-300 hover:scale-105 z-50",
                    isOpen
                        ? "bg-muted text-muted-foreground rotate-90"
                        : "bg-gradient-to-r from-neon-purple to-neon-blue text-white animate-pulse-slow"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </Button>
        </div>
    );
}

export default ChatWidget;
