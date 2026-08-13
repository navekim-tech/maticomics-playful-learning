import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta, topics, type Category } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import { getTopicStarCount, isTopicDone, useLearningProgress } from "@/lib/learning-progress";
import auroriaMap from "@/assets/auroria-map.png.asset.json";
import fractionsMap from "@/assets/fractions-map.webp.asset.json";
import decimalsMap from "@/assets/decimals-map.png.asset.json";


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
  const { progress } = useLearningProgress();
  const completed = list.filter((topic) => isTopicDone(progress, topic.id)).length;
  const earnedStars = list.reduce((sum, topic) => sum + getTopicStarCount(progress, topic.id), 0);
  const maxStars = list.length * 3;
  const quiz = progress.quizzes[cat];
  const quizUnlocked = list.every((topic, index) => index === 0 || getTopicStarCount(progress, topic.id) > 0);
  const progressPercent = list.length ? Math.round((completed / list.length) * 100) : 0;

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

        <section className="comic-card p-5 md:p-6 mb-6 bg-card">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">התקדמות עולם</p>
              <p className="font-display text-3xl font-bold">{completed}/{list.length}</p>
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
                style={{ background: `var(--${meta.color})` }}
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-3xl font-extrabold opacity-70">
                    {status}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-xl font-bold leading-snug">{String(i + 1).padStart(2, "0")} · {t.title}</h2>
                      <span className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-sm font-bold">
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

        <section className="comic-card p-5 md:p-6 mt-6 bg-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-4xl mb-2">🏁</div>
              <h2 className="font-display text-2xl font-bold">מבחן פוקסי סוף עולם</h2>
              <p className="text-sm text-muted-foreground mt-1">
                5 שאלות קצרות: בסיס, יישום ואתגר. המבחן נפתח כשיש לפחות כוכב אחד בכל נושא.
              </p>
              {quiz && <p className="mt-2 font-bold">ניסיון אחרון: {quiz.score}/{quiz.total}</p>}
            </div>
            {quizUnlocked ? (
              <a href={`/world/${cat}/quiz`} className="comic-btn comic-btn-primary">
                התחילו מבחן 🦊
              </a>
            ) : (
              <span className="comic-btn opacity-60 cursor-not-allowed">מבחן נעול 🔒</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
