import { Link } from "@tanstack/react-router";

interface Props {
  to: string;
  params?: Record<string, string>;
  title: string;
  emoji: string;
  description: string;
  bgVar: string; // CSS var name like --geo
}

export function WorldCard({ to, params, title, emoji, description, bgVar }: Props) {
  return (
    <Link
      to={to}
      params={params as never}
      className="comic-card comic-card-hover block p-6 md:p-7 group"
      style={{ background: `var(${bgVar})` }}
    >
      <div className="text-6xl mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-6 inline-block">
        {emoji}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      <p className="text-base opacity-80">{description}</p>
      <div className="mt-4 inline-block comic-btn bg-card text-sm">
        כניסה ←
      </div>
    </Link>
  );
}
