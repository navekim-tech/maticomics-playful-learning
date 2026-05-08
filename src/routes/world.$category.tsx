import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta, topics, type Category } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";

export const Route = createFileRoute("/world/$category")({
  component: WorldPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">העולם לא נמצא</h1>
      <Link to="/" className="comic-btn comic-btn-primary">חזרה לבית</Link>
    </div>
  ),
  beforeLoad: ({ params }) => {
    if (!(params.category in categoryMeta)) throw notFound();
  },
});

function WorldPage() {
  const { category } = Route.useParams();
  const cat = category as Category;
  const meta = categoryMeta[cat];
  const list = topics.filter((t) => t.category === cat);

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="comic-btn text-sm mb-6">← חזרה לבית</Link>

        <header className="text-center my-6">
          <div className="text-6xl mb-2">{meta.emoji}</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">{meta.title}</h1>
          <p className="text-muted-foreground mt-2">בחרו נושא והתחילו ללמוד</p>
        </header>

        <div className="mb-8">
          <ComicGuide message="כל נושא מסביר רעיון אחד, נותן דוגמה פתורה ותרגיל קטן למחברת. קדימה!" />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((t, i) => (
            <li key={t.id}>
              <Link
                to="/topic/$id"
                params={{ id: t.id }}
                className="comic-card comic-card-hover block p-5"
                style={{ background: `var(--${meta.color})` }}
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-3xl font-extrabold opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold leading-snug">{t.title}</h2>
                    <p className="text-sm opacity-80 mt-1">{t.intro}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
