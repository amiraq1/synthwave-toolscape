import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import { Bot, Loader2, MessageCircle, SendHorizontal, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const HIDDEN_ROUTE_PREFIXES = ["/admin", "/auth", "/owner", "/workflow"];

const MARKDOWN_COMPONENTS = {
  p: (props: ComponentProps<"p">) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props: ComponentProps<"ul">) => <ul className="mb-2 list-disc space-y-1 ps-5 last:mb-0" {...props} />,
  ol: (props: ComponentProps<"ol">) => <ol className="mb-2 list-decimal space-y-1 ps-5 last:mb-0" {...props} />,
  li: (props: ComponentProps<"li">) => <li className="leading-7 marker:text-slate-400" {...props} />,
  strong: (props: ComponentProps<"strong">) => <strong className="font-semibold text-slate-950" {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a className="font-medium text-teal-700 underline underline-offset-4" rel="noreferrer" target="_blank" {...props} />
  ),
};

const ChatWidget = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("chatbot.greeting"),
    },
  ]);

  const shouldHide = useMemo(
    () => HIDDEN_ROUTE_PREFIXES.some((prefix) => location.pathname.startsWith(prefix)),
    [location.pathname],
  );

  const quickPrompts = useMemo(
    () => [
      t("chatbot.prompt_compare"),
      t("chatbot.prompt_budget"),
      t("chatbot.prompt_stack"),
    ],
    [t],
  );

  useEffect(() => {
    if (!isOpen || !scrollRef.current) {
      return;
    }

    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.role !== "assistant") {
        return current;
      }

      return [{ role: "assistant", content: t("chatbot.greeting") }];
    });
  }, [t]);

  if (shouldHide) {
    return null;
  }

  const sendMessage = async (rawValue: string) => {
    const trimmedValue = rawValue.trim();

    if (!trimmedValue || isLoading) {
      return;
    }

    if (!navigator.onLine) {
      toast.error(t("chatbot.no_internet"), {
        description: t("chatbot.no_internet_desc"),
      });
      return;
    }

    const nextUserMessage: Message = {
      role: "user",
      content: trimmedValue,
    };

    const nextMessages = [...messages, nextUserMessage];

    setInput("");
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-agent", {
        body: {
          agentSlug: "tool-advisor",
          query: trimmedValue,
          pagePath: location.pathname,
          messages: nextMessages.slice(-6),
        },
      });

      if (error) {
        throw error;
      }

      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

      if (!reply) {
        throw new Error("No reply received");
      }

      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("chat-agent invoke failed", error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: t("chatbot.error_connection"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-4 z-50 sm:bottom-6",
          i18n.dir() === "rtl" ? "right-4 sm:right-6" : "left-4 sm:left-6",
        )}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="group h-14 rounded-full border border-white/15 bg-slate-950 px-4 text-white shadow-[0_24px_70px_rgba(2,6,23,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
          aria-label={t("chatbot.open")}
          aria-expanded={isOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="mx-3 text-right">
            <span className="block text-xs uppercase tracking-[0.24em] text-white/55">AI Bot</span>
            <span className="block text-sm font-semibold">{t("chatbot.title")}</span>
          </span>
          <Sparkles className="h-4 w-4 text-white/70 transition-transform duration-300 group-hover:rotate-12" />
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={i18n.dir() === "rtl" ? "right" : "left"}
          dir={i18n.dir()}
          className="w-full border-black/10 bg-[#faf6ed]/95 p-0 text-slate-950 backdrop-blur-xl sm:max-w-[430px]"
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="relative overflow-hidden border-b border-black/10 bg-slate-950 px-6 pb-5 pt-6 text-white">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.26),_transparent_60%)]" />
              <SheetHeader className="relative space-y-3 text-right">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/10">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SheetTitle className="font-editorial text-2xl text-white">
                        {t("chatbot.title")}
                      </SheetTitle>
                      <Badge className="border-0 bg-white/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-white/72">
                        AI Bot
                      </Badge>
                    </div>
                    <SheetDescription className="mt-2 max-w-xs text-sm leading-6 text-white/72">
                      {t("chatbot.subtitle")}
                    </SheetDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/65">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.12)]" />
                  {t("chatbot.online")}
                </div>
              </SheetHeader>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,243,234,0.94))]">
              <ScrollArea className="flex-1 px-4 py-5 sm:px-5">
                <div className="space-y-4">
                  {messages.length === 1 && (
                    <div className="rounded-[1.6rem] border border-black/8 bg-white/80 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {t("chatbot.suggestions")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt) => (
                          <Button
                            key={prompt}
                            type="button"
                            variant="outline"
                            className="h-auto rounded-full border-black/10 bg-[#fffaf0] px-3 py-2 text-xs text-slate-700 hover:bg-white"
                            onClick={() => void sendMessage(prompt)}
                            disabled={isLoading}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={cn(
                          "flex gap-3",
                          isUser
                            ? i18n.dir() === "rtl"
                              ? "flex-row-reverse"
                              : "justify-end"
                            : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] border",
                            isUser
                              ? "border-slate-950/10 bg-slate-950 text-white"
                              : "border-teal-900/10 bg-teal-900/5 text-teal-900",
                          )}
                        >
                          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>

                        <div
                          className={cn(
                            "max-w-[84%] rounded-[1.55rem] px-4 py-3 text-sm leading-7 shadow-[0_14px_38px_rgba(15,23,42,0.05)]",
                            isUser
                              ? "rounded-tr-md bg-slate-950 text-white"
                              : "rounded-tl-md border border-black/8 bg-white/88 text-slate-700",
                          )}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-0 prose-strong:text-slate-950">
                              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] border border-teal-900/10 bg-teal-900/5 text-teal-900">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-[1.55rem] rounded-tl-md border border-black/8 bg-white/88 px-4 py-3 shadow-[0_14px_38px_rgba(15,23,42,0.05)]">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t("chatbot.loading")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-black/10 bg-white/75 p-4 sm:p-5">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendMessage(input);
                  }}
                  className="space-y-3"
                >
                  <div className="rounded-[1.7rem] border border-black/10 bg-[#fffaf0] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                    <Textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void sendMessage(input);
                        }
                      }}
                      placeholder={t("chatbot.placeholder")}
                      className="min-h-[74px] resize-none border-0 bg-transparent px-3 py-2 text-sm leading-7 text-slate-800 shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs leading-6 text-slate-500">
                      {t("chatbot.footnote")}
                    </p>

                    <Button
                      type="submit"
                      className="h-11 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-900"
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                      <span className="ms-2">{t("chatbot.send")}</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWidget;
