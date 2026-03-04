import type { ReactNode } from 'react';
import styles from './LinkedText.module.css';

interface Props {
  children: string;
}

const URL_REGEX = /(https?:\/\/[^\s<>)"']+)/g;

function linkify(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
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
    <div className={styles.content}>
      {lines.map((line, i) => (
        <span key={i}>
          {linkify(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
