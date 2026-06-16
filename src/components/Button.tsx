import type { FC, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]} ${isLoading ? styles.loading : ''} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className={`${styles['loader-icon']} animate-spin`} size={18} />
      )}
      <span className={isLoading ? styles['content-loading'] : ''}>
        {children}
      </span>
    </button>
  );
};
