import type { FC } from 'react';
import styles from './Stories.module.css';

interface Story {
  id: string;
  title: string;
  src: string;
}

const stories: Story[] = [
  { id: '1', title: 'A Dor', src: '/arts/story1_pain.svg' },
  { id: '2', title: 'O Valor', src: '/arts/story2_value.svg' },
  { id: '3', title: 'Chamada para Ação', src: '/arts/story3_cta.svg' },
  { id: '4', title: 'Prova Social', src: '/arts/story4_social.svg' },
  { id: '5', title: 'Sucesso: Maria', src: '/arts/story5_maria.svg' },
  { id: '6', title: 'Sucesso: João', src: '/arts/story6_joao.svg' },
  { id: '7', title: 'Revelação do Dashboard', src: '/arts/story7_dashboard.svg' },
];

export const Stories: FC = () => {
  return (
    <section id="stories" className={styles['stories-section']}>
      <div className="container">
        <header className={styles['stories-header']}>
          <h2 className={styles['stories-title']}>Talkvex Stories</h2>
          <p className={styles['stories-subtitle']}>Séries verticais de alto impacto para crescimento social.</p>
        </header>
        
        <div className={styles['stories-track']}>
          {stories.map((story) => (
            <div key={story.id} className={styles['story-card']}>
              <div className={styles['story-preview']}>
                <img src={story.src} alt={story.title} loading="lazy" />
              </div>
              <span className={styles['story-label']}>{story.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
