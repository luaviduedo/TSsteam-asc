import styles from "./status/status.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.statusSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionTitleText}>Início</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <a className={styles.buttonPrimary} href="/status">
              Ver Status
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
