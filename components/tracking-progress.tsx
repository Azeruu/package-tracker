"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingCart,
  CheckCircle2,
  BoxSelect,
  Truck,
  Plane,
  Building2,
  PackageCheck,
  Bike,
  Warehouse,
  MapPin,
  PartyPopper,
} from "lucide-react";

// ─── Status map ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, number> = {
  ORDER_RECEIVED: 0,
  ITEM_BUYING: 1,
  ITEM_BOUGHT: 2,
  ITEM_PACKING: 3,
  HANDED_OVER_JP: 4,
  ON_FLIGHT: 5,
  ARRIVED_INDO: 6,
  LOCAL_RECEIVED: 7,
  LOCAL_TRANSIT: 8,
  JASTIP_HUB: 9,
  FINAL_DELIVERY: 10,
  DELIVERED: 11,
};

const STEPS = [
  {
    label: "Pesanan Masuk",
    icon: Package,
    desc: "Pesanan kamu telah diterima",
  },
  {
    label: "Sedang Dibeli",
    icon: ShoppingCart,
    desc: "Tim kami sedang membeli item",
  },
  {
    label: "Berhasil Dibeli",
    icon: CheckCircle2,
    desc: "Item berhasil dibeli",
  },
  {
    label: "Sedang Dipacking",
    icon: BoxSelect,
    desc: "Item sedang dikemas dengan aman",
  },
  { label: "Serah ke Kurir", icon: Truck, desc: "Diserahkan ke kurir Jepang" },
  {
    label: "Terbang ke Indo",
    icon: Plane,
    desc: "Paket dalam penerbangan udara",
  },
  {
    label: "Sampai di Indo",
    icon: Building2,
    desc: "Proses clearance bea cukai",
  },
  {
    label: "Diterima Kurir",
    icon: PackageCheck,
    desc: "Kurir lokal menerima paket",
  },
  { label: "Transit Lokal", icon: Bike, desc: "Dalam perjalanan antar kota" },
  {
    label: "Sampai Gudang",
    icon: Warehouse,
    desc: "Paket tiba di gudang jastip",
  },
  { label: "Pengiriman", icon: MapPin, desc: "Dalam perjalanan ke alamatmu" },
  {
    label: "Selesai",
    icon: PartyPopper,
    desc: "Paket tiba! Selamat menikmati",
  },
];

// ─── Koordinat Map & Arah Pesawat (Presisi 100%) ─────────────────────────────
type LabelSide = "right" | "left" | "top" | "bottom";

const POSITIONS: {
  topPct: number;
  leftPct: number;
  labelSide: LabelSide;
  angle: number;
}[] = [
  { topPct: 6, leftPct: 6, labelSide: "bottom", angle: 45 },
  { topPct: 6, leftPct: 52, labelSide: "bottom", angle: 45 },
  { topPct: 6, leftPct: 90, labelSide: "left", angle: 135 },
  { topPct: 32, leftPct: 70, labelSide: "top", angle: 225 },
  { topPct: 32, leftPct: 32, labelSide: "top", angle: 225 },
  { topPct: 52, leftPct: 17, labelSide: "top", angle: 45 },
  { topPct: 52, leftPct: 52, labelSide: "top", angle: 45 },
  { topPct: 54, leftPct: 90, labelSide: "left", angle: 135 },
  { topPct: 71, leftPct: 72, labelSide: "bottom", angle: 225 },
  { topPct: 67, leftPct: 30, labelSide: "top", angle: 225 },
  { topPct: 92, leftPct: 7, labelSide: "top", angle: 45 },
  { topPct: 94, leftPct: 55, labelSide: "right", angle: 45 },
];

// ─── Pemecahan Segmen SVG ────────────────────────────────────────────────────
const SNAKE_PATH_FULL =
  "M 6 6 C 1 6, 25 12, 52 6 C 47 6, 85 1, 90 6 C 90 4, 100 15, 70 32 C 70 32, 45 40, 32 32 C 2 25, 10 50, 17 52 C 16 52, 25 60, 52 52 C 52 52, 75 45, 90 54 C 98 62, 80 80, 72 71 C 72 71, 60 60, 30 67 C 1 71, 1 91, 7 92 C 7 95, 26 90, 55 94";

const PATH_SEGMENTS = [
  "M 6 6 C 1 6, 25 12, 52 6",
  "M 52 6 C 47 6, 85 1, 90 6",
  "M 90 6 C 90 4, 100 15, 70 32",
  "M 70 32 C 70 32, 45 40, 32 32",
  "M 32 32 C 2 25, 10 50, 17 52",
  "M 17 52 C 16 52, 25 60, 52 52",
  "M 52 52 C 52 52, 75 45, 90 54",
  "M 90 54 C 98 62, 80 80, 72 71",
  "M 72 71 C 72 71, 60 60, 30 67",
  "M 30 67 C 1 71, 1 91, 7 92",
  "M 7 92 C 7 95, 26 90, 55 94",
];

