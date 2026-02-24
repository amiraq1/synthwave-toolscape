import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { getCategoryLabel } from "@/utils/localization";

dayjs.extend(relativeTime);

interface NotificationTool {
    id: string | number;
    title: string;
    category: string;
    created_at: string;
}

const NotificationsMenu = () => {
    const [notifications, setNotifications] = useState<NotificationTool[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchLatestTools = async () => {
            const { data, error } = await supabase
                .from("tools")
                .select("id, title, category, created_at")
                .eq("is_published", true)
                .order("created_at", { ascending: false })
                .limit(5);

            if (error) {
                console.error("Failed to load notifications:", error);
                setNotifications([]);
                setHasUnread(false);
                return;
            }

            if (!data || data.length === 0) {
                setNotifications([]);
                setHasUnread(false);
                return;
            }

            setNotifications(data);
            const lastSeenDate = localStorage.getItem("last_notification_check");
            const newestToolDate = new Date(data[0].created_at).getTime();

            if (!lastSeenDate || newestToolDate > Number(lastSeenDate)) {
                setHasUnread(true);
            }
        };

        fetchLatestTools();
    }, []);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && notifications.length > 0) {
            setHasUnread(false);
            localStorage.setItem("last_notification_check", Date.now().toString());
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="الإشعارات"
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
                dir="rtl"
            >
                <div className="p-4 border-b border-white/5">
                    <h4 className="font-bold text-sm">أحدث الإضافات</h4>
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((tool) => {
                                const displayCategory = getCategoryLabel(tool.category, true);

                                return (
                                    <Link
                                        key={tool.id}
                                        to={`/tool/${tool.id}`}
                                        onClick={() => setOpen(false)}
                                        className="flex flex-col gap-1 p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-sm text-neon-purple">{tool.title}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {dayjs(tool.created_at).locale("ar").fromNow()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            تمت إضافة أداة جديدة في قسم <span className="text-white">{displayCategory}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            لا توجد إشعارات جديدة حاليًا
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationsMenu;
