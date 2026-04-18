"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Sparkles, Clock } from "lucide-react"

const TARGET_DATE = new Date()
TARGET_DATE.setDate(TARGET_DATE.getDate() + 3)
TARGET_DATE.setHours(0, 0, 0, 0)

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now()
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { hours, minutes, seconds }
}

function AnimatedDigit({ value }: { value: number }) {
  return (
    <div className="relative h-[1em] w-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center bg-pink-50/50 backdrop-blur-sm border border-pink-200/50 rounded-xl px-4 py-3 md:px-6 md:py-5 min-w-[80px] md:min-w-[100px] shadow-sm overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="font-mono text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-pink-600">
          <AnimatedDigit value={value} />
        </span>
      </div>
      <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-pink-400">
        {label}
      </span>
    </div>
  )
}

interface CountdownBannerProps {
  onNotify?: () => void;
}

export function CountdownBanner({ onNotify }: CountdownBannerProps) {
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getTimeLeft())
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative w-full px-4 py-12 md:py-24 overflow-hidden flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[800px] h-[600px] bg-pink-200/20 rounded-full blur-3xl -top-1/2 -left-1/4" />
        <div className="absolute w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl bottom-0 right-0" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl border border-pink-200/50 bg-white/40 backdrop-blur-xl p-8 md:p-16 flex flex-col items-center gap-8 md:gap-12 text-center shadow-2xl overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center gap-4 relative z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-xs font-medium text-pink-600"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>限时优惠 即将开始</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800">
              VIP年卡限时特惠
            </h2>
            
            <p className="text-gray-500 text-base md:text-lg max-w-xl leading-relaxed">
              错过再等一年！原价698元，届时仅需298元。立即预约，锁定最低价。
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-10">
            <TimeUnit value={time?.hours ?? 0} label="小时" />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-pink-400 animate-pulse">:</span>
            </div>
            <TimeUnit value={time?.minutes ?? 0} label="分钟" />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-pink-400 animate-pulse">:</span>
            </div>
            <TimeUnit value={time?.seconds ?? 0} label="秒" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative z-10"
          >
            <button 
              onClick={onNotify}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-300/50"
            >
              <span>立即预约</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all border border-gray-200">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>提醒我</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
