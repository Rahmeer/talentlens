import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import {
  Sparkles,
  Brain,
  Shield,
  BarChart3,
  Users,
  FileSearch,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              AI-Powered Hiring Intelligence
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Hire Smarter with{" "}
              <span className="gradient-text">AI Insights</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              TalentLens combines intelligent resume parsing, skill matching, and
              AI evaluation to help you find the perfect candidates — while
              keeping humans in the loop.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/jobs">
                <Button size="lg" className="text-base px-8">
                  Browse Open Positions
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to hire <span className="gradient-text">intelligently</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete hiring workflow powered by AI, designed for transparency and fairness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: Brain,
                title: "AI Resume Analysis",
                description: "Automatically parse and analyze resumes. Extract skills, experience, and qualifications with advanced language models.",
                color: "from-violet-500 to-indigo-500",
              },
              {
                icon: FileSearch,
                title: "Hybrid Scoring",
                description: "Combine deterministic rule-based checks with AI semantic evaluation for accurate, explainable candidate scoring.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Bias-Free Evaluation",
                description: "Built-in safeguards ensure evaluations focus only on skills and qualifications — never on protected characteristics.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Users,
                title: "Human-in-the-Loop",
                description: "AI recommends, humans decide. Every AI suggestion can be overridden with full audit trail transparency.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description: "Track application pipelines, conversion rates, and hiring metrics at a glance from your admin dashboard.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Zap,
                title: "Instant Evaluation",
                description: "Candidates get evaluated within seconds of applying. No waiting, no manual resume screening bottlenecks.",
                color: "from-fuchsia-500 to-purple-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 cursor-default"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Post a Job", desc: "Create and publish job listings with required skills and screening questions." },
              { step: "02", title: "Candidates Apply", desc: "Candidates upload resumes and fill out their profiles with relevant details." },
              { step: "03", title: "AI Evaluates", desc: "Our hybrid engine scores candidates using rule-based and AI semantic analysis." },
              { step: "04", title: "You Decide", desc: "Review AI recommendations, override when needed, and move candidates forward." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-black gradient-text mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
          <p className="text-gray-400 mb-8">Start evaluating candidates with AI-powered insights today.</p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10">
              Create an Account
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <span className="font-semibold">TalentLens</span>
          </div>
          <p className="text-sm text-gray-500">
            AI is an assistant, not the final decision maker. Always keep humans in the loop.
          </p>
        </div>
      </footer>
    </div>
  );
}
