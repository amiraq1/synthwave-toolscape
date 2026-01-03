import { useState } from 'react';
import { Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTools, type Tool } from '@/hooks/useTools';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const categories = ['نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية', 'دراسة وطلاب'];
const pricingTypes = ['مجاني', 'مدفوع', 'مجاني جزئياً'];

const AdminToolsTable = () => {
  const { data, isLoading } = useTools('', 'الكل');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toolsList = data?.pages.flat() ?? [];

  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    pricing_type: '',
    image_url: '',
  });

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      title: tool.title,
      description: tool.description,
      url: tool.url,
      category: tool.category,
      pricing_type: tool.pricing_type,
      image_url: tool.image_url || '',
    });
  };

  const handleSave = async () => {
    if (!editingTool) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tools')
        .update({
          title: formData.title,
          description: formData.description,
          url: formData.url,
          category: formData.category,
          pricing_type: formData.pricing_type,
          image_url: formData.image_url || null,
        })
        .eq('id', editingTool.id);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الأداة بنجاح',
      });

      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setEditingTool(null);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الأداة',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTool) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', deletingTool.id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الأداة بنجاح',
      });

      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setDeletingTool(null);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الأداة',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">إدارة الأدوات ({toolsList.length})</h2>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">الأداة</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {toolsList.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {tool.image_url ? (
                      <img
                        src={tool.image_url}
                        alt={tool.title}
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-lg">
                        🤖
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{tool.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple">
                    {tool.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={tool.pricing_type === 'مجاني'
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                    }
                  >
                    {tool.pricing_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(tool.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(tool)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingTool(tool)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الأداة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الأداة</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الرابط</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">التصنيف</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع التسعير</label>
                <Select
                  value={formData.pricing_type}
                  onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">رابط الصورة (اختياري)</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                dir="ltr"
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTool(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTool} onOpenChange={() => setDeletingTool(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف "{deletingTool?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminToolsTable;
