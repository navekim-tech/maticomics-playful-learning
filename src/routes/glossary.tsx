import { createFileRoute, Link } from "@tanstack/react-router";
import { glossary } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "מילון מושגים — מתמטיקומיקס" },
      { name: "description", content: "מילון מושגים בגאומטריה, שברים, מספרים עשרוניים, אחוזים, חזקות ושורשים." },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="comic-btn text-sm mb-6">← חזרה לבית</Link>

        <header className="text-center my-6">
          <div className="text-6xl mb-2">📖</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">מילון מושגים</h1>
          <p className="text-muted-foreground mt-2">כל המושגים החשובים במקום אחד</p>
        </header>

        <div className="mb-8">
          <ComicGuide message="לא בטוחים מה המשמעות של מושג? קפצו לכאן בכל רגע." />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {glossary.map((g) => (
            <li key={g.term} className="comic-card p-5" style={{ background: "var(--glossary)" }}>
              <h2 className="font-display text-xl font-bold mb-1">{g.term}</h2>
              <p className="text-sm leading-relaxed">{g.definition}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
