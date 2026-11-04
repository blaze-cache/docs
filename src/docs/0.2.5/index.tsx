"use client";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/blaze-cache-logo.png";
import ThemeToggle from "../../components/ThemeToggle";
import CopyButton from "../../components/CopyButton";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Terminal, Zap, Radio, BookOpen } from "lucide-react";

const INSTALL = "npm install @blaze-cache/core";

/** Section heading in the site's established style: crimson icon tile + mono title. */
function SectionHeading({
  id,
  icon,
  title,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div id={id} className="mb-6 flex scroll-mt-28 items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10">
        {icon}
      </div>
      <h3 className="text-3xl font-bold font-mono tracking-tight">{title}</h3>
    </div>
  );
}

export default function DocsPage025() {
  useEffect(() => {
    document.title = "Blaze Cache — v0.2.5";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
      {/* Skip link for keyboard navigators */}
      <a
        href="#main"
        className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:outline-none"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} alt="Blaze Cache" className="h-9 w-auto" />
            <h1 className="text-base font-bold tracking-tight leading-none">
              Blaze Cache
            </h1>
            <Badge>v0.2.5</Badge>
          </Link>

          {/* Version switcher — stable is active, beta links to the prerelease docs. */}
          <nav
            aria-label="Documentation version"
            className="hidden items-center gap-1 rounded-lg border border-border bg-card p-0.5 px-3 lg:flex"
          >
            <Link
              to="/0.2.5"
              className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white"
            >
              v0.2.5
            </Link>
            <Link
              to="/0.3.0-beta"
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              v0.3.0-beta
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/blaze-cache/blaze-cache"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-white sm:inline-flex"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-20">
        {/* Section: Overview */}
        <section id="overview" className="mb-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-flame">
              Blaze Cache
            </p>
            <h2 className="mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent md:text-5xl">
              A full-featured client-side caching library for heavy data,
              offline-ready apps, and high-performance browsers
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              One core, many adapters. A single Rust/Wasm engine powers axios,
              fetch, ky, TanStack Query and SWR — synchronous hot path, durable
              persistence, tag invalidation.
            </p>
          </div>
        </section>

        <Separator className="mb-16 bg-border" />

        {/* Section: Installation */}
        <section className="mb-16">
          <div className="mx-auto max-w-2xl">
            <SectionHeading id="install" icon={<Terminal size={20} />} title="Installation" />
            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border border-border bg-code p-4 pr-16 font-mono text-sm text-foreground">
                {INSTALL}
              </pre>
              <CopyButton text={INSTALL} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Core is the only requirement — copy the lines for the integrations
              you actually use.
            </p>
          </div>
        </section>

        <Separator className="mb-16 bg-border" />

        {/* Section: Core API */}
        <section className="mb-16">
          <div className="mx-auto max-w-2xl">
            <SectionHeading id="core" icon={<Zap size={20} />} title="Core API" />
            <p className="mb-6 text-muted-foreground">
              Create a cache instance. All reads/writes are synchronous after
              initialization.
            </p>
            <div className="rounded-xl border border-border bg-card p-6 font-mono text-sm shadow-sm">
              createCache(options?) → Promise&lt;BlazeCache&gt;
            </div>
          </div>
        </section>

        <Separator className="mb-16 bg-border" />

        {/* Section: Events */}
        <section className="mb-16">
          <div className="mx-auto max-w-2xl">
            <SectionHeading id="events" icon={<Radio size={20} />} title="Events" />
            <p className="text-muted-foreground">
              Everything the cache does is observable through a typed event
              system.
              <code className="text-flame"> on(type, listener)</code> subscribes
              to one event type — the payload typed to exactly that event —{" "}
              <code className="text-flame">on(listener)</code> subscribes to{" "}
              <strong className="font-medium text-foreground">all</strong> of
              them (wildcard), both return their own unsubscribe function, and{" "}
              <code>once</code> / <code>off</code> complete the API.
            </p>
          </div>
        </section>

        <Separator className="mb-16 bg-border" />

        {/* Section: Repo */}
        <section className="mb-16">
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              id="repo"
              icon={<BookOpen size={20} />}
              title="Repo & Development"
            />
            <p className="text-muted-foreground">
              GitHub:{" "}
              <a
                href="https://github.com/blaze-cache/blaze-cache"
                target="_blank"
                rel="noreferrer"
                className="text-flame underline underline-offset-4 hover:text-primary"
              >
                github.com/blaze-cache/blaze-cache
              </a>
            </p>
          </div>
        </section>

        {/* Footer — matches the main docs page */}
        <footer className="mt-20 border-t border-border pt-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Blaze Cache" className="h-8 w-auto" />
              <span>Blaze Cache — Rust / Wasm client-side caching.</span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/blaze-cache/blaze-cache"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
              <a href="#overview" className="hover:text-foreground">
                Overview
              </a>
              <a href="#install" className="hover:text-foreground">
                Install
              </a>
              <a href="#core" className="hover:text-foreground">
                API
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
