import { useEffect, useState, useCallback, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import type { Tool } from "@/hooks/useTools";
import UserStatsCards from "@/components/profile/UserStatsCards";
import RecentlyViewedTools from "@/components/profile/RecentlyViewedTools";
import AvatarUpload from "@/components/profile/AvatarUpload";

// Types for the profile page
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
    const { session, signOut } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [bookmarks, setBookmarks] = useState<Tool[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    // حالات التعديل
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [updating, setUpdating] = useState(false);

    // حساب الإحصائيات
    const userStats = useMemo(() => {
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const joinDate = profile?.created_at ? new Date(profile.created_at) : new Date();
        const joinedDaysAgo = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

        // حساب مستوى النشاط
        const totalActivity = bookmarks.length + reviews.length;
        let activityLevel: 'very_active' | 'active' | 'inactive' = 'inactive';
        if (totalActivity >= 10) activityLevel = 'very_active';
        else if (totalActivity >= 3) activityLevel = 'active';

        return {
            bookmarksCount: bookmarks.length,
            reviewsCount: reviews.length,
            averageRating,
            joinedDaysAgo,
            activityLevel
        };
    }, [bookmarks, reviews, profile]);

    const fetchProfileData = useCallback(async () => {
        try {
            const userId = session?.user.id;

            // 1. جلب بيانات البروفايل
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileData) {
                setProfile(profileData);
                setFullName(profileData.display_name || "");
                setAvatarUrl(profileData.avatar_url || "");
            }

            // 2. جلب المفضلة (مع بيانات الأدوات)
            const { data: bookmarksData } = await supabase
                .from("bookmarks")
                .select(`
          tool_id,
          tools (*)
        `)
                .eq("user_id", userId);

            if (bookmarksData) {
                // استخراج مصفوفة الأدوات مع تحويل id
                const tools = bookmarksData
                    .map((b) => {
                        const tool = b.tools;
                        if (!tool) return null;
                        return {
                            ...tool,
                            id: String(tool.id),
                            features: tool.features || [],
                        } as Tool;
                    })
                    .filter((t): t is Tool => t !== null);
                setBookmarks(tools);
            }

            // 3. جلب مراجعات المستخدم
            const { data: reviewsData } = await supabase
                .from("reviews")
                .select(`
          *,
          tools (title)
        `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (reviewsData) setReviews(reviewsData as Review[]);

        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (!session) {
            if (!loading) navigate("/auth");
            return;
        }
        fetchProfileData();
    }, [session, loading, navigate, fetchProfileData]);

    const handleUpdateProfile = async () => {
        if (!session) return;
        setUpdating(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                display_name: fullName,
                avatar_url: avatarUrl,
            })
            .eq("id", session.user.id);

        if (error) {
            toast.error("فشل تحديث البيانات");
        } else {
            toast.success("تم تحديث البروفايل بنجاح ✅");
            setProfile(prev => prev ? { ...prev, display_name: fullName, avatar_url: avatarUrl } : null);
        }
        setUpdating(false);
    };

    if (loading) return (
        <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-neon-purple w-12 h-12" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Helmet>
                <title>{t('profile.title')} | نبض AI</title>
            </Helmet>

            {/* الهيدر الشخصي */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-purple to-blue-600 p-1">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-white">{profile?.display_name?.[0] || session?.user.email?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-right">
                    <h1 className="text-3xl font-bold text-white mb-2">{profile?.display_name || t('profile.title')}</h1>
                    <p className="text-gray-400">{session?.user.email}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-400" /> {bookmarks.length} {t('profile.library')}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4 text-blue-400" /> {reviews.length} {t('profile.reviews')}</span>
                    </div>
                </div>

                <Button variant="destructive" onClick={() => { signOut(); navigate('/'); }} className="gap-2">
                    <LogOut className="w-4 h-4" /> {t('profile.logout')}
                </Button>
            </div>

            {/* بطاقات الإحصائيات */}
            <UserStatsCards stats={userStats} />

            {/* التبويبات والمحتوى */}
            <Tabs defaultValue="bookmarks" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8">
                    <TabsTrigger value="bookmarks" className="data-[state=active]:bg-neon-purple">{t('profile.library')}</TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-neon-purple gap-2">
                        <Clock className="w-4 h-4" /> الأخيرة
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-neon-purple">{t('profile.reviews')}</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-neon-purple">{t('profile.settings')}</TabsTrigger>
                </TabsList>

                {/* 1. تبويب المفضلة */}
                <TabsContent value="bookmarks" className="animate-in fade-in">
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map(tool => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">{t('profile.no_bookmarks')}</p>
                            <Button variant="link" onClick={() => navigate("/")} className="text-neon-purple">تصفح الأدوات</Button>
                        </div>
                    )}
                </TabsContent>

                {/* 2. تبويب الأدوات المشاهدة مؤخراً */}
                <TabsContent value="recent" className="animate-in fade-in">
                    <RecentlyViewedTools />
                </TabsContent>

                {/* 3. تبويب المراجعات */}
                <TabsContent value="reviews" className="animate-in fade-in">
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white text-lg">{review.tools?.title}</h3>
                                        <div className="flex text-yellow-400 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mb-4">"{review.comment}"</p>
                                    <div className="text-xs text-gray-500">
                                        تم النشر: {new Date(review.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500">لا توجد مراجعات حتى الآن.</div>
                        )}
                    </div>
                </TabsContent>

                {/* 4. تبويب الإعدادات */}
                <TabsContent value="settings" className="animate-in fade-in">
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-neon-purple" /> {t('profile.settings')}
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">الاسم الكامل</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-gray-300">الصورة الرمزية</Label>
                                {session?.user.id && (
                                    <AvatarUpload
                                        userId={session.user.id}
                                        currentAvatarUrl={avatarUrl}
                                        onUploadComplete={(url) => setAvatarUrl(url)}
                                    />
                                )}
                            </div>

                            <Button
                                onClick={handleUpdateProfile}
                                disabled={updating}
                                className="w-full bg-neon-purple hover:bg-neon-purple/80 mt-4"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.save')}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;
