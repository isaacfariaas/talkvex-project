import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Talkvex</h1>
        <p className={styles.subtitle}>Transforme suas metas em realidade</p>
        <div className={styles.buttonContainer}>
          <Link href="/login" className={`${styles.button} ${styles.buttonPrimary}`}>
            Entrar
          </Link>
          <Link href="/register" className={`${styles.button} ${styles.buttonSecondary}`}>
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
