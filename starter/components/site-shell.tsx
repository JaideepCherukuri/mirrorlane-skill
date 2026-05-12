import { sections } from "@/lib/content";

export function SiteShell() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {sections.map((section) => (
        <section
          className="border-b border-zinc-200 px-6 py-16 sm:px-10 lg:px-16"
          key={section.id}
        >
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                {section.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {section.title}
              </h1>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              {section.body}
            </p>
          </div>
        </section>
      ))}
    </main>
  );
}
