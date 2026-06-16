import type { FC } from 'react';
import { TriangleAlert, RefreshCw, Home } from 'lucide-react';
import styles from './Maintenance.module.css';

import { Button } from './Button';

export const Maintenance: FC = () => {
  return (
    <div className={styles['maintenance-page']}>
      <div className={styles['maintenance-bg-glow']}></div>
      <div className={styles['maintenance-card']}>
        <div className={styles['icon-container']}>
          <TriangleAlert size={64} color="var(--color-ai)" />
        </div>
        <h1 className={styles['maintenance-title']}>Estamos ajustando os caminhos.</h1>
        <p className={styles['maintenance-subtitle']}>
          O Talkvex está passando por uma breve manutenção técnica para garantir que sua IA continue montando o melhor caminho para você.
        </p>
        
        <div className={styles['status-badge']}>
          <div className={`status-dot animate-pulse ${styles['status-dot']}`}></div>
          Estabilidade: Alerta de Conectividade
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={() => window.location.reload()}>
            <RefreshCw size={18} /> Tentar novamente
          </Button>
          <Button variant="secondary" size="md" onClick={() => window.location.href = '/'}>
            <Home size={18} /> Início
          </Button>
        </div>
      </div>
      
      <div className={styles['maintenance-footer']}>
        Talkvex Corp &copy; 2026 • Sistemas Seguros e Privados
      </div>
    </div>
  );
};
