interface Props {
  message: string;
}

export function ComicGuide({ message }: Props) {
  return (
    <div className="flex items-end gap-4">
      <div className="shrink-0">
        <div className="relative w-20 h-20 rounded-full bg-sun border-[3px] border-foreground shadow-[4px_4px_0_0_var(--color-border)] flex items-center justify-center text-4xl">
          🦊
        </div>
      </div>
      <div className="comic-bubble flex-1">
        <p className="text-base md:text-lg font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
