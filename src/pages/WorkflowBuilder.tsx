import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Construction } from "lucide-react";
import { useTranslation } from "react-i18next";

const WorkflowBuilder = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" role="main" dir={isAr ? "rtl" : "ltr"}>
            <Helmet>
                <title>Workflow Builder | Nabd AI</title>
                <meta name="description" content={isAr ? "ابنِ وخصص وكلاء الذكاء الاصطناعي باستخدام منشئ مرئي لسير العمل." : "Build and customize your own AI agents with a visual workflow builder."} />
            </Helmet>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
                <Construction className="w-16 h-16 text-neon-purple mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-2">{isAr ? "قريباً" : "Coming Soon"}</h1>
                <p className="text-gray-400 mb-8">
                    {isAr
                        ? "نعمل على بناء أداة متقدمة لتصميم سير عمل الوكلاء الذكيين. ستكون متاحة قريباً."
                        : "We are building a next-generation AI agent workflow tool. It will be available soon."}
                </p>

                <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white"
                >
                    <ArrowRight className={`w-4 h-4 ${isAr ? "ml-2" : "mr-2 rotate-180"}`} />
                    {isAr ? "العودة للرئيسية" : "Back to Home"}
                </Button>
            </div>
        </div>
    );
};

export default WorkflowBuilder;
