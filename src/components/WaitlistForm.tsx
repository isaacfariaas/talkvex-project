import { useState, type FC, type FormEvent } from 'react';
import { Button } from './Button';
import { CheckCircle2 } from 'lucide-react';
import styles from './WaitlistForm.module.css';

export const WaitlistForm: FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Waitlist submission:', email);
        setIsSubmitting(false);
        setSubmitted(true);
      }, 1000);
    }
  };

  if (submitted) {
    return (
      <div className={styles['waitlist-success']}>
        <CheckCircle2 className={styles['success-icon']} size={24} />
        <span>Você está na lista! Avisaremos em breve.</span>
      </div>
    );
  }

  return (
    <form className={styles['waitlist-form']} onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="Seu melhor e-mail" 
        className={styles['waitlist-input']}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
        aria-label="Endereço de e-mail para a lista de espera"
      />
      <Button 
        variant="primary" 
        size="lg" 
        type="submit" 
        isLoading={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Entrar na Lista VIP'}
      </Button>
    </form>
  );
};
