import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
    variant?: 'default' | 'compact' | 'hero';
    className?: string;
}

const NewsletterForm = ({ variant = 'default', className }: NewsletterFormProps) => {
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const subscribeMutation = useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase
                .from('subscribers')
                .insert({ email: email.toLowerCase().trim() });

            if (error) {
                // Handle unique constraint violation
                if (error.code === '23505') {
                    throw new Error('This email is already subscribed');
                }
                throw error;
            }
        },
        onSuccess: () => {
            setIsSuccess(true);
            setEmail('');
            toast.success('🎉 Subscribed successfully!', {
                description: 'You will receive our latest AI tool updates',
            });
            // Reset success state after 5 seconds
            setTimeout(() => setIsSuccess(false), 5000);
        },
        onError: (error: Error) => {
            toast.error('Error', {
                description: error.message || 'Subscription failed',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Error', {
                description: 'Invalid email address',
            });
            return;
        }

        subscribeMutation.mutate(email);
    };

    if (variant === 'compact') {
        return (
            <form onSubmit={handleSubmit} className={cn("flex gap-2", className)} dir="ltr">
                <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-background/50 border-white/10 flex-1"
                    disabled={subscribeMutation.isPending || isSuccess}
                />
                <Button
                    type="submit"
                    disabled={subscribeMutation.isPending || isSuccess}
                    aria-label={isSuccess ? "Subscribed" : "Subscribe to newsletter"}
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
        <div className={cn("glass-card rounded-2xl p-6 sm:p-8", className)} dir="ltr">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">Weekly Newsletter</h3>
                    <p className="text-xs text-muted-foreground">The latest AI tools in your inbox</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 bg-background/50 border-white/10"
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
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Subscribing...
                        </>
                    ) : isSuccess ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Subscribed!
                        </>
                    ) : (
                        'Subscribe for Free'
                    )}
                </Button>

                <p className="text-[10px] text-muted-foreground/60 text-center">
                    One useful email per week. Unsubscribe anytime.
                </p>
            </form>
        </div>
    );
};

export default NewsletterForm;
