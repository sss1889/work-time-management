import { cn } from "@/lib/utils"

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color = "hsl(var(--primary))",
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth * 2) / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}