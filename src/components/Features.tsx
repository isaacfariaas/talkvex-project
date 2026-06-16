import type { FC } from 'react';
import { Zap, RefreshCw, Target } from 'lucide-react';
import styles from './Features.module.css';

export const Features: FC = () => {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <h2 className={styles['features-title']}>Funcionalidades Inteligentes</h2>
        <div className={styles['features-grid']}>
          <div className={styles['feature-card']}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-accent']}`}>
              <Zap size={24} />
            </div>
            <h3 className={styles['feature-name']}>Decomposição IA</h3>
            <p className={styles['feature-description']}>A IA quebra suas grandes metas em tarefas menores e gerenciáveis automaticamente.</p>
          </div>
          <div className={styles['feature-card']}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-ai']}`}>
              <RefreshCw size={24} />
            </div>
            <h3 className={styles['feature-name']}>Ajuste Dinâmico</h3>
            <p className={styles['feature-description']}>O plano se adapta ao seu ritmo. Perdeu um dia? A Talkvex reorganiza tudo para você.</p>
          </div>
          <div className={styles['feature-card']}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-success']}`}>
              <Target size={24} />
            </div>
            <h3 className={styles['feature-name']}>Foco Diário</h3>
            <p className={styles['feature-description']}>Interface minimalista focada apenas no que você precisa fazer agora.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
