import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bot } from "lucide-react";

const AgentsMarketplace = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" role="main">
            <Helmet>
                <title>Agents Marketplace | Nabd AI</title>
                <meta name="description" content="Browse and use ready-to-run AI agents." />
            </Helmet>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
                <Bot className="w-16 h-16 text-neon-blue mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-2">Agents Marketplace</h1>
                <p className="text-gray-400 mb-8">
                    The marketplace is under active development. More soon.
                </p>

                <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-neon-blue hover:bg-neon-blue/80 text-white"
                >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

export default AgentsMarketplace;
