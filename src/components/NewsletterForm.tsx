import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NewsletterFormProps {
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

const NewsletterForm = ({ variant = 'default', className }: NewsletterFormProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const { error } = await supabase
        .from('subscribers')
        .insert({ email: emailValue.toLowerCase().trim() });

      if (error) {
        if (error.code === '23505') {
          throw new Error(isAr ? 'هذا البريد مسجل مسبقاً' : 'This email is already subscribed');
        }
        throw error;
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      setEmail('');
      toast.success(isAr ? '🎉 تم الاشتراك بنجاح!' : '🎉 Subscribed successfully!', {
        description: isAr
          ? 'ستصلك آخر أخبار أدوات الذكاء الاصطناعي'
          : 'You will receive the latest AI tools updates',
      });
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error: Error) => {
      toast.error(isAr ? 'خطأ' : 'Error', {
        description: error.message || (isAr ? 'فشل في الاشتراك' : 'Subscription failed'),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(isAr ? 'خطأ' : 'Error', {
        description: isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address',
      });
      return;
    }

    subscribeMutation.mutate(email);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)} dir={isAr ? 'rtl' : 'ltr'}>
        <Input
          type="email"
          placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 bg-background/50 border-white/10 flex-1"
          disabled={subscribeMutation.isPending || isSuccess}
        />
        <Button
          type="submit"
          disabled={subscribeMutation.isPending || isSuccess}
          aria-label={isSuccess ? (isAr ? 'تم الاشتراك' : 'Subscribed') : (isAr ? 'اشتراك في النشرة البريدية' : 'Subscribe to newsletter')}
          className={cn(
            'h-10 px-4',
            isSuccess
              ? 'bg-emerald-500 hover:bg-emerald-500'
              : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90'
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
    <div className={cn('glass-card rounded-2xl p-6 sm:p-8', className)} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{isAr ? 'النشرة الأسبوعية' : 'Weekly Newsletter'}</h3>
          <p className="text-xs text-muted-foreground">
            {isAr ? 'أحدث أدوات الذكاء الاصطناعي في بريدك' : 'Latest AI tools in your inbox'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <Input
            type="email"
            placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn('h-12 bg-background/50 border-white/10', isAr ? 'pr-10' : 'pl-10')}
            disabled={subscribeMutation.isPending || isSuccess}
          />
        </div>

        <Button
          type="submit"
          className={cn(
            'w-full h-11 font-semibold transition-all',
            isSuccess
              ? 'bg-emerald-500 hover:bg-emerald-500'
              : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90'
          )}
          disabled={subscribeMutation.isPending || isSuccess}
        >
          {subscribeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              {isAr ? 'جاري الاشتراك...' : 'Subscribing...'}
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-4 h-4 ml-2" />
              {isAr ? 'تم الاشتراك!' : 'Subscribed!'}
            </>
          ) : (
            isAr ? 'اشترك الآن مجاناً' : 'Subscribe for free'
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground/60 text-center">
          {isAr
            ? 'نرسل مقالاً واحداً أسبوعياً، بدون إزعاج. يمكنك إلغاء الاشتراك في أي وقت.'
            : 'We send one weekly email, no spam. You can unsubscribe anytime.'}
        </p>
      </form>
    </div>
  );
};

export default NewsletterForm;
