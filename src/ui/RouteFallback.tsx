import { DogLoadingScreen } from './DogLoadingScreen';

export function RouteFallback() {
  return (
    <section className="section section--page">
      <div className="container">
        <DogLoadingScreen
          title="Stiamo aprendo la prossima pagina"
          description="Le zampette stanno sistemando contenuti, immagini e navigazione."
          variant="page"
        />
      </div>
    </section>
  );
}
