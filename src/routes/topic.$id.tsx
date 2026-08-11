import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryMeta, topics, type Topic } from "@/data/topics";
import { ComicGuide } from "@/components/ComicGuide";
import { getTopicStars, useLearningProgress } from "@/lib/learning-progress";

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

function TopicPage() {
  const { id } = Route.useParams();
  const topic = topics.find((t) => t.id === id)!;
  const meta = categoryMeta[topic.category];
  const { progress, awardTopicStar } = useLearningProgress();
  const stars = getTopicStars(progress, topic.id);
  const hasReadStar = stars.includes("read");

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
