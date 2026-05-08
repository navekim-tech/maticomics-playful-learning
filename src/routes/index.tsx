import { createFileRoute } from "@tanstack/react-router";
import { ComicGuide } from "@/components/ComicGuide";
import { WorldCard } from "@/components/WorldCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מתמטיקומיקס — לומדים מתמטיקה בכיף" },
      { name: "description", content: "אפליקציית לימוד גאומטריה, שברים ומספרים עשרוניים לכיתות ה׳-ו׳ בסגנון קומיקס." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block bg-accent border-[3px] border-foreground rounded-2xl px-6 py-2 mb-4 -rotate-2 shadow-[4px_4px_0_0_var(--color-border)]">
            <span className="font-display font-bold text-sm md:text-base">כיתות ה׳ ו־ו׳</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-3">
            מתמטיקומיקס
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            לומדים גאומטריה ומתמטיקה בדרך פשוטה, צבעונית וברורה
          </p>
        </header>

        <div className="mb-10">
          <ComicGuide message="היי! אני פוקסי, החבר הקומיקסי שלכם. בחרו עולם והתחילו ללמוד — אני אתן טיפים בדרך!" />
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          <WorldCard
            to="/world/$category"
            params={{ category: "geometry" }}
            title="עולם הגאומטריה"
            emoji="📐"
            description="צורות, שטחים, נפחים וזוויות"
            bgVar="--geo"
          />
          <WorldCard
            to="/world/$category"
            params={{ category: "fractions" }}
            title="עולם השברים"
            emoji="🍕"
            description="מונה, מכנה, חיבור, חיסור וכפל"
            bgVar="--frac"
          />
          <WorldCard
            to="/world/$category"
            params={{ category: "decimals" }}
            title="עולם המספרים העשרוניים"
            emoji="🔢"
            description="הנקודה העשרונית, פעולות וקשר לשברים"
            bgVar="--dec"
          />
          <WorldCard
            to="/glossary"
            title="מילון מושגים"
            emoji="📖"
            description="כל המושגים החשובים במקום אחד"
            bgVar="--glossary"
          />
        </section>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          לומדים בקצב שלכם · עם מחברת ועיפרון ביד ✏️
        </footer>
      </div>
    </div>
  );
}
