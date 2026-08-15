import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta, topics, type Category } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import { requestFoxyHint } from "@/lib/foxy-ai";
import { getTopicStars, isTopicQuizReady, useLearningProgress } from "@/lib/learning-progress";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  review: string;
  topicHint?: string;
};

export const Route = createFileRoute("/world/$category/quiz")({
  component: WorldQuizPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">המבחן לא נמצא</h1>
      <Link to="/" className="comic-btn comic-btn-primary">חזרה לבית</Link>
    </div>
  ),
  beforeLoad: ({ params }) => {
    if (!(params.category in categoryMeta)) throw notFound();
  },
});

const quizBank: Record<Category, QuizQuestion[]> = {
  geometry: [
    { question: "מהו רדיוס?", options: ["קו מהמרכז לקצה", "קו מסביב למעגל", "שטח של מלבן", "גובה של משולש"], answer: 0, review: "רדיוס הוא המרחק מהמרכז עד הקצה.", topicHint: "מעגל/כדור" },
    { question: "שטח משולש מחשבים כך:", options: ["בסיס × גובה", "בסיס × גובה ÷ 2", "צלע × 4", "πr²"], answer: 1, review: "משולש הוא חצי ממלבן מתאים, לכן מחלקים ב־2.", topicHint: "שטח משולש" },
    { question: "סכום הזוויות במשולש הוא:", options: ["90°", "180°", "270°", "360°"], answer: 1, review: "בכל משולש סכום הזוויות הוא 180°.", topicHint: "משולשים" },
    { question: "נפח תיבה הוא:", options: ["אורך + רוחב + גובה", "אורך × רוחב", "אורך × רוחב × גובה", "היקף × גובה"], answer: 2, review: "נפח תיבה משתמש בשלושה ממדים.", topicHint: "נפחים" },
    { question: "למה בנפח כדור מופיע r³?", options: ["כי נפח הוא תלת־ממדי", "כי זו טעות", "כי רדיוס תמיד כפול 3", "כי שטח ונפח זה אותו דבר"], answer: 0, review: "נפח מודד מקום בתוך גוף תלת־ממדי, ולכן משתמשים בחזקה שלישית.", topicHint: "כדור" },
  ],
  fractions: [
    { question: "בשבר 3/8, מהו המכנה?", options: ["3", "8", "11", "5"], answer: 1, review: "המכנה הוא המספר התחתון — 8.", topicHint: "מהו שבר" },
    { question: "איזה שבר שווה ל־1/2?", options: ["2/4", "2/3", "1/4", "3/8"], answer: 0, review: "2/4 מצטמצם ל־1/2.", topicHint: "שברים שווים" },
    { question: "2/7 + 3/7 = ?", options: ["5/14", "6/7", "5/7", "1/7"], answer: 2, review: "המכנים שווים, מחברים מונים: 2+3=5.", topicHint: "פעולות בשברים" },
    { question: "בחילוק שברים צריך:", options: ["להפוך את השבר השני ואז לכפול", "לחבר מכנים", "להפוך את הראשון", "למחוק את המכנה"], answer: 0, review: "בחילוק שברים הופכים את השבר השני וכופלים.", topicHint: "פעולות בשברים" },
    { question: "7/3 הוא:", options: ["שבר קטן מ־1", "שבר מדומה", "מספר עשרוני", "אחוז"], answer: 1, review: "המונה גדול מהמכנה, לכן זה שבר מדומה.", topicHint: "שברים מדומים" },
  ],
  decimals: [
    { question: "0.5 שווה ל:", options: ["1/5", "1/2", "5/100", "50"], answer: 1, review: "0.5 הוא חצי.", topicHint: "עשרוניים" },
    { question: "בחיבור עשרוניים חשוב:", options: ["ליישר נקודה מתחת לנקודה", "למחוק את הנקודה", "לכפול קודם", "לחלק ב־10 תמיד"], answer: 0, review: "בחיבור וחיסור עשרוניים מיישרים נקודה מתחת לנקודה.", topicHint: "פעולות עשרוניות" },
    { question: "0.25 שווה ל:", options: ["1/4", "1/2", "3/4", "1/10"], answer: 0, review: "0.25 הוא 25 מאיות, כלומר רבע.", topicHint: "שברים ועשרוניים" },
    { question: "מה גדול יותר?", options: ["0.6", "0.56", "הם שווים", "אי אפשר לדעת"], answer: 0, review: "0.6 הוא 0.60, וזה גדול מ־0.56.", topicHint: "השוואה" },
    { question: "1/2 = 0.5 = ?", options: ["5%", "25%", "50%", "100%"], answer: 2, review: "חצי מתוך 100 הוא 50%.", topicHint: "מעבר בין שפות" },
  ],
  percentages: [
    { question: "אחוז פירושו:", options: ["מתוך 10", "מתוך 100", "כפל בלבד", "מספר שלם בלבד"], answer: 1, review: "אחוז הוא חלק מתוך 100.", topicHint: "מהו אחוז" },
    { question: "25% הם:", options: ["חצי", "רבע", "עשירית", "שלם"], answer: 1, review: "25 מתוך 100 הם רבע.", topicHint: "אחוזים מוכרים" },
    { question: "10% מתוך 90 הם:", options: ["9", "10", "18", "45"], answer: 0, review: "10% הם עשירית, ועשירית מ־90 היא 9.", topicHint: "אחוז מתוך מספר" },
    { question: "מחיר 100 ₪ עם הנחה של 20% יהיה:", options: ["120 ₪", "100 ₪", "80 ₪", "20 ₪"], answer: 2, review: "20% מתוך 100 הם 20, ולכן 100-20=80.", topicHint: "הנחות" },
    { question: "אם מחיר עולה ב־10%, צריך:", options: ["להחסיר 10%", "להוסיף 10%", "לחלק ב־10", "לא לשנות"], answer: 1, review: "התייקרות היא הוספה למחיר המקורי.", topicHint: "עלייה באחוזים" },
  ],
  powers: [
    { question: "2⁵ שווה:", options: ["10", "16", "25", "32"], answer: 3, review: "2×2×2×2×2 = 32.", topicHint: "חזקות עד 5" },
    { question: "3⁴ הוא לא:", options: ["3×3×3×3", "81", "3×4", "חזקה"], answer: 2, review: "חזקה היא כפל חוזר, לא בסיס כפול מעריך.", topicHint: "חזקות" },
    { question: "√64 שווה:", options: ["6", "7", "8", "9"], answer: 2, review: "8²=64.", topicHint: "שורשים" },
    { question: "⁵√32 שווה:", options: ["2", "3", "4", "5"], answer: 0, review: "2⁵=32.", topicHint: "שורש חמישי" },
    { question: "נפח קובייה שצלעה 3 הוא:", options: ["6", "9", "18", "27"], answer: 3, review: "נפח קובייה = צלע³ = 3³ = 27.", topicHint: "ריבועים וקוביות" },
  ],
};

