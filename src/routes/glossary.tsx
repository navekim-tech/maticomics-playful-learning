import { createFileRoute, Link } from "@tanstack/react-router";
import { glossary } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import glossaryMap from "@/assets/glossary-map.png.asset.json";

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
    <div
      className="min-h-screen px-4 py-8 md:py-12"
      style={{
        backgroundImage: `url(${glossaryMap.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="comic-btn text-sm mb-6">← חזרה לבית</Link>

        <header className="text-center my-6" style={{ textShadow: "0 2px 8px rgba(255,255,255,0.9)" }}>
          <div className="text-6xl mb-2">📖</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">מילון מושגים</h1>
          <p className="text-muted-foreground mt-2">כל המושגים החשובים במקום אחד</p>
        </header>

        <div className="mb-8">
          <ComicGuide message="לא בטוחים מה המשמעות של מושג? קפצו לכאן בכל רגע." />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {glossary.map((g) => (
            <li key={g.term} className="comic-card p-4">
              <h2 className="font-display text-xl font-bold mb-1">{g.term}</h2>
              <p className="text-sm leading-relaxed">{g.definition}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
