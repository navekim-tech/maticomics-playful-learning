import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta, topics } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";

export const Route = createFileRoute("/topic/$id")({
  component: TopicPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">הנושא לא נמצא</h1>
      <Link to="/" className="comic-btn comic-btn-primary">חזרה לבית</Link>
    </div>
  ),
  beforeLoad: ({ params }) => {
    if (!topics.some((t) => t.id === params.id)) throw notFound();
  },
});

function Section({
  label,
  children,
  badge,
}: {
  label: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <section className="comic-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        {badge && <span className="text-2xl">{badge}</span>}
        <h2 className="font-display text-xl md:text-2xl font-bold">{label}</h2>
      </div>
      <div className="text-base md:text-lg leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </section>
  );
}

function TopicPage() {
  const { id } = Route.useParams();
  const topic = topics.find((t) => t.id === id)!;
  const meta = categoryMeta[topic.category];

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/world/$category"
          params={{ category: topic.category }}
          className="comic-btn text-sm mb-6"
        >
          ← חזרה ל{meta.title}
        </Link>

        <header
          className="comic-card p-6 md:p-8 mb-6 text-center"
          style={{ background: `var(--${meta.color})` }}
        >
          <div className="text-5xl mb-2">{meta.emoji}</div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">{topic.title}</h1>
          <p className="mt-2 opacity-80">{topic.intro}</p>
        </header>

        <div className="space-y-5">
          <Section label="מה לומדים כאן?" badge="🎯">
            {topic.intro}
          </Section>

          <Section label="מושגים חשובים" badge="🧩">
            <div className="flex flex-wrap gap-2">
              {topic.concepts.map((c) => (
                <span
                  key={c}
                  className="inline-block px-3 py-1 rounded-full bg-accent border-2 border-foreground text-sm font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          </Section>

          <Section label="הסבר פשוט" badge="💡">
            {topic.explanation}
          </Section>

          <Section label="כלל / נוסחה" badge="📏">
            <code className="block bg-muted rounded-lg p-3 font-mono text-base" dir="ltr">
              {topic.formula}
            </code>
          </Section>

          <Section label="דוגמה פתורה שלב אחר שלב" badge="✏️">
            {topic.solvedExample}
          </Section>

          <Section label="תרגיל למחברת" badge="📓">
            <div className="bg-sun/40 border-2 border-dashed border-foreground rounded-xl p-4">
              {topic.notebookQuestion}
            </div>
          </Section>

          <Section label="בדיקת חשיבה" badge="🤔">
            {topic.thinkingCheck}
          </Section>

          <ComicGuide message={topic.comicTip} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/world/$category"
            params={{ category: topic.category }}
            className="comic-btn comic-btn-primary"
          >
            ← חזרה לרשימת הנושאים
          </Link>
        </div>
      </div>
    </div>
  );
}
