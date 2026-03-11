import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <section className={styles.contentCard}>
        <header className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Steam ASC</p>
          <h1 className={styles.heroTitle}>Início</h1>
          <p className={styles.heroDescription}>
            Acesse informações do usuário Steam e verifique o status da
            aplicação.
          </p>
        </header>

        <div className={styles.actionsSection}>
          <a href="/user" className={styles.primaryAction}>
            Ver Usuário
          </a>

          <a href="/steam_games" className={styles.secondaryAction}>
            Jogos Para 100%
          </a>

          <a
            href="https://steamid.xyz"
            target="_blank"
            rel="noreferrer"
            className={styles.secondaryAction}
          >
            Ver Meu ID 64
          </a>

          <a href="/status" className={styles.secondaryAction}>
            Ver Status
          </a>
        </div>
      </section>
    </main>
  );
}
