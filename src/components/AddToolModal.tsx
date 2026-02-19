import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
import { Loader2, Sparkles, LogIn, Plus, X, Link as LinkIcon, Image as ImageIcon, Wand2 } from 'lucide-react';

interface AddToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'توليد نصوص', label: 'Text Generation' },
  { value: 'توليد صور وفيديو', label: 'Image & Video Generation' },
  { value: 'مساعدات إنتاجية', label: 'Productivity Assistants' },
  { value: 'صناعة محتوى', label: 'Content Creation' },
  { value: 'تطوير وبرمجة', label: 'Development & Coding' },
  { value: 'تعليم وبحث', label: 'Education & Research' },
  { value: 'أخرى', label: 'Other' },
];
const pricingTypes = [
  { value: 'مجاني', label: 'Free' },
  { value: 'مدفوع', label: 'Paid' },
  { value: 'تجربة مجانية', label: 'Free Trial' },
];

const formSchema = z.object({
  title: z.string().min(2, 'Name is too short'),
  description: z.string().min(10, 'Description is too short').max(500),
  url: z.string().url('Invalid URL'),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Required'),
  pricing_type: z.string(),
  features: z.array(z.object({ value: z.string().min(1, 'Required') })).optional(),
  screenshots: z.array(z.object({ value: z.string().url('Invalid URL') })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddToolModal = ({ open, onOpenChange }: AddToolModalProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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

  const { fields: featureFields, append: appendFeature, remove: removeFeature, replace: replaceFeatures } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (open) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      };
      checkAuth();
      form.reset();
    }
  }, [open, form]);

  // 1. Auto-Fill with AI
  const autoFillFromUrl = async () => {
    const url = form.getValues('url');
    const name = form.getValues('title');

    if (!url || !name) {
      toast.error('Missing information', { description: 'Please enter tool name and URL first' });
      return;
    }

    setIsAutoFilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-draft', {
        body: { name, url }
      });

      if (error) throw error;

      if (data?.tool) {
        // تحديث الحقول بالبيانات المقترحة
        form.setValue('title', data.tool.title);
        form.setValue('description', data.tool.description);
        form.setValue('category', data.tool.category || 'أخرى');
        form.setValue('pricing_type', data.tool.pricing_type || 'مجاني');

        // تحديث المميزات
        if (data.tool.features && Array.isArray(data.tool.features)) {
          // استبدال المميزات الحالية بالمقترحة
          const newFeatures = data.tool.features.map((f: string) => ({ value: f }));
          replaceFeatures(newFeatures);
        }

        toast.success('Data fetched successfully! 🪄');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Auto-fill failed', { description: 'Check the URL or fill manually' });
    } finally {
      setIsAutoFilling(false);
    }
  };

  // 2. Enhance Description (Old function, kept for manual edits)
  const enhanceDescription = async () => {
    const currentTitle = form.getValues('title');
    const currentDesc = form.getValues('description');

    if (!currentTitle.trim() || !currentDesc.trim()) {
      toast.error('Enter title and description first');
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
        toast.success('✨ Description improved');
      }
    } catch {
      toast.error('Enhancement failed');
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
        is_published: false,
        screenshots: cleanScreenshots.length > 0 ? cleanScreenshots : [],
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🎉 Tool added successfully');
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onOpenChange(false);
    },
    onError: () => toast.error('Error', { description: 'Save failed' }),
  });

  if (isAuthenticated === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xs p-6 text-center" dir="ltr">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">Login Required</DialogTitle>
          <DialogDescription className="mb-6">You need to be logged in to add tools.</DialogDescription>
          <Button onClick={() => { onOpenChange(false); navigate('/auth'); }} className="w-full">Login</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-white/10 bg-background/95 backdrop-blur-xl" dir="ltr">

        <DialogHeader className="p-4 pb-2 border-b border-white/5 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">Add New Tool</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Enter name and URL, then use "Smart Fill" to fetch details automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Form {...form}>
            <form id="add-tool-form" onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4 pb-4">

              {/* URL & Auto-fill Section */}
              <div className="bg-neon-purple/5 p-3 rounded-lg border border-neon-purple/10 space-y-3">
                <div className="flex gap-2 items-end">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Tool Name (English)</FormLabel>
                      <FormControl><Input placeholder="Example: ChatGPT" {...field} className="h-9 bg-background/50" /></FormControl>
                    </FormItem>
                  )} />

                  <Button
                    type="button"
                    onClick={autoFillFromUrl}
                    disabled={isAutoFilling}
                    size="sm"
                    className="bg-neon-purple hover:bg-neon-purple/90 text-white h-9 px-3 gap-2 min-w-[120px]"
                  >
                    {isAutoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wand2 className="w-4 h-4" /> Smart Fill</>}
                  </Button>
                </div>

                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Website URL</FormLabel>
                    <FormControl><Input placeholder="https://..." dir="ltr" {...field} className="h-9 bg-background/50" /></FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Details Section */}
              <div className="space-y-3 bg-muted/10 p-3 rounded-lg border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-8 bg-background/50"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="pricing_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Pricing</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-8 bg-background/50"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{pricingTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="image_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Logo URL (optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." dir="ltr" {...field} className="h-8 bg-background/50" /></FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Description */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-xs">Description</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={enhanceDescription} disabled={isEnhancing} className="h-6 px-2 text-[10px] text-neon-purple hover:bg-neon-purple/10">
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1" /> AI Enhance</>}
                    </Button>
                  </div>
                  <FormControl><Textarea placeholder="Short description..." {...field} className="min-h-[80px] bg-background/50 resize-none text-sm" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Features */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs text-muted-foreground">Features</FormLabel>
                  <Button type="button" variant="ghost" size="sm" onClick={() => appendFeature({ value: '' })} className="h-6 w-6 p-0"><Plus className="w-4 h-4" /></Button>
                </div>
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField control={form.control} name={`features.${index}.value`} render={({ field }) => (
                      <Input placeholder={`Feature ${index + 1}`} {...field} className="h-8 bg-background/50 text-xs" />
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="h-8 w-8 text-destructive"><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>

            </form>
          </Form>
        </div>

        <DialogFooter className="p-4 border-t border-white/5 bg-background shrink-0 flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">Cancel</Button>
          <Button type="submit" form="add-tool-form" disabled={mutation.isPending} className="flex-1 h-9 bg-primary hover:bg-primary/90">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AddToolModal;
