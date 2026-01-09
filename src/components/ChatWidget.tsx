import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle, X, Send, Bot, User, Loader2, Sparkles,
    Trash2, Volume2, VolumeX, Minimize2, Maximize2,
    ChevronDown, Copy, Check, ExternalLink, Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Types
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'nabd-chat-history';
const SETTINGS_KEY = 'nabd-chat-settings';
const MAX_STORED_MESSAGES = 50;

interface ChatSettings {
    soundEnabled: boolean;
    isMinimized: boolean;
}

interface ToolCard {
    title: string;
    slug: string;
}

// Quick suggestion buttons
const QUICK_SUGGESTIONS = [
    { label: '🎨 تصميم', query: 'أدوات تصميم الصور بالذكاء الاصطناعي' },
    { label: '✍️ كتابة', query: 'مساعد للكتابة والتحرير' },
    { label: '💻 برمجة', query: 'أفضل أدوات البرمجة AI' },
    { label: '🎬 فيديو', query: 'أدوات إنشاء الفيديو' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

const loadSettings = (): ChatSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : { soundEnabled: true, isMinimized: false };
    } catch {
        return { soundEnabled: true, isMinimized: false };
    }
};

const saveSettings = (settings: ChatSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save chat settings:', e);
    }
};

const loadStoredMessages = (): ChatMessage[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveMessages = (messages: ChatMessage[]) => {
    try {
        // Keep only the most recent messages
        const toStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
        console.warn('Failed to save chat history:', e);
    }
};

// Extract tool mentions from text for linking
const extractToolSlug = (text: string): ToolCard | null => {
    const match = text.match(/\*\*([^*]+)\*\*/);
    if (match) {
        const title = match[1];
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return { title, slug };
    }
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

// Animated typing indicator
const TypingIndicator = () => (
    <div className="flex gap-3 ml-auto max-w-[80%] animate-fadeIn" role="status" aria-label="المساعد يكتب...">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-blue-600 flex items-center justify-center shrink-0 border border-white/20 shadow-lg mt-1">
            <Bot className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="bg-card/60 rounded-2xl rounded-tr-none px-4 py-3 flex items-center gap-2 border border-white/5 backdrop-blur-sm">
            <span className="text-xs text-muted-foreground ml-2">يفكر</span>
            <span className="flex gap-1">
                <span className="w-2 h-2 bg-neon-purple/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-neon-purple/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-neon-purple/60 rounded-full animate-bounce" />
            </span>
        </div>
    </div>
);

// Message bubble component
interface MessageBubbleProps {
    msg: ChatMessage;
    onCopy: (text: string) => void;
    copiedIndex: number | null;
    index: number;
    navigate: (path: string) => void;
}

const MessageBubble = ({ msg, onCopy, copiedIndex, index, navigate }: MessageBubbleProps) => {
    const isUser = msg.role === 'user';
    const toolCard = !isUser ? extractToolSlug(msg.content) : null;

    return (
        <div
            className={cn(
                "flex gap-3 max-w-[90%] group animate-slideInUp",
                isUser ? "mr-auto flex-row-reverse" : "ml-auto"
            )}
            style={{ animationDelay: '0.05s' }}
        >
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 transition-transform group-hover:scale-110",
                isUser
                    ? "bg-white/10 border-white/20"
                    : "bg-gradient-to-br from-neon-purple to-blue-600 border-white/20 shadow-lg"
            )}>
                {isUser
                    ? <User className="w-4 h-4" aria-hidden="true" />
                    : <Bot className="w-4 h-4 text-white" aria-hidden="true" />
                }
            </div>

            {/* Message Content */}
            <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm shadow-sm relative",
                isUser
                    ? "bg-gradient-to-br from-white/10 to-white/5 text-white rounded-tl-none border border-white/10"
                    : "bg-card/80 text-foreground rounded-tr-none border border-white/5 backdrop-blur-sm"
            )}>
                {isUser ? (
                    <p>{msg.content}</p>
                ) : (
                    <>
                        <div className="prose prose-invert prose-p:text-sm prose-a:text-neon-purple prose-a:no-underline hover:prose-a:underline prose-ul:my-1 prose-li:my-0.5 max-w-none">
                            <ReactMarkdown
                                components={{
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-neon-purple hover:text-neon-cyan transition-colors"
                                        >
                                            {children}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>

                        {/* Tool Card Preview (if detected) */}
                        {toolCard && (
                            <button
                                onClick={() => navigate(`/tool/${toolCard.slug}`)}
                                className="mt-3 w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group/tool"
                            >
                                <span className="text-xs text-muted-foreground">
                                    عرض تفاصيل: <span className="text-neon-purple">{toolCard.title}</span>
                                </span>
                                <ExternalLink className="w-3 h-3 opacity-50 group-hover/tool:opacity-100 transition-opacity" />
                            </button>
                        )}

                        {/* Copy Button */}
                        <button
                            onClick={() => onCopy(msg.content)}
                            className="absolute -bottom-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-white/10 rounded-full p-1.5 hover:bg-white/10"
                            aria-label="نسخ الرسالة"
                        >
                            {copiedIndex === index
                                ? <Check className="w-3 h-3 text-green-400" />
                                : <Copy className="w-3 h-3 text-muted-foreground" />
                            }
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Error display component
interface ErrorDisplayProps {
    error: string;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
    <div className="flex gap-3 ml-auto max-w-[90%] animate-fadeIn" role="alert">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30 mt-1">
            <Bot className="w-4 h-4 text-red-400" aria-hidden="true" />
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tr-none px-4 py-2.5 text-sm">
            <p className="text-red-400 font-medium mb-1">⚠️ خطأ</p>
            <p className="text-red-300/80 text-xs">{error}</p>
            {error.includes('تسجيل الدخول') && (
                <a
                    href="/auth"
                    className="inline-block mt-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                    تسجيل الدخول →
                </a>
            )}
        </div>
    </div>
);

// Welcome screen when chat is empty
interface WelcomeScreenProps {
    onSuggestionClick: (query: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-6 animate-fadeIn">
        <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-neon-purple" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-white text-lg">مرحباً بك! 👋</h3>
            <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                أنا نبض AI، مساعدك الذكي للعثور على أفضل أدوات الذكاء الاصطناعي. اسألني عن أي شيء!
            </p>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[300px]">
            {QUICK_SUGGESTIONS.map(suggestion => (
                <button
                    key={suggestion.query}
                    onClick={() => onSuggestionClick(suggestion.query)}
                    className="text-xs bg-white/5 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/30 rounded-full px-3 py-2 transition-all duration-200 hover:scale-105"
                >
                    {suggestion.label}
                </button>
            ))}
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mt-4">
            <Keyboard className="w-3 h-3" />
            <span>Ctrl + Enter للإرسال السريع</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ChatWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [settings, setSettings] = useState<ChatSettings>(loadSettings);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const { messages, sendMessage, isLoading, clearChat, error, setMessages } = useChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ─────────────────────────────────────────────
    // Load stored messages on mount
    // ─────────────────────────────────────────────
    useEffect(() => {
        const stored = loadStoredMessages();
        if (stored.length > 0) {
            setMessages(stored);
        }
    }, [setMessages]);

    // Save messages when they change
    useEffect(() => {
        if (messages.length > 0) {
            saveMessages(messages);
        }
    }, [messages]);

    // Save settings when they change
    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    // ─────────────────────────────────────────────
    // Auto-scroll & scroll detection
    // ─────────────────────────────────────────────
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
        // Reset unread when viewing
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [messages, isLoading, isOpen, scrollToBottom]);

    // Track scroll position for "scroll to bottom" button
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Track unread messages when closed
    useEffect(() => {
        if (!isOpen && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'model') {
                setUnreadCount(prev => prev + 1);
            }
        }
    }, [messages, isOpen]);

    // Animation handler for open/close
    const handleToggle = useCallback(() => {
        if (isOpen) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsAnimating(false);
            }, 200);
        } else {
            setIsOpen(true);
        }
    }, [isOpen]);

    // ─────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const query = inputValue;
        setInputValue('');
        await sendMessage(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl+Enter to send
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = useCallback((query: string) => {
        setInputValue(query);
        // Give time for state to update, then send
        setTimeout(() => {
            sendMessage(query);
            setInputValue('');
        }, 50);
    }, [sendMessage]);

    const handleCopy = useCallback(async (text: string, index?: number) => {
        try {
            await navigator.clipboard.writeText(text);
            if (index !== undefined) {
                setCopiedIndex(index);
                setTimeout(() => setCopiedIndex(null), 2000);
            }
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, []);

    const handleClearChat = useCallback(() => {
        clearChat();
        localStorage.removeItem(STORAGE_KEY);
    }, [clearChat]);

    const toggleSound = useCallback(() => {
        setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    const toggleMinimize = useCallback(() => {
        setSettings(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }, []);

    // ─────────────────────────────────────────────
    // Memoized Values
    // ─────────────────────────────────────────────
    const hasMessages = useMemo(() => messages.length > 0, [messages.length]);

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────
    return (
        <div
            className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2"
            dir="rtl"
            role="complementary"
            aria-label="مساعد نبض AI"
        >
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "w-[350px] sm:w-[400px] bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
                        isAnimating ? "animate-slideOutDown" : "animate-slideInUp",
                        !settings.isMinimized ? "h-[500px] max-h-[80vh]" : "h-auto"
                    )}
                    role="dialog"
                    aria-labelledby="chat-title"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 bg-gradient-to-r from-neon-purple/20 via-blue-600/10 to-transparent flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-blue-500 flex items-center justify-center shadow-lg border border-white/20">
                                    <Bot className="w-6 h-6 text-white" aria-hidden="true" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <h3 id="chat-title" className="font-bold text-white flex items-center gap-2 text-sm">
                                    نبض AI
                                    <Sparkles className="w-3 h-3 text-yellow-400" aria-hidden="true" />
                                </h3>
                                <p className="text-[10px] text-white/60">
                                    مساعدك الذكي • {hasMessages ? `${messages.length} رسالة` : 'جاهز للمساعدة'}
                                </p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                                onClick={toggleSound}
                                aria-label={settings.soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
                            >
                                {settings.soundEnabled
                                    ? <Volume2 className="w-4 h-4" />
                                    : <VolumeX className="w-4 h-4" />
                                }
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                                onClick={toggleMinimize}
                                aria-label={settings.isMinimized ? "توسيع" : "تصغير"}
                            >
                                {settings.isMinimized
                                    ? <Maximize2 className="w-4 h-4" />
                                    : <Minimize2 className="w-4 h-4" />
                                }
                            </Button>
                            {hasMessages && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/10"
                                    onClick={handleClearChat}
                                    aria-label="مسح المحادثة"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                                onClick={handleToggle}
                                aria-label="إغلاق المحادثة"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area (hidden when minimized) */}
                    {!settings.isMinimized && (
                        <>
                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-black/10 to-black/30 relative"
                                ref={scrollRef}
                                role="log"
                                aria-live="polite"
                                aria-label="سجل المحادثة"
                            >
                                {!hasMessages && (
                                    <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
                                )}

                                {messages.map((msg, idx) => (
                                    <MessageBubble
                                        key={idx}
                                        msg={msg}
                                        index={idx}
                                        onCopy={(text) => handleCopy(text, idx)}
                                        copiedIndex={copiedIndex}
                                        navigate={navigate}
                                    />
                                ))}

                                {isLoading && <TypingIndicator />}

                                {error && !isLoading && <ErrorDisplay error={error} />}
                            </div>

                            {/* Scroll to Bottom Button */}
                            {showScrollButton && (
                                <button
                                    onClick={scrollToBottom}
                                    className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-neon-purple/80 hover:bg-neon-purple text-white rounded-full p-2 shadow-lg border border-white/20 transition-all animate-fadeIn"
                                    aria-label="التمرير للأسفل"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            )}

                            {/* Input Area */}
                            <form
                                onSubmit={handleSend}
                                className="p-3 bg-background/80 border-t border-white/10 shrink-0 flex gap-2 backdrop-blur-sm"
                            >
                                <Input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="اكتب سؤالك هنا..."
                                    className="flex-1 bg-white/5 border-white/10 focus-visible:ring-neon-purple/50 min-h-[44px] text-sm"
                                    disabled={isLoading}
                                    aria-label="حقل إدخال الرسالة"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !inputValue.trim()}
                                    className={cn(
                                        "h-11 w-11 shrink-0 transition-all duration-200",
                                        inputValue.trim()
                                            ? "bg-gradient-to-br from-neon-purple to-blue-600 shadow-lg shadow-neon-purple/20 hover:scale-105 hover:shadow-neon-purple/40"
                                            : "bg-white/5 text-white/30 cursor-not-allowed"
                                    )}
                                    aria-label="إرسال الرسالة"
                                >
                                    {isLoading
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : <Send className="w-5 h-5 ml-0.5" />
                                    }
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <Button
                onClick={handleToggle}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 relative",
                    isOpen
                        ? "bg-background border border-white/10 text-white hover:bg-white/10"
                        : "bg-gradient-to-br from-neon-purple to-blue-600 border border-white/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                )}
                aria-label={isOpen ? "إغلاق المحادثة" : "فتح مساعد نبض AI"}
                aria-expanded={isOpen}
            >
                <span className={cn(
                    "transition-transform duration-200",
                    isOpen ? "rotate-90" : "rotate-0"
                )}>
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <MessageCircle className="w-7 h-7 text-white" />
                    )}
                </span>

                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background animate-scaleIn">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Pulse Animation (when closed) */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-neon-purple/30 animate-ping pointer-events-none" />
                )}
            </Button>
        </div>
    );
};

export default ChatWidget;
