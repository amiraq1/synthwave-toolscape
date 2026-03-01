import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  variant?: "default" | "compact" | "hero";
  className?: string;
}

const NewsletterForm = ({ variant = "default", className }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: emailValue.toLowerCase().trim() });

      if (error) {
        if (error.code === "23505") {
          throw new Error("هذا البريد مشترك بالفعل");
        }
        throw error;
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      setEmail("");
      toast.success("تم الاشتراك بنجاح", {
        description: "ستصلك أحدث تحديثات الأدوات الذكية",
      });
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error: Error) => {
      toast.error("تعذر الاشتراك", {
        description: error.message || "حدث خطأ أثناء تنفيذ الطلب",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("بريد إلكتروني غير صالح");
      return;
    }

    subscribeMutation.mutate(email);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)} dir="rtl">
        <Input
          type="email"
          placeholder="بريدك الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 bg-background/50 border-white/10 flex-1"
          disabled={subscribeMutation.isPending || isSuccess}
        />
        <Button
          type="submit"
          disabled={subscribeMutation.isPending || isSuccess}
          aria-label={isSuccess ? "تم الاشتراك" : "الاشتراك في النشرة"}
          className={cn(
            "h-10 px-4",
            isSuccess
              ? "bg-emerald-500 hover:bg-emerald-500"
              : "bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90",
          )}
        >
          {subscribeMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : isSuccess ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Mail className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn("glass-card rounded-2xl p-6 sm:p-8", className)} dir="rtl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold text-foreground">النشرة الأسبوعية</h3>
          <p className="text-xs text-muted-foreground">أحدث أدوات الذكاء الاصطناعي في بريدك</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 pr-10 bg-background/50 border-white/10"
            disabled={subscribeMutation.isPending || isSuccess}
          />
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-11 font-semibold transition-all",
            isSuccess
              ? "bg-emerald-500 hover:bg-emerald-500"
              : "bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90",
          )}
          disabled={subscribeMutation.isPending || isSuccess}
        >
          {subscribeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جارٍ الاشتراك...
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-4 h-4 ml-2" />
              تم الاشتراك
            </>
          ) : (
            "اشترك مجانًا"
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground/60 text-center">رسالة مفيدة واحدة أسبوعيًا ويمكنك إلغاء الاشتراك في أي وقت.</p>
      </form>
    </div>
  );
};

export default NewsletterForm;