// Helper class responsif untuk margin Label agar menyesuaikan layar
const LABEL_POSITION_CLASSES = {
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5 md:ml-3.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5 md:mr-3.5",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5 md:mb-3.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5 md:mt-3.5",
};

interface TrackingProgressProps {
  currentStatus: string;
  resiNumber?: string;
}

export function TrackingProgress({
  currentStatus,
  resiNumber,
}: TrackingProgressProps) {
  const currentIndex = STATUS_MAP[currentStatus] ?? 0;
  const isFinished = currentIndex === STEPS.length - 1;

  return (
    <div className="border border-2 border-amber-100 dark:border-zinc-800 rounded-[2.5rem] p-8 border-4 border-amber-100 dark:border-zinc-800 shadow-2xl w-full max-w-5xl h-screen overflow-y-auto mx-auto select-none p-2 sm:p-4">
      <div className="relative rounded-2xl sm:rounded-3xl border-2 border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-zinc-900 shadow-xl overflow-hidden flex flex-col min-h-full">
        {/* Parchment texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b45309' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* ── Header ── */}
        <div className="relative px-4 sm:px-6 pt-5 pb-4 border-b border-amber-200/50 flex-none z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8.5px] sm:text-[10px] font-semibold tracking-[0.18em] uppercase text-amber-600/70 mb-0.5">
                Logistik Jastip
              </p>
              <h2 className="text-sm sm:text-base font-bold text-amber-900 font-serif tracking-wide">
                Japan <span className="text-amber-500">→</span> Indo
              </h2>
            </div>
            {resiNumber && (
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] tracking-wider uppercase text-amber-600/60 mb-0.5">
                  No. Resi
                </p>
                <p className="text-[10px] sm:text-xs font-mono font-semibold text-amber-800">
                  {resiNumber}
                </p>
              </div>
            )}
          </div>

          <div className="relative mt-4 sm:mt-5 h-1.5 rounded-full bg-amber-100 dark:bg-zinc-800 flex items-center">
            <motion.div
              className="absolute left-0 h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
            <motion.div
              className="absolute z-10 text-amber-600 drop-shadow-md -translate-x-1/2"
              initial={{ left: 0 }}
              animate={{
                left: `${((currentIndex + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-600 rotate-[45deg]" />
            </motion.div>
          </div>

          <div className="flex justify-between mt-1.5 sm:mt-2">
            <span className="text-[8px] sm:text-[9px] text-amber-600/60 font-sans">
              Mulai
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold text-amber-700 font-sans">
              {currentIndex + 1} / {STEPS.length}
            </span>
            <span className="text-[8px] sm:text-[9px] text-amber-600/60 font-sans">
              Selesai
            </span>
          </div>
        </div>

        {/* ── Map area (Responsif Tinggi) ── */}
        <div className="relative px-3 py-6 sm:py-8 flex-1">
          {/* Tinggi dinamis: 600px di mobile, 900px di tablet/desktop agar proporsi peta tetap cantik */}
          <div className="relative w-full h-[550px] sm:h-[700px] md:h-[900px] transition-all duration-300">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={SNAKE_PATH_FULL}
                fill="none"
                stroke="#d4a373"
                strokeWidth="0.8"
                strokeDasharray="3 2.5"
                opacity="0.3"
              />
              {PATH_SEGMENTS.map((segment, i) => {
                if (i >= currentIndex) return null;
                return (
                  <motion.path
                    key={`segment-${i}`}
                    d={segment}
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                    strokeLinecap="round"
                    opacity="0.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.15 + 0.2,
                      ease: "linear",
                    }}
                  />
                );
              })}
            </svg>

            {!isFinished && (
              <motion.div
                className="absolute z-30 text-amber-600 drop-shadow-xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${POSITIONS[currentIndex].topPct}%`,
                  left: `${POSITIONS[currentIndex].leftPct}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.1, y: [0, -3, 0] }}
                transition={{
                  scale: { delay: currentIndex * 0.15 + 0.3, type: "spring" },
                  opacity: { delay: currentIndex * 0.15 + 0.3 },
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                }}
              >
                <Plane
                  className="w-5 h-5 md:w-6 md:h-6 fill-current"
                  style={{
                    transform: `rotate(${POSITIONS[currentIndex].angle}deg)`,
                  }}
                />
              </motion.div>
            )}

            {STEPS.map((step, i) => {
              const pos = POSITIONS[i];
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const isDone = isFinished && i === STEPS.length - 1;
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="absolute z-20 pointer-events-none"
                  style={{ top: `${pos.topPct}%`, left: `${pos.leftPct}%` }}
                >
                  <div className="relative w-0 h-0 flex items-center justify-center">
                    {/* Lingkaran Ikon - Mengecil di Mobile (w-6), Besar di Desktop (w-9) */}
                    <motion.div
                      className="absolute z-10 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.4,
                        ease: "backOut",
                      }}
                    >
                      <div className="relative flex items-center justify-center w-6 h-6 md:w-9 md:h-9">
                        {isCurrent && !isFinished && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
                            <span className="absolute -inset-1 rounded-full bg-amber-300/20 animate-pulse" />
                          </>
                        )}
                        <motion.div
                          className={cn(
                            "relative z-10 w-6 h-6 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors duration-500",
                            isDone
                              ? "bg-emerald-500 border-emerald-700 text-white"
                              : isActive
                                ? "bg-amber-500 border-amber-700 text-white"
                                : "bg-white border-amber-200 text-amber-300",
                          )}
                        >
                          {isActive ? (
                            <Icon
                              className="w-3.5 h-3.5 md:w-[15px] md:h-[15px]"
                              strokeWidth={2.5}
                            />
                          ) : (
                            <span className="text-[7.5px] md:text-[10px] font-bold font-serif">
                              {i + 1}
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Label Teks - Membungkus otomatis (wrapping) agar tidak tabrakan di mobile */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.1, duration: 0.35 }}
                        className={cn(
                          "absolute rounded-lg md:rounded-xl border px-1.5 py-1 md:px-2.5 md:py-1.5 shadow-sm backdrop-blur-sm transition-all",
                          "w-max max-w-[70px] sm:max-w-[100px] md:max-w-[140px]", // <- Kunci anti-tabrak (Auto Wrap di Mobile)
                          LABEL_POSITION_CLASSES[pos.labelSide],
                          isDone
                            ? "bg-emerald-50/90 border-emerald-300"
                            : isCurrent
                              ? "bg-white/95 border-amber-400 shadow-amber-200/60 shadow-md z-30"
                              : isActive
                                ? "bg-white/90 border-amber-200"
                                : "bg-white/50 border-transparent opacity-40",
                        )}
                      >
                        <p
                          className={cn(
                            "text-[7px] md:text-[9.5px] font-bold uppercase tracking-tight font-serif text-center md:text-left leading-[1.1] md:leading-normal whitespace-normal md:whitespace-nowrap",
                            isDone
                              ? "text-emerald-700"
                              : isCurrent
                                ? "text-amber-900"
                                : isActive
                                  ? "text-amber-800"
                                  : "text-amber-300",
                          )}
                        >
                          {step.label}
                        </p>
                        {isCurrent && !isFinished && (
                          <motion.p
                            className="text-[6px] md:text-[7.5px] text-red-500 font-sans mt-0.5 leading-none text-center md:text-left"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          >
                            ● update
                          </motion.p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer status pill (Dikecilkan proporsinya untuk mobile) ── */}
        <div className="relative px-4 sm:px-6 pb-4 sm:pb-5 pt-2 sm:pt-3 border-t border-amber-200/50 bg-white/40 dark:bg-black/20 flex-none z-10">
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={cn(
              "flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border backdrop-blur-md shadow-sm",
              isFinished
                ? "bg-emerald-50/80 border-emerald-200"
                : "bg-white/80 border-amber-200",
            )}
          >
            {(() => {
              const Icon = STEPS[currentIndex].icon;
              return (
                <div
                  className={cn(
                    "w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0",
                    isFinished
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600",
                  )}
                >
                  <Icon
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                    strokeWidth={2}
                  />
                </div>
              );
            })()}
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[7.5px] sm:text-[9px] font-semibold uppercase tracking-widest leading-none mb-0.5 sm:mb-1",
                  isFinished ? "text-emerald-600/70" : "text-amber-600/70",
                )}
              >
                Status terkini
              </p>
              <p
                className={cn(
                  "text-xs sm:text-sm font-bold font-serif truncate leading-tight",
                  isFinished ? "text-emerald-800" : "text-amber-900",
                )}
              >
                {STEPS[currentIndex].label}
              </p>
              <p className="text-[8px] sm:text-[10px] text-amber-600/70 font-sans leading-tight mt-0.5 truncate">
                {STEPS[currentIndex].desc}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
