import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit, Trash2, Search, Eye, ExternalLink, MoreHorizontal, CheckCircle, XCircle, Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDraftDialog from "@/components/EditDraftDialog";
import type { Tool } from "@/types";
import { getValidImageUrl } from "@/utils/imageUrl";

interface AdminToolsTableProps {
  tools: Tool[];
  onUpdate: () => void;
}

const AdminToolsTable = ({ tools, onUpdate }: AdminToolsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter tools based on search
  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الأداة نهائياً؟")) return;

    const { error } = await supabase.from('tools').delete().eq('id', Number(id));

    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم الحذف بنجاح");
      onUpdate();
    }
  };

  const toggleFeatured = async (tool: Tool) => {
    const { error } = await supabase
      .from('tools')
      .update({ is_featured: !tool.is_featured } as any)
      .eq('id', Number(tool.id));

    if (error) {
      toast.error("حدث خطأ");
    } else {
      toast.success(tool.is_featured ? "تم إزالة التمييز" : "تم تمييز الأداة");
      onUpdate();
    }
  };

  const togglePublished = async (tool: Tool) => {
    // @ts-ignore
    const { error } = await supabase
      .from('tools')
      .update({ is_published: !tool.is_published })
      .eq('id', Number(tool.id));

    if (error) {
      toast.error("حدث خطأ");
    } else {
      toast.success(tool.is_published ? "تم إخفاء الأداة" : "تم نشر الأداة");
      onUpdate();
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="بحث في الأدوات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0"
        />
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead className="text-right">الأداة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => {
                const imageUrl = getValidImageUrl(tool.image_url);
                return (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={tool.title}
                          className="w-10 h-10 rounded-lg object-cover bg-white/5"
                        />
                      )}
                      <div>
                        <div className="font-bold">{tool.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={tool.is_published ? "default" : "secondary"} className={tool.is_published ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}>
                        {tool.is_published ? "منشور" : "مسودة"}
                      </Badge>
                      {tool.is_featured && (
                        <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                          ⭐ مميز
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tool.category}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(tool)}>
                          <Edit className="mr-2 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublished(tool)}>
                          {tool.is_published ? (
                            <><XCircle className="mr-2 h-4 w-4" /> إخفاء</>
                          ) : (
                            <><CheckCircle className="mr-2 h-4 w-4" /> نشر</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatured(tool)}>
                          <Sparkles className="mr-2 h-4 w-4" /> {tool.is_featured ? "إزالة التمييز" : "تمييز"}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={tool.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> زيارة الموقع
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(tool.id)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  لا توجد أدوات مطابقة للبحث.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-gray-500 text-center">
        يتم عرض {filteredTools.length} أداة من أصل {tools.length}
      </div>

      {/* Dialog for editing */}
      {editingTool && (
        <EditDraftDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          tool={editingTool} // We cast because EditDraftDialog expects Tool but might have subtle checking
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default AdminToolsTable;
