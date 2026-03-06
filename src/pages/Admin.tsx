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
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";
// Lazy load AdminCharts because it depends on recharts (~150KB)
const AdminCharts = lazy(() => import("@/components/admin/AdminCharts"));
import AdminToolsTable from "@/components/admin/AdminToolsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tool } from "@/types";
import { getValidToolUrl } from "@synthwave/utils";

// Loading skeleton for charts
const ChartsLoadingSkeleton = () => (
  <div className="mb-8 grid grid-cols-1 gap-6 animate-pulse lg:grid-cols-2">
    <Card className="editorial-soft-card border-black/8">
      <CardHeader>
        <div className="h-4 w-32 rounded bg-slate-200" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full rounded bg-slate-100" />
      </CardContent>
    </Card>
    <Card className="editorial-soft-card border-black/8">
      <CardHeader>
        <div className="h-4 w-32 rounded bg-slate-200" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full rounded bg-slate-100" />
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
    const normalizedToolUrl = getValidToolUrl(formData.url);
    if (!normalizedToolUrl) {
      toast.error(t('admin.tools.invalid_url'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("auto-draft", {
        body: {
          ...formData,
          url: normalizedToolUrl,
        },
      });
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
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-slate-950" />
            <p className="text-slate-600">{t('admin.checking_perms')}</p>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (!isAdmin) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="font-editorial text-3xl font-semibold text-slate-950">{t('admin.unauthorized')}</h1>
            <p className="text-slate-600">{t('admin.unauthorized_desc')}</p>
            <Button
              onClick={() => navigate('/')}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t('common.back_to_home')}
            </Button>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  return (
    <EditorialPage dir={i18n.dir()}>
      <EditorialHero
        eyebrow={t('admin.title')}
        title={t('admin.dashboard')}
        description={t('admin.unauthorized_desc')}
        icon={<ShieldAlert className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Admin
            </span>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Tools</p>
                <p className="mt-2 text-2xl font-semibold">{stats.totalTools}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Drafts</p>
                <p className="mt-2 text-2xl font-semibold">{stats.pendingDrafts}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Users</p>
                <p className="mt-2 text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        }
      />

        {/* 📊 شريط الإحصائيات */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="editorial-soft-card border-sky-200/70 bg-sky-50/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="mb-1 text-sm text-slate-500">{t('admin.stats_total_tools')}</p>
                <h3 className="text-3xl font-bold text-sky-700">{stats.totalTools}</h3>
              </div>
              <Database className="h-8 w-8 text-sky-600/70" />
            </CardContent>
          </Card>
          <Card className="editorial-soft-card border-amber-200/70 bg-amber-50/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="mb-1 text-sm text-slate-500">{t('admin.stats_pending_drafts')}</p>
                <h3 className="text-3xl font-bold text-amber-700">{stats.pendingDrafts}</h3>
              </div>
              <Edit className="h-8 w-8 text-amber-600/70" />
            </CardContent>
          </Card>
          <Card className="editorial-soft-card border-fuchsia-200/70 bg-fuchsia-50/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="mb-1 text-sm text-slate-500">{t('admin.stats_total_users')}</p>
                <h3 className="text-3xl font-bold text-fuchsia-700">{stats.totalUsers}</h3>
              </div>
              <Users className="h-8 w-8 text-fuchsia-600/70" />
            </CardContent>
          </Card>
        </div>

        {/* 📈 الرسوم البيانية - Lazy loaded */}
        <Suspense fallback={<ChartsLoadingSkeleton />}>
          <AdminCharts tools={tools} />
        </Suspense>


        {/* نظام التبويبات */}
        <Tabs defaultValue="tools" className="w-full">
          <EditorialPanel className="p-3">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0">
              <TabsTrigger
                value="tools"
                className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {t('admin.tab_tools')}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {t('admin.tab_users')}
              </TabsTrigger>
          </TabsList>
          </EditorialPanel>

          <TabsContent value="tools" className="space-y-8">
            {/* ✨ مولد المحتوى */}
            <Card className="editorial-soft-card border-black/8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
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
                        className="editorial-form-field text-left"
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
                        className="editorial-form-field text-left"
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
                      className="editorial-form-field text-left"
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800" disabled={loading}>
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
                <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 py-12 text-center">
                  <Database className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                  <p className="text-slate-500">{t('admin.no_drafts')}</p>
                </div>
              )}

              <div className="grid gap-4">
                {drafts.map((tool) => (
                  <div key={tool.id} className="editorial-soft-card flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
                    <div className="flex-1 w-full">
                      <h3 className="mb-1 flex flex-wrap items-center gap-2 text-lg font-bold text-slate-950">
                        {tool.title}
                        <span className="rounded-full border border-black/8 bg-white/80 px-2 py-0.5 text-xs font-normal text-slate-500">{tool.category}</span>
                      </h3>
                      <p className="line-clamp-2 pl-4 text-sm text-slate-600">{tool.description}</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(tool)} className="flex-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 md:flex-none">
                        <Edit className="w-4 h-4 ml-1" /> {t('admin.review_publish')}
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteDraft(tool.id)} className="border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
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
            <EditorialPanel>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
                <Users className="text-teal-700" />
                {t('admin.users_list')}
              </h2>
              <AdminUsersTable />
            </EditorialPanel>
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
    </EditorialPage>
  );
};

export default Admin;
