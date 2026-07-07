const CX = 720
const CY = 350

export function MandalaBg() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 700"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.22 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 16 líneas radiales */}
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={`l${i}`}
            x1={CX}
            y1={CY - 226}
            x2={CX}
            y2={CY - 800}
            stroke="var(--surface)"
            strokeWidth="1.2"
            transform={`rotate(${i * 22.5} ${CX} ${CY})`}
          />
        ))}
        {/* Círculos concéntricos */}
        <circle
          cx={CX}
          cy={CY}
          r={226}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        <circle
          cx={CX}
          cy={CY}
          r={393}
          fill="none"
          stroke="var(--highlight)"
          strokeWidth="2"
        />
        <circle
          cx={CX}
          cy={CY}
          r={540}
          fill="none"
          stroke="var(--warning)"
          strokeWidth="2"
        />
        <circle
          cx={CX}
          cy={CY}
          r={673}
          fill="none"
          stroke="var(--magenta)"
          strokeWidth="2"
        />
        <circle
          cx={CX}
          cy={CY}
          r={800}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="1.5"
        />
        {/* Anillo 1 — 8 pétalos · accent */}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={`a1${i}`}
            cx={CX}
            cy={CY - 226}
            rx={27}
            ry={73}
            fill="var(--accent)"
            transform={`rotate(${i * 45} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 1.5 — 8 puntos · highlight */}
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={`a15${i}`}
            cx={CX}
            cy={CY - 310}
            r={13}
            fill="var(--highlight)"
            transform={`rotate(${i * 45 + 22.5} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 2 — 8 diamantes · highlight */}
        {Array.from({ length: 8 }, (_, i) => (
          <polygon
            key={`a2${i}`}
            points={`${CX},${CY - 363} ${CX + 30},${CY - 393} ${CX},${CY - 423} ${CX - 30},${CY - 393}`}
            fill="var(--highlight)"
            transform={`rotate(${i * 45} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 3 — 12 pétalos largos · warning */}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={`a3${i}`}
            cx={CX}
            cy={CY - 540}
            rx={30}
            ry={93}
            fill="var(--warning)"
            transform={`rotate(${i * 30} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 3.5 — 12 puntos · accent */}
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={`a35${i}`}
            cx={CX}
            cy={CY - 626}
            r={10}
            fill="var(--accent)"
            transform={`rotate(${i * 30 + 15} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 4 — 8 pétalos grandes · magenta */}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={`a4${i}`}
            cx={CX}
            cy={CY - 673}
            rx={40}
            ry={113}
            fill="var(--magenta)"
            transform={`rotate(${i * 45 + 22.5} ${CX} ${CY})`}
          />
        ))}
        {/* Anillo 5 — 16 puntos exteriores · secondary */}
        {Array.from({ length: 16 }, (_, i) => (
          <circle
            key={`a5${i}`}
            cx={CX}
            cy={CY - 800}
            r={15}
            fill="var(--secondary)"
            transform={`rotate(${i * 22.5} ${CX} ${CY})`}
          />
        ))}
        {/* Centro */}
        <circle cx={CX} cy={CY} r={53} fill="var(--accent)" />
        <circle cx={CX} cy={CY} r={30} fill="var(--highlight)" />
        <circle cx={CX} cy={CY} r={10} fill="var(--surface)" />
      </svg>
    </div>
  )
}
