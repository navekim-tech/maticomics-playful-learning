import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, Navigate, notFound } from "@tanstack/react-router";
import { categoryMeta, topics, type Topic } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import { getTopicStars, useLearningProgress } from "@/lib/learning-progress";

export const Route = createFileRoute("/topic/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    fromWorld: search.fromWorld === "1" ? "1" : undefined,
  }),
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

type Level = "קל" | "בינוני" | "אתגר";

type PracticeQuestion = {
  question: string;
  hint: string;
  answer: string;
};

const levelIndex: Record<Level, number> = { קל: 0, בינוני: 1, אתגר: 2 };

const topicQuestionBank: Record<string, PracticeQuestion[]> = {
  polygons: [
    { question: "האם צורה סגורה עם 5 קווים ישרים היא מצולע? הסבירו.", hint: "בדקו שני תנאים: סגור וקווים ישרים.", answer: "כן. היא סגורה ומורכבת מ־5 קווים ישרים, לכן היא מחומש — מצולע." },
    { question: "צורה סגורה עם 2 קווים ישרים וקשת עגולה אחת — האם היא מצולע?", hint: "מצולע לא אוהב קווים עגולים.", answer: "לא. יש בה קשת עגולה, ולכן היא לא מצולע." },
    { question: "מצולע בעל 8 צלעות איבד צלע אחת בציור ונשאר פתוח. האם עדיין מצולע?", hint: "צורה חייבת להיות סגורה.", answer: "לא. אם הצורה פתוחה היא לא מצולע, גם אם רוב הקווים ישרים." },
  ],
  "triangles-types": [
    { question: "במשולש יש זוויות 40° ו־80°. מצאו את הזווית השלישית.", hint: "סכום זוויות במשולש הוא 180°.", answer: "40+80=120, ולכן 180-120=60°." },
    { question: "משולש עם זווית אחת של 90° — איך נקרא לפי הזוויות?", hint: "90° היא זווית ישרה.", answer: "משולש ישר־זווית." },
    { question: "במשולש שווה־שוקיים זוויות הבסיס הן 55° כל אחת. מה זווית הראש?", hint: "חברו את שתי זוויות הבסיס והשלימו ל־180°.", answer: "55+55=110, ולכן 180-110=70°." },
  ],
  angles: [
    { question: "זווית של 115° היא חדה, ישרה או קהה?", hint: "השוו ל־90° ול־180°.", answer: "היא קהה, כי היא גדולה מ־90° וקטנה מ־180°." },
    { question: "שתי זוויות יוצרות יחד זווית שטוחה. אחת היא 65°. מה השנייה?", hint: "זווית שטוחה היא 180°.", answer: "180-65=115°." },
    { question: "סביב נקודה יש 360°. שלוש זוויות הן 90°, 120°, 80°. מה הזווית החסרה?", hint: "חברו את הידוע והשלימו ל־360°.", answer: "90+120+80=290, ולכן החסרה היא 70°." },
  ],
  quadrilaterals: [
    { question: "כמה מעלות יש בסכום הזוויות של מרובע?", hint: "מרובע אפשר לחלק לשני משולשים.", answer: "360°." },
    { question: "במרובע שלוש זוויות הן 90°, 80°, 100°. מה הזווית הרביעית?", hint: "השלימו ל־360°.", answer: "90+80+100=270, ולכן הרביעית היא 90°." },
    { question: "האם כל מלבן הוא מקבילית? הסבירו בקצרה.", hint: "בדקו אם יש שני זוגות של צלעות מקבילות.", answer: "כן. במלבן יש שני זוגות של צלעות נגדיות מקבילות." },
  ],
  "perimeter-polygons": [
    { question: "מצולע עם צלעות 4, 4, 5, 7 ס״מ. מה ההיקף?", hint: "היקף = סכום הצלעות.", answer: "4+4+5+7=20 ס״מ." },
    { question: "משושה משוכלל שכל צלע שלו 3 ס״מ. מה ההיקף?", hint: "משוכלל = כל הצלעות שוות.", answer: "6×3=18 ס״מ." },
    { question: "היקף מחומש הוא 30 ס״מ. ארבע צלעות הן 5, 6, 7, 4. מה הצלע החסרה?", hint: "חברו את הידוע וחסרו מההיקף.", answer: "5+6+7+4=22, ולכן החסרה היא 8 ס״מ." },
  ],
  "rect-area": [
    { question: "מלבן: אורך 9 ס״מ, רוחב 4 ס״מ. מה השטח?", hint: "שטח מלבן = אורך × רוחב.", answer: "9×4=36 סמ״ר." },
    { question: "ריבוע שצלעו 7 ס״מ. מה השטח?", hint: "שטח ריבוע = צלע².", answer: "7²=49 סמ״ר." },
    { question: "שטח מלבן הוא 48 סמ״ר והרוחב 6 ס״מ. מה האורך?", hint: "חלקו את השטח ברוחב.", answer: "48÷6=8 ס״מ." },
  ],
  "triangle-area": [
    { question: "בסיס משולש 12 ס״מ וגובה 5 ס״מ. מה השטח?", hint: "בסיס × גובה ÷ 2.", answer: "12×5=60, 60÷2=30 סמ״ר." },
    { question: "שטח משולש הוא 24 סמ״ר והבסיס 8 ס״מ. מה הגובה?", hint: "שטח×2÷בסיס.", answer: "24×2=48, 48÷8=6 ס״מ." },
    { question: "למה מחלקים ב־2 בשטח משולש?", hint: "חשבו על מלבן שנחתך באלכסון.", answer: "משולש מתאים הוא חצי ממלבן בעל אותו בסיס וגובה." },
  ],
  "parallelogram-trapezoid-area": [
    { question: "מקבילית: בסיס 10 וגובה 6. מה השטח?", hint: "בסיס × גובה.", answer: "10×6=60 סמ״ר." },
    { question: "טרפז: בסיסים 5 ו־11, גובה 4. מה השטח?", hint: "חברו בסיסים, כפלו בגובה וחלקו ב־2.", answer: "(5+11)×4÷2 = 32 סמ״ר." },
    { question: "שטח טרפז הוא 45, הבסיסים 7 ו־11. מה הגובה?", hint: "הכפילו שטח ב־2 ואז חלקו בסכום הבסיסים.", answer: "45×2=90, 7+11=18, 90÷18=5." },
  ],
  "circle-area-circumference": [
    { question: "רדיוס עיגול 5. מה הקוטר?", hint: "קוטר = 2r.", answer: "2×5=10." },
    { question: "רדיוס מעגל 4. מה ההיקף בקירוב עם π=3?", hint: "היקף = 2πr.", answer: "2×3×4=24." },
    { question: "רדיוס עיגול 3. מה השטח עם π=3.14?", hint: "שטח = πr².", answer: "3.14×3² = 3.14×9 = 28.26." },
  ],
  height: [
    { question: "במקבילית צלע אלכסונית 9 וגובה 4. באיזה מספר משתמשים לחישוב שטח?", hint: "גובה חייב להיות מאונך לבסיס.", answer: "משתמשים בגובה 4, לא בצלע האלכסונית." },
    { question: "האם קו שיורד לבסיס בזווית של 70° הוא גובה?", hint: "גובה יוצר 90°.", answer: "לא. גובה חייב להיות מאונך לבסיס." },
    { question: "למה הגובה לא חייב להיות באמצע הצורה?", hint: "ההגדרה תלויה בזווית ישרה, לא במיקום באמצע.", answer: "כי גובה הוא קו מאונך לבסיס; הוא יכול להיות בצד או מחוץ לצורה." },
  ],
  "solid-volume": [
    { question: "תיבה: 4×3×5. מה הנפח?", hint: "אורך × רוחב × גובה.", answer: "4×3×5=60 סמ״ק." },
    { question: "קובייה שצלעה 5. מה הנפח?", hint: "צלע³.", answer: "5³=125 סמ״ק." },
    { question: "מנסרה עם שטח בסיס 18 וגובה 7. מה הנפח?", hint: "שטח בסיס × גובה.", answer: "18×7=126 סמ״ק." },
  ],
  "cylinder-cone-volume": [
    { question: "גליל עם שטח בסיס 12 וגובה 5. מה הנפח?", hint: "שטח בסיס × גובה.", answer: "12×5=60 סמ״ק." },
    { question: "חרוט עם שטח בסיס 18 וגובה 6. מה הנפח?", hint: "כמו גליל ואז לחלק ב־3.", answer: "18×6÷3=36 סמ״ק." },
    { question: "גליל וחרוט עם אותו בסיס וגובה. נפח הגליל 90. מה נפח החרוט?", hint: "חרוט הוא שליש מהגליל המתאים.", answer: "90÷3=30." },
  ],
  "sphere-area-volume": [
    {
      question: "כדור ברדיוס 2 ס״מ. מה שטח הפנים בקירוב עם π=3?",
      hint: "שטח פנים הוא המעטפת מבחוץ. משתמשים ב־4 × π × r².",
      answer: "r²=2²=4. לכן 4×3×4=48. שטח הפנים הוא בערך 48 סמ״ר.",
    },
    {
      question: "כדור ברדיוס 2 ס״מ. מה הנפח בקירוב עם π=3?",
      hint: "נפח מודד את המקום שבתוך הכדור. משתמשים ב־4/3 × π × r³.",
      answer: "r³=2³=8. מציבים: 4/3×3×8. ה־3 מצטמצם, נשאר 4×8=32. הנפח הוא בערך 32 סמ״ק.",
    },
    {
      question: "למה בנפח כדור מופיע r³ ולא r²?",
      hint: "חשבו על ההבדל בין שטח שטוח לבין מקום בתוך גוף תלת־ממדי.",
      answer: "שטח הוא דו־ממדי ולכן משתמשים ב־r². נפח הוא תלת־ממדי — יש בו עומק — ולכן משתמשים ב־r³.",
    },
  ],
  "what-is-fraction": [
    { question: "מה אומר המכנה בשבר 5/8?", hint: "המכנה הוא המספר למטה.", answer: "השלם חולק ל־8 חלקים שווים." },
    { question: "אם צבעתי 3 מתוך 6 חלקים שווים, איזה שבר צבעתי?", hint: "מונה = צבועים, מכנה = כל החלקים.", answer: "3/6, שזה גם 1/2." },
    { question: "למה חלקים לא שווים לא יוצרים שבר תקין של שלם?", hint: "שבר דורש חלוקה שווה.", answer: "כי המכנה מתאר חלקים שווים. אם החלקים שונים, השבר לא מייצג כמות מדויקת." },
  ],
  "equal-fractions": [
    { question: "הרחיבו את 2/3 פי 4.", hint: "כופלים מונה ומכנה באותו מספר.", answer: "2×4 / 3×4 = 8/12." },
    { question: "צמצמו את 6/8.", hint: "חלקו ב־2.", answer: "6/8 = 3/4." },
    { question: "האם 9/12 שווה ל־3/4?", hint: "נסו לצמצם ב־3.", answer: "כן. 9÷3=3 ו־12÷3=4." },
  ],
  "compare-fractions": [
    { question: "מי גדול יותר: 4/9 או 7/9?", hint: "המכנים שווים.", answer: "7/9 גדול יותר." },
    { question: "מי גדול יותר: 1/2 או 3/5?", hint: "אפשר להפוך למכנה 10.", answer: "1/2=5/10, 3/5=6/10, לכן 3/5 גדול יותר." },
    { question: "סדרו מהקטן לגדול: 1/4, 1/2, 3/4.", hint: "חשבו על רבעים.", answer: "1/4, 1/2, 3/4." },
  ],
  "fraction-operations": [
    { question: "פתרו: 2/7 + 3/7", hint: "מכנים שווים — מחברים מונים.", answer: "5/7." },
    { question: "פתרו: 3/4 × 2/5", hint: "מונה עם מונה, מכנה עם מכנה.", answer: "6/20 = 3/10." },
    { question: "פתרו: 2/3 ÷ 4/5", hint: "הופכים את השבר השני וכופלים.", answer: "2/3 × 5/4 = 10/12 = 5/6." },
  ],
  "improper-mixed": [
    { question: "הפכו את 11/4 למספר מעורב.", hint: "11÷4.", answer: "2 ושארית 3, לכן 2 ו־3/4." },
    { question: "הפכו את 3 ו־1/5 לשבר מדומה.", hint: "שלמים×מכנה + מונה.", answer: "3×5+1=16, לכן 16/5." },
    { question: "מה גדול יותר: 9/4 או 2?", hint: "9/4 הוא 2 ורבע.", answer: "9/4 גדול יותר מ־2." },
  ],
  "what-is-decimal": [
    { question: "כתבו את 0.7 כשבר.", hint: "ספרה אחת אחרי הנקודה = עשיריות.", answer: "7/10." },
    { question: "כתבו את 0.25 כשבר מוכר.", hint: "25 מאיות.", answer: "25/100 = 1/4." },
    { question: "מה גדול יותר: 0.6 או 0.56?", hint: "כתבו 0.6 בתור 0.60.", answer: "0.60 גדול מ־0.56, לכן 0.6 גדול יותר." },
  ],
  "decimal-operations": [
    { question: "פתרו: 3.4 + 2.15", hint: "יישרו נקודה מתחת לנקודה.", answer: "3.40+2.15=5.55." },
    { question: "פתרו: 7.2 - 3.85", hint: "כתבו 7.2 בתור 7.20.", answer: "7.20-3.85=3.35." },
    { question: "פתרו: 1.25 × 4", hint: "אפשר לחשוב על 1 ורבע כפול 4.", answer: "5." },
  ],
  "frac-decimal-percent": [
    { question: "כתבו 1/2 כעשרוני וכאחוז.", hint: "חצי מתוך 100 הוא 50.", answer: "1/2 = 0.5 = 50%." },
    { question: "כתבו 0.25 כאחוז וכשבר.", hint: "0.25 הוא 25 מאיות.", answer: "0.25 = 25% = 1/4." },
    { question: "איזה גדול יותר: 60% או 0.55?", hint: "הפכו לאותה שפה.", answer: "60% = 0.60, וזה גדול מ־0.55." },
  ],
  "what-is-percent": [
    { question: "כתבו 35% כשבר מתוך 100.", hint: "% פירושו מתוך 100.", answer: "35/100 = 7/20." },
    { question: "איזה אחוז הוא חצי?", hint: "חצי מ־100.", answer: "50%." },
    { question: "איזה אחוז הוא רבע?", hint: "100÷4.", answer: "25%." },
  ],
  "percent-of-number": [
    { question: "כמה הם 10% מתוך 90?", hint: "10% הם עשירית.", answer: "9." },
    { question: "כמה הם 25% מתוך 200?", hint: "25% הם רבע.", answer: "50." },
    { question: "כמה הם 12.5% מתוך 80?", hint: "12.5% הם שמינית.", answer: "10." },
  ],
  "discounts-increase": [
    { question: "מחיר 120 ₪, הנחה 25%. מה המחיר החדש?", hint: "25% הם רבע.", answer: "רבע מ־120 הוא 30. 120-30=90 ₪." },
    { question: "מחיר 80 ₪ עלה ב־10%. מה המחיר החדש?", hint: "10% מ־80 הם 8.", answer: "80+8=88 ₪." },
    { question: "מחיר ירד מ־200 ל־150. כמה שקלים ירדו ומה אחוז ההנחה?", hint: "ירידה של 50 מתוך 200.", answer: "ירדו 50 ₪. 50/200=25%." },
  ],
  "powers-basics": [
    { question: "חשבו: 2⁵", hint: "2 כפול עצמו 5 פעמים.", answer: "2×2×2×2×2=32." },
    { question: "חשבו: 4³", hint: "4×4×4.", answer: "64." },
    { question: "האם 3⁴ שווה 12? הסבירו.", hint: "חזקה היא לא בסיס כפול מעריך.", answer: "לא. 3⁴=3×3×3×3=81." },
  ],
  "squares-cubes": [
    { question: "שטח ריבוע שצלעו 8?", hint: "צלע².", answer: "8²=64." },
    { question: "נפח קובייה שצלעה 3?", hint: "צלע³.", answer: "3³=27." },
    { question: "מה גדול יותר: 5² או 3³?", hint: "חשבו כל אחד.", answer: "5²=25, 3³=27, לכן 3³ גדול יותר." },
  ],
  "roots-up-to-five": [
    { question: "מהו √64?", hint: "איזה מספר בריבוע נותן 64?", answer: "8." },
    { question: "מהו ∛125?", hint: "איזה מספר בחזקה שלישית נותן 125?", answer: "5, כי 5³=125." },
    { question: "מהו ⁵√32?", hint: "2 בחזקה חמישית.", answer: "2, כי 2⁵=32." },
  ],
  "powers-roots-patterns": [
    { question: "בין אילו שני מספרים נמצא √20?", hint: "4²=16 ו־5²=25.", answer: "בין 4 ל־5." },
    { question: "איזה שורש מתאים ל־81 אם התשובה היא 3?", hint: "3 באיזו חזקה נותן 81?", answer: "שורש רביעי, כי 3⁴=81." },
    { question: "סדרו: 2³, 2⁴, 2⁵", hint: "כל פעם מכפילים בעוד 2.", answer: "2³=8, 2⁴=16, 2⁵=32." },
  ],
};

