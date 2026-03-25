import { motion } from 'framer-motion';
import { Megaphone, Sparkles } from 'lucide-react';

type SponsorCardProps = {
  title: string;
  body: string;
};

export function SponsorCard({ title, body }: SponsorCardProps) {
  return (
    <motion.aside
      className="sponsor-card"
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <span className="sponsor-card__eyebrow">
          <Megaphone size={16} />
          Sponsor
        </span>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>

      <div className="sponsor-card__badge">
        <Sparkles size={18} />
        Placement ogni 3 risultati
      </div>
    </motion.aside>
  );
}
