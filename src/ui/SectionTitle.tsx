import { Reveal } from './motion';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export function SectionTitle({ eyebrow, title, description, className = '' }: SectionTitleProps) {
  return (
    <Reveal className={`section-title${className ? ` ${className}` : ''}`} y={22}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </Reveal>
  );
}
