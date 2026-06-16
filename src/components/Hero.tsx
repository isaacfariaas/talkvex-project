import type { FC } from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { WaitlistForm } from './WaitlistForm';
import styles from './Hero.module.css';

export const Hero: FC = () => {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles['hero-grid']}`}>
        <div className={styles['hero-text']}>
          <h1 className={styles['hero-title']}>
            Diga onde você quer chegar. <br />
            <span className="gradient-text">A IA monta seu caminho.</span>
          </h1>
          <p className={styles['hero-subtitle']}>
            Transforme grandes ambições em rotinas diárias automáticas com inteligência artificial. Do plano anual ao foco de hoje, sem fricção.
          </p>
          <WaitlistForm />
          <div className={styles['hero-social-proof']}>
            <div className={styles['avatar-stack']}>
              <div className={`${styles.avatar} ${styles['avatar-accent']}`}></div>
              <div className={`${styles.avatar} ${styles['avatar-ai']}`}></div>
              <div className={`${styles.avatar} ${styles['avatar-success']}`}></div>
            </div>
            <span>Junte-se a 1.200+ criadores acelerando com IA</span>
          </div>
          <div className={styles['hero-tagline']}>
            <Lock size={14} className={styles['tagline-icon']} /> Seus dados são privados e seguros.
          </div>
        </div>

        <div className={styles['hero-visual']}>
          <div className={styles['visual-card']}>
            <div className={styles['input-field']}>
              <span className={styles['input-cursor']}>"</span>
              Quero lançar um SaaS em 6 meses
              <span className={styles['input-cursor']}>"</span>
            </div>
            
            <div className={styles['ai-process']}>
              <div className="sparkle-container animate-pulse">
                <Sparkles size={32} color="var(--color-ai)" fill="var(--color-ai)" />
              </div>
              <div className={styles['ai-line']}></div>
            </div>

            <div className={styles['output-ladder']}>
              <div className={`${styles['ladder-step']} ${styles.annual}`}>
                <span className={styles['step-label']}>PLANO ANUAL</span>
                <div className={styles['step-bar']}>Lançar SaaS de Produtividade</div>
              </div>
              <div className={`${styles['ladder-step']} ${styles.quarterly}`}>
                <span className={styles['step-label']}>METAS TRIMESTRAIS</span>
                <div className={styles['step-bar']}>Validar MVP com 100 usuários</div>
              </div>
              <div className={`${styles['ladder-step']} ${styles.weekly}`}>
                <span className={styles['step-label']}>TAREFAS DA SEMANA</span>
                <div className={styles['step-bar']}>Finalizar Landing Page</div>
              </div>
              <div className={`${styles['ladder-step']} ${styles.daily} ${styles.active}`}>
                <span className={styles['step-label']}>FOCO DE HOJE</span>
                <div className={styles['step-bar']}>
                  Refinar Hero Section
                  <div className={styles['status-dot']}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles['visual-bg-glow']}></div>
        </div>
      </div>
    </section>
  );
};
