import Image from "next/image";
import { getAppEnvironment, getBuildInfo } from "@/lib/env";

/**
 * Infrastructure placeholder only. Product screens are built after the owner supplies
 * approved requirements (see docs/PROJECT_RULES.md, Gate A).
 */
export default function Home() {
  const environment = getAppEnvironment();
  const { commitSha } = getBuildInfo();

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <Image src="/brand/aquasentinel-logo.svg" alt="AquaSentinel logo" width={88} height={88} priority unoptimized />
        <h1 style={{ margin: "12px 0 4px", color: "var(--brand-navy)" }}>AquaSentinel</h1>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>Detect Early. Respond Locally. Keep Water Flowing.</p>
        <p style={{ marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
          Infrastructure skeleton — no product features yet.
        </p>
        <dl style={{ fontSize: 13, color: "var(--text-muted)", margin: "16px 0 0" }}>
          <dt style={{ display: "inline" }}>Environment: </dt>
          <dd style={{ display: "inline", margin: 0 }} data-testid="environment">
            {environment}
          </dd>
          <br />
          <dt style={{ display: "inline" }}>Build: </dt>
          <dd style={{ display: "inline", margin: 0 }} data-testid="commit">
            {commitSha.slice(0, 7)}
          </dd>
        </dl>
      </section>
    </main>
  );
}
