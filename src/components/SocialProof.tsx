import type { FC } from 'react';
import { Briefcase, MessageSquare, Camera, Play, Newspaper } from 'lucide-react';
import styles from './SocialProof.module.css';

export const SocialProof: FC = () => {
  return (
    <section className={styles['social-proof']}>
      <div className="container">
        <p className={styles['proof-label']}>PROJETADO PARA QUEM CONSTRÓI EM</p>
        <div className={styles['proof-grid']}>
          <div className={styles['proof-item']}>
            <Briefcase size={20} />
            <span>LinkedIn</span>
          </div>
          <div className={styles['proof-item']}>
            <MessageSquare size={20} />
            <span>X</span>
          </div>
          <div className={styles['proof-item']}>
            <Camera size={20} />
            <span>Instagram</span>
          </div>
          <div className={styles['proof-item']}>
            <Play size={20} />
            <span>YouTube</span>
          </div>
          <div className={styles['proof-item']}>
            <Newspaper size={20} />
            <span>Substack</span>
          </div>
        </div>
      </div>
    </section>
  );
};
