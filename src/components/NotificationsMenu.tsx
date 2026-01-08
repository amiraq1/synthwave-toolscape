import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const NotificationsMenu = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [open, setOpen] = useState(false);
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        const fetchLatestTools = async () => {
            // 1. جلب أحدث 5 أدوات منشورة
            const { data } = await supabase
                .from("tools")
                .select("id, title, category, created_at")
                .eq("is_published", true)
                .order("created_at", { ascending: false })
                .limit(5);

            if (data && data.length > 0) {
                setNotifications(data);

                // 2. التحقق من "النقطة الحمراء"
                const lastSeenDate = localStorage.getItem("last_notification_check");
                const newestToolDate = new Date(data[0].created_at).getTime();

                if (!lastSeenDate || newestToolDate > parseInt(lastSeenDate)) {
                    setHasUnread(true);
                }
            }
        };

        fetchLatestTools();
    }, []);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && notifications.length > 0) {
            // عند الفتح، نعتبر أن المستخدم "رأى" الإشعارات
            setHasUnread(false);
            localStorage.setItem("last_notification_check", new Date().getTime().toString());
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label={isAr ? "الإشعارات" : "Notifications"}
                >
                    <Bell className="w-5 h-5 text-gray-300 hover:text-neon-purple transition-colors" />
                    {hasUnread && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f0f1a] animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 bg-[#1a1a2e] border-white/10 text-white"
                align="end"
                dir={isAr ? "rtl" : "ltr"}
            >
                <div className="p-4 border-b border-white/5">
                    <h4 className="font-bold text-sm">
                        {isAr ? "أحدث الإضافات 🚀" : "Latest Additions 🚀"}
                    </h4>
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((tool) => {
                                const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
                                return (
                                    <Link
                                        key={tool.id}
                                        to={`/tool/${tool.id}`}
                                        onClick={() => setOpen(false)}
                                        className="flex flex-col gap-1 p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-sm text-neon-purple">{displayTitle}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {formatDistanceToNow(new Date(tool.created_at), {
                                                    addSuffix: true,
                                                    locale: isAr ? ar : enUS
                                                })}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {isAr
                                                ? <>تمت إضافة أداة جديدة في قسم <span className="text-white">{tool.category}</span></>
                                                : <>New tool added in <span className="text-white">{tool.category}</span> category</>
                                            }
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            {isAr ? "لا توجد إشعارات جديدة حالياً" : "No new notifications"}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationsMenu;
