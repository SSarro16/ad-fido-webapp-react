import { PawPrint } from 'lucide-react';

type DogLoadingScreenProps = {
  title?: string;
  description?: string;
  variant?: 'page' | 'overlay';
};

const pawSteps = ['one', 'two', 'three', 'four'];

export function DogLoadingScreen({
  title = 'Stiamo preparando il prossimo passo',
  description = 'Stiamo caricando i contenuti della pagina.',
  variant = 'page',
}: DogLoadingScreenProps) {
  return (
    <div className={`dog-loader dog-loader--${variant}`} role="status" aria-live="polite">
      <div className="dog-loader__backdrop" aria-hidden="true">
        <span className="dog-loader__orb dog-loader__orb--warm" />
        <span className="dog-loader__orb dog-loader__orb--cool" />
      </div>

      <div className="dog-loader__card">
        <div className="dog-loader__badge">
          <span className="dog-loader__badge-ring" />
          <PawPrint size={24} strokeWidth={2.2} />
        </div>

        <div className="dog-loader__copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>

        <div className="dog-loader__trail" aria-hidden="true">
          {pawSteps.map((step) => (
            <span key={step} className={`dog-loader__trail-step dog-loader__trail-step--${step}`}>
              <PawPrint size={18} strokeWidth={2.1} />
            </span>
          ))}
        </div>

        <div className="dog-loader__meter" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
