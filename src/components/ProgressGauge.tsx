const CX = 100;
const CY = 100;
const R = 80;
const NEEDLE_R = 65;

function angleToPoint(deg: number, r: number, cx: number, cy: number) {
  const rad = Math.PI - (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(
  startDeg: number,
  endDeg: number,
  r: number,
  cx: number,
  cy: number,
) {
  if (endDeg <= startDeg) return "";
  const s = angleToPoint(startDeg, r, cx, cy);
  const e = angleToPoint(endDeg, r, cx, cy);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

interface Props {
  completed: number;
  inProgress: number;
  total: number;
}

export function ProgressGauge({ completed, inProgress, total }: Props) {
  const safeTotal = total > 0 ? total : 1;
  const completedDeg = (completed / safeTotal) * 180;
  const inProgressDeg = (inProgress / safeTotal) * 180;
  const needleDeg = completedDeg + inProgressDeg;
  const percent = Math.round((completed / safeTotal) * 100);
  const _MARGIN_TO_ARCH = 20;

  const needle = angleToPoint(needleDeg, NEEDLE_R, CX, CY);

  return (
    <svg
      viewBox="0 0 200 140"
      className="w-full"
      aria-label={`Progreso: ${percent}% aprobado`}
    >
      <path
        d={arcPath(0, 180, R, CX, CY)}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={14}
        strokeLinecap="round"
      />

      {completedDeg > 0 ? (
        <path
          d={arcPath(0, completedDeg, R, CX, CY)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={14}
          strokeLinecap="round"
        />
      ) : null}

      {inProgressDeg > 0 ? (
        <path
          d={arcPath(completedDeg, completedDeg + inProgressDeg, R, CX, CY)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={14}
          strokeLinecap="round"
        />
      ) : null}

      <line
        x1={CX}
        y1={CY}
        x2={needle.x.toFixed(2)}
        y2={needle.y.toFixed(2)}
        stroke="#1f2937"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={4} fill="#1f2937" />

      <text
        x={CX}
        y={CY - 20}
        textAnchor="middle"
        fontSize={20}
        fontWeight="700"
        fill="#111827"
      >
        {percent}%
      </text>
      <text
        x={CX}
        y={CY + _MARGIN_TO_ARCH}
        textAnchor="middle"
        fontSize={10}
        fill="#6b7280"
      >
        aprobado
      </text>

      <text
        x={22}
        y={CY + _MARGIN_TO_ARCH}
        textAnchor="middle"
        fontSize={9}
        fill="#9ca3af"
      >
        0
      </text>
      <text
        x={178}
        y={CY + _MARGIN_TO_ARCH}
        textAnchor="middle"
        fontSize={9}
        fill="#9ca3af"
      >
        {total}
      </text>
    </svg>
  );
}
