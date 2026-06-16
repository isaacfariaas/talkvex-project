import { useState, useEffect, type FC } from 'react';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { Hexagon, Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll locking for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles['header-content']}`}>
        <div className={styles.logo}>
          <Hexagon className={styles['logo-icon']} fill="currentColor" />
          <span className={styles['logo-text']}>TALKVEX</span>
        </div>
        
        <nav className={styles.nav}>
          <a href="#features" className={styles['nav-link']}>Funcionalidades</a>
          <a href="#dashboard" className={styles['nav-link']}>Dashboard</a>
          <a href="#stories" className={styles['nav-link']}>Stories</a>
          <a href="#narratives" className={styles['nav-link']}>Narrativas</a>
          <a href="#updates" className={styles['nav-link']}>Novidades</a>
        </nav>

        <div className={styles.actions}>
          <div className={styles['desktop-only']}>
            <ThemeToggle />
          </div>
          <div className={styles['desktop-only']}>
            <Button variant="ghost" size="sm">Entrar</Button>
          </div>
          <Button variant="primary" size="sm">Teste grátis</Button>
          
          <button 
            className={styles['mobile-menu-trigger']}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <nav 
        id="mobile-navigation"
        className={`${styles['mobile-nav']} ${isMobileMenuOpen ? styles.open : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <a href="#features" className={styles['nav-link']} onClick={() => setIsMobileMenuOpen(false)}>Funcionalidades</a>
        <a href="#dashboard" className={styles['nav-link']} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</a>
        <a href="#stories" className={styles['nav-link']} onClick={() => setIsMobileMenuOpen(false)}>Stories</a>
        <a href="#narratives" className={styles['nav-link']} onClick={() => setIsMobileMenuOpen(false)}>Narrativas</a>
        <a href="#updates" className={styles['nav-link']} onClick={() => setIsMobileMenuOpen(false)}>Novidades</a>
        
        <div className={styles['mobile-actions']}>
          <div className={styles['mobile-actions-wrapper']}>
            <span>Tema</span>
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="md">Entrar</Button>
          <Button variant="primary" size="md">Teste grátis</Button>
        </div>
      </nav>
    </header>
  );
};
