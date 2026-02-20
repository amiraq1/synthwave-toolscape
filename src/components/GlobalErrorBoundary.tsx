import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
    isAr?: boolean;
}

interface State {
    hasError: boolean;
    isChunkError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        isChunkError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        const isChunkError = error.name === 'ChunkLoadError' || error.message.includes('dynamically imported module');
        return { hasError: true, isChunkError };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        // Force reload bypassing cache to fetch latest chunks
        window.location.reload();
    };

    public render() {
        const { isAr = true } = this.props;

        if (this.state.hasError) {
            if (this.state.isChunkError) {
                this.handleReload();
                return (
                    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-neon-purple opacity-50 animate-pulse font-cairo">
                        {isAr ? "جاري تحديث النظام..." : "Updating System..."}
                    </div>
                );
            }

            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f1a] text-white p-4 font-cairo" dir={isAr ? "rtl" : "ltr"}>
                    <div className="glass-card p-10 rounded-3xl flex flex-col items-center max-w-md text-center border-red-500/20 shadow-red-500/10">
                        <AlertTriangle className="w-16 h-16 text-red-500 mb-6 animate-pulse-slow" />
                        <h1 className="text-3xl font-bold mb-4">
                            {isAr ? "عذراً، حدث خلل غير متوقع" : "Oops, unexpected error"}
                        </h1>
                        <p className="text-slate-400 mb-8 max-w-[280px]">
                            {isAr
                                ? "تعذر تحميل بعض واجهات التطبيق. عادةً ما يحل التحديث هذه المشكلة."
                                : "Unable to load some application interfaces. A refresh usually fixes this."}
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="flex items-center gap-2 bg-neon-purple text-white px-8 py-3 rounded-full hover:bg-neon-purple/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all hover:scale-105 active:scale-95 font-semibold"
                        >
                            <RefreshCw className="w-5 h-5" />
                            {isAr ? "تحديث الصفحة" : "Refresh Page"}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
