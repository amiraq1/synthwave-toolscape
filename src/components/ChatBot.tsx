import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, X, MessageCircle, Loader2, User, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحبًا! أنا مساعدك الذكي. كيف أساعدك في اختيار الأداة المناسبة؟" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    if (!navigator.onLine) {
      toast.error("لا يوجد اتصال بالإنترنت", {
        description: "المساعد يحتاج اتصالًا بالإنترنت للرد.",
        icon: <WifiOff className="w-4 h-4" />,
      });
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [...messages, { role: "user", content: userMessage }] },
      });

      if (error) throw error;
      if (!data?.reply) throw new Error("لم يصل رد من الخادم");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error: unknown) {
      console.error("Chat Error Details:", error);

      let errorMessage = "تعذر الاتصال بالمساعد";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "message" in error) {
        const fallbackMessage = (error as { message?: unknown }).message;
        if (typeof fallbackMessage === "string" && fallbackMessage.trim()) {
          errorMessage = fallbackMessage;
        }
      }

      toast.error("فشل الاتصال بالمساعد", {
        description: errorMessage,
        action: {
          label: "إعادة المحاولة",
          onClick: () => setInputValue(userMessage),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-neon-purple hover:bg-neon-purple/80 z-50 animate-bounce"
          aria-label="فتح المساعد"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card
          className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[500px] shadow-2xl z-50 flex flex-col border-neon-purple/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          dir="rtl"
        >
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Avatar className="h-8 w-8 bg-neon-purple/20">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="block font-bold">المساعد الذكي</span>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  متصل الآن
                </span>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
              aria-label="إغلاق المساعد"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className={msg.role === "assistant" ? "bg-primary text-white" : "bg-muted"}>
                        {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none",
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 max-w-[85%] mr-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t bg-muted/20">
            <form onSubmit={handleSend} className="flex w-full gap-2 items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="اسأل عن أي أداة..."
                className="flex-1 bg-background focus-visible:ring-neon-purple"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary hover:bg-primary/90 transition-all"
                aria-label="إرسال الرسالة"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
