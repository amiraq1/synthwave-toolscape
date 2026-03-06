import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Crown,
  Database,
  GitBranch,
  Loader2,
  MessageSquareText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOwnerCheck } from "@/hooks/useOwnerCheck";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

interface OwnerUserRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user" | null;
}

interface LatestToolRow {
  id: number;
  title: string;
  category: string;
  created_at: string;
}

interface LatestPostRow {
  id: string;
  title: string;
  created_at: string;
  is_published: boolean;
}

interface LatestReviewRow {
  id: string;
  rating: number;
  created_at: string;
  tools: { title: string } | { title: string }[] | null;
}

interface OwnerDashboardData {
  users: OwnerUserRow[];
  latestTools: LatestToolRow[];
  latestPosts: LatestPostRow[];
  latestReviews: LatestReviewRow[];
  stats: {
    totalUsers: number;
    totalAdmins: number;
    totalModerators: number;
    totalTools: number;
    publishedTools: number;
    draftTools: number;
    featuredTools: number;
    totalPosts: number;
    publishedPosts: number;
    totalReviews: number;
    totalWorkflows: number;
  };
}

const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-IQ" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value));

const OwnerDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isOwner, loading, ownerEmailsConfigured } = useOwnerCheck();

  useSEO({
    title: t("owner.title"),
    description: t("owner.subtitle"),
    noIndex: true,
  });

  const dashboardQuery = useQuery({
    queryKey: ["owner_dashboard"],
    enabled: isOwner,
    queryFn: async (): Promise<OwnerDashboardData> => {
      const [
        usersResult,
        totalToolsResult,
        publishedToolsResult,
        featuredToolsResult,
        latestToolsResult,
        totalPostsResult,
        publishedPostsResult,
        latestPostsResult,
        totalReviewsResult,
        latestReviewsResult,
        totalWorkflowsResult,
      ] = await Promise.all([
        supabase.rpc("admin_get_users"),
        supabase.from("tools").select("id", { count: "exact", head: true }),
        supabase
          .from("tools")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("tools")
          .select("id", { count: "exact", head: true })
          .eq("is_featured", true),
        supabase
          .from("tools")
          .select("id, title, category, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("posts")
          .select("id, title, created_at, is_published")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase
          .from("reviews")
          .select("id, rating, created_at, tools(title)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("workflows")
          .select("id", { count: "exact", head: true }),
      ]);

      const firstError = [
        usersResult.error,
        totalToolsResult.error,
        publishedToolsResult.error,
        featuredToolsResult.error,
        latestToolsResult.error,
        totalPostsResult.error,
        publishedPostsResult.error,
        latestPostsResult.error,
        totalReviewsResult.error,
        latestReviewsResult.error,
        totalWorkflowsResult.error,
      ].find(Boolean);

      if (firstError) {
        throw new Error(firstError.message);
      }

      const users = ((usersResult.data || []) as OwnerUserRow[]).sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime(),
      );

      const totalUsers = users.length;
      const totalAdmins = users.filter((user) => user.role === "admin").length;
      const totalModerators = users.filter(
        (user) => user.role === "moderator",
      ).length;
      const totalTools = totalToolsResult.count || 0;
      const publishedTools = publishedToolsResult.count || 0;
      const featuredTools = featuredToolsResult.count || 0;
      const totalPosts = totalPostsResult.count || 0;
      const publishedPosts = publishedPostsResult.count || 0;
      const totalReviews = totalReviewsResult.count || 0;
      const totalWorkflows = totalWorkflowsResult.count || 0;

      return {
        users,
        latestTools: (latestToolsResult.data || []) as LatestToolRow[],
        latestPosts: (latestPostsResult.data || []) as LatestPostRow[],
        latestReviews: (latestReviewsResult.data || []) as LatestReviewRow[],
        stats: {
          totalUsers,
          totalAdmins,
          totalModerators,
          totalTools,
          publishedTools,
          draftTools: Math.max(totalTools - publishedTools, 0),
          featuredTools,
          totalPosts,
          publishedPosts,
          totalReviews,
          totalWorkflows,
        },
      };
    },
  });

  if (loading || (isOwner && dashboardQuery.isLoading)) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-slate-950" />
            <p className="text-slate-600">{t("owner.checking_access")}</p>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (!isOwner) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="font-editorial text-3xl font-semibold text-slate-950">
              {t("owner.unauthorized")}
            </h1>
            <p className="text-slate-600">{t("owner.unauthorized_desc")}</p>
            <Button
              onClick={() => navigate("/")}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t("nav.home")}
            </Button>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    const message =
      dashboardQuery.error instanceof Error
        ? dashboardQuery.error.message
        : t("common.error");

    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="font-editorial text-3xl font-semibold text-slate-950">
              {t("common.error")}
            </h1>
            <p className="text-slate-600">{message}</p>
            <Button
              onClick={() => dashboardQuery.refetch()}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t("owner.retry")}
            </Button>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  const { stats, users, latestTools, latestPosts, latestReviews } =
    dashboardQuery.data;

  const statCards = [
    {
      key: "users",
      label: t("owner.stats.total_users"),
      value: stats.totalUsers,
      icon: Users,
      className: "editorial-soft-card border-sky-200/70 bg-sky-50/70",
      textClassName: "text-sky-700",
    },
    {
      key: "admins",
      label: t("owner.stats.admins"),
      value: stats.totalAdmins,
      icon: ShieldCheck,
      className: "editorial-soft-card border-rose-200/70 bg-rose-50/70",
      textClassName: "text-rose-700",
    },
    {
      key: "tools",
      label: t("owner.stats.live_tools"),
      value: stats.publishedTools,
      icon: Database,
      className: "editorial-soft-card border-emerald-200/70 bg-emerald-50/70",
      textClassName: "text-emerald-700",
    },
    {
      key: "posts",
      label: t("owner.stats.total_posts"),
      value: stats.totalPosts,
      icon: BookOpen,
      className: "editorial-soft-card border-amber-200/70 bg-amber-50/70",
      textClassName: "text-amber-700",
    },
    {
      key: "reviews",
      label: t("owner.stats.total_reviews"),
      value: stats.totalReviews,
      icon: MessageSquareText,
      className: "editorial-soft-card border-fuchsia-200/70 bg-fuchsia-50/70",
      textClassName: "text-fuchsia-700",
    },
    {
      key: "workflows",
      label: t("owner.stats.total_workflows"),
      value: stats.totalWorkflows,
      icon: GitBranch,
      className: "editorial-soft-card border-cyan-200/70 bg-cyan-50/70",
      textClassName: "text-cyan-700",
    },
  ];

  const actionLinks = [
    { to: "/admin", label: t("owner.quick.admin"), icon: Crown },
    { to: "/blog", label: t("owner.quick.blog"), icon: BookOpen },
    { to: "/agents", label: t("owner.quick.agents"), icon: Sparkles },
    { to: "/workflow/new", label: t("owner.quick.workflow"), icon: GitBranch },
    { to: "/settings", label: t("owner.quick.settings"), icon: Settings },
  ];

  return (
    <EditorialPage dir={i18n.dir()}>
      <EditorialHero
        eyebrow={t("owner.title")}
        title={t("owner.title")}
        description={t("owner.subtitle")}
        icon={<Crown className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Owner Mode
            </span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Tools
                </p>
                <p className="mt-2 text-2xl font-semibold">{stats.totalTools}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Users
                </p>
                <p className="mt-2 text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
            <Link to="/admin">
              <Button className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                {t("owner.open_admin")}
                <ArrowUpRight className="ms-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.key} className={stat.className}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="mb-1 text-sm text-slate-500">{stat.label}</p>
                  <h2 className={`text-3xl font-bold ${stat.textClassName}`}>
                    {stat.value}
                  </h2>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.textClassName} opacity-70`} />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="editorial-soft-card border-black/8 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.quick_actions")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.quick_actions_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {actionLinks.map((action) => (
                <Link key={action.to} to={action.to}>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-2xl border-black/10 bg-white/75 text-slate-950 hover:bg-white"
                  >
                    <span className="flex items-center gap-2">
                      <action.icon className="h-4 w-4 text-teal-700" />
                      {action.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

        <Card className="editorial-soft-card border-black/8 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.access_mode")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.access_mode_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge
                className={
                  ownerEmailsConfigured
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                }
              >
                {ownerEmailsConfigured
                  ? t("owner.access_configured")
                  : t("owner.access_fallback")}
              </Badge>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-black/8 bg-white/72 p-4">
                  <p className="mb-1 text-slate-500">
                    {t("owner.snapshot_featured")}
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {stats.featuredTools}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/72 p-4">
                  <p className="mb-1 text-slate-500">
                    {t("owner.snapshot_drafts")}
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {stats.draftTools}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/72 p-4">
                  <p className="mb-1 text-slate-500">
                    {t("owner.snapshot_live_posts")}
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {stats.publishedPosts}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/72 p-4">
                  <p className="mb-1 text-slate-500">
                    {t("owner.snapshot_moderators")}
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {stats.totalModerators}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card className="editorial-soft-card border-black/8 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.health_title")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.health_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/72 p-4">
                <span className="text-slate-500">
                  {t("owner.stats.total_tools")}
                </span>
                <span className="font-semibold text-slate-950">
                  {stats.totalTools}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/72 p-4">
                <span className="text-slate-500">
                  {t("owner.stats.total_users")}
                </span>
                <span className="font-semibold text-slate-950">
                  {stats.totalUsers}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/72 p-4">
                <span className="text-slate-500">
                  {t("owner.snapshot_workflows")}
                </span>
                <span className="font-semibold text-slate-950">
                  {stats.totalWorkflows}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/72 p-4">
                <span className="text-slate-500">
                  {t("owner.stats.total_reviews")}
                </span>
                <span className="font-semibold text-slate-950">
                  {stats.totalReviews}
                </span>
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="editorial-soft-card border-black/8">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.latest_users")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.latest_users_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.slice(0, 5).length === 0 && (
                <p className="text-sm text-slate-500">
                  {t("owner.empty")}
                </p>
              )}
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/72 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {user.display_name || user.email || t("admin.users.no_name")}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <Badge variant="outline" className="mb-2 border-black/10 text-slate-700">
                      {user.role === "admin"
                        ? t("admin.users.role_admin")
                        : user.role === "moderator"
                          ? t("admin.users.role_moderator")
                          : t("admin.users.role_user")}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      {formatDate(user.created_at, i18n.language)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        <Card className="editorial-soft-card border-black/8">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.latest_tools")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.latest_tools_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestTools.length === 0 && (
                <p className="text-sm text-slate-500">
                  {t("owner.empty")}
                </p>
              )}
              {latestTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/72 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {tool.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tool.category}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-500">
                    {formatDate(tool.created_at, i18n.language)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

        <Card className="editorial-soft-card border-black/8">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.latest_posts")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.latest_posts_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestPosts.length === 0 && (
                <p className="text-sm text-slate-500">
                  {t("owner.empty")}
                </p>
              )}
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/72 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {post.title}
                    </p>
                    <Badge variant="outline" className="mt-2 border-black/10 text-slate-700">
                      {post.is_published
                        ? t("admin.tools.status_published")
                        : t("admin.tools.status_draft")}
                    </Badge>
                  </div>
                  <p className="shrink-0 text-xs text-slate-500">
                    {formatDate(post.created_at, i18n.language)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

        <Card className="editorial-soft-card border-black/8">
            <CardHeader>
              <CardTitle className="text-slate-950">{t("owner.latest_reviews")}</CardTitle>
              <CardDescription className="text-slate-600">{t("owner.latest_reviews_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestReviews.length === 0 && (
                <p className="text-sm text-slate-500">
                  {t("owner.empty")}
                </p>
              )}
              {latestReviews.map((review) => {
                const tool =
                  Array.isArray(review.tools) ? review.tools[0] : review.tools;

                return (
                  <div
                    key={review.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/72 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950">
                        {tool?.title || "-"}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-amber-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs text-slate-500">
                      {formatDate(review.created_at, i18n.language)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
      </div>
    </EditorialPage>
  );
};

export default OwnerDashboard;
