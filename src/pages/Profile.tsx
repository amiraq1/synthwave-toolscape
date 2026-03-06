import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Heart,
  Loader2,
  LogOut,
  MessageSquare,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ToolCard from "@/components/ToolCard";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import type { Tool } from "@/hooks/useTools";
import UserStatsCards from "@/components/profile/UserStatsCards";
import RecentlyViewedTools from "@/components/profile/RecentlyViewedTools";
import AvatarUpload from "@/components/profile/AvatarUpload";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  tools: { title: string } | null;
}

const Profile = () => {
  const { session, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) throw new Error("No session");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!session?.user.id,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["profile_bookmarks", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];
      const { data } = await supabase
        .from("bookmarks")
        .select("tool_id, tools (*)")
        .eq("user_id", session.user.id);

      return (data || [])
        .map((bookmark) =>
          bookmark.tools
            ? ({
                ...bookmark.tools,
                id: String(bookmark.tools.id),
                features: bookmark.tools.features || [],
              } as Tool)
            : null,
        )
        .filter((tool): tool is Tool => tool !== null);
    },
    enabled: !!session?.user.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["profile_reviews", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];
      const { data } = await supabase
        .from("reviews")
        .select("*, tools (title)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      return data as Review[];
    },
    enabled: !!session?.user.id,
  });

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { display_name: string; avatar_url: string }) => {
      if (!session?.user.id) throw new Error("No session");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);
      if (error) throw error;
      return updates;
    },
    onMutate: async (
      newProfile,
    ): Promise<{ previousProfile?: ProfileData | null }> => {
      await queryClient.cancelQueries({ queryKey: ["profile", session?.user.id] });
      const previousProfile = queryClient.getQueryData<ProfileData | null>([
        "profile",
        session?.user.id,
      ]);

      queryClient.setQueryData(
        ["profile", session?.user.id],
        (old: ProfileData | undefined | null) => ({
          ...(old || {}),
          ...newProfile,
        }),
      );

      return { previousProfile };
    },
    onError: (_error, _newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ["profile", session?.user.id],
          context.previousProfile,
        );
      }
      toast.error(t("profile.update_failed"));
    },
    onSuccess: () => {
      toast.success(t("profile.update_success"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", session?.user.id] });
    },
  });

  const userStats = useMemo(() => {
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    const joinDate = profile?.created_at ? new Date(profile.created_at) : new Date();
    const joinedDaysAgo = Math.floor(
      (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalActivity = bookmarks.length + reviews.length;
    let activityLevel: "very_active" | "active" | "inactive" = "inactive";
    if (totalActivity >= 10) activityLevel = "very_active";
    else if (totalActivity >= 3) activityLevel = "active";

    return {
      bookmarksCount: bookmarks.length,
      reviewsCount: reviews.length,
      averageRating,
      joinedDaysAgo,
      activityLevel,
    };
  }, [bookmarks, profile, reviews]);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [authLoading, navigate, session]);

  const handleUpdateProfile = () => {
    if (!session) return;
    updateProfileMutation.mutate({
      display_name: fullName,
      avatar_url: avatarUrl,
    });
  };

  if (authLoading || profileLoading) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-950" />
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (isError) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="space-y-4 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="font-editorial text-3xl font-semibold text-slate-950">
              {t("profile.error_title")}
            </h2>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              {t("profile.error_desc")}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white"
            >
              {t("profile.refresh")}
            </Button>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  return (
    <EditorialPage dir={i18n.dir()}>
      <Helmet>
        <title>{t("profile.title")} | نبض AI</title>
      </Helmet>

      <EditorialHero
        eyebrow={t("profile.title")}
        title={profile?.display_name || t("profile.title")}
        description={session?.user.email || ""}
        icon={
          profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile?.display_name || "Avatar"}
              className="h-full w-full rounded-[1.35rem] object-cover"
            />
          ) : (
            <span className="text-2xl font-bold">
              {profile?.display_name?.[0] ||
                session?.user.email?.[0]?.toUpperCase()}
            </span>
          )
        }
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Account
            </span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {t("profile.library")}
                </p>
                <p className="mt-2 text-2xl font-semibold">{bookmarks.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {t("profile.reviews")}
                </p>
                <p className="mt-2 text-2xl font-semibold">{reviews.length}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="me-2 h-4 w-4" />
              {t("profile.logout")}
            </Button>
          </div>
        }
      />

      <EditorialPanel>
        <UserStatsCards stats={userStats} />
      </EditorialPanel>

      <Tabs defaultValue="bookmarks" className="w-full">
        <EditorialPanel className="p-3">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
            <TabsTrigger
              value="bookmarks"
              className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {t("profile.library")}
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Clock className="me-2 h-4 w-4" />
              {t("profile.recent")}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {t("profile.reviews")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-600 data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {t("profile.settings")}
            </TabsTrigger>
          </TabsList>
        </EditorialPanel>

        <TabsContent value="bookmarks">
          <EditorialPanel>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {bookmarks.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="editorial-soft-card py-16 text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-2 text-slate-700">{t("profile.no_bookmarks")}</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/")}
                  className="text-teal-700"
                >
                  {t("profile.browse")}
                </Button>
              </div>
            )}
          </EditorialPanel>
        </TabsContent>

        <TabsContent value="recent">
          <EditorialPanel>
            <RecentlyViewedTools />
          </EditorialPanel>
        </TabsContent>

        <TabsContent value="reviews">
          <EditorialPanel>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="editorial-soft-card p-6">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          {review.tools?.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          "{review.comment}"
                        </p>
                      </div>
                      <div className="text-end">
                        <div className="flex justify-end text-amber-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span key={index}>
                              {index < review.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {t("profile.published")}{" "}
                          {new Date(review.created_at).toLocaleDateString(
                            i18n.language === "ar" ? "ar-EG" : "en-US",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="editorial-soft-card py-16 text-center text-slate-500">
                  {t("profile.no_reviews")}
                </div>
              )}
            </div>
          </EditorialPanel>
        </TabsContent>

        <TabsContent value="settings">
          <EditorialPanel className="max-w-4xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                    {t("profile.settings")}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {t("profile.update_success")}
                  </p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr]">
                <div className="editorial-soft-card p-6">
                  {session?.user.id && (
                    <AvatarUpload
                      userId={session.user.id}
                      currentAvatarUrl={avatarUrl}
                      onUploadComplete={(url) => setAvatarUrl(url)}
                    />
                  )}
                </div>

                <div className="editorial-soft-card p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">
                        {t("settings.fullname")}
                      </Label>
                      <Input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="editorial-form-field rounded-2xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">
                        {t("settings.email_label")}
                      </Label>
                      <Input
                        value={session?.user.email}
                        disabled
                        className="editorial-form-field rounded-2xl"
                      />
                    </div>

                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                      className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("profile.save")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </EditorialPanel>
        </TabsContent>
      </Tabs>
    </EditorialPage>
  );
};

export default Profile;
