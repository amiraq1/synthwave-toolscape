import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Loader2, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/AgentCard";
import { Helmet } from "react-helmet-async";

const AgentsMarketplace = () => {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setLoading(true);
        // لاحظ: في الواقع قد نحتاج لإضافة عمود is_official أو التعامل معه بشكل مختلف إذا لم يكن موجوداً
        // سأفترض أنه غير موجود حالياً وأزيل الترتيب به لتجنب الأخطاء، أو أضيفه لاحقاً
        // سأقوم بالترتيب حسب الاسم مؤقتاً
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('is_published', true) // فقط الوكلاء المنشورين
            .order('name', { ascending: true });

        if (data) setAgents(data);
        if (error) console.error("Error fetching agents:", error);
        setLoading(false);
    };

    // تصفية النتائج محلياً
    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) || "";
        const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // استخراج الفئات المتاحة ديناميكياً
    const categories = ["all", ...Array.from(new Set(agents.map(a => a.category).filter(Boolean)))];

    return (
        <div className="min-h-screen bg-[#0f0f1a] pt-24 pb-20 px-4 md:px-8 font-cairo">
            <Helmet>
                <title>سوق الوكلاء | نبض AI</title>
            </Helmet>

            {/* Hero Section الخاص بالسوق */}
            <div className="max-w-7xl mx-auto mb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-neon-purple/10 border border-neon-purple/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in slide-in-from-top-4">
                    <Bot className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm font-medium text-neon-purple">نبض AI 4.0</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                    اكتشف فريق عملك <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">الذكي</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                    استعن بوكلاء ذكاء اصطناعي متخصصين لإنجاز مهامك المعقدة. من البرمجة إلى التصميم، لدينا الوكيل المناسب لك.
                </p>

                {/* شريط البحث والفلترة */}
                <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto bg-[#1a1a2e] p-2 rounded-2xl border border-white/10 shadow-xl">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            placeholder="ابحث عن وكيل (مثلاً: مبرمج، كاتب...)"
                            className="bg-transparent border-none h-12 pr-12 text-white focus-visible:ring-0 placeholder:text-gray-600 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "ghost"}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl h-12 px-6 transition-all ${selectedCategory === cat ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {cat === "all" ? "الكل" : cat}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* شبكة الوكلاء */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent, index) => (
                            <div key={agent.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                                <AgentCard agent={agent} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Bot className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">لم نجد وكلاء مطابقين</h3>
                        <p className="text-gray-400">جرب تغيير كلمات البحث أو الفلتر.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchTerm(""); setSelectedCategory("all") }}
                            className="text-neon-purple mt-4"
                        >
                            مسح الفلاتر
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentsMarketplace;
