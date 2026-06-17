import { type FC } from 'react';
import { Button } from './Button';
import { Target, Zap, Clock, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import styles from './Dashboard.module.css';

export const Dashboard: FC = () => {
  const focusPercentage = 75;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (focusPercentage / 100) * circumference;

  return (
    <section className={styles.dashboard} id="dashboard">
      <div className="container">
            <div className={styles['dashboard-grid']}>
          {/* Main Focus Card */}
          <div className={`${styles.card} ${styles['focus-card']} ${styles['animate-in']}`}>
            <div className={styles['card-header']}>
              <Target className={styles.icon} />
              <h3>Foco de Hoje</h3>
            </div>
            
            <div className={styles['progress-container']}>
              <svg className={styles['progress-ring']} width="200" height="200">
                <circle
                  className={styles['progress-ring-bg']}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                />
                <circle
                  className={styles['progress-ring-fill']}
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                />
              </svg>
              <div className={styles['progress-text']}>
                <span className={styles['progress-value']}>{focusPercentage}%</span>
                <span className={styles['progress-label']}>Concluído</span>
              </div>
            </div>

            <div className={styles['card-footer']}>
              <div className={styles['footer-status']}>
                <p>Priorização automática ativa</p>
                <Zap className={styles['active-icon']} />
              </div>
              <Button variant="primary" size="sm" className={styles['cta-button']}>
                Explorar novo modo
              </Button>
            </div>
          </div>

          {/* Productivity Stats */}
          <div className={styles['stats-column']}>
            <div className={`${styles.card} ${styles['stat-card']} ${styles['animate-in']}`} style={{ '--delay': '0.1s' } as React.CSSProperties}>
              <div className={styles['stat-info']}>
                <TrendingUp className={styles['stat-icon']} />
                <div>
                  <span className={styles['stat-label']}>Momentum Semanal</span>
                  <span className={styles['stat-value']}>+12.5%</span>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles['stat-card']} ${styles['animate-in']}`} style={{ '--delay': '0.2s' } as React.CSSProperties}>
              <div className={styles['stat-info']}>
                <Clock className={styles['stat-icon']} />
                <div>
                  <span className={styles['stat-label']}>Tempo em Foco</span>
                  <span className={styles['stat-value']}>5h 42m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className={`${styles.card} ${styles['schedule-card']} ${styles['animate-in']}`} style={{ '--delay': '0.3s' } as React.CSSProperties}>
            <div className={styles['card-header']}>
              <Calendar className={styles.icon} />
              <h3>Próximas Prioridades</h3>
            </div>
            
            <div className={styles['schedule-list']}>
              <div className={styles['schedule-item']}>
                <CheckCircle2 className={styles['check-icon']} />
                <div className={styles['item-content']}>
                  <span className={styles['item-title']}>Revisão de Arquitetura</span>
                  <span className={styles['item-time']}>Concluído</span>
                </div>
              </div>
              
              <div className={styles['schedule-item']}>
                <div className={styles['dot-active']} />
                <div className={styles['item-content']}>
                  <span className={styles['item-title']}>Refatoração de CSS Modules</span>
                  <span className={styles['item-time']}>Em andamento</span>
                </div>
              </div>

              <div className={styles['schedule-item']}>
                <div className={styles['dot-pending']} />
                <div className={styles['item-content']}>
                  <span className={styles['item-title']}>Implementação do Dashboard</span>
                  <span className={styles['item-time']}>15:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
