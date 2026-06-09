import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Users,
  MessageCircle,
  Heart,
  UserCircle2,
  Star,
  ArrowRight,
  Zap,
  Globe,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

/* ─── Animated Counter ─────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 2000;
          const step = (target / duration) * 16;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Star Rating ───────────────────────────────────────────────── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "text-amber-400 fill-amber-400" : "text-white/20"}
        />
      ))}
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, accent }) {
  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-300 cursor-default
        border border-white/10 hover:border-white/25
        bg-white/5 hover:bg-white/10
        shadow-xl hover:shadow-indigo-500/20
        hover:-translate-y-1"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* Glow orb on hover */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${accent}`}
      />

      <div
        className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-4
          bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-white/10
          group-hover:scale-110 transition-transform duration-300"
      >
        <Icon size={22} className="text-indigo-300 group-hover:text-white transition-colors duration-300" />
      </div>

      <h3 className="relative z-10 text-white font-semibold text-base mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="relative z-10 text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
        {desc}
      </p>
    </div>
  );
}

/* ─── Testimonial Card ──────────────────────────────────────────── */
function TestimonialCard({ initials, name, handle, text, stars, color }) {
  return (
    <div
      className="group flex-shrink-0 w-72 rounded-2xl p-5 border border-white/10
        bg-white/5 hover:bg-white/10 hover:border-white/25
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${color}`}
        >
          {initials}
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-none mb-0.5">{name}</p>
          <p className="text-white/40 text-xs">{handle}</p>
        </div>
        <div className="ml-auto">
          <Stars count={stars} />
        </div>
      </div>
      <p className="text-white/60 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/* ─── Floating Badge ────────────────────────────────────────────── */
