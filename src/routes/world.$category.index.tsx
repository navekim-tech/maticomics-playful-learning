import { createFileRoute, Link } from "@tanstack/react-router";
import { categoryMeta, topics, type Category } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import { getTopicStarCount, getTopicStars, isTopicQuizReady, useLearningProgress } from "@/lib/learning-progress";
import auroriaMap from "@/assets/auroria-map.png.asset.json";
import fractionsMap from "@/assets/fractions-map.webp.asset.json";
import decimalsMap from "@/assets/decimals-map.png.asset.json";
import percentagesMap from "@/assets/percentages-map.png.asset.json";
import powersMap from "@/assets/powers-map.png.asset.json";


export const Route = createFileRoute("/world/$category/")({
  component: WorldPage,
});

function WorldPage() {
  const { category } = Route.useParams();
  const cat = category as Category;
  const meta = categoryMeta[cat];
  const list = topics.filter((t) => t.category === cat);
  const { progress } = useLearningProgress();
  const requiredCompleted = list.filter((topic) => isTopicQuizReady(progress, topic.id)).length;
  const earnedStars = list.reduce((sum, topic) => sum + getTopicStarCount(progress, topic.id), 0);
  const maxStars = list.length * 3;
  const quiz = progress.quizzes[cat];
  const quizUnlocked = list.every((topic) => isTopicQuizReady(progress, topic.id));
  const quizMissing = list
    .map((topic) => {
      const stars = getTopicStars(progress, topic.id);
      const missing = [
        !stars.includes("read") ? "קריאה" : null,
        !stars.includes("practice") ? "תרגול" : null,
      ].filter(Boolean);
      return missing.length ? `${topic.title}: ${missing.join(" + ")}` : null;
    })
    .filter(Boolean);
  const progressPercent = list.length ? Math.round((requiredCompleted / list.length) * 100) : 0;

  return (
    <div
      className="min-h-screen px-4 py-8 md:py-12"
      style={{
        backgroundImage:
          cat === "geometry"
            ? `url(${auroriaMap.url})`
            : cat === "fractions"
              ? `url(${fractionsMap.url})`
              : cat === "decimals"
                ? `url(${decimalsMap.url})`
                : cat === "percentages"
                  ? `url(${percentagesMap.url})`
                  : cat === "powers"
                    ? `url(${powersMap.url})`
                    : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto">

        <Link to="/" className="comic-btn text-sm mb-6">← חזרה לבית</Link>

        <header className="text-center my-6" style={{ textShadow: "0 2px 8px rgba(255,255,255,0.9)" }}>
          <div className="text-6xl mb-2">{meta.emoji}</div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">{meta.title}</h1>
          <p className="text-muted-foreground mt-2">מסלול למידה: נושא אחרי נושא, כוכבים, ואז מבחן פוקסי קצר</p>
        </header>


        <div className="mb-8">
          <ComicGuide message="המסלול נפתח בהדרגה. בכל נושא אפשר לאסוף עד 3 כוכבים: קריאה, תרגול ומשימת קומיקס. כשתרגישו מוכנים — עברו למבחן סוף עולם." />
        </div>

        <section className="comic-card p-4 md:p-5 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">מטלות חובה למבחן</p>
              <p className="font-display text-3xl font-bold">{requiredCompleted}/{list.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">כוכבים</p>
              <p className="font-display text-3xl font-bold">⭐ {earnedStars}/{maxStars}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">מבחן פוקסי</p>
              <p className="font-display text-2xl font-bold">{quiz ? `${quiz.score}/${quiz.total}` : quizUnlocked ? "פתוח" : "נעול"}</p>
            </div>
          </div>
          <div className="mt-4 h-4 rounded-full border-2 border-foreground bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        <ol className="grid grid-cols-1 gap-4">
          {list.map((t, i) => {
            const stars = getTopicStarCount(progress, t.id);
            const previousUnlocked = i === 0 || getTopicStarCount(progress, list[i - 1].id) > 0;
            const done = stars >= 3;
            const status = done ? "✅" : previousUnlocked ? "⏳" : "🔒";
            const card = (
              <div
                className={`comic-card comic-card-hover block p-5 ${previousUnlocked ? "" : "opacity-60 grayscale"}`}
               
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-3xl font-extrabold opacity-70">
                    {status}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-xl font-bold leading-snug">{String(i + 1).padStart(2, "0")} · {t.title}</h2>
                      <span className="rounded-full border-2 border-foreground px-3 py-1 text-sm font-bold">
                        {"⭐".repeat(stars)}{"☆".repeat(3 - stars)} {stars}/3
                      </span>
                    </div>
                    <p className="text-sm opacity-80 mt-1">{t.intro}</p>
                    {!previousUnlocked && <p className="text-xs mt-2 font-bold">כדאי להשלים קודם לפחות כוכב אחד בנושא הקודם.</p>}
                  </div>
                </div>
              </div>
            );

            return (
              <li key={t.id}>
                {previousUnlocked ? (
                  <Link to="/topic/$id" params={{ id: t.id }} search={{ fromWorld: "1" }} className="block">
                    {card}
                  </Link>
                ) : card}
              </li>
            );
          })}
        </ol>

        <section className="comic-card p-4 md:p-5 mt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-4xl mb-2">🏁</div>
              <h2 className="font-display text-2xl font-bold">מבחן פוקסי סוף עולם</h2>
              <p className="text-sm text-muted-foreground mt-1">
                5 שאלות קצרות: בסיס, יישום ואתגר. המבחן נפתח אחרי השלמת קריאה ותרגול בכל נושא. משימת הקומיקס היא כוכב FUN ולא חוסמת את המבחן.
              </p>
              {quiz && <p className="mt-2 font-bold">ניסיון אחרון: {quiz.score}/{quiz.total}</p>}
            </div>
            {quizUnlocked ? (
              <Link to="/world/$category/quiz" params={{ category: cat }} className="comic-btn comic-btn-primary">
                התחילו מבחן 🦊
              </Link>
            ) : (
              <Link to="/world/$category/quiz" params={{ category: cat }} className="comic-btn">
                צפו בהסבר ומה חסר 🔒
              </Link>
            )}
          </div>
          {!quizUnlocked && quizMissing.length > 0 && (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-foreground bg-slate-950/70 p-3 text-sm leading-relaxed">
              <p className="font-bold mb-2">כדי לפתוח את המבחן חסר עדיין:</p>
              <ul className="list-disc list-inside space-y-1">
                {quizMissing.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
