export function RouteFallback() {
  return (
    <section className="section section--page">
      <div className="container">
        <div className="panel route-fallback">
          <div className="route-fallback__pulse" />
          <strong>Caricamento pagina...</strong>
          <p>Stiamo preparando i contenuti richiesti.</p>
        </div>
      </div>
    </section>
  );
}
