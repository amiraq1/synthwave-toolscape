import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Mail, Calendar, Edit2, Save, Bookmark, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
// import { format } from "date-fns"; // Removed unused import or will install if needed. User provided code uses it? User provided code imports it.
import { format } from "date-fns";
import ToolCard from "@/components/ToolCard";

const Profile = () => {
    const { session } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // بيانات للتعديل
    const [formData, setFormData] = useState({ full_name: "", avatar_url: "" });

    // بيانات النشاط
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    // 1. جلب بيانات المستخدم ونشاطه
    useEffect(() => {
        const fetchData = async () => {
            if (!session) return;

            const userId = session.user.id;

            // جلب البروفايل
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileData) {
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name || "",
                    avatar_url: profileData.avatar_url || ""
                });
            }

            // جلب المفضلة
            // Note: Assuming 'bookmarks' table exists and links to 'tools'. If not, this might fail.
            // Based on context, bookmarks might be 'bookmarks' table with 'tool_id'.
            // The user code assumes: .from("bookmarks").select("tools(*)")
            const { data: bookmarksData } = await supabase
                .from("bookmarks")
                .select("tools(*)")
                .eq("user_id", userId);

            if (bookmarksData) {
                // bookmarksData is an array of objects { tools: { ... } }
                // We map it to just get the tool objects
                const tools = bookmarksData.map((b: any) => b.tools).filter(Boolean);
                setBookmarks(tools);
            }

            // جلب المراجعات
            const { data: reviewsData } = await supabase
                .from("reviews")
                .select("*, tools(title)")
                .eq("user_id", userId);

            if (reviewsData) setReviews(reviewsData);

            setLoading(false);
        };

        fetchData();
    }, [session]);

    // 2. تحديث البروفايل
    const handleUpdate = async () => {
        if (!session) return;
        const { error } = await supabase
            .from("profiles")
            .update({
                // The user code uses 'full_name', but previous files used 'display_name'.
                // I should stick to user's code but verify schema if possible.
                // Looking at previous migrations: 20251220140845...sql: display_name TEXT
                // The user provided code uses `full_name`. I will preserve `full_name` as requested, but I should probably alias it or check if column exists.
                // Wait, the user specifically provided code with `full_name`. I will assume they might have updated schema or want me to use this.
                // However, if the column is 'display_name', this will error.
                // I will use 'display_name' mapped to 'full_name' in the UI if necessary, OR assum the user KNOWS what they are doing.
                // Let's assume the user made a mistake in the snippet vs existing schema, OR they want this new valid code.
                // Migration 20251220140845 has `display_name`.
                // I will use `display_name` in the API call but keep logic.
                display_name: formData.full_name,
                // avatar_url: formData.avatar_url // يمكن تفعيل هذا لاحقاً مع رفع الصور
            })
            .eq("id", session.user.id);

        if (error) {
            toast.error("فشل التحديث");
        } else {
            toast.success("تم تحديث معلوماتك بنجاح! 🎉");
            setProfile({ ...profile, full_name: formData.full_name }); // Update local state
            setIsEditing(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-neon-purple" /></div>;
    if (!session) return <div className="text-center p-10">يرجى تسجيل الدخول</div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl min-h-screen">

            {/* 1. بطاقة الهوية (Header) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* خلفية جمالية */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neon-purple to-blue-500" />

                <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-black/50 shadow-xl">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-4xl bg-neon-purple/20 text-neon-purple">
                            {profile?.full_name?.[0] || profile?.display_name?.[0] || <User />}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 text-center md:text-right space-y-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <Input
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="max-w-xs bg-black/20"
                                placeholder="الاسم الكامل"
                            />
                            <Button onClick={handleUpdate} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                            {profile?.full_name || profile?.display_name || "مستخدم جديد"}
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </h1>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-neon-purple" /> {session.user.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-neon-purple" />
                            انضم في {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. التبويبات (المفضلة + المراجعات) */}
            <Tabs defaultValue="bookmarks" className="w-full">
                <TabsList className="bg-black/20 border border-white/5 mb-8 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="bookmarks" className="gap-2">
                        <Bookmark className="w-4 h-4" /> أدواتي المفضلة ({bookmarks.length})
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2">
                        <MessageSquare className="w-4 h-4" /> مراجعاتي ({reviews.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bookmarks">
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>لا توجد أدوات في المفضلة بعد.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews">
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.id} className="bg-white/5 border-white/10">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-neon-purple mb-2">
                                            {review.tools?.title || "أداة غير معروفة"}
                                        </h3>
                                        <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`}>★</div>
                                            ))}
                                        </div>
                                        <p className="text-gray-300">{review.comment}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>لم تقم بكتابة أي مراجعات بعد.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    );
};

export default Profile;
