import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.statusSection}>
            <header className={styles.sectionTitle}>
              <h1 className={styles.sectionTitleText}>Início</h1>
              <p className={styles.description}>
                Acesse informações do usuário Steam e verifique o status da
                aplicação.
              </p>
            </header>

            <div className={styles.homeLinks}>
              <a href="/user" className={styles.buttonPrimary}>
                Ver Usuário
              </a>

              <a
                href="https://steamid.xyz"
                target="_blank"
                rel="noreferrer"
                className={styles.buttonPrimary}
              >
                Ver Meu ID 64
              </a>

              <a href="/status" className={styles.buttonPrimary}>
                Ver Status
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
