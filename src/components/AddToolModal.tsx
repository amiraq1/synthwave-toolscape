import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const AddToolModal = ({ open, onOpenChange }: AddToolModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    if (open) {
      checkAuth();
    }
  }, [open]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    category: '',
    pricing_type: 'مجاني',
    features: ['', '', ''] as string[],
  });

  const enhanceDescription = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'مطلوب',
        description: 'يرجى إدخال اسم الأداة أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'مطلوب',
        description: 'يرجى إدخال وصف مبدئي للأداة',
        variant: 'destructive',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: {
          toolName: formData.title,
          description: formData.description,
        },
      });

      if (error) throw error;

      if (data?.enhancedDescription) {
        setFormData({ ...formData, description: data.enhancedDescription });
        toast({
          title: 'تم التحسين!',
          description: 'تم تحسين الوصف بنجاح',
        });
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحسين الوصف. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Filter out empty features
      const filteredFeatures = data.features.filter(f => f.trim() !== '');
      const { error } = await supabase.from('tools').insert([{
        ...data,
        features: filteredFeatures.length > 0 ? filteredFeatures : null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'تمت الإضافة بنجاح!',
        description: 'تم إضافة الأداة الجديدة إلى الدليل.',
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
      });
    },
    onError: (error) => {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في إضافة الأداة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
      console.error('Error adding tool:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.url || !formData.category) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(formData);
  };

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background border-border" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text text-right">
              تسجيل الدخول مطلوب
            </DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              يجب عليك تسجيل الدخول لإضافة أداة جديدة
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-6">
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/auth');
              }}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
            >
              <LogIn className="h-4 w-4 ml-2" />
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

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background border-border" dir="rtl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text text-right">
            إضافة أداة جديدة
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">اسم الأداة *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: ChatGPT"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">وصف قصير *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={enhanceDescription}
                disabled={isEnhancing}
                className="text-xs gap-1 h-7 px-2 text-neon-purple hover:text-neon-blue hover:bg-neon-purple/10"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    جاري التحسين...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    ✨ تحسين الوصف تلقائياً
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً مختصراً للأداة..."
              className="bg-secondary/50 border-border resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">رابط الموقع *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="bg-secondary/50 border-border"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">أيقونة/إيموجي الأداة</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="🤖 أو رابط صورة"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>التصنيف *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>السعر</Label>
              <Select
                value={formData.pricing_type}
                onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {pricingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label>أهم المميزات (اختياري - حتى 3 مميزات)</Label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-emerald-500 text-lg">✓</span>
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData({ ...formData, features: newFeatures });
                  }}
                  placeholder={`الميزة ${index + 1}`}
                  className="bg-secondary/50 border-border"
                  maxLength={100}
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
