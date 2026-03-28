"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrackingProgress } from "@/components/tracking-progress";
import { cn } from "@/lib/utils";

// 1. Definisi Master Data Status (Sama dengan TrackingProgress)
const STATUS_STAGES = [
  {
    id: "ORDER_RECEIVED",
    label: "Pesanan Masuk",
    desc: "Pesanan dikonfirmasi dan masuk antrean jastip.",
    loc: "Sistem J-Track",
  },
  {
    id: "ITEM_BUYING",
    label: "Sedang Dibeli",
    desc: "Admin sedang menuju lokasi atau sedang mengantre di toko.",
    loc: "Tokyo/Osaka, Japan",
  },
  {
    id: "ITEM_BOUGHT",
    label: "Berhasil Dibeli",
    desc: "Item telah aman ditangan admin dan siap diproses.",
    loc: "Ginza, Tokyo",
  },
  {
    id: "ITEM_PACKING",
    label: "Sedang Dipacking",
    desc: "Proses packing ekstra aman dengan bubble wrap dan dus.",
    loc: "Warehouse Tokyo",
  },
  {
    id: "HANDED_OVER_JP",
    label: "Serah ke Kurir Jepang",
    desc: "Paket diserahkan ke pihak ekspedisi internasional (EMS/DHL).",
    loc: "Narita Airport",
  },
  {
    id: "ON_FLIGHT",
    label: "Terbang ke Indo",
    desc: "Pesanan dalam penerbangan udara menuju Jakarta.",
    loc: "Airspace",
  },
  {
    id: "ARRIVED_INDO",
    label: "Sampai di Indo (Bea Cukai)",
    desc: "Paket tiba di Indonesia dan sedang pemeriksaan Bea Cukai.",
    loc: "Bandara Soekarno-Hatta",
  },
  {
    id: "LOCAL_RECEIVED",
    label: "Diterima Kurir Lokal",
    desc: "Paket telah lolos sortir dan diterima kurir domestik.",
    loc: "Jakarta Gateway",
  },
  {
    id: "LOCAL_TRANSIT",
    label: "Dikirim Kurir Lokal",
    desc: "Paket sedang menuju gudang sortir kota tujuan.",
    loc: "On Transit",
  },
  {
    id: "JASTIP_HUB",
    label: "Sampai di Gudang Jastip",
    desc: "Paket sampai di gudang sortir utama jastip untuk re-check.",
    loc: "Warehouse Indo",
  },
  {
    id: "FINAL_DELIVERY",
    label: "Pengiriman ke Alamatmu",
    desc: "Kurir sedang dalam perjalanan menuju lokasi penerima.",
    loc: "Area Penerima",
  },
  {
    id: "DELIVERED",
    label: "Sampai di Tanganmu",
    desc: "Paket telah diterima dengan baik. Terima kasih!",
    loc: "Tujuan Akhir",
  },
];

