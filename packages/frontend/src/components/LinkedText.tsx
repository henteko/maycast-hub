import type { ReactNode } from 'react';

interface Props {
  children: string;
}

const URL_REGEX = /(https?:\/\/[^\s<>)"']+)/g;

function linkify(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function LinkedText({ children }: Props) {
  const lines = children.split('\n');

  return (
    <div className="text-sm leading-[1.8] text-text-secondary">
      {lines.map((line, i) => (
        <span key={i}>
          {linkify(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
