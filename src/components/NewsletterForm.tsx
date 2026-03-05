import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    const subscribeMutation = useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase
                .from('subscribers')
                .insert({ email: email.toLowerCase().trim() });

            if (error) {
                // Handle unique constraint violation
                if (error.code === '23505') {
                    throw new Error(t('newsletter.already_registered'));
                }
                throw error;
            }
        },
        onSuccess: () => {
            setIsSuccess(true);
            setEmail('');
            toast({
                title: t('newsletter.success_title'),
                description: t('newsletter.success_desc'),
                className: 'bg-emerald-500/10 text-emerald-500',
            });
            // Reset success state after 5 seconds
            setTimeout(() => setIsSuccess(false), 5000);
        },
        onError: (error: Error) => {
            toast({
                title: t('common.error'),
                description: error.message || t('common.error'),
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: t('common.error'),
                description: t('newsletter.invalid_email'),
                variant: 'destructive',
            });
            return;
        }

        subscribeMutation.mutate(email);
    };

    if (variant === 'compact') {
        return (
            <form onSubmit={handleSubmit} className={cn("flex gap-2", className)} dir={i18n.dir()}>
                <Input
                    type="email"
                    placeholder={t('newsletter.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-background/50 border-white/10 flex-1"
                    disabled={subscribeMutation.isPending || isSuccess}
                />
                <Button
                    type="submit"
                    disabled={subscribeMutation.isPending || isSuccess}
                    aria-label={isSuccess ? t('newsletter.subscribed') : t('newsletter.subscribe_btn')}
                    className={cn(
                        "h-10 px-4",
                        isSuccess
                            ? "bg-emerald-500 hover:bg-emerald-500"
                            : "bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
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
        <div className={cn("glass-card rounded-2xl p-6 sm:p-8", className)} dir={i18n.dir()}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">{t('newsletter.title')}</h3>
                    <p className="text-xs text-muted-foreground">{t('newsletter.desc')}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", i18n.dir() === 'rtl' ? 'right-3' : 'left-3')} />
                    <Input
                        type="email"
                        placeholder={t('newsletter.placeholder_full')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn("h-12 bg-background/50 border-white/10", i18n.dir() === 'rtl' ? 'pr-10' : 'pl-10')}
                        disabled={subscribeMutation.isPending || isSuccess}
                    />
                </div>

                <Button
                    type="submit"
                    className={cn(
                        "w-full h-11 font-semibold transition-all",
                        isSuccess
                            ? "bg-emerald-500 hover:bg-emerald-500"
                            : "bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
                    )}
                    disabled={subscribeMutation.isPending || isSuccess}
                >
                    {subscribeMutation.isPending ? (
                        <>
                            <Loader2 className={cn("w-4 h-4 animate-spin", i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2')} />
                            {t('newsletter.subscribing')}
                        </>
                    ) : isSuccess ? (
                        <>
                            <Check className={cn("w-4 h-4", i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2')} />
                            {t('newsletter.subscribed')}
                        </>
                    ) : (
                        t('newsletter.subscribe_now')
                    )}
                </Button>

                <p className="text-[10px] text-muted-foreground/60 text-center">
                    {t('newsletter.footer_text')}
                </p>
            </form>
        </div>
    );
};

export default NewsletterForm;
