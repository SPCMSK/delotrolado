import { ScannerPanel } from "./scanner-panel";

export default function ScannerPage() {
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Scanner QR</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
          Validar entradas en la puerta del evento
        </p>
      </div>

      <ScannerPanel />
    </div>
  );
}
