"use client";

import useSWR from "swr";
import styles from "./status.module.css";

async function fetchAPI(url: string) {
  const response = await fetch(url);
  const responseBody = await response.json();
  return responseBody;
}

type Health = "loading" | "ok" | "warn" | "down";

type StatusResponse = {
  dependencies?: {
    database?: {
      healthy?: boolean;
      status?: string;
      version?: string;
      max_connections?: number;
      opened_connections?: number;
    };
  };
  updated_at?: string;
};

function getDatabaseHealth(
  data: StatusResponse | undefined,
  isLoading: boolean,
): Health {
  if (isLoading) return "loading";
  if (!data) return "down";

  const database = data.dependencies?.database;

  if (!database) return "down";

  if (typeof database.healthy === "boolean") {
    return database.healthy ? "ok" : "down";
  }

  const status = String(database.status ?? "").toLowerCase();

  if (status.includes("degrad") || status.includes("warn")) return "warn";
  if (
    status.includes("down") ||
    status.includes("fail") ||
    status.includes("error")
  ) {
    return "down";
  }
  if (
    status.includes("up") ||
    status.includes("ok") ||
    status.includes("healthy")
  ) {
    return "ok";
  }

  if (database.version && typeof database.max_connections !== "undefined") {
    return "ok";
  }

  return "warn";
}

function getHealthLabel(health: Health) {
  switch (health) {
    case "ok":
      return "OK";
    case "warn":
      return "DEGRADADO";
    case "down":
      return "FORA DO AR";
    default:
      return "CARREGANDO";
  }
}

export default function StatusPage() {
  const { data, isLoading, mutate } = useSWR<StatusResponse>(
    "/api/v1/status",
    fetchAPI,
    {
      refreshInterval: 3000,
    },
  );

  const databaseHealth = getDatabaseHealth(data, isLoading);

  const updatedAtText =
    !isLoading && data?.updated_at
      ? new Date(data.updated_at).toLocaleString("pt-BR")
      : "Carregando...";

  const badgeVariantClass =
    databaseHealth === "ok"
      ? styles.badgeOk
      : databaseHealth === "warn"
        ? styles.badgeWarn
        : databaseHealth === "down"
          ? styles.badgeDown
          : styles.badgeLoading;

  function handleRefresh() {
    mutate();
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentCard}>
        <header className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Steam ASC</p>
          <h1 className={styles.heroTitle}>Status</h1>
          <p className={styles.heroDescription}>
            Acompanhe a saúde da aplicação e verifique rapidamente o estado da
            conexão com o banco de dados.
          </p>
        </header>

        <div className={styles.metaCard}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Última atualização</span>
            <strong className={styles.metaValue}>{updatedAtText}</strong>
          </div>

          <div className={styles.metaActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRefresh}
              title="Atualizar agora"
            >
              Atualizar
            </button>
          </div>
        </div>

        <section className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <span className={`${styles.statusBadge} ${badgeVariantClass}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {getHealthLabel(databaseHealth)}
            </span>

            <h2 className={styles.statusTitle}>Database</h2>
          </div>

          {isLoading ? (
            <p className={styles.loadingMessage}>Carregando...</p>
          ) : (
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Versão</span>
                <strong className={styles.metricValue}>
                  {data?.dependencies?.database?.version ?? "—"}
                </strong>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Conexões abertas</span>
                <strong className={styles.metricValue}>
                  {data?.dependencies?.database?.opened_connections ?? "—"}
                </strong>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Conexões máximas</span>
                <strong className={styles.metricValue}>
                  {data?.dependencies?.database?.max_connections ?? "—"}
                </strong>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
