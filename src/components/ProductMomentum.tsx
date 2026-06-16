import { useState, type FC } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import styles from './ProductMomentum.module.css';

interface Update {
  id: string;
  src: string;
  alt: string;
}

const updates: Update[] = [
  { id: '1', src: '/arts/carousel_service_update1.svg', alt: 'Service Update: Novas funcionalidades' },
  { id: '2', src: '/arts/carousel_service_update2.svg', alt: 'IA de Execução mais inteligente' },
];

export const ProductMomentum: FC = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? updates.length - 1 : prev - 1));

  return (
    <section id="updates" className={styles['momentum-section']}>
      <div className="container">
        <div className={styles['momentum-grid']}>
          <div className={styles['momentum-text']}>
            <div className={styles['momentum-badge']}>
              <Zap size={14} />
              <span>EVOLUÇÃO CONSTANTE</span>
            </div>
            <h2 className={styles['momentum-title']}>Sempre em <span className="gradient-text">evolução.</span></h2>
            <p className={styles['momentum-description']}>
              O Talkvex não é apenas uma ferramenta, é um ecossistema vivo. Lançamos atualizações semanais para garantir que sua produtividade nunca estagne.
            </p>
            <div className={styles['momentum-stats']}>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>99.9%</span>
                <span className={styles['stat-label']}>Disponibilidade</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>Semanal</span>
                <span className={styles['stat-label']}>Atualizações</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>24/7</span>
                <span className={styles['stat-label']}>Suporte</span>
              </div>
            </div>
          </div>

          <div className={styles['momentum-visual']}>
            <div className={styles['update-carousel']}>
              <div className={styles['update-track']} style={{ transform: `translateX(-${current * 100}%)` }}>
                {updates.map((update) => (
                  <div key={update.id} className={styles['update-slide']}>
                    <img src={update.src} alt={update.alt} />
                  </div>
                ))}
              </div>
              
              <div className={styles['update-controls']}>
                <button onClick={prev} className={styles['control-btn']} aria-label="Anterior">
                  <ChevronLeft size={20} />
                </button>
                <div className={styles['update-dots']}>
                  {updates.map((_, i) => (
                    <div key={i} className={`${styles.dot} ${i === current ? styles.active : ''}`} />
                  ))}
                </div>
                <button onClick={next} className={styles['control-btn']} aria-label="Próximo">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