function buildSmartQuestion(topic: Topic, level: Level, round: number): PracticeQuestion {
  const bank = topicQuestionBank[topic.id];
  if (bank?.length) {
    return bank[(levelIndex[level] + round) % bank.length];
  }

  const concept = topic.concepts[(round + levelIndex[level]) % topic.concepts.length] ?? topic.title;
  return {
    question: `צרו במחברת דוגמה קצרה לנושא "${topic.title}" שבה מופיע המושג "${concept}".`,
    hint: `התחילו מהנוסחה או מהכלל: ${topic.formula}`,
    answer: `בדקו שהדוגמה משתמשת נכון במושג "${concept}" ושהשלבים כתובים בצורה מסודרת.`,
  };
}

function SmartPractice({ topic }: { topic: Topic }) {
  const [level, setLevel] = useState<Level>("קל");
  const [round, setRound] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { progress, awardTopicStar } = useLearningProgress();
  const practice = useMemo(() => buildSmartQuestion(topic, level, round), [topic, level, round]);
  const hasPracticeStar = getTopicStars(progress, topic.id).includes("practice");

  return (
    <section className="comic-card p-5 md:p-6 bg-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-3 py-1 text-xs font-bold mb-2">
            🤖 פוקסי AI · מחולל תרגול חכם
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold">שאלה חדשה לפי הנושא</h2>
          <p className="text-sm text-muted-foreground mt-1">
            גרסה בטוחה ללא מפתחות API: השאלות נבנות מתוך בנק תרגול ותבניות לפי הנושא והרמה.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["קל", "בינוני", "אתגר"] as Level[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLevel(item);
                setShowAnswer(false);
              }}
              className={`comic-btn px-3 py-2 text-xs ${level === item ? "comic-btn-primary" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-foreground bg-sun/40 p-4 md:p-5">
        <p className="font-bold mb-2">השאלה:</p>
        <p className="text-lg leading-relaxed">{practice.question}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-4">
        <div className="rounded-2xl border-2 border-foreground bg-secondary/60 p-4">
          <p className="font-bold mb-1">רמז חשיבה</p>
          <p className="text-sm leading-relaxed">{practice.hint}</p>
        </div>
        <div className="rounded-2xl border-2 border-foreground bg-card p-4">
          <p className="font-bold mb-1">פתרון / בדיקה</p>
          {showAnswer ? (
            <p className="text-sm leading-relaxed">{practice.answer}</p>
          ) : (
            <p className="text-sm text-muted-foreground">נסו קודם לבד, ואז פתחו פתרון.</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="comic-btn comic-btn-accent" onClick={() => setShowAnswer((value) => !value)}>
          {showAnswer ? "הסתר פתרון" : "הצג פתרון"}
        </button>
        <button
          type="button"
          className="comic-btn"
          onClick={() => {
            setRound((value) => value + 1);
            setShowAnswer(false);
          }}
        >
          שאלה חדשה ✨
        </button>
        <button
          type="button"
          className={`comic-btn ${hasPracticeStar ? "comic-btn-primary" : ""}`}
          onClick={() => awardTopicStar(topic.id, "practice")}
        >
          {hasPracticeStar ? "⭐ כוכב תרגול נשמר" : "סיימתי תרגול ⭐"}
        </button>
      </div>
    </section>
  );
}


type ComicFrame = {
  title: string;
  prompt: string;
};

type ComicMissionData = {
  title: string;
  setup: string;
  frames: ComicFrame[];
  dataPrompt: string;
  calculationPrompt: string;
};

function buildComicMission(topic: Topic, variant: number): ComicMissionData {
  const mainConcept = topic.concepts[variant % topic.concepts.length] ?? topic.title;

  if (topic.id === "sphere-area-volume") {
    const radius = [2, 3, 4][variant % 3];
    return {
      title: "כדור־על של גיבור ופוקסי הבלש",
      setup: `ציירו קומיקס קצר שבו פוקסי עוזר לגיבור למדוד כדור־על. הרדיוס הוא ${radius} ס״מ, ומשתמשים ב־π=3 כדי לחשב בקלות.`,
      frames: [
        { title: "פריים 1 — הכדור החמקמק", prompt: "ציירו גיבור שמחזיק כדור־על עגול. פוקסי אומר: ‘כדור הוא חמקמק — אין לו פינות!’" },
        { title: "פריים 2 — מציאת הרדיוס", prompt: `ציירו קו מהמרכז לקצה. פוקסי אומר: ‘זה הרדיוס: r=${radius}’.` },
        { title: "פריים 3 — בחירת נוסחה", prompt: "פוקסי בוחר: שטח פנים הוא המעטפת, נפח הוא המקום בפנים. כאן מחשבים נפח: 4/3 × π × r³." },
        { title: "פריים 4 — רגע הניצחון", prompt: "כתבו את החישוב ואת התשובה בתוך בועת קומיקס גדולה." },
      ],
      dataPrompt: `נתון: רדיוס הכדור r=${radius}, משתמשים ב־π=3.`,
      calculationPrompt: `נפח = 4/3 × 3 × ${radius}³`,
    };
  }

  if (topic.category === "percentages") {
    const percent = [10, 20, 25][variant % 3];
    return {
      title: "חנות הקומיקס של פוקסי",
      setup: `ציירו סיפור קצר שבו פוקסי מוצא הנחה של ${percent}% וצריך להסביר איך מחשבים אותה.`,
      frames: [
        { title: "פריים 1 — שלט ההנחה", prompt: `ציירו שלט גדול: ${percent}% הנחה!` },
        { title: "פריים 2 — מהו אחוז?", prompt: "פוקסי מסביר שאחוז הוא חלק מתוך 100." },
        { title: "פריים 3 — החישוב", prompt: "כתבו מחיר מקורי, חשבו את ההנחה, ואז מצאו מחיר חדש." },
        { title: "פריים 4 — בדיקת היגיון", prompt: "פוקסי בודק: האם המחיר ירד ולא עלה?" },
      ],
      dataPrompt: `בחרו מחיר מקורי וחשבו ${percent}% ממנו.`,
      calculationPrompt: `הנחה = מחיר × ${percent}/100`,
    };
  }

  if (topic.category === "powers") {
    const base = [2, 3, 4][variant % 3];
    const power = [2, 3, 5][variant % 3];
    return {
      title: "מכונת החזקות של פוקסי",
      setup: `ציירו מכונה קומיקסית שמכפילה את ${base} בעצמו ${power} פעמים.`,
      frames: [
        { title: "פריים 1 — המכונה נדלקת", prompt: `פוקסי מכניס את המספר ${base} למכונת החזקות.` },
        { title: "פריים 2 — לא מתבלבלים", prompt: `פוקסי מזהיר: ${base} בחזקת ${power} זה לא ${base}×${power}.` },
        { title: "פריים 3 — כפל חוזר", prompt: "כתבו את הכפל החוזר בתוך ענן מחשבה." },
        { title: "פריים 4 — התוצאה", prompt: "הציגו את התוצאה כמו אפקט קומיקס: בום!" },
      ],
      dataPrompt: `נתון: בסיס ${base}, מעריך ${power}.`,
      calculationPrompt: `${base}^${power} = ${Array(power).fill(base).join(" × ")}`,
    };
  }

  return {
    title: `פוקסי מסביר: ${topic.title}`,
    setup: `ציירו קומיקס קצר שבו פוקסי עוזר לחבר להבין את המושג "${mainConcept}" מתוך הנושא ${topic.title}.`,
    frames: [
      { title: "פריים 1 — הבעיה", prompt: `דמות מתבלבלת בנושא ${topic.title}.` },
      { title: "פריים 2 — פוקסי מגיע", prompt: `פוקסי מסביר את המושג "${mainConcept}" במילים פשוטות.` },
      { title: "פריים 3 — דוגמה", prompt: "כתבו דוגמה מספרית קצרה או ציור שממחיש את הרעיון." },
      { title: "פריים 4 — הבנתי!", prompt: "הדמות מסכמת את הכלל במילים שלה." },
    ],
    dataPrompt: `בחרו מספרים פשוטים שמתאימים לנושא: ${topic.title}.`,
    calculationPrompt: topic.formula,
  };
}

function ComicMission({ topic }: { topic: Topic }) {
  const [variant, setVariant] = useState(0);
  const [comicTitle, setComicTitle] = useState("");
  const [heroName, setHeroName] = useState("פוקסי");
  const [frameTexts, setFrameTexts] = useState(["", "", "", ""]);
  const [dataText, setDataText] = useState("");
  const [calculationText, setCalculationText] = useState("");
  const { progress, awardTopicStar } = useLearningProgress();
  const mission = useMemo(() => buildComicMission(topic, variant), [topic, variant]);
  const hasComicStar = getTopicStars(progress, topic.id).includes("comic");

  const updateFrame = (index: number, value: string) => {
    setFrameTexts((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const fillWithFoxyAI = () => {
    setComicTitle(mission.title);
    setHeroName(topic.id === "sphere-area-volume" ? "גיבור הכדור" : "פוקסי");
    setDataText(mission.dataPrompt);
    setCalculationText(mission.calculationPrompt);
    setFrameTexts(mission.frames.map((frame) => frame.prompt));
  };

  return (
    <section className="comic-card p-5 md:p-6 bg-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-sun px-3 py-1 text-xs font-bold mb-2">
            🎨 משימת קומיקס + יוצר קומיקס
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold">הופכים את המתמטיקה לסיפור</h2>
          <p className="text-sm text-muted-foreground mt-1">
            שלב 1: מציירים במחברת · שלב 2: ממלאים תסריט באתר · שלב 3: פוקסי AI מקומי מציע רעיון.
          </p>
        </div>
        <button
          type="button"
          className="comic-btn comic-btn-accent text-sm"
          onClick={() => {
            setVariant((value) => value + 1);
            setFrameTexts(["", "", "", ""]);
            setDataText("");
            setCalculationText("");
          }}
        >
          רעיון אחר ✨
        </button>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-foreground bg-sun/40 p-4 mb-4">
        <p className="font-bold mb-2">משימה לציור במחברת</p>
        <p className="leading-relaxed">{mission.setup}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-4">
        {mission.frames.map((frame, index) => (
          <div key={frame.title} className="rounded-2xl border-2 border-foreground bg-secondary/50 p-4">
            <p className="font-bold mb-1">{frame.title}</p>
            <p className="text-sm leading-relaxed">{frame.prompt}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-lg font-bold">יוצר קומיקס אינטראקטיבי</h3>
          <button type="button" className="comic-btn text-sm" onClick={fillWithFoxyAI}>
            🤖 פוקסי AI מלא לי רעיון
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mb-4">
          <label className="text-sm font-semibold">
            שם הקומיקס
            <input
              value={comicTitle}
              onChange={(event) => setComicTitle(event.target.value)}
              placeholder="לדוגמה: כדור־העל של פוקסי"
              className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold">
            שם הגיבור/ה
            <input
              value={heroName}
              onChange={(event) => setHeroName(event.target.value)}
              placeholder="פוקסי / גיבורת האחוזים"
              className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {mission.frames.map((frame, index) => (
            <label key={frame.title} className="text-sm font-semibold">
              מה קורה בפריים {index + 1}?
              <textarea
                value={frameTexts[index]}
                onChange={(event) => updateFrame(index, event.target.value)}
                placeholder={frame.prompt}
                className="mt-1 min-h-24 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm leading-relaxed"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-4">
          <label className="text-sm font-semibold">
            נתונים מתמטיים
            <textarea
              value={dataText}
              onChange={(event) => setDataText(event.target.value)}
              placeholder={mission.dataPrompt}
              className="mt-1 min-h-20 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm leading-relaxed"
            />
          </label>
          <label className="text-sm font-semibold">
            חישוב ותשובה
            <textarea
              value={calculationText}
              onChange={(event) => setCalculationText(event.target.value)}
              placeholder={mission.calculationPrompt}
              className="mt-1 min-h-20 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm leading-relaxed"
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-foreground bg-muted p-4">
          <p className="font-bold mb-2">תצוגת סיכום</p>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {comicTitle || mission.title} · גיבור/ה: {heroName || "פוקסי"}
            {"\n"}
            {frameTexts.map((text, index) => `פריים ${index + 1}: ${text || mission.frames[index].prompt}`).join("\n")}
            {"\n"}
            נתונים: {dataText || mission.dataPrompt}
            {"\n"}
            חישוב: {calculationText || mission.calculationPrompt}
          </p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className={`comic-btn ${hasComicStar ? "comic-btn-primary" : ""}`}
            onClick={() => awardTopicStar(topic.id, "comic")}
          >
            {hasComicStar ? "⭐ כוכב קומיקס נשמר" : "סיימתי משימת קומיקס ⭐"}
          </button>
        </div>
      </div>
    </section>
  );
}

type LogicAnswer = { ok: boolean; result: string; explanation: string };

type LogicTask = {
  title: string;
  story: string;
  inputs: { key: string; label: string; value: number; unit?: string }[];
  conditionLabel: string;
  operationLabel: string;
  answerPrompt: string;
  expectedHint: string;
  solve: (values: Record<string, number>) => LogicAnswer;
};

function fmt(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "לא מספר";
  const rounded = Number(value.toFixed(digits));
  return String(rounded);
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[٪%]/g, "%")
    .replace(/[–—]/g, "-")
    .replace(/٫/g, ".");
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function parseFractionText(value: string) {
  const normalized = normalizeAnswer(value);
  const match = normalized.match(/^(-?\d+)\/(-?\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return { numerator, denominator };
}

function simplifyFraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor, divisor };
}

function checkAnswerMatch(userAnswer: string, expected: string) {
  const user = normalizeAnswer(userAnswer);
  const exp = normalizeAnswer(expected);
  if (user === exp) return { ok: true, note: "התשובה זהה לתוצאה שחושבה." };

  const userFraction = parseFractionText(userAnswer);
  const expectedFraction = parseFractionText(expected);
  if (userFraction && expectedFraction) {
    const sameValue = userFraction.numerator * expectedFraction.denominator === expectedFraction.numerator * userFraction.denominator;
    if (sameValue) {
      const simplifiedExpected = simplifyFraction(expectedFraction.numerator, expectedFraction.denominator);
      const simplifiedUser = simplifyFraction(userFraction.numerator, userFraction.denominator);
      const reduced = `${simplifiedExpected.numerator}/${simplifiedExpected.denominator}`;
      return {
        ok: true,
        note: `נכון — אלה שברים שקולים. ${expected} מצטמצם ל־${reduced} כי מחלקים מונה ומכנה ב־${simplifiedExpected.divisor}. גם ${userAnswer} מייצג את אותו חלק: ${simplifiedUser.numerator}/${simplifiedUser.denominator}.`,
      };
    }
  }

  const userNum = Number(user.replace("%", ""));
  const expNum = Number(exp.replace("%", ""));
  if (Number.isFinite(userNum) && Number.isFinite(expNum) && Math.abs(userNum - expNum) < 0.01) {
    return { ok: true, note: "נכון — הערך המספרי תואם לתוצאה." };
  }

  return { ok: false, note: "התשובה אינה תואמת לתוצאה שחושבה." };
}

const topicLogicTasks: Record<string, LogicTask> = {
  polygons: {
    title: "מצולעים ב־Blockly",
    story: "צורה סגורה עם 5 קווים ישרים. האם היא מצולע?",
    inputs: [{ key: "sides", label: "מספר צלעות", value: 5 }, { key: "closed", label: "סגור? 1=כן 0=לא", value: 1 }],
    conditionLabel: "אם הצורה סגורה ויש לפחות 3 צלעות",
    operationLabel: "בדוק: צורה סגורה + קווים ישרים + לפחות 3 צלעות",
    answerPrompt: "כתוב כן או לא",
    expectedHint: "התשובה הצפויה: כן",
    solve: (v) => v.closed === 1 && v.sides >= 3
      ? { ok: true, result: "כן", explanation: `יש ${v.sides} צלעות והצורה סגורה, לכן זה מצולע.` }
      : { ok: false, result: "לא", explanation: "מצולע חייב להיות סגור ובעל לפחות 3 צלעות ישרות." },
  },
  "triangles-types": {
    title: "סוגי משולשים ב־Blockly",
    story: "במשולש שתי זוויות הן 50° ו־60°. חשבו את הזווית השלישית.",
    inputs: [{ key: "a", label: "זווית א", value: 50 }, { key: "b", label: "זווית ב", value: 60 }],
    conditionLabel: "אם סכום שתי הזוויות קטן מ־180",
    operationLabel: "זווית שלישית = 180 - זווית א - זווית ב",
    answerPrompt: "כתוב זווית שלישית",
    expectedHint: "התשובה הצפויה: 70",
    solve: (v) => v.a + v.b < 180
      ? { ok: true, result: fmt(180 - v.a - v.b), explanation: `180-${v.a}-${v.b}=${fmt(180 - v.a - v.b)}°.` }
      : { ok: false, result: "שגיאה", explanation: "סכום שתי זוויות במשולש חייב להיות קטן מ־180°." },
  },
  angles: {
    title: "זוויות ב־Blockly",
    story: "שתי זוויות יוצרות יחד זווית שטוחה. אחת היא 65°. חשבו את השנייה.",
    inputs: [{ key: "known", label: "זווית ידועה", value: 65 }, { key: "straight", label: "זווית שטוחה", value: 180 }],
    conditionLabel: "אם הזווית הידועה קטנה מזווית שטוחה",
    operationLabel: "זווית חסרה = 180 - זווית ידועה",
    answerPrompt: "כתוב זווית חסרה",
    expectedHint: "התשובה הצפויה: 115",
    solve: (v) => v.known < v.straight
      ? { ok: true, result: fmt(v.straight - v.known), explanation: `${v.straight}-${v.known}=${fmt(v.straight - v.known)}°.` }
      : { ok: false, result: "שגיאה", explanation: "הזווית הידועה לא יכולה להיות גדולה או שווה לזווית השטוחה." },
  },
  quadrilaterals: {
    title: "מרובעים ב־Blockly",
    story: "במרובע שלוש זוויות הן 90°, 80°, 100°. חשבו את הרביעית.",
    inputs: [{ key: "a", label: "זווית א", value: 90 }, { key: "b", label: "זווית ב", value: 80 }, { key: "c", label: "זווית ג", value: 100 }],
    conditionLabel: "אם סכום שלוש הזוויות קטן מ־360",
    operationLabel: "זווית רביעית = 360 - סכום הזוויות",
    answerPrompt: "כתוב זווית רביעית",
    expectedHint: "התשובה הצפויה: 90",
    solve: (v) => v.a + v.b + v.c < 360
      ? { ok: true, result: fmt(360 - v.a - v.b - v.c), explanation: `360-${v.a}-${v.b}-${v.c}=${fmt(360 - v.a - v.b - v.c)}°.` }
      : { ok: false, result: "שגיאה", explanation: "סכום שלוש הזוויות כבר מגיע ל־360 או יותר." },
  },
  "perimeter-polygons": {
    title: "היקף מצולעים ב־Blockly",
    story: "למצולע 4 צלעות: 4, 4, 5, 7 ס״מ. חשבו היקף.",
    inputs: [{ key: "a", label: "צלע א", value: 4 }, { key: "b", label: "צלע ב", value: 4 }, { key: "c", label: "צלע ג", value: 5 }, { key: "d", label: "צלע ד", value: 7 }],
    conditionLabel: "אם כל הצלעות גדולות מ־0",
    operationLabel: "היקף = סכום כל הצלעות",
    answerPrompt: "כתוב היקף",
    expectedHint: "התשובה הצפויה: 20",
    solve: (v) => [v.a, v.b, v.c, v.d].every((x) => x > 0)
      ? { ok: true, result: fmt(v.a + v.b + v.c + v.d), explanation: `${v.a}+${v.b}+${v.c}+${v.d}=${fmt(v.a + v.b + v.c + v.d)}.` }
      : { ok: false, result: "שגיאה", explanation: "אורך צלע חייב להיות חיובי." },
  },
  "rect-area": {
    title: "שטח מלבן ב־Blockly",
    story: "מלבן באורך 9 וברוחב 4. חשבו שטח.",
    inputs: [{ key: "length", label: "אורך", value: 9 }, { key: "width", label: "רוחב", value: 4 }],
    conditionLabel: "אם אורך ורוחב גדולים מ־0",
    operationLabel: "שטח = אורך × רוחב",
    answerPrompt: "כתוב שטח",
    expectedHint: "התשובה הצפויה: 36",
    solve: (v) => v.length > 0 && v.width > 0
      ? { ok: true, result: fmt(v.length * v.width), explanation: `${v.length}×${v.width}=${fmt(v.length * v.width)}.` }
      : { ok: false, result: "שגיאה", explanation: "אורך ורוחב חייבים להיות חיוביים." },
  },
  "triangle-area": {
    title: "שטח משולש ב־Blockly",
    story: "בסיס משולש 12 וגובה 5. חשבו שטח.",
    inputs: [{ key: "base", label: "בסיס", value: 12 }, { key: "height", label: "גובה", value: 5 }],
    conditionLabel: "אם בסיס וגובה גדולים מ־0",
    operationLabel: "שטח = בסיס × גובה ÷ 2",
    answerPrompt: "כתוב שטח",
    expectedHint: "התשובה הצפויה: 30",
    solve: (v) => v.base > 0 && v.height > 0
      ? { ok: true, result: fmt((v.base * v.height) / 2), explanation: `${v.base}×${v.height}÷2=${fmt((v.base * v.height) / 2)}.` }
      : { ok: false, result: "שגיאה", explanation: "בסיס וגובה חייבים להיות חיוביים." },
  },
  "parallelogram-trapezoid-area": {
    title: "שטח טרפז ב־Blockly",
    story: "טרפז עם בסיסים 5 ו־11 וגובה 4. חשבו שטח.",
    inputs: [{ key: "b1", label: "בסיס 1", value: 5 }, { key: "b2", label: "בסיס 2", value: 11 }, { key: "h", label: "גובה", value: 4 }],
    conditionLabel: "אם שני הבסיסים והגובה גדולים מ־0",
    operationLabel: "שטח = (בסיס 1 + בסיס 2) × גובה ÷ 2",
    answerPrompt: "כתוב שטח",
    expectedHint: "התשובה הצפויה: 32",
    solve: (v) => v.b1 > 0 && v.b2 > 0 && v.h > 0
      ? { ok: true, result: fmt(((v.b1 + v.b2) * v.h) / 2), explanation: `(${v.b1}+${v.b2})×${v.h}÷2=${fmt(((v.b1 + v.b2) * v.h) / 2)}.` }
      : { ok: false, result: "שגיאה", explanation: "בסיסים וגובה חייבים להיות חיוביים." },
  },
  "circle-area-circumference": {
    title: "מעגל ב־Blockly",
    story: "רדיוס מעגל 4, נשתמש ב־π=3. חשבו היקף.",
    inputs: [{ key: "r", label: "רדיוס", value: 4 }, { key: "pi", label: "פאי", value: 3 }],
    conditionLabel: "אם הרדיוס גדול מ־0",
    operationLabel: "היקף = 2 × π × רדיוס",
    answerPrompt: "כתוב היקף",
    expectedHint: "התשובה הצפויה: 24",
    solve: (v) => v.r > 0
      ? { ok: true, result: fmt(2 * v.pi * v.r), explanation: `2×${v.pi}×${v.r}=${fmt(2 * v.pi * v.r)}.` }
      : { ok: false, result: "שגיאה", explanation: "רדיוס חייב להיות חיובי." },
  },
  height: {
    title: "גובה בצורה ב־Blockly",
    story: "קו יורד לבסיס בזווית 90°. האם הוא גובה?",
    inputs: [{ key: "angle", label: "זווית עם הבסיס", value: 90 }],
    conditionLabel: "אם הזווית שווה 90",
    operationLabel: "בדוק אם הקו מאונך לבסיס",
    answerPrompt: "כתוב כן או לא",
    expectedHint: "התשובה הצפויה: כן",
    solve: (v) => v.angle === 90
      ? { ok: true, result: "כן", explanation: "גובה חייב להיות מאונך לבסיס, כלומר 90°." }
      : { ok: false, result: "לא", explanation: "אם הזווית אינה 90°, זה לא גובה." },
  },
  "solid-volume": {
    title: "נפח תיבה ב־Blockly",
    story: "תיבה: אורך 4, רוחב 3, גובה 5. חשבו נפח.",
    inputs: [{ key: "l", label: "אורך", value: 4 }, { key: "w", label: "רוחב", value: 3 }, { key: "h", label: "גובה", value: 5 }],
    conditionLabel: "אם שלושת הממדים גדולים מ־0",
    operationLabel: "נפח = אורך × רוחב × גובה",
    answerPrompt: "כתוב נפח",
    expectedHint: "התשובה הצפויה: 60",
    solve: (v) => v.l > 0 && v.w > 0 && v.h > 0
      ? { ok: true, result: fmt(v.l * v.w * v.h), explanation: `${v.l}×${v.w}×${v.h}=${fmt(v.l * v.w * v.h)}.` }
      : { ok: false, result: "שגיאה", explanation: "כל הממדים חייבים להיות חיוביים." },
  },
  "cylinder-cone-volume": {
    title: "נפח חרוט ב־Blockly",
    story: "חרוט עם שטח בסיס 18 וגובה 6. חשבו נפח.",
    inputs: [{ key: "baseArea", label: "שטח בסיס", value: 18 }, { key: "h", label: "גובה", value: 6 }],
    conditionLabel: "אם שטח בסיס וגובה גדולים מ־0",
    operationLabel: "נפח חרוט = שטח בסיס × גובה ÷ 3",
    answerPrompt: "כתוב נפח",
    expectedHint: "התשובה הצפויה: 36",
    solve: (v) => v.baseArea > 0 && v.h > 0
      ? { ok: true, result: fmt((v.baseArea * v.h) / 3), explanation: `${v.baseArea}×${v.h}÷3=${fmt((v.baseArea * v.h) / 3)}.` }
      : { ok: false, result: "שגיאה", explanation: "שטח בסיס וגובה חייבים להיות חיוביים." },
  },
  "sphere-area-volume": {
    title: "נפח כדור ב־Blockly",
    story: "כדור ברדיוס 3, נשתמש ב־π=3. חשבו נפח.",
    inputs: [{ key: "r", label: "רדיוס", value: 3 }, { key: "pi", label: "פאי", value: 3 }],
    conditionLabel: "אם הרדיוס גדול מ־0",
    operationLabel: "נפח = 4 ÷ 3 × π × r³",
    answerPrompt: "כתוב נפח",
    expectedHint: "התשובה הצפויה: 108",
    solve: (v) => v.r > 0
      ? { ok: true, result: fmt((4 / 3) * v.pi * Math.pow(v.r, 3)), explanation: `4÷3×${v.pi}×${v.r}³=${fmt((4 / 3) * v.pi * Math.pow(v.r, 3))}.` }
      : { ok: false, result: "שגיאה", explanation: "רדיוס חייב להיות חיובי." },
  },
  "what-is-fraction": {
    title: "מהו שבר ב־Blockly",
    story: "צבעו 3 מתוך 8 חלקים שווים. איזה שבר התקבל?",
    inputs: [{ key: "parts", label: "חלקים צבועים", value: 3 }, { key: "whole", label: "כל החלקים", value: 8 }],
    conditionLabel: "אם כל החלקים גדול מ־0 והצבועים לא עוברים אותו",
    operationLabel: "שבר = חלקים צבועים / כל החלקים",
    answerPrompt: "כתוב שבר",
    expectedHint: "התשובה הצפויה: 3/8",
    solve: (v) => v.whole > 0 && v.parts >= 0 && v.parts <= v.whole
      ? { ok: true, result: `${v.parts}/${v.whole}`, explanation: `מונה=${v.parts}, מכנה=${v.whole}.` }
      : { ok: false, result: "שגיאה", explanation: "מספר החלקים הצבועים חייב להיות בין 0 לבין כל החלקים." },
  },
  "equal-fractions": {
    title: "שברים שווים ב־Blockly",
    story: "הרחיבו את 2/3 פי 4.",
    inputs: [{ key: "n", label: "מונה", value: 2 }, { key: "d", label: "מכנה", value: 3 }, { key: "k", label: "פי", value: 4 }],
    conditionLabel: "אם המכנה והגורם גדולים מ־0",
    operationLabel: "שבר מורחב = מונה×פי / מכנה×פי",
    answerPrompt: "כתוב שבר מורחב",
    expectedHint: "התשובה הצפויה: 8/12",
    solve: (v) => v.d > 0 && v.k > 0
      ? { ok: true, result: `${v.n * v.k}/${v.d * v.k}`, explanation: `${v.n}×${v.k}/${v.d}×${v.k}=${v.n * v.k}/${v.d * v.k}.` }
      : { ok: false, result: "שגיאה", explanation: "מכנה וגורם הרחבה חייבים להיות חיוביים." },
  },
  "compare-fractions": {
    title: "השוואת שברים ב־Blockly",
    story: "מי גדול יותר: 4/9 או 7/9?",
    inputs: [{ key: "n1", label: "מונה א", value: 4 }, { key: "d1", label: "מכנה א", value: 9 }, { key: "n2", label: "מונה ב", value: 7 }, { key: "d2", label: "מכנה ב", value: 9 }],
    conditionLabel: "אם המכנים שווים",
    operationLabel: "השווה מונים בלבד",
    answerPrompt: "כתוב את השבר הגדול",
    expectedHint: "התשובה הצפויה: 7/9",
    solve: (v) => v.d1 === v.d2
      ? { ok: true, result: v.n1 > v.n2 ? `${v.n1}/${v.d1}` : `${v.n2}/${v.d2}`, explanation: `המכנים שווים, לכן משווים ${v.n1} מול ${v.n2}.` }
      : { ok: false, result: "צריך מכנה משותף", explanation: "בדמו הזה משווים ישירות רק כשמכנים שווים." },
  },
  "fraction-operations": {
    title: "חיבור שברים ב־Blockly",
    story: "פתרו: 2/7 + 3/7.",
    inputs: [{ key: "n1", label: "מונה א", value: 2 }, { key: "d1", label: "מכנה א", value: 7 }, { key: "n2", label: "מונה ב", value: 3 }, { key: "d2", label: "מכנה ב", value: 7 }],
    conditionLabel: "אם המכנים שווים",
    operationLabel: "מונה תוצאה = מונה א + מונה ב; המכנה נשאר",
    answerPrompt: "כתוב תוצאת חיבור",
    expectedHint: "התשובה הצפויה: 5/7",
    solve: (v) => v.d1 === v.d2
      ? { ok: true, result: `${v.n1 + v.n2}/${v.d1}`, explanation: `${v.n1}+${v.n2}=${v.n1 + v.n2}; המכנה נשאר ${v.d1}.` }
      : { ok: false, result: "צריך מכנה משותף", explanation: "אי אפשר לחבר ישר אם המכנים שונים." },
  },
  "improper-mixed": {
    title: "שבר מדומה ב־Blockly",
    story: "הפכו את 3 ו־1/5 לשבר מדומה.",
    inputs: [{ key: "whole", label: "שלמים", value: 3 }, { key: "n", label: "מונה", value: 1 }, { key: "d", label: "מכנה", value: 5 }],
    conditionLabel: "אם המכנה גדול מ־0",
    operationLabel: "מונה חדש = שלמים×מכנה + מונה",
    answerPrompt: "כתוב שבר מדומה",
    expectedHint: "התשובה הצפויה: 16/5",
    solve: (v) => v.d > 0
      ? { ok: true, result: `${v.whole * v.d + v.n}/${v.d}`, explanation: `${v.whole}×${v.d}+${v.n}=${v.whole * v.d + v.n}.` }
      : { ok: false, result: "שגיאה", explanation: "מכנה חייב להיות גדול מ־0." },
  },
  "what-is-decimal": {
    title: "עשרוני לשבר ב־Blockly",
    story: "כתבו 0.7 כשבר.",
    inputs: [{ key: "tenths", label: "עשיריות", value: 7 }, { key: "den", label: "מכנה עשיריות", value: 10 }],
    conditionLabel: "אם מספר העשיריות בין 0 ל־9",
    operationLabel: "שבר = עשיריות / 10",
    answerPrompt: "כתוב שבר",
    expectedHint: "התשובה הצפויה: 7/10",
    solve: (v) => v.tenths >= 0 && v.tenths <= 9 && v.den === 10
      ? { ok: true, result: `${v.tenths}/10`, explanation: `0.${v.tenths} הוא ${v.tenths}/10.` }
      : { ok: false, result: "שגיאה", explanation: "בדמו הזה עובדים עם ספרת עשיריות אחת ומכנה 10." },
  },
  "decimal-operations": {
    title: "חיבור עשרוניים ב־Blockly",
    story: "פתרו: 3.4 + 2.15.",
    inputs: [{ key: "a", label: "מספר א", value: 3.4 }, { key: "b", label: "מספר ב", value: 2.15 }],
    conditionLabel: "אם שני הערכים הם מספרים",
    operationLabel: "תוצאה = מספר א + מספר ב",
    answerPrompt: "כתוב תוצאה",
    expectedHint: "התשובה הצפויה: 5.55",
    solve: (v) => ({ ok: true, result: fmt(v.a + v.b), explanation: `${v.a}+${v.b}=${fmt(v.a + v.b)}.` }),
  },
  "frac-decimal-percent": {
    title: "מעבר לאחוזים ב־Blockly",
    story: "הפכו 0.25 לאחוז.",
    inputs: [{ key: "decimal", label: "מספר עשרוני", value: 0.25 }, { key: "factor", label: "כופלים ב", value: 100 }],
    conditionLabel: "אם המספר בין 0 ל־1",
    operationLabel: "אחוז = עשרוני × 100",
    answerPrompt: "כתוב אחוז עם %",
    expectedHint: "התשובה הצפויה: 25%",
    solve: (v) => v.decimal >= 0 && v.decimal <= 1
      ? { ok: true, result: `${fmt(v.decimal * v.factor)}%`, explanation: `${v.decimal}×${v.factor}=${fmt(v.decimal * v.factor)}%.` }
      : { ok: false, result: "שגיאה", explanation: "עשרוני שמייצג חלק מהשלם צריך להיות בין 0 ל־1." },
  },
  "what-is-percent": {
    title: "מהו אחוז ב־Blockly",
    story: "כתבו 35% כשבר מתוך 100.",
    inputs: [{ key: "percent", label: "אחוז", value: 35 }, { key: "hundred", label: "מתוך", value: 100 }],
    conditionLabel: "אם האחוז בין 0 ל־100",
    operationLabel: "שבר = אחוז / 100",
    answerPrompt: "כתוב שבר מתוך 100",
    expectedHint: "התשובה הצפויה: 35/100",
    solve: (v) => v.percent >= 0 && v.percent <= 100
      ? { ok: true, result: `${v.percent}/${v.hundred}`, explanation: `${v.percent}% פירושו ${v.percent} מתוך ${v.hundred}.` }
      : { ok: false, result: "שגיאה", explanation: "אחוז בסיסי צריך להיות בין 0 ל־100." },
  },
  "percent-of-number": {
    title: "אחוז מתוך מספר ב־Blockly",
    story: "כמה הם 25% מתוך 200?",
    inputs: [{ key: "percent", label: "אחוז", value: 25 }, { key: "base", label: "מספר", value: 200 }],
    conditionLabel: "אם אחוז ומספר אינם שליליים",
    operationLabel: "ערך = מספר × אחוז ÷ 100",
    answerPrompt: "כתוב ערך",
    expectedHint: "התשובה הצפויה: 50",
    solve: (v) => v.percent >= 0 && v.base >= 0
      ? { ok: true, result: fmt((v.base * v.percent) / 100), explanation: `${v.base}×${v.percent}÷100=${fmt((v.base * v.percent) / 100)}.` }
      : { ok: false, result: "שגיאה", explanation: "אחוז ומספר לא יכולים להיות שליליים בדמו הזה." },
  },
  "discounts-increase": {
    title: "הנחה ב־Blockly",
    story: "מחיר 120 ₪, הנחה 25%. מה המחיר החדש?",
    inputs: [{ key: "price", label: "מחיר", value: 120 }, { key: "discount", label: "הנחה %", value: 25 }],
    conditionLabel: "אם ההנחה בין 0 ל־100",
    operationLabel: "מחיר חדש = מחיר - מחיר×הנחה÷100",
    answerPrompt: "כתוב מחיר חדש",
    expectedHint: "התשובה הצפויה: 90",
    solve: (v) => v.discount >= 0 && v.discount <= 100
      ? { ok: true, result: fmt(v.price - (v.price * v.discount) / 100), explanation: `ההנחה היא ${fmt((v.price * v.discount) / 100)}, לכן ${v.price}-${fmt((v.price * v.discount) / 100)}=${fmt(v.price - (v.price * v.discount) / 100)}.` }
      : { ok: false, result: "שגיאה", explanation: "הנחה צריכה להיות בין 0 ל־100%." },
  },
  "powers-basics": {
    title: "חזקות ב־Blockly",
    story: "חשבו 2⁵.",
    inputs: [{ key: "base", label: "בסיס", value: 2 }, { key: "exp", label: "מעריך", value: 5 }],
    conditionLabel: "אם המעריך בין 2 ל־5",
    operationLabel: "תוצאה = בסיס בחזקת מעריך",
    answerPrompt: "כתוב תוצאה",
    expectedHint: "התשובה הצפויה: 32",
    solve: (v) => v.exp >= 2 && v.exp <= 5
      ? { ok: true, result: fmt(Math.pow(v.base, v.exp), 0), explanation: `${v.base}^${v.exp}=${fmt(Math.pow(v.base, v.exp), 0)}.` }
      : { ok: false, result: "שגיאה", explanation: "המעריך צריך להיות בין 2 ל־5." },
  },
  "squares-cubes": {
    title: "ריבועים וקוביות ב־Blockly",
    story: "נפח קובייה שצלעה 3. חשבו נפח.",
    inputs: [{ key: "side", label: "צלע", value: 3 }, { key: "exp", label: "חזקה", value: 3 }],
    conditionLabel: "אם הצלע חיובית והחזקה היא 3",
    operationLabel: "נפח קובייה = צלע³",
    answerPrompt: "כתוב נפח",
    expectedHint: "התשובה הצפויה: 27",
    solve: (v) => v.side > 0 && v.exp === 3
      ? { ok: true, result: fmt(Math.pow(v.side, 3), 0), explanation: `${v.side}³=${fmt(Math.pow(v.side, 3), 0)}.` }
      : { ok: false, result: "שגיאה", explanation: "נפח קובייה משתמש בחזקה שלישית וצלע חיובית." },
  },
  "roots-up-to-five": {
    title: "שורשים ב־Blockly",
    story: "מהו ∛125?",
    inputs: [{ key: "value", label: "מספר", value: 125 }, { key: "root", label: "דרגת שורש", value: 3 }],
    conditionLabel: "אם דרגת השורש בין 2 ל־5",
    operationLabel: "מצא מספר שבחזקה הזו נותן את המספר",
    answerPrompt: "כתוב שורש",
    expectedHint: "התשובה הצפויה: 5",
    solve: (v) => v.root >= 2 && v.root <= 5
      ? { ok: true, result: fmt(Math.pow(v.value, 1 / v.root), 0), explanation: `${fmt(Math.pow(v.value, 1 / v.root), 0)}^${v.root}=${v.value}.` }
      : { ok: false, result: "שגיאה", explanation: "דרגת השורש צריכה להיות בין 2 ל־5." },
  },
  "powers-roots-patterns": {
    title: "דפוסים בחזקות ב־Blockly",
    story: "סדרו את התוצאה של 2³. מה הערך?",
    inputs: [{ key: "base", label: "בסיס", value: 2 }, { key: "exp", label: "מעריך", value: 3 }],
    conditionLabel: "אם הבסיס חיובי והמעריך בין 2 ל־5",
    operationLabel: "תוצאה = בסיס בחזקת מעריך",
    answerPrompt: "כתוב ערך",
    expectedHint: "התשובה הצפויה: 8",
    solve: (v) => v.base > 0 && v.exp >= 2 && v.exp <= 5
      ? { ok: true, result: fmt(Math.pow(v.base, v.exp), 0), explanation: `${v.base}^${v.exp}=${fmt(Math.pow(v.base, v.exp), 0)}.` }
      : { ok: false, result: "שגיאה", explanation: "הבסיס צריך להיות חיובי והמעריך בין 2 ל־5." },
  },
};

function buildLogicTasks(topic: Topic): LogicTask[] {
  return [topicLogicTasks[topic.id] ?? topicLogicTasks["rect-area"]];
}

function TopicBlocklyLab({ topic }: { topic: Topic }) {
  const tasks = useMemo(() => buildLogicTasks(topic), [topic]);
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex % tasks.length];
  const [isBlocklyOpen, setIsBlocklyOpen] = useState(false);
  const [isBlocklyLoading, setIsBlocklyLoading] = useState(false);
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<any>(null);
  const BlocklyRef = useRef<any>(null);
  const [output, setOutput] = useState("פעילות Blockly עדיין לא נטענה. לחצו על ‘פתח פעילות Blockly’ רק כשתרצו להתחיל לעבוד עם בלוקים.");

  const initialValues = useMemo(
    () => Object.fromEntries(task.inputs.map((input) => [input.key, input.value])),
    [task],
  );

  const expectedAtStart = task.solve(initialValues).result;

  function valuesFromWorkspace() {
    const values = { ...initialValues } as Record<string, number>;
    const workspace = workspaceRef.current;
    if (!workspace) return values;

    workspace.getAllBlocks(false).forEach((block: any) => {
      if (block.type === "maticomics_set_value") {
        const key = block.getFieldValue("KEY");
        values[key] = Number(block.getFieldValue("VALUE"));
      }
    });
    return values;
  }

  function findStartBlock(workspace: any) {
    return workspace.getTopBlocks(true).find((block: any) => block.type === "maticomics_start");
  }

  function nextChainTypes(block: any) {
    const chain: any[] = [];
    let current = block?.nextConnection?.targetBlock();
    while (current) {
      chain.push(current);
      current = current.nextConnection?.targetBlock();
    }
    return chain;
  }

  function validateStructure() {
    const workspace = workspaceRef.current;
    if (!workspace) return ["Blockly עדיין לא נטען."];
    const errors: string[] = [];
    const allBlocks = workspace.getAllBlocks(false);
    const start = findStartBlock(workspace);
    if (!start) errors.push("חסר בלוק התחלה: ‘כאשר לוחצים על התחל’. ");

    const setBlocks = allBlocks.filter((block: any) => block.type === "maticomics_set_value");
    const keys = new Set(setBlocks.map((block: any) => block.getFieldValue("KEY")));
    task.inputs.forEach((input) => {
      if (!keys.has(input.key)) errors.push(`חסר בלוק משתנה: ${input.label}.`);
    });

    const ifBlocks = allBlocks.filter((block: any) => block.type === "controls_if");
    const ifBlock = ifBlocks[0];
    if (!ifBlock) errors.push("חסר בלוק תנאי ‘אם’. ");
    if (ifBlock && ifBlock.getInput("IF0")?.connection?.targetBlock()?.type !== "maticomics_condition") {
      errors.push("בלוק התנאי לא מחובר לשקע של ‘אם’. ");
    }

    const calcBlock = allBlocks.find((block: any) => block.type === "maticomics_calculate");
    const answerBlock = allBlocks.find((block: any) => block.type === "maticomics_answer_text");
    const outputBlock = allBlocks.find((block: any) => block.type === "maticomics_output");
    if (!calcBlock) errors.push("חסר בלוק חישוב ירוק.");
    if (!answerBlock) errors.push("חסר בלוק תשובה ורוד.");
    if (!outputBlock) errors.push("חסר בלוק פלט ורוד.");

    const doFirst = ifBlock?.getInput("DO0")?.connection?.targetBlock();
    if (ifBlock && doFirst?.type !== "maticomics_calculate") {
      errors.push("בתוך ה‘אם’ צריך להתחיל בבלוק החישוב הירוק.");
    }
    const doChain = nextChainTypes({ nextConnection: { targetBlock: () => doFirst } });
    if (doFirst && !doChain.some((block) => block.type === "maticomics_answer_text")) {
      errors.push("בלוק התשובה צריך להיות בתוך ה‘אם’, אחרי החישוב.");
    }

    if (start) {
      const mainChain = nextChainTypes(start);
      if (!mainChain.some((block) => block.type === "controls_if")) {
        errors.push("בלוק ה‘אם’ צריך להיות מחובר לרצף שמתחיל בבלוק ההתחלה.");
      }
    }

    return errors;
  }

  function runBlockly() {
    if (!workspaceRef.current) {
      setOutput("פתחו קודם את פעילות Blockly, ואז לחצו ‘בדוק והריץ’.");
      return;
    }

    const structureErrors = validateStructure();
    const values = valuesFromWorkspace();
    const answer = task.solve(values);
    const answerBlock = workspaceRef.current?.getAllBlocks(false).find((block: any) => block.type === "maticomics_answer_text");
    const userAnswer = String(answerBlock?.getFieldValue("ANSWER") ?? "");
    const answerCheck = checkAnswerMatch(userAnswer, answer.result);
    const answerOk = answer.ok && answerCheck.ok;

    if (structureErrors.length) {
      setOutput(`❌ יש בעיה במבנה התוכנית:\n${structureErrors.map((item) => `• ${item}`).join("\n")}\n\nתקנו את הבלוקים ונסו שוב.`);
      return;
    }

    if (!answer.ok) {
      setOutput(`⚠️ התנאי לא עבר\nתוצאה צפויה: ${answer.result}\n${answer.explanation}`);
      return;
    }

    if (!answerOk) {
      setOutput(`❌ תשובה לא נכונה\nמה שכתבתם בבלוק התשובה: ${userAnswer || "ריק"}\nהתשובה הנכונה לפי הבלוקים היא: ${answer.result}\n${answer.explanation}\n${answerCheck.note}`);
      return;
    }

    setOutput(`✅ נכון מאוד\n${answerCheck.note}\n${answer.explanation}`);
  }

  function defineBlocks(Blockly: any, currentTask: LogicTask) {
    Blockly.Blocks.maticomics_start = {
      init() {
        this.appendDummyInput().appendField("כאשר לוחצים על התחל");
        this.setNextStatement(true, null);
        this.setColour(35);
        this.setTooltip("אירוע התחלה — משפחת Events הכתומה.");
      },
    };

    Blockly.Blocks.maticomics_set_value = {
      init() {
        this.appendDummyInput()
          .appendField("קבע")
          .appendField(new Blockly.FieldDropdown(currentTask.inputs.map((input) => [input.label, input.key])), "KEY")
          .appendField("=")
          .appendField(new Blockly.FieldNumber(1, -10000, 10000, 0.01), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("משתנה עם ערך מספרי שניתן לשינוי בתוך הבלוק.");
      },
    };

    Blockly.Blocks.maticomics_condition = {
      init() {
        this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable(currentTask.conditionLabel), "TEXT");
        this.setOutput(true, "Boolean");
        this.setColour(260);
        this.setTooltip("תנאי לוגי — משפחת Logic הסגולה.");
      },
    };

    Blockly.Blocks.maticomics_calculate = {
      init() {
        this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable(currentTask.operationLabel), "TEXT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("פעולת חישוב — משפחת Math הירוקה.");
      },
    };

    Blockly.Blocks.maticomics_answer_text = {
      init() {
        this.appendDummyInput()
          .appendField(currentTask.answerPrompt)
          .appendField(new Blockly.FieldTextInput(expectedAtStart), "ANSWER");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("כאן מזינים תשובה. אם הערך שגוי — תקבלו חיווי טעות.");
      },
    };

    Blockly.Blocks.maticomics_output = {
      init() {
        this.appendDummyInput().appendField("הצג חיווי לפוקסי");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("פלט/טקסט — משפחת Text הוורודה.");
      },
    };
  }

  function loadBlocks(index = taskIndex) {
    const Blockly = BlocklyRef.current;
    const workspace = workspaceRef.current;
    if (!Blockly || !workspace) return;

    const nextTask = tasks[index % tasks.length];
    defineBlocks(Blockly, nextTask);
    workspace.clear();

    const startBlock = workspace.newBlock("maticomics_start");
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(260, 40);

    let previous = startBlock;
    nextTask.inputs.forEach((input) => {
      const block = workspace.newBlock("maticomics_set_value");
      block.setFieldValue(input.key, "KEY");
      block.setFieldValue(String(input.value), "VALUE");
      block.initSvg();
      block.render();
      previous.nextConnection?.connect(block.previousConnection);
      previous = block;
    });

    const ifBlock = workspace.newBlock("controls_if");
    ifBlock.initSvg();
    ifBlock.render();
    previous.nextConnection?.connect(ifBlock.previousConnection);

    const condition = workspace.newBlock("maticomics_condition");
    condition.initSvg();
    condition.render();
    ifBlock.getInput("IF0")?.connection?.connect(condition.outputConnection);

    const calc = workspace.newBlock("maticomics_calculate");
    calc.initSvg();
    calc.render();
    ifBlock.getInput("DO0")?.connection?.connect(calc.previousConnection);

    const answerBlock = workspace.newBlock("maticomics_answer_text");
    answerBlock.setFieldValue(nextTask.solve(Object.fromEntries(nextTask.inputs.map((input) => [input.key, input.value]))).result, "ANSWER");
    answerBlock.initSvg();
    answerBlock.render();
    calc.nextConnection?.connect(answerBlock.previousConnection);

    const show = workspace.newBlock("maticomics_output");
    show.initSvg();
    show.render();
    answerBlock.nextConnection?.connect(show.previousConnection);

    workspace.render();
    workspace.scrollCenter?.();
    setOutput("שנו מספרים או תשובה בתוך הבלוקים, ואז לחצו ‘בדוק והריץ’. אם תטעו — פוקסי יסביר מה לא תקין.");
  }

  useEffect(() => {
    if (!isBlocklyOpen || BlocklyRef.current || workspaceRef.current) return;

    let disposed = false;

    async function setupBlockly() {
      setIsBlocklyLoading(true);
      setOutput("טוען סביבת Blockly...");
      const Blockly = await import("blockly");
      await import("blockly/blocks");
      if (disposed || !blocklyDivRef.current) return;

      BlocklyRef.current = Blockly;
      defineBlocks(Blockly, task);

      workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
        rtl: false,
        renderer: "geras",
        trashcan: true,
        scrollbars: true,
        move: { scrollbars: true, drag: true, wheel: true },
        zoom: { controls: true, wheel: true, startScale: 0.78, maxScale: 1.25, minScale: 0.45, scaleSpeed: 1.08 },
        toolboxPosition: "start",
        toolbox: {
          kind: "categoryToolbox",
          contents: [
            { kind: "category", name: "התחלה", colour: "35", contents: [{ kind: "block", type: "maticomics_start" }] },
            { kind: "category", name: "משתנים", colour: "210", contents: [{ kind: "block", type: "maticomics_set_value" }] },
            { kind: "category", name: "לוגיקה", colour: "260", contents: [{ kind: "block", type: "controls_if" }, { kind: "block", type: "maticomics_condition" }] },
            { kind: "category", name: "מתמטיקה", colour: "120", contents: [{ kind: "block", type: "maticomics_calculate" }, { kind: "block", type: "math_number" }, { kind: "block", type: "math_arithmetic" }] },
            { kind: "category", name: "תשובה ופלט", colour: "20", contents: [{ kind: "block", type: "maticomics_answer_text" }, { kind: "block", type: "maticomics_output" }, { kind: "block", type: "text" }] },
          ],
        },
      });
      loadBlocks(taskIndex);
      setIsBlocklyLoading(false);
    }

    setupBlockly().catch((error) => {
      console.error("Failed to load Blockly", error);
      setIsBlocklyLoading(false);
      setOutput("❌ לא הצלחתי לטעון את סביבת Blockly. רעננו את הדף ונסו שוב.");
    });

    return () => {
      disposed = true;
      workspaceRef.current?.dispose();
      workspaceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlocklyOpen]);

  useEffect(() => {
    if (!workspaceRef.current) return;
    loadBlocks(taskIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex, topic.id]);

  return (
    <section className="comic-card p-4 md:p-5 bg-card overflow-visible">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-3 py-1 text-xs font-bold mb-1">
            🧱 Blockly אמיתי · בדיקה מדויקת · Frontend בלבד
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold">פוקסי מתכנת את {topic.title}</h2>
        </div>
        <div className="flex gap-2">
          {!isBlocklyOpen ? (
            <button type="button" className="comic-btn text-xs" onClick={() => setIsBlocklyOpen(true)}>
              פתח פעילות Blockly 🧱
            </button>
          ) : null}
          <button type="button" className="comic-btn text-xs" onClick={runBlockly} disabled={!workspaceRef.current || isBlocklyLoading}>בדוק והריץ ▶</button>
          <button type="button" className="comic-btn text-xs" onClick={() => loadBlocks(taskIndex)} disabled={!workspaceRef.current || isBlocklyLoading}>אפס דוגמה</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]" dir="rtl">
        <aside className="rounded-3xl border-2 border-foreground bg-sun/35 p-4 xl:max-h-[640px] xl:overflow-auto">
          <h3 className="font-display text-lg font-bold mb-2">השאלה / הבעיה</h3>
          <p className="font-bold leading-relaxed">{task.story}</p>
          <div className="mt-4 rounded-2xl bg-white/80 border-2 border-dashed border-foreground p-3 text-sm leading-relaxed">
            <p className="font-bold mb-1">מה התוכנית צריכה לעשות?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>להתחיל בבלוק כתום.</li>
              <li>לקבוע את כל המשתנים הכחולים הרלוונטיים לשאלה.</li>
              <li>להכניס תנאי סגול לתוך בלוק ‘אם’.</li>
              <li>בתוך התנאי: חישוב ירוק → בלוק תשובה → בלוק פלט.</li>
            </ol>
            <p className="mt-2 font-bold">{task.expectedHint}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white whitespace-pre-line text-sm leading-relaxed min-h-32">
            {output}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            כרגע אין AI ואין Backend: השאלות והבדיקה מקומיות. בהמשך נחבר יצירת שאלות ושמירת התקדמות.
          </p>
        </aside>

        <div className="rounded-3xl border-2 border-foreground bg-white overflow-hidden min-h-[640px] relative">
          {!isBlocklyOpen ? (
            <div className="flex h-[640px] flex-col items-center justify-center gap-4 p-8 text-center" dir="rtl">
              <div className="text-6xl">🧱</div>
              <h3 className="font-display text-2xl font-extrabold">Blockly נטען רק כשצריך</h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                כדי שהדף ייפתח מהר יותר, סביבת הבלוקים הכבדה לא נטענת אוטומטית. פתחו אותה כשאתם מוכנים לתרגול התכנותי.
              </p>
              <button type="button" className="comic-btn" onClick={() => setIsBlocklyOpen(true)}>
                פתח פעילות Blockly 🧱
              </button>
            </div>
          ) : (
            <div ref={blocklyDivRef} className="h-[640px] w-full [&_.blocklyToolboxDiv]:!bg-orange-50 [&_.blocklyFlyout]:!z-20 [&_.blocklyWidgetDiv]:!z-50" dir="ltr" />
          )}
        </div>
      </div>
    </section>
  );
}

function TopicPage() {
  const { id } = Route.useParams();
  const { fromWorld } = Route.useSearch();

  if (fromWorld !== "1") {
    return <Navigate to="/" replace />;
  }
  const topic = topics.find((t) => t.id === id)!;
  const meta = categoryMeta[topic.category];
  const { progress, awardTopicStar } = useLearningProgress();
  const stars = getTopicStars(progress, topic.id);
  const hasReadStar = stars.includes("read");

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
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
          <section className="comic-card p-5 md:p-6 bg-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold">הכוכבים שלי בנושא</h2>
                <p className="text-sm text-muted-foreground mt-1">קריאה · תרגול · משימת קומיקס</p>
              </div>
              <div className="text-3xl" aria-label={`${stars.length} מתוך 3 כוכבים`}>
                {["read", "practice", "comic"].map((star) => (
                  <span key={star} className={stars.includes(star as never) ? "" : "opacity-25 grayscale"}>⭐</span>
                ))}
              </div>
            </div>
          </section>

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

          <section className="comic-card p-5 md:p-6 bg-card">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-2">סיימתי לקרוא?</h2>
            <p className="text-sm text-muted-foreground mb-4">אם ההסבר והדוגמה ברורים, סמנו כוכב קריאה. אפשר לחזור ולעדכן בכל רגע.</p>
            <button
              type="button"
              className={`comic-btn ${hasReadStar ? "comic-btn-primary" : ""}`}
              onClick={() => awardTopicStar(topic.id, "read")}
            >
              {hasReadStar ? "⭐ כוכב קריאה נשמר" : "סיימתי קריאה ⭐"}
            </button>
          </section>

          <SmartPractice topic={topic} />

          <TopicBlocklyLab topic={topic} />

          <ComicMission topic={topic} />

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
