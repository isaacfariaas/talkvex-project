import { useState, useEffect, useCallback, type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Carousel.module.css';

interface Slide {
  id: string;
  src: string;
  alt: string;
}

const slides: Slide[] = [
  { id: '1', src: '/arts/carousel1_slide1.svg', alt: 'O fim da era das Metas de Papel' },
  { id: '2', src: '/arts/carousel1_slide2.svg', alt: 'A lacuna da execução' },
  { id: '3', src: '/arts/carousel1_slide3.svg', alt: 'A ponte entre plano e ação' },
  { id: '4', src: '/arts/carousel1_slide4.svg', alt: 'Comece hoje' },
];

export const Carousel: FC = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <section id="narratives" className={styles['carousel-section']}>
      <div className="container">
        <header className={styles['carousel-header']}>
          <h2 className={styles['carousel-title']}>Narrativas de Marca</h2>
          <p className={styles['carousel-subtitle']}>Explorando a filosofia por trás do método Talkvex.</p>
        </header>

        <div className={styles['carousel-container']}>
          <button className={`${styles['carousel-nav']} ${styles.prev}`} onClick={prevSlide} aria-label="Slide anterior">
            <ChevronLeft size={32} />
          </button>
          
          <div className={styles['carousel-track-wrapper']}>
            <div 
              className={styles['carousel-track']} 
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className={styles['carousel-slide']}>
                  <img src={slide.src} alt={slide.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <button className={`${styles['carousel-nav']} ${styles.next}`} onClick={nextSlide} aria-label="Próximo slide">
            <ChevronRight size={32} />
          </button>

          <div className={styles['carousel-indicators']}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === current ? styles.active : ''}`}
                onClick={() => setCurrent(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
