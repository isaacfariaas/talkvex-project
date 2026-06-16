import { type FC } from 'react';
import { MessageSquare, Briefcase, Camera, Code, Activity, Hexagon } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles['footer-content']}`}>
        <div className={styles['footer-brand']}>
          <div className={styles.logo}>
            <Hexagon className={styles['logo-icon']} fill="currentColor" />
            <span className={styles['logo-text']}>TALKVEX</span>
          </div>
          <p className={styles['footer-tagline']}>Da meta à rotina, com IA.</p>
          <div className={styles['footer-socials']}>
            <a href="#" aria-label="Twitter"><MessageSquare size={18} /></a>
            <a href="#" aria-label="LinkedIn"><Briefcase size={18} /></a>
            <a href="#" aria-label="Instagram"><Camera size={18} /></a>
            <a href="#" aria-label="Github"><Code size={18} /></a>
          </div>
        </div>
        <div className={styles['footer-links']}>
          <div className={styles['link-group']}>
            <h4>Produto</h4>
            <a href="#features">Funcionalidades</a>
            <a href="#narratives">Narrativas</a>
            <a href="#stories">Stories</a>
            <a href="#updates">Novidades</a>
          </div>
          <div className={styles['link-group']}>
            <h4>Empresa</h4>
            <a href="#">Sobre</a>
            <a href="#">Contato</a>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </div>
        </div>
        <div className={styles['footer-bottom']}>
          <div className={styles['footer-legal']}>
            <p>© 2026 Talkvex Corp. Todos os direitos reservados.</p>
          </div>
          <div className={styles['footer-status']}>
            <Activity size={14} className={styles['status-icon']} />
            <span>Sistemas Operacionais</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
