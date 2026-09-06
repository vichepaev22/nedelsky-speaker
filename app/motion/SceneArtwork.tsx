import { scenes, type SceneType } from "./program-scenes";

// Shared by the HTML poster and Remotion: useful artwork exists before JS loads.
export function SceneArtwork({ type, compact = false, active = 0, progress = [1, 1, 1, 1], pulse = 0 }: {
  type: SceneType; compact?: boolean; active?: number; progress?: number[]; pulse?: number;
}) {
  const config = scenes[type];
  const width = compact ? 400 : 720;
  const height = compact ? 300 : 340;
  const points = compact ? [[100, 66], [300, 66], [100, 202], [300, 202]]
    : type === "partnership" ? [[360, 146], [125, 80], [150, 254], [590, 190]]
    : type === "ai" ? [[100, 100], [260, 224], [450, 100], [620, 224]]
    : type === "service" ? [[90, 168], [268, 104], [455, 211], [631, 126]]
    : [[90, 158], [270, 158], [450, 158], [630, 158]];
  const connections = type === "partnership" ? [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]] : [[0, 1], [1, 2], [2, 3]];
  return <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" fill="none" aria-hidden="true" style={{ display: "block" }}>
    {Array.from({ length: compact ? 40 : 96 }, (_, i) => <circle key={`dot-${i}`} cx={24 + (i % (compact ? 8 : 16)) * 45} cy={27 + Math.floor(i / (compact ? 8 : 16)) * 55} r="1" fill="#ffffff" opacity=".12" />)}
    {type === "partnership" && !compact && <circle cx="360" cy="146" r="116" stroke={config.accent} strokeOpacity=".15" strokeDasharray="3 7" />}
    {connections.map(([from, to], i) => {
      const [x1, y1] = points[from]; const [x2, y2] = points[to];
      const path = type === "service" ? `M ${x1} ${y1} C ${x1 + (compact ? 65 : 95)} ${y1}, ${x2 - (compact ? 65 : 95)} ${y2}, ${x2} ${y2}`
        : type === "procurement" && compact && from === 1 ? `M ${x1} ${y1} V 134 H ${x2} V ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
      const amount = progress[to];
      return <g key={`edge-${i}`}>
        <path d={path} stroke={config.accent} strokeOpacity=".16" strokeWidth="2" />
        <path d={path} pathLength="1" stroke={config.accent} strokeOpacity=".7" strokeWidth="2" strokeDasharray="1" strokeDashoffset={1 - amount} />
        {active === to && pulse > 0 && type !== "service" && !(type === "procurement" && compact && from === 1) && <circle cx={x1 + (x2 - x1) * amount} cy={y1 + (y2 - y1) * amount} r={3 + pulse * 3} fill={config.accent} opacity={pulse} />}
      </g>;
    })}
    {points.map(([x, y], i) => {
      const selected = i === active;
      const nodeWidth = compact ? 164 : (type === "partnership" && i === 3 ? 166 : 148);
      const scale = .94 + progress[i] * .06;
      return <g key={`node-${i}`} transform={`translate(${x} ${y}) scale(${scale})`} opacity={.38 + progress[i] * .62}>
        {selected && <rect x={-nodeWidth / 2 - 5 - pulse * 5} y={-42 - pulse * 5} width={nodeWidth + 10 + pulse * 10} height={84 + pulse * 10} rx="23" stroke={config.accent} opacity={.25 + pulse * .2} />}
        {type === "procurement" && <rect x={-nodeWidth / 2 + 7} y="-45" width={nodeWidth - 14} height="75" rx="12" fill="#303a57" stroke={config.accent} strokeOpacity=".25" />}
        <rect x={-nodeWidth / 2} y="-37" width={nodeWidth} height="74" rx={type === "procurement" ? 12 : 18} fill={selected ? config.accent : "#252f49"} stroke={config.accent} strokeOpacity={selected ? 1 : .3} />
        <text x="0" y="-9" textAnchor="middle" fill={selected ? "#172039" : config.accent} fontSize="13" letterSpacing="2" fontFamily="sans-serif">0{i + 1}{progress[i] >= 1 && i < active ? "  ✓" : ""}</text>
        <text x="0" y="16" textAnchor="middle" fill={selected ? "#172039" : "#faf7f0"} fontSize={compact ? 17 : 18} fontWeight="600" fontFamily="sans-serif">{config.stages[i].label}</text>
      </g>;
    })}
    {!compact && <text x="360" y="322" textAnchor="middle" fill="#bdc4d3" fontSize="15" letterSpacing=".5" fontFamily="sans-serif">{config.caption}</text>}
    {compact && <g><path d="M 28 281 H 372" stroke="#ffffff" strokeOpacity=".14" /><path d={`M 28 281 H ${28 + 344 * ((active + 1) / 4)}`} stroke={config.accent} strokeWidth="2" /></g>}
  </svg>;
}
