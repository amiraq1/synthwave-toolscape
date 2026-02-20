import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, ExternalLink, MoreHorizontal, CheckCircle, XCircle, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

interface AdminToolsTableProps {
  // tools prop is removed as we fetch internally now
  onUpdate?: () => void; // Optional callback for parent refresh if needed
}

type ToolUpdate = Database["public"]["Tables"]["tools"]["Update"];

const AdminToolsTable = ({ onUpdate }: AdminToolsTableProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Debounce search term to avoid hitting API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Server-side Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin_tools_table", page, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from("tools")
        .select("*", { count: "exact" });

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      // Map features to be array of strings if null
      const mappedData = (data || []).map(t => ({
        ...t,
        id: String(t.id),
        features: t.features || []
      })) as unknown as Tool[];

      return { tools: mappedData, count: count || 0 };
    }
  });

  const tools = data?.tools || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleUpdate = () => {
    refetch();
    if (onUpdate) onUpdate();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("tools").delete().eq("id", deleteId);

    if (error) {
      toast.error(t("admin.table.toastDeleteFailed"));
    } else {
      toast.success(t("admin.table.toastDeleteSuccess"));
      handleUpdate();
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
      handleUpdate();
    }
  };

  const togglePublished = async (tool: Tool) => {
    const updatePayload: ToolUpdate = { is_published: !tool.is_published };
    const { error } = await supabase.from("tools").update(updatePayload).eq("id", Number(tool.id));

    if (error) {
      toast.error(t("admin.table.toastError"));
    } else {
      toast.success(tool.is_published ? t("admin.table.toastHidden") : t("admin.table.toastPublished"));
      handleUpdate();
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder={t("admin.table.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0"
        />
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-neon-purple" />}
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.tool")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.status")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.category")}</TableHead>
              <TableHead className={isAr ? "text-right" : "text-left"}>{t("admin.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 text-center">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-full"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : tools.length > 0 ? (
              tools.map((tool) => {
                const imageUrl = getToolImageUrl(tool.image_url, tool.url);
                return (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {imageUrl && <img src={imageUrl} alt={tool.title} className="w-full h-full object-cover" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-bold">{tool.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">{tool.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={tool.is_published ? "default" : "secondary"}
                          className={
                            tool.is_published
                              ? "bg-green-500/10 text-green-400 border-green-500/20 w-fit"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 w-fit"
                          }
                        >
                          {tool.is_published ? t("admin.table.statusPublished") : t("admin.table.statusDraft")}
                        </Badge>
                        {tool.is_featured && (
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400 w-fit text-[10px]">
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
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("admin.table.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          {t("admin.table.showing", { shown: tools.length, total: totalCount })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="border-white/10 hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400">
            Page {page + 1} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="border-white/10 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
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
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AdminToolsTable;