function WorldQuizPage() {
  const { category } = Route.useParams();
  const cat = category as Category;
  const meta = categoryMeta[cat];
  const worldTopics = topics.filter((topic) => topic.category === cat);
  const { progress, saveQuizScore } = useLearningProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [aiHints, setAiHints] = useState<Record<number, string>>({});
  const [hintLoading, setHintLoading] = useState<Record<number, boolean>>({});
  const [hintErrors, setHintErrors] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const questions = useMemo(() => quizBank[cat], [cat]);
  const unlocked = worldTopics.every((topic) => isTopicQuizReady(progress, topic.id));
  const quizMissing = worldTopics
    .map((topic) => {
      const stars = getTopicStars(progress, topic.id);
      const missing = [
        !stars.includes("read") ? "קריאה" : null,
        !stars.includes("practice") ? "תרגול" : null,
      ].filter(Boolean);
      return missing.length ? `${topic.title}: ${missing.join(" + ")}` : null;
    })
    .filter(Boolean);
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  const previous = progress.quizzes[cat];

  const submit = () => {
    setSubmitted(true);
    saveQuizScore(cat, score, questions.length);
  };

  const askFoxyForHint = async (question: QuizQuestion, index: number) => {
    setHintLoading((current) => ({ ...current, [index]: true }));
    setHintErrors((current) => ({ ...current, [index]: "" }));

    try {
      const result = await requestFoxyHint({
        category: cat,
        question: question.question,
        options: question.options,
        topicHint: question.topicHint,
      });
      setAiHints((current) => ({ ...current, [index]: result.hint }));
    } catch {
      setHintErrors((current) => ({
        ...current,
        [index]: "פוקסי לא הצליח להביא רמז כרגע. אפשר לנסות שוב עוד רגע.",
      }));
    } finally {
      setHintLoading((current) => ({ ...current, [index]: false }));
    }
  };

  return (
    <div className="foxy-quiz-page min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/world/$category" params={{ category: cat }} className="comic-btn text-sm mb-6">
          ← חזרה ל{meta.title}
        </Link>

        <header className="comic-card p-4 md:p-6 mb-6 text-center">
          <div className="text-5xl mb-2">🦊</div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">מבחן פוקסי — {meta.title}</h1>
          <p className="mt-2 opacity-80">5 שאלות קצרות לסיכום העולם</p>
        </header>

        <section className="comic-card p-4 md:p-5 mb-6">
          <h2 className="font-display text-2xl font-bold mb-3">מה זה מבחן פוקסי?</h2>
          <div className="space-y-2 text-sm md:text-base leading-relaxed font-semibold">
            <p>זהו מבחן קצר שמסכם את העולם שלמדתם.</p>
            <p>פוקסי שואל 5 שאלות: חלק קלות, חלק שאלות חשיבה, וחלק אתגר קטן.</p>
            <p>המטרה היא לבדוק שהבנתם את הרעיונות המרכזיים לפני שעוברים הלאה.</p>
            <p>אל דאגה — אפשר לחזור לנושאים, לתרגל שוב, ולנסות להשתפר.</p>
          </div>
        </section>

        <div className="mb-6">
          <ComicGuide message="זה לא מבחן מלחיץ. זה בדיקת דרך: מה כבר יושב טוב, ומה כדאי לחזק לפני שעוברים הלאה." />
        </div>

        {!unlocked && (
          <section className="comic-card p-4 md:p-5 mb-6 ">
            <h2 className="font-display text-xl font-bold mb-2">המבחן עדיין נעול רכה 🔒</h2>
            <p className="text-sm leading-relaxed">
              כדי לפתוח את מבחן פוקסי צריך להשלים בכל נושא את מטלת הקריאה ואת מטלת התרגול. משימת הקומיקס היא בשביל FUN והיא לא חוסמת את המבחן.
            </p>
            {quizMissing.length > 0 && (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-foreground bg-slate-950/70 p-3 text-sm leading-relaxed">
                <p className="font-bold mb-2">מה חסר לפתיחה?</p>
                <ul className="list-disc list-inside space-y-1">
                  {quizMissing.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {previous && (
          <section className="comic-card p-4 mb-6">
            <p className="font-bold">ניסיון קודם: {previous.score}/{previous.total}</p>
          </section>
        )}

        <div className="space-y-4">
          {questions.map((question, index) => (
            <section key={question.question} className="comic-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-display text-lg md:text-xl font-bold">שאלה {index + 1}</h2>
                {question.topicHint && <span className="rounded-full border-2 border-foreground bg-accent px-2 py-1 text-xs font-bold">{question.topicHint}</span>}
              </div>
              <p className="mb-4 leading-relaxed">{question.question}</p>
              <div className="mb-4 rounded-2xl border-2 border-foreground bg-yellow-100/90 p-3 text-sm text-slate-950 shadow-[3px_3px_0_rgba(15,23,42,0.25)]">
                {aiHints[index] ? (
                  <p className="font-semibold leading-relaxed">🦊 {aiHints[index]}</p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">נתקעתם? פוקסי יכול לתת רמז בלי לגלות את התשובה.</p>
                    <button
                      type="button"
                      className="comic-btn text-xs"
                      disabled={!unlocked || hintLoading[index]}
                      onClick={() => askFoxyForHint(question, index)}
                    >
                      {hintLoading[index] ? "פוקסי חושב..." : "רמז מפוקסי"}
                    </button>
                  </div>
                )}
                {hintErrors[index] && <p className="mt-2 text-xs font-bold text-red-700">{hintErrors[index]}</p>}
              </div>
              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[index] === optionIndex;
                  const correct = submitted && optionIndex === question.answer;
                  const wrong = submitted && selected && optionIndex !== question.answer;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitted || !unlocked}
                      onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                      className={`rounded-xl border-2 border-foreground px-4 py-3 text-right font-semibold transition ${selected ? "bg-accent" : "bg-background"} ${correct ? "bg-green-200" : ""} ${wrong ? "bg-red-200" : ""}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-3 text-sm leading-relaxed">
                  <strong>משוב פוקסי:</strong> {question.review}
                </p>
              )}
            </section>
          ))}
        </div>

        <section className="comic-card p-4 md:p-5 mt-6 text-center">
          {submitted ? (
            <>
              <div className="text-5xl mb-2">{score >= 4 ? "🏆" : score >= 3 ? "⭐" : "💪"}</div>
              <h2 className="font-display text-2xl font-bold">קיבלתם {score}/{questions.length}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {score >= 4
                  ? "פוקסי מרוצה! אפשר להמשיך לעולם הבא או לנסות להשלים עוד כוכבים."
                  : score >= 3
                    ? "יפה מאוד. פוקסי ממליץ לחזור על שאלה אחת או שתיים שבהן התלבטתם."
                    : "הכול טוב — זה סימן שכדאי לחזור למסלול, לאסוף כוכבים, ואז לנסות שוב."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className="comic-btn"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                >
                  נסו שוב
                </button>
                <Link to="/world/$category" params={{ category: cat }} className="comic-btn comic-btn-primary">
                  חזרה למסלול
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold mb-2">מוכנים לבדיקה?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {unlocked ? "ענו על כל 5 השאלות ואז פוקסי ייתן משוב." : "אפשר לקרוא את ההסבר כאן, אבל כדי לענות צריך להשלים קריאה ותרגול בכל נושא."}
              </p>
              <button
                type="button"
                className="comic-btn comic-btn-primary"
                disabled={!unlocked || Object.keys(answers).length < questions.length}
                onClick={submit}
              >
                בדקו תשובות 🦊
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
