import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, ExternalLink, MoreHorizontal, CheckCircle, XCircle, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import EditDraftDialog from "@/components/EditDraftDialog";
import type { Tool } from "@/types";
import { getToolImageUrl } from "@/utils/imageUrl";
import { useTranslation } from "react-i18next";

interface AdminToolsTableProps {
  tools: Tool[];
  onUpdate: () => void;
}

type ToolUpdate = Database["public"]["Tables"]["tools"]["Update"];

const AdminToolsTable = ({ tools, onUpdate }: AdminToolsTableProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredTools = tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("tools").delete().eq("id", deleteId);

    if (error) {
      toast.error(t("admin.table.toastDeleteFailed"));
    } else {
      toast.success(t("admin.table.toastDeleteSuccess"));
      onUpdate();
    }
    setDeleteId(null);
  };

  const toggleFeatured = async (tool: Tool) => {
    const updatePayload: ToolUpdate = { is_featured: !tool.is_featured };
    const { error } = await supabase.from("tools").update(updatePayload).eq("id", Number(tool.id));

    if (error) {
      toast.error(t("admin.table.toastError"));
    } else {
      toast.success(tool.is_featured ? t("admin.table.toastUnfeatured") : t("admin.table.toastFeatured"));
      onUpdate();
    }
  };

  const togglePublished = async (tool: Tool) => {
    const updatePayload: ToolUpdate = { is_published: !tool.is_published };
    const { error } = await supabase.from("tools").update(updatePayload).eq("id", Number(tool.id));

    if (error) {
      toast.error(t("admin.table.toastError"));
    } else {
      toast.success(tool.is_published ? t("admin.table.toastHidden") : t("admin.table.toastPublished"));
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
          placeholder={t("admin.table.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0"
        />
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.tool")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.status")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.category")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => {
                const imageUrl = getToolImageUrl(tool.image_url, tool.url, { fallbackToFavicon: false });
                return (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {imageUrl && (
                          <img src={imageUrl} alt={tool.title} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        )}
                        <div>
                          <div className="font-bold">{tool.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{tool.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={tool.is_published ? "default" : "secondary"}
                          className={
                            tool.is_published
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }
                        >
                          {tool.is_published ? t("admin.table.statusPublished") : t("admin.table.statusDraft")}
                        </Badge>
                        {tool.is_featured && (
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                            {t("admin.table.featured")}
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
                          <DropdownMenuLabel>{t("admin.table.actions")}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(tool)}>
                            <Edit className="mr-2 h-4 w-4" /> {t("admin.table.actionEdit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublished(tool)}>
                            {tool.is_published ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> {t("admin.table.actionHide")}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> {t("admin.table.actionPublish")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(tool)}>
                            <Sparkles className="mr-2 h-4 w-4" /> {tool.is_featured ? t("admin.table.actionUnfeature") : t("admin.table.actionFeature")}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={tool.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" /> {t("admin.table.actionVisit")}
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(Number(tool.id))}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t("admin.table.actionDelete")}
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
                  {t("admin.table.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-gray-500 text-center">
        {t("admin.table.showing", { shown: filteredTools.length, total: tools.length })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.table.deleteDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.table.deleteDialogDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.table.deleteDialogCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("admin.table.deleteDialogConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingTool && (
        <EditDraftDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          tool={editingTool}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default AdminToolsTable;