interface HistoryItem {
  date: string;
  desc: string;
  location: string;
  statusLabel: string;
  isCompleted: boolean;
}

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packageStatus, setPackageStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleTrack = async () => {
    if (!trackingNumber) {
      setError("Masukkan nomor resi dulu ya.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPackageStatus(null);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error("Gagal melacak paket.");
      }

      const result = await response.json();
      
      if (result.status !== 200) {
        throw new Error(result.message || "Resi tidak ditemukan.");
      }

      const apiStatus = result.data.summary.status.toUpperCase();
      
      // 2. Map API status to our internal STATUS_STAGES
      let mappedStatus = "ORDER_RECEIVED";
      if (apiStatus === "DELIVERED") {
        mappedStatus = "DELIVERED";
      } else if (apiStatus === "ON PROCESS" || apiStatus === "RECEIVED AT WAREHOUSE") {
        mappedStatus = "ARRIVED_INDO";
      } else if (apiStatus === "ON_FLIGHT_TO_INDO" || apiStatus === "ON_FLIGHT") {
        mappedStatus = "ON_FLIGHT";
      } else if (apiStatus === "PURCHASED_IN_JAPAN" || apiStatus === "ITEM_BOUGHT") {
        mappedStatus = "ITEM_BOUGHT";
      } else if (apiStatus === "ORDER_RECEIVED") {
        mappedStatus = "ORDER_RECEIVED";
      } else {
        // Default mapping if not found
        mappedStatus = "ORDER_RECEIVED";
      }

      const currentIndex = STATUS_STAGES.findIndex((s) => s.id === mappedStatus);
      if (currentIndex === -1) throw new Error("Status paket tidak valid.");

      // 3. Logic Generate History Otomatis (Konsep Sebelumnya)
      // Kita ambil semua stage dari awal sampai currentIndex
      const generatedHistory = STATUS_STAGES.slice(0, currentIndex + 1)
        .map((stage, idx) => ({
          // Buat tanggal simulasi (mundur 1 jam setiap step)
          date: new Date(
            Date.now() - (currentIndex - idx) * 3600000,
          ).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          desc: stage.desc,
          location: stage.loc,
          statusLabel: stage.label,
          isCompleted: true,
        }))
        .reverse(); // Terbaru di atas

      setPackageStatus(mappedStatus);
      setHistory(generatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col w-full max-w-2xl mx-auto items-center py-12 px-4 gap-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-black dark:text-zinc-50 uppercase italic">
            J-Track <span className="text-red-600">Express</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Monitoring Logistik Jastip Jepang - Indonesia
          </p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-2xl flex gap-2 border border-zinc-200 dark:border-zinc-800">
          <Input
            type="text"
            placeholder="Nomor Resi: JTP-XXXXX"
            className="border-none focus-visible:ring-0 text-lg font-medium"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Button
            className="rounded-xl px-8 bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
            onClick={handleTrack}
            disabled={isLoading}
          >
            {isLoading ? "..." : "LACAK"}
          </Button>
        </div>

        {error && (
          <p className="text-red-500 font-medium animate-shake">{error}</p>
        )}

        {packageStatus && (
          <div className="w-screen md:flex md:flex-col-2 px-5 space-x-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Visual Progress (The Treasure Map) */}
            <TrackingProgress currentStatus={packageStatus} resiNumber={trackingNumber}/>

            {/* 2. Detailed History List */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border-4 border-amber-100 dark:border-zinc-800 shadow-2xl overflow-y-auto h-screen relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 font-serif uppercase tracking-widest">
                  Log Aktivitas
                </h3>
                <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-[10px] font-bold text-amber-700 uppercase">
                  Real-time Update
                </div>
              </div>

              <div className="space-y-0">
                {history.map((item, index) => {
                  const isLatest = index === 0;
                  const isFinished = packageStatus === "DELIVERED" && isLatest;

                  return (
                    <div key={index} className="flex gap-6 group relative">
                      {/* Line & Dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-4 transition-all duration-500 z-10",
                            isFinished
                              ? "bg-green-500 border-green-200 scale-125 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                              : isLatest
                                ? "bg-amber-500 border-amber-200 scale-125 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                : "bg-zinc-300 border-white dark:border-zinc-800",
                          )}
                        />
                        {index !== history.length - 1 && (
                          <div className="w-0.5 h-full bg-zinc-100 dark:bg-zinc-800 my-1" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={cn(
                          "pb-8 transition-all duration-500",
                          isLatest ? "opacity-100 translate-x-1" : "opacity-50",
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "text-[10px] font-bold font-mono uppercase tracking-tighter",
                              isFinished
                                ? "text-green-600"
                                : isLatest
                                  ? "text-amber-600"
                                  : "text-zinc-400",
                            )}
                          >
                            {item.date}{" "}
                            {isLatest && !isFinished && "— BARU SAJA"}
                          </span>
                          <h4
                            className={cn(
                              "text-base font-bold leading-tight",
                              isFinished
                                ? "text-green-700"
                                : "text-zinc-900 dark:text-zinc-100",
                            )}
                          >
                            {item.statusLabel}
                          </h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {item.desc}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-medium">
                              📍 {item.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
