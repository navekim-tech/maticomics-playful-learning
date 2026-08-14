import { createFileRoute } from "@tanstack/react-router";
import { ComicGuide } from "@/components/ComicGuide";
import { WorldCard } from "@/components/WorldCard";
import { categoryMeta } from "@/data/topics";
import azureMap from "@/assets/azure-map.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מתמטיקומיקס — לומדה חכמה לכיתה ו׳–ז׳" },
      { name: "description", content: "לומדה קומיקסית וחכמה במתמטיקה: גאומטריה, שברים, עשרוניים, אחוזים, חזקות ושורשים בגבולות כיתה ו׳–ז׳." },
    ],
  }),
  component: Index,
});

const worlds = [
  {
    category: "geometry" as const,
    title: categoryMeta.geometry.title,
    emoji: categoryMeta.geometry.emoji,
    description: categoryMeta.geometry.short,
    bgVar: "--geo",
  },
  {
    category: "fractions" as const,
    title: categoryMeta.fractions.title,
    emoji: categoryMeta.fractions.emoji,
    description: categoryMeta.fractions.short,
    bgVar: "--frac",
  },
  {
    category: "decimals" as const,
    title: categoryMeta.decimals.title,
    emoji: categoryMeta.decimals.emoji,
    description: categoryMeta.decimals.short,
    bgVar: "--dec",
  },
  {
    category: "percentages" as const,
    title: categoryMeta.percentages.title,
    emoji: categoryMeta.percentages.emoji,
    description: categoryMeta.percentages.short,
    bgVar: "--percent",
  },
  {
    category: "powers" as const,
    title: categoryMeta.powers.title,
    emoji: categoryMeta.powers.emoji,
    description: categoryMeta.powers.short,
    bgVar: "--powers",
  },
];

function Index() {
  return (
    <div
      className="min-h-screen px-4 py-8 md:py-12"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.45), rgba(15,23,42,0.45)), url(${azureMap.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block bg-accent border-[3px] border-foreground rounded-2xl px-6 py-2 mb-4 -rotate-2 shadow-[4px_4px_0_0_var(--color-border)]">
            <span className="font-display font-bold text-sm md:text-base">כיתות ו׳–ז׳ · למידה צעירה וחכמה</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-3 text-white drop-shadow-lg">
            מתמטיקומיקס
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            לומדה קומיקסית במתמטיקה: הסבר קצר, דוגמה פתורה, תרגול למחברת ומחולל שאלות חכם בכל נושא.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <ComicGuide message="היי! אני פוקסי. בחרו עולם, למדו שלב קצר, ואז לחצו על פוקסי AI כדי לקבל שאלת תרגול חדשה ברמה שמתאימה לכם." />
          <section className="comic-card p-4">
            <h2 className="font-display text-2xl font-bold mb-2">מה חכם כאן?</h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>✨ שאלות מתחלפות לפי נושא ורמת קושי</li>
              <li>🧠 רמז חשיבה לפני פתרון מלא</li>
              <li>📓 משימות קצרות למחברת</li>
              <li>🎯 גבולות ברורים: עד חזקה 5 ושורש חמישי</li>
            </ul>
          </section>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {worlds.map((world) => (
            <WorldCard
              key={world.category}
              to="/world/$category"
              params={{ category: world.category }}
              title={world.title}
              emoji={world.emoji}
              description={world.description}
              bgVar={world.bgVar}
            />
          ))}
          <WorldCard
            to="/glossary"
            title="מילון מושגים"
            emoji="📖"
            description="כל המושגים החשובים במקום אחד"
            bgVar="--glossary"
          />
        </section>

        <footer className="text-center mt-12 text-sm text-white/80">
          לומדים בקצב שלכם · עם מחברת, עיפרון ופוקסי AI ✏️
        </footer>
      </div>
    </div>
  );
}
