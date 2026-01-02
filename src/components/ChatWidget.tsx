import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, sendMessage, isLoading, clearChat } = useChat();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const query = inputValue;
        setInputValue('');
        await sendMessage(query);
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2" dir="rtl">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-neon-purple/20 to-blue-600/20 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-blue-500 flex items-center justify-center shadow-lg border border-white/20">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    نبض AI
                                    <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                                </h3>
                                <p className="text-[10px] text-white/70 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    مساعدك الذكي (متصل)
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={clearChat} title="مسح المحادثة">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 mt-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-neon-purple" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-white">مرحباً بك! 👋</p>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        أنا هنا لمساعدتك في العثور على أفضل أدوات الذكاء الاصطناعي. اسألني عن أي شيء!
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[280px]">
                                    {['أدوات لتصميم الصور المجانية', 'مساعد للكتابة بالعربية', 'أفضل أدوات البرمجة'].map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setInputValue(suggestion); handleSend(); }}
                                            className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-3 max-w-[90%]",
                                    msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
                                    msg.role === 'user'
                                        ? "bg-white/10 border-white/20"
                                        : "bg-gradient-to-br from-neon-purple to-blue-600 border-white/20 shadow-lg"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                                </div>

                                <div className={cn(
                                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-white/10 text-white rounded-tl-none border border-white/10"
                                        : "bg-card/80 text-foreground rounded-tr-none border border-white/5 backdrop-blur-sm"
                                )}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-invert prose-p:text-sm prose-a:text-neon-purple prose-a:no-underline hover:prose-a:underline prose-ul:my-1 prose-li:my-0.5 max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 ml-auto max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-blue-600 flex items-center justify-center shrink-0 border border-white/20 shadow-lg mt-1">
                                    <Bot className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div className="bg-card/40 rounded-2xl rounded-tr-none px-4 py-3 flex items-center gap-1.5 border border-white/5">
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-background border-t border-white/10 shrink-0 flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="اكتب سؤالك هنا..."
                            className="flex-1 bg-white/5 border-white/10 focus-visible:ring-neon-purple/50 min-h-[44px]"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !inputValue.trim()}
                            className={cn(
                                "h-11 w-11 shrink-0 transition-all",
                                inputValue.trim()
                                    ? "bg-gradient-to-br from-neon-purple to-blue-600 shadow-lg shadow-neon-purple/20 hover:scale-105"
                                    : "bg-white/5 text-white/30"
                            )}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </Button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
                    isOpen
                        ? "bg-background border border-white/10 text-white hover:bg-white/10 rotate-90"
                        : "bg-gradient-to-r from-neon-purple to-blue-600 border border-white/20 animate-pulse-gentle"
                )}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-7 h-7 text-white" />
                )}
            </Button>
        </div>
    );
};

export default ChatWidget;
