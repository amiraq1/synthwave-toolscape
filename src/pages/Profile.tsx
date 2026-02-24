import { useEffect, useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Heart, MessageSquare, Settings, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToolCard from "@/components/ToolCard";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import type { Tool } from "@/hooks/useTools";
import UserStatsCards from "@/components/profile/UserStatsCards";
import RecentlyViewedTools from "@/components/profile/RecentlyViewedTools";
import AvatarUpload from "@/components/profile/AvatarUpload";

interface ProfileData {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
}

type ProfileUpdate = {
    display_name: string;
    avatar_url: string;
};

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
    const queryClient = useQueryClient();

    // 1. Fetch Profile
    const { data: profile, isLoading: profileLoading, isError } = useQuery({
        queryKey: ['profile', session?.user.id],
        queryFn: async () => {
            if (!session?.user.id) throw new Error("No session");
            const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
            if (error) throw error;
            return data as ProfileData;
        },
        enabled: !!session?.user.id,
    });

    // 2. Fetch Bookmarks
    const { data: bookmarks = [] } = useQuery({
        queryKey: ['profile_bookmarks', session?.user.id],
        queryFn: async () => {
            if (!session?.user.id) return [];
            const { data } = await supabase.from("bookmarks").select(`tool_id, tools (*)`).eq("user_id", session.user.id);

            return (data || [])
                .map((b) => b.tools ? ({ ...b.tools, id: String(b.tools.id), features: b.tools.features || [] } as Tool) : null)
                .filter((t): t is Tool => t !== null);
        },
        enabled: !!session?.user.id,
    });

    // 3. Fetch Reviews
    const { data: reviews = [] } = useQuery({
        queryKey: ['profile_reviews', session?.user.id],
        queryFn: async () => {
            if (!session?.user.id) return [];
            const { data } = await supabase.from("reviews").select(`*, tools (title)`).eq("user_id", session.user.id).order("created_at", { ascending: false });
            return data as Review[];
        },
        enabled: !!session?.user.id,
    });

    // Local state for form inputs
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Sync form with fetched data
    useEffect(() => {
        if (profile) {
            setFullName(profile.display_name || "");
            setAvatarUrl(profile.avatar_url || "");
        }
    }, [profile]);

    // 4. Optimistic Profile Update Mutation
    const updateProfileMutation = useMutation<ProfileUpdate, Error, ProfileUpdate, { previousProfile?: ProfileData | null }>({
        mutationFn: async (updates: ProfileUpdate) => {
            if (!session?.user.id) throw new Error("No session");
            const { error } = await supabase.from("profiles").update(updates).eq("id", session.user.id);
            if (error) throw error;
            return updates;
        },
        onMutate: async (newProfile) => {
            await queryClient.cancelQueries({ queryKey: ['profile', session?.user.id] });
            const previousProfile = queryClient.getQueryData<ProfileData | null>(['profile', session?.user.id]);

            queryClient.setQueryData<ProfileData | null>(['profile', session?.user.id], (old) =>
                old ? { ...old, ...newProfile } : old
            );

            return { previousProfile };
        },
        onError: (_err, _newProfile, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(['profile', session?.user.id], context.previousProfile);
            }
            toast.error("فشل التحديث. تم استعادة البيانات السابقة.");
        },
        onSuccess: () => {
            toast.success("Profile updated successfully âœ…");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', session?.user.id] });
        }
    });

    const handleUpdateProfile = () => {
        if (!session) return;
        updateProfileMutation.mutate({ display_name: fullName, avatar_url: avatarUrl });
    };

    // ط­ط³ط§ط¨ ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ
    const userStats = useMemo(() => {
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const joinDate = profile?.created_at ? new Date(profile.created_at) : new Date();
        const joinedDaysAgo = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

        const totalActivity = bookmarks.length + reviews.length;
        let activityLevel: 'very_active' | 'active' | 'inactive' = 'inactive';
        if (totalActivity >= 10) activityLevel = 'very_active';
        else if (totalActivity >= 3) activityLevel = 'active';

        return {
            bookmarksCount: bookmarks.length,
            reviewsCount: reviews.length,
            averageRating,
            joinedDaysAgo,
            activityLevel,
        };
    }, [bookmarks, reviews, profile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !session) {
            navigate("/auth");
        }
    }, [session, authLoading, navigate]);

    if (authLoading || profileLoading) return (
        <div className="flex justify-center mt-20" role="main">
            <Loader2 className="animate-spin text-neon-purple w-12 h-12" />
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4" role="main">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
                <h2 className="text-xl font-bold text-red-400 mb-2">حدث خطأ ما</h2>
                <p className="text-gray-400 mb-6">لم نتمكن من تحميل ملفك الشخصي. يرجى المحاولة مرة أخرى لاحقاً.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
                    تحديث الصفحة
                </Button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl" role="main">
            <Helmet>
                <title>ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ | Nabd AI</title>
            </Helmet>

            {/* ط§ظ„ظ‡ظٹط¯ط± ط§ظ„ط´ط®طµظٹ */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-1 relative group">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center relative">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-white">{profile?.display_name?.[0] || session?.user.email?.[0]?.toUpperCase()}</span>
                        )}

                        {/* طھظ„ظ…ظٹط­ ط³ط±ظٹط¹ ظ„طھط؛ظٹظٹط± ط§ظ„طµظˆط±ط© */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-xs text-white" onClick={() => document.getElementById('settings-tab')?.click()}>
                            طھط؛ظٹظٹط±
                        </div>
                    </div>
                </div>

                <div className={`flex-1 text-center md:text-right space-y-2`}>
                    <h1 className="text-3xl font-bold text-white">{profile?.display_name || "ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ"}</h1>
                    <p className="text-gray-400 font-mono text-sm">{session?.user.email}</p>

                    <div className={`flex justify-center md:justify-start gap-4 mt-4 pt-2 border-t border-white/10 text-sm text-gray-500`}>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            <Heart className="w-3.5 h-3.5 fill-current" /> {bookmarks.length} ط§ظ„ظ…ط­ظپظˆط¸ط§طھ
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <MessageSquare className="w-3.5 h-3.5" /> {reviews.length} ط§ظ„ظ…ط±ط§ط¬ط¹ط§طھ
                        </span>
                    </div>
                </div>

                <Button variant="destructive" onClick={() => { signOut(); navigate('/'); }} className="gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20">
                    <LogOut className="w-4 h-4" /> طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬
                </Button>
            </div>

            {/* ط¨ط·ط§ظ‚ط§طھ ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ */}
            <UserStatsCards stats={userStats} />

            {/* ط§ظ„طھط¨ظˆظٹط¨ط§طھ ظˆط§ظ„ظ…ط­طھظˆظ‰ */}
            <Tabs defaultValue="bookmarks" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8 p-1 rounded-xl">
                    <TabsTrigger value="bookmarks" className="data-[state=active]:bg-neon-purple rounded-lg">ط§ظ„ظ…ط­ظپظˆط¸ط§طھ</TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-neon-purple gap-2 rounded-lg">
                        <Clock className="w-4 h-4" /> <span className="hidden sm:inline">ط§ظ„ط£ط®ظٹط±ط©</span>
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-neon-purple rounded-lg">ط§ظ„ظ…ط±ط§ط¬ط¹ط§طھ</TabsTrigger>
                    <TabsTrigger value="settings" id="settings-tab" className="data-[state=active]:bg-neon-purple rounded-lg">ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ</TabsTrigger>
                </TabsList>

                {/* 1. طھط¨ظˆظٹط¨ ط§ظ„ظ…ظپط¶ظ„ط© */}
                <TabsContent value="bookmarks" className="animate-in fade-in space-y-6">
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map(tool => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">ظ„ط§ طھظˆط¬ط¯ ط£ط¯ظˆط§طھ ظ…ط­ظپظˆط¸ط© ط­طھظ‰ ط§ظ„ط¢ظ†.</p>
                            <Button variant="link" onClick={() => navigate("/")} className="text-neon-purple">طھطµظپط­ ط§ظ„ط£ط¯ظˆط§طھ</Button>
                        </div>
                    )}
                </TabsContent>

                {/* 2. طھط¨ظˆظٹط¨ ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظ…ط´ط§ظ‡ط¯ط© ظ…ط¤ط®ط±ط§ظ‹ */}
                <TabsContent value="recent" className="animate-in fade-in space-y-6">
                    <RecentlyViewedTools />
                </TabsContent>

                {/* 3. طھط¨ظˆظٹط¨ ط§ظ„ظ…ط±ط§ط¬ط¹ط§طھ */}
                <TabsContent value="reviews" className="animate-in fade-in space-y-6">
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white text-lg">{review.tools?.title}</h3>
                                        <div className="flex text-yellow-400 text-sm gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < review.rating ? "âک…" : "âک†"}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mb-4 leading-relaxed">"{review.comment}"</p>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        طھظ… ط§ظ„ظ†ط´ط±: {new Date(review.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                                <p>ظ„ط§ طھظˆط¬ط¯ ظ…ط±ط§ط¬ط¹ط§طھ ط­طھظ‰ ط§ظ„ط¢ظ†.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* 4. طھط¨ظˆظٹط¨ ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ */}
                <TabsContent value="settings" className="animate-in fade-in space-y-6">
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 pb-4 border-b border-white/10">
                            <Settings className="w-5 h-5 text-neon-purple" /> ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ
                        </h2>

                        <div className="space-y-8">
                            {/* طھط؛ظٹظٹط± ط§ظ„ط§ط³ظ… */}
                            <div className="space-y-2">
                                <Label className="text-gray-300">ط§ظ„ط§ط³ظ… ط§ظ„ظƒط§ظ…ظ„</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white h-12"
                                />
                            </div>

                            {/* طھط؛ظٹظٹط± ط§ظ„طµظˆط±ط© */}
                            <div className="space-y-4">
                                <Label className="text-gray-300 block">ط§ظ„طµظˆط±ط© ط§ظ„ط±ظ…ط²ظٹط©</Label>
                                {session?.user.id && (
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                                        <AvatarUpload
                                            userId={session.user.id}
                                            currentAvatarUrl={avatarUrl}
                                            onUploadComplete={(url) => setAvatarUrl(url)}
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleUpdateProfile}
                                disabled={updateProfileMutation.isPending}
                                className="w-full bg-neon-purple hover:bg-neon-purple/80 h-12 text-lg mt-4 shadow-lg shadow-neon-purple/20"
                            >
                                {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "ط­ظپط¸ ط§ظ„طھط؛ظٹظٹط±ط§طھ"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;

