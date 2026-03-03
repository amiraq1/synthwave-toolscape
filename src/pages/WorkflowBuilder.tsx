import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Construction } from "lucide-react";

const WorkflowBuilder = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" role="main" dir="rtl">
            <Helmet>
                <title>Workflow Builder | Nabd AI</title>
                <meta name="description" content="ابنِ وخصص وكلاء الذكاء الاصطناعي باستخدام منشئ مرئي لسير العمل." />
            </Helmet>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
                <Construction className="w-16 h-16 text-neon-purple mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-2">قريباً</h1>
                <p className="text-gray-400 mb-8">
                    نعمل على بناء أداة متقدمة لتصميم سير عمل الوكلاء الذكيين. ستكون متاحة قريباً.
                </p>

                <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white flex-row-reverse"
                >
                    العودة للرئيسية
                    <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
            </div>
        </div>
    );
};

export default WorkflowBuilder;
