import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, LogIn, Plus, X, Link as LinkIcon, Image as ImageIcon, Upload } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import ToolLogo from '@/components/ToolLogo';

interface AddToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getCategories = (t: TFunction) => [
  { value: 'نصوص', label: t('categories.text') },
  { value: 'صور', label: t('categories.image') },
  { value: 'فيديو', label: t('categories.video') },
  { value: 'برمجة', label: t('categories.code') },
  { value: 'إنتاجية', label: t('categories.productivity') },
  { value: 'دراسة وطلاب', label: t('categories.education') },
  { value: 'صوت', label: t('categories.audio') },
];

const getPricingTypes = (t: TFunction) => [
  { value: 'مجاني', label: t('pricing.free') },
  { value: 'مدفوع', label: t('pricing.paid') },
];

const sanitizeFileSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tool-logo';

const getFileExtension = (file: File) => {
  const fileNameExtension = file.name.split('.').pop()?.toLowerCase();
  if (fileNameExtension) return fileNameExtension;
  if (file.type === 'image/svg+xml') return 'svg';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/png') return 'png';
  return 'jpg';
};

const getFormSchema = (t: TFunction) => z.object({
  title: z.string().min(2, t('add_tool.validation_name_short')),
  description: z.string().min(10, t('add_tool.validation_desc_short')).max(500),
  url: z.string().url(t('add_tool.validation_url_invalid')),
  image_url: z.string().url(t('add_tool.validation_url_invalid')).optional().or(z.literal('')),
  category: z.string().min(1, t('add_tool.validation_required')),
  pricing_type: z.string(),
  features: z.array(z.object({ value: z.string().min(1, t('add_tool.validation_required')) })).optional(),
  screenshots: z.array(z.object({ value: z.string().url(t('add_tool.validation_url_invalid')) })).optional(),
});

type FormValues = {
  title: string;
  description: string;
  url: string;
  image_url: string;
  category: string;
  pricing_type: string;
  features: { value: string }[];
  screenshots: { value: string }[];
};

