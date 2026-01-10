import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAgentBrain, AgentMessage, AgentError, ToolExecution, AgentSlug } from '@/hooks/useAgentBrain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle, X, Send, Bot, User, Loader2, Sparkles,
    Trash2, Volume2, VolumeX, Minimize2, Maximize2,
    ChevronDown, Copy, Check, ExternalLink, Keyboard,
    RefreshCw, XCircle, Clock, Wifi, WifiOff, AlertTriangle,
    Wrench, Search, GitCompare, Info, Star, Zap, Users, ChevronLeft
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

// Tool Execution Badge Component
const getToolIcon = (toolName: string) => {
    switch (toolName) {
        case 'search_tools': return <Search className="w-3 h-3" />;
        case 'compare_tools': return <GitCompare className="w-3 h-3" />;
        case 'get_tool_details': return <Info className="w-3 h-3" />;
        case 'search_by_category': return <Star className="w-3 h-3" />;
        case 'get_popular_tools': return <Zap className="w-3 h-3" />;
        default: return <Wrench className="w-3 h-3" />;
    }
};

const getToolLabel = (toolName: string) => {
    const labels: Record<string, string> = {
        'search_tools': 'بحث دلالي',
        'compare_tools': 'مقارنة',
        'get_tool_details': 'تفاصيل',
        'search_by_category': 'حسب الفئة',
        'get_popular_tools': 'الأشهر'
    };
    return labels[toolName] || toolName;
};

interface ToolExecutionBadgeProps {
    tools: ToolExecution[];
}

