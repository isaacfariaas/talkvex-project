import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stories } from './components/Stories';
import { SocialProof } from './components/SocialProof';
import { Carousel } from './components/Carousel';
import { ProductMomentum } from './components/ProductMomentum';
import { Features } from './components/Features';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <Stories />
        <Carousel />
        <Dashboard />
        <ProductMomentum />
      </main>
      <Footer />
    </div>
  );
}

export default App;
