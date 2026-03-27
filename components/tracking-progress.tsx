import { cn } from "@/lib/utils";

// List status super detail (12 Tahap)
const statuses = [
  "Pesanan Masuk",
  "Sedang Dibeli",
  "Berhasil Dibeli",
  "Sedang Dipacking",
  "Serah ke Kurir Jepang",
  "Terbang ke Indo",
  "Sampai di Indo (Bea Cukai)",
  "Diterima Kurir Lokal",
  "Dikirim Kurir Lokal",
  "Sampai di Gudang Jastip",
  "Pengiriman ke Alamatmu",
  "Sampai di Tanganmu",
];

interface TrackingProgressProps {
  currentStatus: string;
}

export function TrackingProgress({ currentStatus }: TrackingProgressProps) {
  // Mapping logic untuk 12 status
  let activeStatus = "Pesanan Masuk";

  if (currentStatus === "ORDER_RECEIVED") activeStatus = "Pesanan Masuk";
  if (currentStatus === "ITEM_BUYING") activeStatus = "Sedang Dibeli";
  if (currentStatus === "ITEM_BOUGHT") activeStatus = "Berhasil Dibeli";
  if (currentStatus === "ITEM_PACKING") activeStatus = "Sedang Dipacking";
  if (currentStatus === "HANDED_OVER_JP")
    activeStatus = "Serah ke Kurir Jepang";
  if (currentStatus === "ON_FLIGHT") activeStatus = "Terbang ke Indo";
  if (currentStatus === "ARRIVED_INDO")
    activeStatus = "Sampai di Indo (Bea Cukai)";
  if (currentStatus === "LOCAL_RECEIVED") activeStatus = "Diterima Kurir Lokal";
  if (currentStatus === "LOCAL_TRANSIT") activeStatus = "Dikirim Kurir Lokal";
  if (currentStatus === "JASTIP_HUB") activeStatus = "Sampai di Gudang Jastip";
  if (currentStatus === "FINAL_DELIVERY")
    activeStatus = "Pengiriman ke Alamatmu";
  if (currentStatus === "DELIVERED") activeStatus = "Sampai di Tanganmu";

  const currentIndex = statuses.indexOf(activeStatus);
  const isFinished = currentIndex === statuses.length - 1;

  return (
    <div className="w-full p-8 bg-amber-50 dark:bg-zinc-900 rounded-3xl border-4 border-amber-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />

      <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-8 text-center font-serif uppercase tracking-widest">
        Logistik Jastip: Japan ➔ Indo
      </h2>

      {/* Tinggi dinaikkan ke 1100px karena ada 12 titik */}
      <div className="relative h-[1100px] w-full max-w-sm mx-auto">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 50 2 Q 95 10 85 20 T 15 35 T 85 50 T 15 65 T 85 80 T 50 98"
            fill="none"
            stroke="#d4a373"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-40"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col justify-between">
          {statuses.map((status, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isLastStep = index === statuses.length - 1;

            // Posisi 12 titik mengikuti lekukan path
            const positions = [
              { top: "2%", left: "50%" }, // Order Received
              { top: "10%", left: "85%" }, // Buying
              { top: "18%", left: "90%" }, // Bought
              { top: "27%", left: "60%" }, // Packing
              { top: "35%", left: "15%" }, // Handover JP
              { top: "44%", left: "45%" }, // Flight
              { top: "52%", left: "85%" }, // Arrived Indo
              { top: "61%", left: "60%" }, // Local Received
              { top: "70%", left: "15%" }, // Local Transit
              { top: "79%", left: "45%" }, // Jastip Hub
              { top: "89%", left: "80%" }, // Final Delivery
              { top: "98%", left: "50%" }, // Finished!
            ];

            const pos = positions[index];

            return (
              <div
                key={status}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 group"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="relative">
                  {/* Animasi hanya jika BELUM sampai tujuan akhir */}
                  {isCurrent && !isFinished && (
                    <>
                      <div className="absolute -inset-4 bg-amber-400 rounded-full animate-ping opacity-20" />
                      <div className="absolute -inset-3 bg-red-400 rounded-full animate-pulse opacity-30" />
                    </>
                  )}

                  <div
                    className={cn(
                      "w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 relative transition-all duration-700 shadow-md",
                      isActive
                        ? isFinished && isLastStep
                          ? "bg-green-600 border-green-800 text-white"
                          : "bg-amber-600 border-amber-900 text-white"
                        : "bg-white border-amber-200 text-amber-200",
                    )}
                  >
                    {isActive ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    "bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border-2 shadow-sm transition-all duration-500",
                    isActive
                      ? isFinished && isLastStep
                        ? "border-green-400 scale-110"
                        : "border-amber-400 scale-110"
                      : "border-transparent opacity-40 scale-90",
                    pos.left > "50%"
                      ? "order-first -translate-x-2"
                      : "order-last translate-x-0",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] sm:text-xs whitespace-nowrap font-bold uppercase tracking-tighter font-serif",
                      isActive
                        ? isFinished && isLastStep
                          ? "text-green-700 dark:text-green-300"
                          : "text-amber-900 dark:text-amber-100"
                        : "text-amber-300",
                    )}
                  >
                    {status}
                  </p>
                  {isCurrent && !isFinished && (
                    <p className="text-[7px] text-red-500 animate-bounce font-sans font-normal lowercase mt-0.5">
                      • update terbaru
                    </p>
                  )}
                  {isCurrent && isFinished && (
                    <p className="text-[7px] text-green-600 font-sans font-bold uppercase mt-0.5 tracking-widest">
                      Selesai ✨
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
