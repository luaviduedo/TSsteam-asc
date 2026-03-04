"use client";

import React from "react";
import useSWR from "swr";
import styles from "./status.module.css";

async function fetchAPI(key: string | URL | Request) {
  const response = await fetch(key);
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

function getDbHealth(
  data: StatusResponse | undefined,
  isLoading: boolean,
): Health {
  if (isLoading) return "loading";
  if (!data) return "down";

  const db = data?.dependencies?.database;

  if (!db) return "down";

  // Common shapes:
  // - { healthy: true/false }
  // - { status: "up" | "down" | "degraded" }
  // - or presence of version/max_connections implies "ok"
  if (typeof db.healthy === "boolean") return db.healthy ? "ok" : "down";

  const status = String(db.status ?? "").toLowerCase();
  if (status.includes("degrad") || status.includes("warn")) return "warn";
  if (
    status.includes("down") ||
    status.includes("fail") ||
    status.includes("error")
  )
    return "down";
  if (
    status.includes("up") ||
    status.includes("ok") ||
    status.includes("healthy")
  )
    return "ok";

  // Fallback: if it has sane fields, assume ok
  if (db.version && typeof db.max_connections !== "undefined") return "ok";
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
  const { isLoading, data, mutate } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 3000,
  });

  const updatedAtText =
    !isLoading && data?.updated_at
      ? new Date(data.updated_at).toLocaleString("pt-BR")
      : "Carregando...";

  const health = getDbHealth(data, isLoading);

  const onRefresh = () => mutate();

  const badgeClass =
    health === "ok"
      ? styles.badgeOk
      : health === "warn"
        ? styles.badgeWarn
        : health === "down"
          ? styles.badgeDown
          : styles.badgeLoading;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Status</h1>

      <div className={styles.updateInfo}>
        <div className={styles.metaRow}>
          <span className={styles.label}>Última atualização:</span>
          <span className={styles.metaValue}>{updatedAtText}</span>
          <span className={styles.metaDivider} />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={onRefresh}
            title="Atualizar agora"
          >
            Atualizar
          </button>
        </div>
      </div>

      <section className={styles.statusSection}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.badge} ${badgeClass}`}>
            <span className={styles.dot} aria-hidden="true" />
            {getHealthLabel(health)}
          </span>
          <span className={styles.sectionTitleText}>Database</span>
        </div>

        {isLoading ? (
          <div className={styles.loadingText}>Carregando…</div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.statusItem}>
              <span className={styles.itemLabel}>Versão</span>
              <span className={styles.value}>
                {data?.dependencies?.database?.version ?? "—"}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.itemLabel}>Conexões abertas</span>
              <span className={styles.value}>
                {data?.dependencies?.database?.opened_connections ?? "—"}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.itemLabel}>Conexões máximas</span>
              <span className={styles.value}>
                {data?.dependencies?.database?.max_connections ?? "—"}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
