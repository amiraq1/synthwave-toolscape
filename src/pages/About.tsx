
import { Activity, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

const About = () => {
    useSEO({
        title: 'About Nabd - AI Tools Directory',
        description: 'Learn about Nabd, a curated platform for discovering the best AI tools for work and creativity.',
        keywords: 'Nabd, about, AI tools directory, AI tools, who we are',
    });

    const features = [
        {
            icon: Target,
            title: 'Our Mission',
            description: 'Make AI tool discovery faster, clearer, and more reliable for everyone.',
        },
        {
            icon: Users,
            title: 'Who Is Nabd For?',
            description: 'Creators, founders, developers, writers, designers, and teams that want higher output.',
        },
        {
            icon: Zap,
            title: 'Why Nabd?',
            description: 'Accurate categories, practical comparisons, and continuously updated AI tool coverage.',
        },
    ];

    return (
        <div className="min-h-screen bg-background" dir="ltr">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50">
                <div className="container mx-auto max-w-5xl px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl px-4 py-12 space-y-16">
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                            <Activity className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                        About Nabd
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Nabd is your smart guide to discovering the AI tools that can transform how you work and create.
                    </p>
                </section>

                {/* Features Grid */}
                <section className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl p-8 text-center space-y-4 hover:border-neon-purple/50 transition-colors"
                        >
                            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                                <feature.icon className="h-7 w-7 text-neon-purple" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{feature.title}</h2>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </section>

                {/* Story Section */}
                <section className="glass rounded-3xl p-8 md:p-12 space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                    <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Nabd started with a simple idea: one place to find the best AI tools without the noise.
                        </p>
                        <p>
                            As AI products evolve rapidly, it becomes harder to track what is actually useful.
                            Nabd does that research and curation work for you.
                        </p>
                        <p>
                            We believe AI should be accessible and practical. Our goal is to help you make better, faster decisions.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Ready to explore the future of AI tools?</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/">
                            <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                                Browse Tools
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button size="lg" variant="outline">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>© 2024 Nabd AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
