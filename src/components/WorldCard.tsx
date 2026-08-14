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
      className="comic-card comic-card-hover block p-5 group"
      style={{ boxShadow: `6px 6px 0 0 color-mix(in oklab, var(${bgVar}) 70%, transparent)` }}
    >
      <div className="text-5xl mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-6 inline-block">
        {emoji}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      <p className="text-base opacity-90">{description}</p>
      <div className="mt-4 inline-block comic-btn text-sm">
        כניסה ←
      </div>
    </Link>
  );

}
