import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddPostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    title: z.string().min(3, 'العنوان قصير جداً').max(200),
    content: z.string().min(20, 'المحتوى قصير جداً'),
    image_url: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const AddPostModal = ({ open, onOpenChange }: AddPostModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            image_url: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const { error } = await (supabase as any).from('posts').insert([{
                title: values.title,
                content: values.content,
                image_url: values.image_url || null,
            }]);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({
                title: '🎉 تم نشر المقال بنجاح',
                className: "bg-emerald-500/10 text-emerald-500"
            });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            onOpenChange(false);
            form.reset();
        },
        onError: () => toast({
            title: 'خطأ',
            description: 'فشل في نشر المقال',
            variant: 'destructive'
        }),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-white/10 bg-background/95 backdrop-blur-xl" dir="rtl">

                {/* Fixed Header */}
                <DialogHeader className="p-4 pb-2 border-b border-white/5 bg-muted/20 shrink-0">
                    <DialogTitle className="text-lg font-bold">إضافة مقال جديد</DialogTitle>
                    <DialogDescription className="text-xs">
                        شارك معرفتك مع المجتمع
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Form Body */}
                <ScrollArea className="flex-1 p-4">
                    <Form {...form}>
                        <form id="add-post-form" onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4 pb-4">

                            {/* Title */}
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">عنوان المقال</FormLabel>
                                    <FormControl>
                                        <Input placeholder="عنوان جذاب للمقال..." {...field} className="h-10 bg-background/50" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            {/* Image URL */}
                            <FormField control={form.control} name="image_url" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> صورة الغلاف (اختياري)
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." dir="ltr" {...field} className="h-8 bg-background/50" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            {/* Content */}
                            <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">المحتوى</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="اكتب محتوى المقال هنا..."
                                            {...field}
                                            className="min-h-[200px] bg-background/50 resize-none text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                        </form>
                    </Form>
                </ScrollArea>

                {/* Fixed Footer */}
                <DialogFooter className="p-4 border-t border-white/5 bg-background shrink-0 flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        form="add-post-form"
                        disabled={mutation.isPending}
                        className="flex-1 h-9 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر المقال'}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
};

export default AddPostModal;