const AddToolModal = ({ open, onOpenChange }: AddToolModalProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const { isAdmin, loading: adminCheckLoading } = useAdminCheck();

  const categories = getCategories(t);
  const pricingTypes = getPricingTypes(t);
  const formSchema = getFormSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      image_url: '',
      category: '',
      pricing_type: 'مجاني',
      features: [{ value: '' }],
      screenshots: [],
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const watchedTitle = form.watch('title');
  const watchedImageUrl = form.watch('image_url');
  const watchedCategory = form.watch('category');

  useEffect(() => {
    if (open) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      };
      checkAuth();
      form.reset();
      setIsUploadingLogo(false);
    }
  }, [open, form]);

  const enhanceDescription = async () => {
    const currentTitle = form.getValues('title');
    const currentDesc = form.getValues('description');

    if (!currentTitle.trim() || !currentDesc.trim()) {
      toast({ title: t('common.error'), description: t('add_tool.enhance_alert'), variant: 'destructive' });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: { toolName: currentTitle, description: currentDesc },
      });
      if (error) throw error;
      if (data?.enhancedDescription) {
        form.setValue('description', data.enhancedDescription, { shouldValidate: true });
        toast({ title: t('add_tool.enhance_success') });
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('add_tool.enhance_error'), variant: 'destructive' });
    } finally {
      setIsEnhancing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const cleanFeatures = values.features?.map(f => f.value).filter(Boolean) || [];
      const cleanScreenshots = values.screenshots?.map(s => s.value).filter(Boolean) || [];
      const { error } = await supabase.from('tools').insert([{
        title: values.title,
        description: values.description,
        url: values.url,
        image_url: values.image_url || null,
        category: values.category,
        pricing_type: values.pricing_type,
        features: cleanFeatures.length > 0 ? cleanFeatures : null,
        screenshots: cleanScreenshots.length > 0 ? cleanScreenshots : [],
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: t('add_tool.submit_success'), className: "bg-emerald-500/10 text-emerald-500" });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onOpenChange(false);
    },
    onError: () => toast({ title: t('common.error'), description: t('add_tool.submit_error'), variant: 'destructive' }),
  });

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!isAdmin) {
      toast({
        title: t('common.error'),
        description: t('add_tool.logo_upload_admin_only'),
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('add_tool.logo_invalid_type'),
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('add_tool.logo_invalid_size'),
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    setIsUploadingLogo(true);

    try {
      const fileExtension = getFileExtension(file);
      const seed = watchedTitle || file.name.replace(/\.[^.]+$/, '');
      const randomSuffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
      const filePath = `manual/${sanitizeFileSegment(seed)}-${Date.now()}-${randomSuffix}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('tool-logos')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tool-logos').getPublicUrl(filePath);
      form.setValue('image_url', data.publicUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      toast({ title: t('add_tool.logo_upload_success') });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('add_tool.logo_upload_error');
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  // Auth Guard
  if (isAuthenticated === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xs p-6 text-center" dir={i18n.dir()} aria-describedby={undefined}>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">{t('add_tool.login_required')}</DialogTitle>
          <DialogDescription className="mb-6">{t('add_tool.login_required_desc')}</DialogDescription>
          <Button onClick={() => { onOpenChange(false); navigate('/auth'); }} className="w-full">{t('nav.signin')}</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-white/10 bg-background/95 backdrop-blur-xl" dir={i18n.dir()} aria-describedby={undefined}>

        {/* Fixed Header */}
        <DialogHeader className="p-4 pb-2 border-b border-white/5 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">{t('add_tool.title')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {t('add_tool.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body - Using native scroll for keyboard accessibility */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Form {...form}>
            <form id="add-tool-form" onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4 pb-4">

              {/* Basic Info Group */}
              <div className="space-y-3 bg-muted/10 p-3 rounded-lg border border-white/5">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t('add_tool.form_name')}</FormLabel>
                    <FormControl><Input placeholder={t('add_tool.form_name_placeholder')} {...field} className="h-8 bg-background/50" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('add_tool.form_category')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-8 bg-background/50"><SelectValue placeholder={t('common.select')} /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="pricing_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('add_tool.form_pricing')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-8 bg-background/50"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{pricingTypes.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Links Group */}
              <div className="space-y-3 bg-muted/10 p-3 rounded-lg border border-white/5">
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {t('add_tool.form_url')}</FormLabel>
                    <FormControl><Input placeholder={t('add_tool.form_url_placeholder')} dir="ltr" {...field} className="h-8 bg-background/50" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )} />

                <div className="flex items-start gap-3">
                  <ToolLogo
                    title={watchedTitle || t('add_tool.form_name_placeholder')}
                    imageUrl={watchedImageUrl || null}
                    category={watchedCategory || null}
                    size="lg"
                    className="mt-5"
                  />

                  <div className="flex-1 space-y-2">
                    <FormField control={form.control} name="image_url" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {t('add_tool.form_image_url')}</FormLabel>
                        <FormControl><Input placeholder={t('add_tool.form_url_placeholder')} dir="ltr" {...field} className="h-8 bg-background/50" /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={isUploadingLogo || mutation.isPending || adminCheckLoading || !isAdmin}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 me-1" />
                            {t('add_tool.logo_upload')}
                          </>
                        )}
                      </Button>

                      {watchedImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => form.setValue('image_url', '', {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })}
                        >
                          {t('add_tool.logo_remove')}
                        </Button>
                      )}
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      {isAdmin ? t('add_tool.logo_hint') : t('add_tool.logo_upload_admin_only')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-xs">{t('add_tool.form_desc')}</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={enhanceDescription} disabled={isEnhancing} className="h-6 px-2 text-[10px] text-neon-purple hover:bg-neon-purple/10">
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1" /> {t('add_tool.enhance_ai')}</>}
                    </Button>
                  </div>
                  <FormControl><Textarea placeholder={t('add_tool.form_desc_placeholder')} {...field} className="min-h-[80px] bg-background/50 resize-none text-sm" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Dynamic Features - Compact */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs text-muted-foreground">{t('add_tool.form_features')}</FormLabel>
                  <Button type="button" variant="ghost" size="sm" onClick={() => appendFeature({ value: '' })} className="h-6 w-6 p-0"><Plus className="w-4 h-4" /></Button>
                </div>
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField control={form.control} name={`features.${index}.value`} render={({ field }) => (
                      <Input placeholder={t('add_tool.form_feature_placeholder', { index: index + 1 })} {...field} className="h-8 bg-background/50 text-xs" />
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="h-8 w-8 text-destructive"><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>

            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="p-4 border-t border-white/5 bg-background shrink-0 flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">{t('add_tool.cancel')}</Button>
          <Button type="submit" form="add-tool-form" disabled={mutation.isPending} className="flex-1 h-9 bg-primary hover:bg-primary/90">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('add_tool.save')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AddToolModal;