const ToolExecutionBadge = ({ tools }: ToolExecutionBadgeProps) => {
    if (!tools || tools.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-muted-foreground/60 w-full mb-1 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                أدوات مُنفذة:
            </span>
            {tools.map((tool, idx) => (
                <span
                    key={idx}
                    className={cn(
                        "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                        tool.success
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                >
                    {getToolIcon(tool.name)}
                    <span>{getToolLabel(tool.name)}</span>
                    {tool.itemsFound > 0 && (
                        <span className="bg-white/10 px-1 rounded text-white/70">
                            {tool.itemsFound}
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
};

// Message bubble component
interface MessageBubbleProps {
    msg: AgentMessage;
    onCopy: (text: string) => void;
    copiedIndex: number | null;
    index: number;
    navigate: (path: string) => void;
}

const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
};

const MessageBubble = ({ msg, onCopy, copiedIndex, index, navigate }: MessageBubbleProps) => {
    const isUser = msg.role === 'user';
    const isAgent = msg.role === 'agent';
    const toolCard = isAgent ? extractToolSlug(msg.content) : null;

    return (
        <div
            className={cn(
                "flex gap-3 max-w-[90%] group animate-slideInUp",
                isUser ? "mr-auto flex-row-reverse" : "ml-auto",
                isAgent && msg.toolsExecuted?.length ? "max-w-[95%]" : "",
                msg.status === 'error' && "opacity-60"
            )}
            style={{ animationDelay: '0.05s' }}
        >
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 transition-transform group-hover:scale-110",
                isUser
                    ? msg.status === 'error'
                        ? "bg-red-500/20 border-red-500/30"
                        : "bg-white/10 border-white/20"
                    : msg.toolsExecuted?.length
                        ? "bg-gradient-to-br from-neon-cyan to-blue-600 border-white/20 shadow-lg shadow-neon-cyan/20"
                        : "bg-gradient-to-br from-neon-purple to-blue-600 border-white/20 shadow-lg"
            )}>
                {isUser
                    ? msg.status === 'sending'
                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : msg.status === 'error'
                            ? <AlertTriangle className="w-4 h-4 text-red-400" aria-hidden="true" />
                            : <User className="w-4 h-4" aria-hidden="true" />
                    : <Bot className="w-4 h-4 text-white" aria-hidden="true" />
                }
            </div>

            {/* Message Content */}
            <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm shadow-sm relative",
                isUser
                    ? msg.status === 'error'
                        ? "bg-red-500/10 text-red-300 rounded-tl-none border border-red-500/20"
                        : "bg-gradient-to-br from-white/10 to-white/5 text-white rounded-tl-none border border-white/10"
                    : "bg-card/80 text-foreground rounded-tr-none border border-white/5 backdrop-blur-sm"
            )}>
                {isUser ? (
                    <div>
                        <p>{msg.content}</p>
                        {msg.status === 'sending' && (
                            <p className="text-[10px] text-white/40 mt-1">جاري الإرسال...</p>
                        )}
                        {msg.status === 'error' && (
                            <p className="text-[10px] text-red-400 mt-1">فشل الإرسال</p>
                        )}
                    </div>
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

                        {/* Tools Executed Badge */}
                        {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                            <ToolExecutionBadge tools={msg.toolsExecuted} />
                        )}

                        {/* Response Time Badge */}
                        {msg.executionTime && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60">
                                <Clock className="w-3 h-3" />
                                <span>{formatResponseTime(msg.executionTime)}</span>
                                {msg.toolsExecuted?.length && (
                                    <span className="text-neon-cyan/60 mr-2">
                                        • {msg.toolsExecuted.length} أداة
                                    </span>
                                )}
                            </div>
                        )}

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

// Error display component with retry support
interface ErrorDisplayProps {
    error: AgentError;
    onRetry?: () => void;
    canRetry?: boolean;
}

const getErrorIcon = (type: AgentError['type']) => {
    switch (type) {
        case 'network': return <WifiOff className="w-4 h-4 text-red-400" />;
        case 'auth': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
        case 'timeout': return <Clock className="w-4 h-4 text-orange-400" />;
        case 'rateLimit': return <Clock className="w-4 h-4 text-yellow-400" />;
        default: return <Bot className="w-4 h-4 text-red-400" />;
    }
};

const ErrorDisplay = ({ error, onRetry, canRetry }: ErrorDisplayProps) => (
    <div className="flex gap-3 ml-auto max-w-[90%] animate-fadeIn" role="alert">
        <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
            error.type === 'auth' ? "bg-yellow-500/20 border-yellow-500/30" : "bg-red-500/20 border-red-500/30"
        )}>
            {getErrorIcon(error.type)}
        </div>
        <div className={cn(
            "rounded-2xl rounded-tr-none px-4 py-2.5 text-sm border",
            error.type === 'auth'
                ? "bg-yellow-500/10 border-yellow-500/20"
                : "bg-red-500/10 border-red-500/20"
        )}>
            <p className={cn(
                "font-medium mb-1",
                error.type === 'auth' ? "text-yellow-400" : "text-red-400"
            )}>
                {error.type === 'network' && '📡 '}
                {error.type === 'timeout' && '⏱️ '}
                {error.type === 'auth' && '🔐 '}
                {error.type === 'server' && '🖥️ '}
                {error.type === 'rateLimit' && '⏳ '}
                {error.type === 'unknown' && '⚠️ '}
                خطأ
            </p>
            <p className="text-red-300/80 text-xs">{error.message}</p>

            <div className="flex gap-2 mt-2">
                {error.type === 'auth' && (
                    <a
                        href="/auth"
                        className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-full transition-colors"
                    >
                        تسجيل الدخول →
                    </a>
                )}
                {error.retryable && canRetry && onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        إعادة المحاولة
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Thinking Indicator - عندما يفكر الوكيل
const ThinkingIndicator = () => (
    <div className="flex gap-3 ml-auto max-w-[80%] animate-fadeIn" role="status" aria-label="الوكيل يفكر...">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shrink-0 border border-white/20 shadow-lg shadow-neon-cyan/20 mt-1">
            <Wrench className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="bg-card/60 rounded-2xl rounded-tr-none px-4 py-3 flex items-center gap-2 border border-neon-cyan/20 backdrop-blur-sm">
            <span className="text-xs text-neon-cyan ml-2">ينفذ الأدوات...</span>
            <span className="flex gap-1">
                <span className="w-2 h-2 bg-neon-cyan/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-neon-cyan/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-neon-cyan/60 rounded-full animate-bounce" />
            </span>
        </div>
    </div>
);

// Retry indicator removed - useAgentBrain handles retry internally


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

// Agent Selector Component
interface AgentSelectorProps {
    currentAgent: AgentSlug;
    availableAgents: { slug: AgentSlug; name: string; emoji: string; description: string }[];
    onSelectAgent: (slug: AgentSlug) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const AgentSelector = ({ currentAgent, availableAgents, onSelectAgent, isOpen, onToggle }: AgentSelectorProps) => {
    const current = availableAgents.find(a => a.slug === currentAgent);

    return (
        <div className="relative">
            {/* Current Agent Button */}
            <button
                onClick={onToggle}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs",
                    "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
            >
                <span className="text-base">{current?.emoji}</span>
                <span className="text-white/80 font-medium">{current?.name}</span>
                <ChevronDown className={cn(
                    "w-3 h-3 text-white/50 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
                    <div className="p-2 border-b border-white/5">
                        <p className="text-[10px] text-muted-foreground px-2">اختر وكيلاً متخصصاً</p>
                    </div>
                    <div className="p-1">
                        {availableAgents.map((agent) => (
                            <button
                                key={agent.slug}
                                onClick={() => {
                                    onSelectAgent(agent.slug);
                                    onToggle();
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right",
                                    agent.slug === currentAgent
                                        ? "bg-neon-purple/20 border border-neon-purple/30"
                                        : "hover:bg-white/5"
                                )}
                            >
                                <span className="text-xl">{agent.emoji}</span>
                                <div className="flex-1 text-right">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        agent.slug === currentAgent ? "text-neon-purple" : "text-white"
                                    )}>
                                        {agent.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {agent.description}
                                    </p>
                                </div>
                                {agent.slug === currentAgent && (
                                    <Check className="w-4 h-4 text-neon-purple" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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
    const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);

    const {
        messages, sendMessage, isLoading, isThinking, clearChat, error,
        setMessages, cancelRequest, retryLastMessage,
        currentAgent, switchAgent, availableAgents, quickSuggestions
    } = useAgentBrain();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Note: useAgentBrain handles message persistence internally

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
            if (lastMessage.role === 'agent') {
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
                            {/* Agent Selector */}
                            <AgentSelector
                                currentAgent={currentAgent}
                                availableAgents={availableAgents}
                                onSelectAgent={switchAgent}
                                isOpen={isAgentSelectorOpen}
                                onToggle={() => setIsAgentSelectorOpen(!isAgentSelectorOpen)}
                            />
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

                                {isLoading && !isThinking && <TypingIndicator />}

                                {isThinking && <ThinkingIndicator />}

                                {error && !isLoading && (
                                    <ErrorDisplay
                                        error={error}
                                        onRetry={retryLastMessage}
                                        canRetry={!isLoading}
                                    />
                                )}
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
