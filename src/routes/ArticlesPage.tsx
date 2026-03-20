import { ArrowUpRight, Newspaper, PlayCircle, Sparkles } from 'lucide-react';

import { articleItems } from '../features/articles/articles.data';
import type { Article } from '../types/marketplace';
import { SectionTitle } from '../ui/SectionTitle';
import { StaggerGrid, StaggerItem } from '../ui/motion';

const editorialGroups = [
  {
    id: 'nutrition',
    title: 'Nutrizione e crescita',
    description: 'Routine pasti, crescita del cucciolo e scelte alimentari piu consapevoli.',
    icon: Sparkles,
    articles: articleItems.filter(
      (article) => article.kind !== 'video' && ['Nutrizione', 'Crescita'].includes(article.category)
    ),
  },
  {
    id: 'education',
    title: 'Educazione e relazione',
    description:
      'Metodo, gestione quotidiana e consigli pratici per costruire una relazione solida.',
    icon: Newspaper,
    articles: articleItems.filter(
      (article) =>
        article.kind !== 'video' && !['Nutrizione', 'Crescita'].includes(article.category)
    ),
  },
  {
    id: 'video',
    title: 'Video e risorse visive',
    description: 'Canali e selezioni video utili per salute, alimentazione e gestione del cane.',
    icon: PlayCircle,
    articles: articleItems.filter((article) => article.kind === 'video'),
  },
] satisfies Array<{
  id: string;
  title: string;
  description: string;
  icon: typeof Newspaper;
  articles: Article[];
}>;

export function ArticlesPage() {
  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Editoriale"
          title="Guide, video e risorse affidabili"
          description="Risorse reali e fonti autorevoli su gestione, educazione e nutrizione del cane, con rimando diretto alle pagine originali."
        />

        <div className="editorial-groups">
          {editorialGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <section key={group.id} className="editorial-group">
                <div className="editorial-group__header">
                  <div>
                    <span className="editorial-group__eyebrow">
                      <GroupIcon size={16} />
                      {group.title}
                    </span>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span className="chip">{group.articles.length} risorse</span>
                </div>

                <StaggerGrid className="editorial__grid editorial__grid--spacious" delay={0.06}>
                  {group.articles.map((article) => (
                    <StaggerItem key={article.id}>
                      <article
                        className={`editorial-card editorial-card--feature editorial-card--resource editorial-card--${article.kind ?? 'article'}`}
                      >
                        <div className="editorial-card__media">
                          <img src={article.image} alt={article.title} />
                          <span
                            className={`editorial-card__badge editorial-card__badge--${article.kind ?? 'article'}`}
                          >
                            {article.kind === 'video' ? (
                              <PlayCircle size={15} />
                            ) : (
                              <Newspaper size={15} />
                            )}
                            {article.kind === 'video' ? 'Video' : 'Articolo'}
                          </span>
                        </div>

                        <div className="editorial-card__body">
                          <span className="editorial-card__meta">
                            {article.kind === 'video' ? (
                              <PlayCircle size={16} />
                            ) : (
                              <Newspaper size={16} />
                            )}
                            {`${article.category} · ${article.readTime}`}
                          </span>
                          <h3>{article.title}</h3>
                          <p>{article.excerpt}</p>
                          <div className="editorial-card__footer">
                            <strong>{article.source}</strong>
                            {article.url ? (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                                className="button button--ghost"
                              >
                                {article.ctaLabel ?? 'Apri risorsa'}
                                <ArrowUpRight size={16} />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
