import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Loader2, Sparkles, Trash2, Edit, BarChart3, Database, Users, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "react-i18next";
import EditDraftDialog from "@/components/EditDraftDialog";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
// Lazy load AdminCharts because it depends on recharts (~150KB)
const AdminCharts = lazy(() => import("@/components/admin/AdminCharts"));
import AdminToolsTable from "@/components/admin/AdminToolsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tool } from "@/types";

// Loading skeleton for charts
const ChartsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-pulse">
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <div className="h-4 w-32 bg-white/10 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full bg-white/5 rounded" />
      </CardContent>
    </Card>
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <div className="h-4 w-32 bg-white/10 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full bg-white/5 rounded" />
      </CardContent>
    </Card>
  </div>
);


// Type for draft tools (unpublished)
type DraftTool = Tool & { is_published: boolean };

const Admin = () => {
  const { t, i18n } = useTranslation();
  useSEO({
    title: t('admin.title'),
    description: t('admin.unauthorized_desc'),
    noIndex: true,
  });

  const { session } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminCheck();

  const [loading, setLoading] = useState(false);

  // UI Local State
  const [editingTool, setEditingTool] = useState<DraftTool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", url: "", description_en: "" });

  // 1. Fetch All Tools utilizing React Query
  const { data: tools = [], refetch: refetchTools } = useQuery({
    queryKey: ['admin_tools'],
    queryFn: async () => {
      const { data } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
      if (!data) return [];
      return data.map(t => ({
        ...t,
        id: String(t.id),
        features: t.features || []
      })) as unknown as Tool[];
    },
    enabled: isAdmin
  });

  // 2. Fetch Users utilizing React Query
  const { data: usersCount = 0 } = useQuery({
    queryKey: ['admin_users_count'],
    queryFn: async () => {
      // We use head: true to get count only, much lighter
      const { count, error } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },
    enabled: isAdmin
  });

  // Derived Stats
  const drafts = tools.filter(t => (t as unknown as Record<string, unknown>).is_published === false) as DraftTool[];
  const stats = {
    totalTools: tools.length,
    pendingDrafts: drafts.length,
    totalUsers: usersCount
  };

  // Auth Check
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // Optional: Redirect or Show Unauthorized
    }
  }, [isAdmin, authLoading]);

  // Actions
  const handleAutoDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("auto-draft", { body: formData });
      if (error) throw error;
      toast.success(t('admin.auto_draft_success', { name: formData.name }));
      setFormData({ name: "", url: "", description_en: "" });
      refetchTools();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(t('admin.error', { message: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return;
    await supabase.from("tools").delete().eq("id", Number(id));
    toast.success(t('admin.deleted'));
    refetchTools();
  };

  const openEdit = (tool: DraftTool) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center" dir={i18n.dir()}>
        <div>
          <Loader2 className="h-12 w-12 animate-spin text-neon-purple mx-auto mb-4" />
          <p className="text-muted-foreground">{t('admin.checking_perms')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-4" dir={i18n.dir()}>
        <div className="space-y-4 max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">{t('admin.unauthorized')}</h1>
          <p className="text-muted-foreground">{t('admin.unauthorized_desc')}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            {t('common.back_to_home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir={i18n.dir()}>
      <div className="container mx-auto p-6 max-w-6xl min-h-screen space-y-8">
        <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>

        {/* 📊 شريط الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-900/10 border-blue-500/20 card-glow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{t('admin.stats_total_tools')}</p>
                <h3 className="text-3xl font-bold text-blue-400">{stats.totalTools}</h3>
              </div>
              <Database className="w-8 h-8 text-blue-500/50" />
            </CardContent>
          </Card>
          <Card className="bg-orange-900/10 border-orange-500/20 card-glow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{t('admin.stats_pending_drafts')}</p>
                <h3 className="text-3xl font-bold text-orange-400">{stats.pendingDrafts}</h3>
              </div>
              <Edit className="w-8 h-8 text-orange-500/50" />
            </CardContent>
          </Card>
          <Card className="bg-purple-900/10 border-purple-500/20 card-glow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{t('admin.stats_total_users')}</p>
                <h3 className="text-3xl font-bold text-purple-400">{stats.totalUsers}</h3>
              </div>
              <Users className="w-8 h-8 text-purple-500/50" />
            </CardContent>
          </Card>
        </div>

        {/* 📈 الرسوم البيانية - Lazy loaded */}
        <Suspense fallback={<ChartsLoadingSkeleton />}>
          <AdminCharts tools={tools} />
        </Suspense>


        {/* نظام التبويبات */}
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-8">
            <TabsTrigger value="tools">{t('admin.tab_tools')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.tab_users')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-8">
            {/* ✨ مولد المحتوى */}
            <Card className="border-neon-purple/30 bg-card/40 backdrop-blur glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-purple">
                  <Sparkles className="w-5 h-5" /> {t('admin.generator_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAutoDraft} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t('admin.form_name_en')}</label>
                      <Input
                        placeholder="e.g. ChatGPT"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-black/20 text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t('admin.form_url')}</label>
                      <Input
                        placeholder="https://openai.com/chatgpt"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        required
                        className="bg-black/20 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t('admin.form_desc_en')}</label>
                    <Textarea
                      placeholder="An AI chatbot developed by OpenAI..."
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      required
                      className="bg-black/20 text-left"
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-neon-purple hover:bg-neon-purple/80" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> {t('admin.generate_btn')}</span>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 📝 قائمة المسودات */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5" /> {t('admin.drafts_review', { count: drafts.length })}
              </h2>

              {drafts.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">{t('admin.no_drafts')}</p>
                </div>
              )}

              <div className="grid gap-4">
                {drafts.map((tool) => (
                  <div key={tool.id} className="bg-card/40 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center group hover:border-neon-purple/30 transition-all hover:bg-white/5">
                    <div className="flex-1 w-full">
                      <h3 className="font-bold text-lg text-white flex items-center flex-wrap gap-2 mb-1">
                        {tool.title}
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-normal border border-white/5">{tool.category}</span>
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 pl-4">{tool.description}</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(tool)} className="flex-1 md:flex-none border-green-500/20 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                        <Edit className="w-4 h-4 ml-1" /> {t('admin.review_publish')}
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteDraft(tool.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🛠️ جدول كل الأدوات */}
            <div className="mt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Database className="w-5 h-5" /> {t('admin.all_tools_title', { count: tools.length })}
              </h2>
              <AdminToolsTable tools={tools} onUpdate={() => refetchTools()} />
            </div>

          </TabsContent>

          <TabsContent value="users">
            <div className="bg-black/20 p-6 rounded-xl border border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-neon-purple" />
                {t('admin.users_list')}
              </h2>
              <AdminUsersTable />
            </div>
          </TabsContent>
        </Tabs>

        {/* نافذة التعديل المنبثقة */}
        {editingTool && (
          <EditDraftDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            tool={editingTool}
            onUpdate={() => refetchTools()}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
