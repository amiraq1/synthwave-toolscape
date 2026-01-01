import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Loader2, Sparkles, LogIn } from 'lucide-react';

interface AddToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = ['نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية', 'صوت'];
const pricingTypes = ['مجاني', 'مدفوع'];

// 1. تعريف مخطط التحقق (Validation Schema)
const formSchema = z.object({
  title: z.string().min(2, 'اسم الأداة يجب أن يكون حرفين على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل').max(500, 'الوصف طويل جداً'),
  url: z.string().url('يرجى إدخال رابط صحيح (https://...)'),
  image_url: z.string().url('يرجى إدخال رابط صورة صحيح').optional().or(z.literal('')),
  category: z.string().min(1, 'يرجى اختيار التصنيف'),
  pricing_type: z.string(),
  features: z.array(z.object({ value: z.string().min(1, 'الميزة لا يمكن أن تكون فارغة') })).optional(),
  screenshots: z.array(z.object({ value: z.string().url('رابط غير صحيح') })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddToolModal = ({ open, onOpenChange }: AddToolModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 2. إعداد النموذج (React Hook Form)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      image_url: '',
      category: '',
      pricing_type: 'مجاني',
      features: [{ value: '' }], // حقل واحد افتراضي
      screenshots: [],
    },
  });

  // إدارة الحقول الديناميكية
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const { fields: screenshotFields, append: appendScreenshot, remove: removeScreenshot } = useFieldArray({
    control: form.control,
    name: "screenshots",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    if (open) {
      checkAuth();
      form.reset(); // إعادة تعيين النموذج عند الفتح
    }
  }, [open, form]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    category: '',
    pricing_type: 'مجاني',
    features: ['', '', ''] as string[],
    screenshots: ['', '', ''] as string[],
  });

  const enhanceDescription = async () => {
    const currentTitle = form.getValues('title');
    const currentDesc = form.getValues('description');

    if (!currentTitle.trim()) {
      form.setError('title', { message: 'يرجى إدخال اسم الأداة أولاً' });
      return;
    }

    if (!currentDesc.trim()) {
      form.setError('description', { message: 'يرجى إدخال وصف مبدئي للأداة' });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: {
          toolName: currentTitle,
          description: currentDesc,
        },
      });

      if (error) throw error;

      if (data?.enhancedDescription) {
        form.setValue('description', data.enhancedDescription, { shouldValidate: true });
        toast({
          title: '✨ تم التحسين!',
          description: 'تم تحسين الوصف بنجاح',
        });
      }
    } catch (error) {
      console.error('Error enhancing:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحسين الوصف.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const uploadScreenshots = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < screenshotFiles.length; i++) {
      const file = screenshotFiles[i];
      if (!file) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tool-screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tool-screenshots')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Filter out empty features & screenshots
      const filteredFeatures = data.features.filter(f => f.trim() !== '');
      const filteredScreenshots = data.screenshots.filter(s => s.trim() !== '');
      const { error } = await supabase.from('tools').insert([{
        ...data,
        features: filteredFeatures.length > 0 ? filteredFeatures : null,
        screenshots: filteredScreenshots.length > 0 ? filteredScreenshots : [],
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '🎉 تم!',
        description: 'تمت إضافة الأداة بنجاح.',
        className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        image_url: '',
        category: '',
        pricing_type: 'مجاني',
        features: ['', '', ''],
        screenshots: ['', '', ''],
      });
    },
    onError: () => {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في إضافة الأداة. حاول مرة أخرى.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // واجهة التحقق من الدخول
  if (isAuthenticated === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10" dir="rtl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-neon-purple" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              تسجيل الدخول مطلوب
            </DialogTitle>
            <DialogDescription className="text-center">
              يجب عليك تسجيل الدخول للمساهمة وإضافة أدوات جديدة
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/auth');
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              تسجيل الدخول
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isAuthenticated === null) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar" dir="rtl">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold gradient-text w-fit">
            إضافة أداة جديدة
          </DialogTitle>
          <DialogDescription>
            ساهم في إثراء الدليل بإضافة أدوات مفيدة. يرجى التأكد من صحة البيانات.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">

            {/* القسم الأساسي */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الأداة <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: ChatGPT" {...field} className="bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الموقع <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." dir="ltr" {...field} className="bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* الوصف والتحسين */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>الوصف <span className="text-red-500">*</span></FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={enhanceDescription}
                      disabled={isEnhancing}
                      className="text-xs h-6 px-2 text-neon-purple hover:bg-neon-purple/10"
                    >
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                      تحسين بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="اشرح ما تفعله الأداة باختصار..."
                      className="resize-none bg-secondary/30 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* التصنيف والسعر والصورة */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التصنيف <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/30">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/30">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pricingTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>رابط الشعار</FormLabel>
                    <FormControl>
                      <Input placeholder="https://... أو فارغ" dir="ltr" {...field} className="bg-secondary/30" />
                    </FormControl>
                    <FormDescription className="text-[10px] truncate">
                      اتركه فارغاً لجلب الأيقونة تلقائياً
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* الميزات (ديناميكي) */}
            <div className="space-y-2">
              <FormLabel className="flex justify-between items-center">
                <span>أهم المميزات</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFeature({ value: '' })}
                  className="h-6 text-xs"
                >
                  <Plus className="w-3 h-3 ml-1" /> إضافة ميزة
                </Button>
              </FormLabel>
              <div className="space-y-2">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`الميزة رقم ${index + 1}`} {...field} className="bg-secondary/30 h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {featureFields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-md">
                    لا توجد ميزات مضافة.
                  </p>
                )}
              </div>
            </div>

          {/* Screenshots */}
          <div className="space-y-3">
            <Label>روابط لقطات الشاشة (اختياري - حتى 3 صور)</Label>
            {formData.screenshots.map((shot, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-neon-blue text-lg">🖼️</span>
                <Input
                  value={shot}
                  onChange={(e) => {
                    const newShots = [...formData.screenshots];
                    newShots[index] = e.target.value;
                    setFormData({ ...formData, screenshots: newShots });
                  }}
                  placeholder={`رابط الصورة ${index + 1} (اختياري)`}
                  className="bg-secondary/50 border-border"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الأداة'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToolModal;