function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 ${className}`}
    >
      {children}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function GetStarted() {
  const navigate = useNavigate();

  useEffect(() => {

    document.title = "Welcome to Vibeo";

    return () => {
      document.title = "Vibeo";
    }
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Create Posts",
      desc: "Share thoughts, images, and videos with your audience in seconds.",
      accent: "bg-gradient-to-br from-indigo-500/10 to-transparent",
    },
    {
      icon: Globe,
      title: "Discover People",
      desc: "Find and connect with creators and communities from around the world.",
      accent: "bg-gradient-to-br from-cyan-500/10 to-transparent",
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      desc: "Instant messaging with a smooth, lightning-fast UI experience.",
      accent: "bg-gradient-to-br from-violet-500/10 to-transparent",
    },
    {
      icon: Heart,
      title: "Engage with Content",
      desc: "Like, comment, and interact — every reaction builds real connection.",
      accent: "bg-gradient-to-br from-pink-500/10 to-transparent",
    },
    {
      icon: UserCircle2,
      title: "Build Your Profile",
      desc: "Showcase your personality, interests, and creative work.",
      accent: "bg-gradient-to-br from-amber-500/10 to-transparent",
    },
    {
      icon: TrendingUp,
      title: "Track Your Growth",
      desc: "Analytics and insights to help you grow your audience organically.",
      accent: "bg-gradient-to-br from-emerald-500/10 to-transparent",
    },
  ];

  const testimonials = [
    {
      initials: "AK",
      name: "Arjun Kapoor",
      handle: "@arjun_creates",
      text: "This platform changed how I connect with people. The UI is incredibly smooth and the community is super welcoming.",
      stars: 5,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
    },
    {
      initials: "SR",
      name: "Sneha Raj",
      handle: "@sneha.world",
      text: "Finally a social app that feels premium! Real-time chat is seamless and profile customization is top-notch.",
      stars: 5,
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
    },
    {
      initials: "MK",
      name: "Mihail Kovač",
      handle: "@m.kovac",
      text: "I discovered so many amazing people here. The content discovery algorithm is genuinely intelligent.",
      stars: 4,
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
    {
      initials: "PN",
      name: "Priya Nair",
      handle: "@priya.nair",
      text: "Been on every social platform — this one just feels right. Modern, fast, and actually fun to use.",
      stars: 5,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      initials: "DT",
      name: "Diego Torres",
      handle: "@diegot",
      text: "The post creation tools are next level. I love how easy it is to share and get real engagement.",
      stars: 5,
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
  ];

  const stats = [
    { label: "Active Users", value: 2400000, suffix: "+" },
    { label: "Posts Created", value: 18000000, suffix: "+" },
    { label: "Connections Made", value: 5700000, suffix: "+" },
  ];

  return (
    <div className="relative z-10 min-h-screen text-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-5 pt-24 pb-20 md:pt-32 md:pb-28">

        {/* Decorative ring */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-indigo-500/10 pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-purple-500/5 pointer-events-none" />

        <Badge className="mb-6 animate-pulse">
          <Sparkles size={12} />
          Now in Public Beta
        </Badge>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter mb-6 max-w-4xl">
          <span className="text-white">Connect, Share, and </span>
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Explore
          </span>
          <span className="text-white"> Like Never Before</span>
        </h1>

        <p className="text-white/50 text-base sm:text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Join a vibrant community, create content, and interact with people worldwide.
          Your next great connection is one click away.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => navigate("/register")}
            className="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-base
              bg-gradient-to-r from-indigo-500 to-purple-600
              hover:from-indigo-400 hover:to-purple-500
              shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
              transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <Zap size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            Get Started — It's Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            className="cursor-pointer inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-white/60 text-base font-medium
              border border-white/10 hover:border-white/25 hover:text-white
              bg-white/5 hover:bg-white/10
              transition-all duration-300"
          >
            See how it works
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Hero Mockup Card */}
        <div className="relative mt-16 w-full max-w-2xl mx-auto">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-600/20 rounded-3xl blur-3xl scale-95 pointer-events-none" />

          <div
            className="relative rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl"
            style={{ backdropFilter: "blur(20px)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-4">
                <div className="h-5 rounded-full bg-white/10 flex items-center px-3">
                  <span className="text-white/30 text-xs">app.socialverse.io/feed</span>
                </div>
              </div>
            </div>

            {/* Fake feed preview */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Aria Lee", time: "2m ago", likes: 248, img: "from-violet-500 to-indigo-600" },
                { name: "Marco Silva", time: "7m ago", likes: 91, img: "from-pink-500 to-rose-600" },
              ].map((post, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <div className={`h-28 bg-gradient-to-br ${post.img} opacity-70`} />
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${post.img}`} />
                      <span className="text-white text-xs font-semibold">{post.name}</span>
                      <span className="text-white/30 text-xs ml-auto">{post.time}</span>
                    </div>
                    <div className="h-2 rounded bg-white/10 w-full mb-1" />
                    <div className="h-2 rounded bg-white/10 w-3/4" />
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-pink-400 text-xs">
                        <Heart size={12} className="fill-pink-400" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1 text-white/40 text-xs">
                        <MessageCircle size={12} />
                        14
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="px-5 py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map(({ label, value, suffix }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center
                hover:border-indigo-400/30 hover:bg-white/8 transition-all duration-300"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                <Counter target={value} suffix={suffix} />
              </p>
              <p className="text-white/40 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Zap size={12} />
              Core Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                thrive online
              </span>
            </h2>
            <p className="text-white/45 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              A full-featured social experience — powerful tools, beautiful interface, real community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Star size={12} className="fill-indigo-300" />
              Loved by Users
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Real people. Real stories.
            </h2>
            <p className="text-white/45 text-base max-w-md mx-auto">
              Thousands of creators and explorers have already found their tribe.
            </p>
          </div>

          {/* Scrollable row */}
          <div style={{ scrollbarWidth: "none" }} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {testimonials.map((t) => (
              <div key={t.name} className="snap-start">
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>

          {/* Aggregate rating */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-white/50 text-sm">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span>
              <span className="text-white font-semibold">4.9 / 5</span> — Based on 2,400+ reviews
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-3xl pointer-events-none" />

          <div
            className="relative rounded-3xl border border-white/10 bg-white/5 p-10 md:p-16 shadow-2xl"
            style={{ backdropFilter: "blur(20px)" }}
          >
            <Badge className="mb-6">
              <Sparkles size={12} />
              Join Today — Free Forever
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
              Ready to join{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                the community?
              </span>
            </h2>

            <p className="text-white/50 text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Sign up in seconds. No credit card required. Start exploring, creating, and connecting right now.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="cursor-pointer group inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-bold text-white text-lg
                bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <Zap size={20} className="group-hover:rotate-12 transition-transform duration-200" />
              Get Started Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <p className="text-white/25 text-xs mt-5">
              No spam. No credit card. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="px-5 pb-10 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} Vibeo. All rights reserved.
      </footer>

    </div>
  );
}