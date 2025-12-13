import { useEffect, useState } from 'react'

interface ProgressBarProps {
  duration?: number
}

const ProgressBarTw = ({ duration = 8000 }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    // update every 16ms for smooth animation
    const interval = setInterval(() => {
      const timeElapsed = Date.now() - start
      const progressPercentage = Math.min((timeElapsed / duration) * 100, 100)
      setProgress(progressPercentage)

      if (progressPercentage >= 100) clearInterval(interval)
    }, 16)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="bg-ibis-blue h-full rounded-full transition-all duration-150 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBarTw
