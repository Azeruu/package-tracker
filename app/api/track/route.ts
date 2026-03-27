import { NextResponse } from "next/server";

const BINDERBYTE_API_KEY = "8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d";

interface MockEntry {
  status: string;
  desc: string;
  history: {
    date: string;
    desc: string;
    location: string;
  }[];
}

const MOCK_DATA: Record<string, MockEntry> = {
  "MOCK-001": {
    "status": "ORDER_RECEIVED",
    "desc": "Pesanan diterima oleh sistem web",
    "history": [
      { "date": "2024-03-27 10:00:00", "desc": "Order received and being processed", "location": "Web System" }
    ]
  },
  "MOCK-002": {
    "status": "PURCHASED_IN_JAPAN",
    "desc": "Paket telah dibeli dan berada di gudang Jepang",
    "history": [
      { "date": "2024-03-27 12:00:00", "desc": "Item purchased and received at Tokyo Warehouse", "location": "Tokyo, JP" },
      { "date": "2024-03-27 10:00:00", "desc": "Order confirmed", "location": "Web System" }
    ]
  },
  "MOCK-003": {
    "status": "ON_FLIGHT_TO_INDO",
    "desc": "Paket dalam penerbangan menuju Indonesia",
    "history": [
      { "date": "2024-03-27 15:00:00", "desc": "Departed from Narita International Airport", "location": "Narita, JP" },
      { "date": "2024-03-27 12:00:00", "desc": "Processed at Tokyo Warehouse", "location": "Tokyo, JP" }
    ]
  },
  "MOCK-004": {
    "status": "ON PROCESS",
    "desc": "Paket telah sampai di Indonesia (Bea Cukai/Gudang Lokal)",
    "history": [
      { "date": "2024-03-28 08:00:00", "desc": "RECEIVED AT WAREHOUSE [JAKARTA]", "location": "Jakarta, ID" },
      { "date": "2024-03-27 22:00:00", "desc": "Arrived at Soekarno-Hatta International Airport", "location": "Tangerang, ID" }
    ]
  },
  "MOCK-005": {
    "status": "DELIVERED",
    "desc": "Paket telah diterima oleh penerima",
    "history": [
      { "date": "2024-03-29 14:00:00", "desc": "DELIVERED TO [CUSTOMER]", "location": "Destination" },
      { "date": "2024-03-29 09:00:00", "desc": "With delivery courier", "location": "Local Hub" },
      { "date": "2024-03-28 10:00:00", "desc": "Processed at sorting center", "location": "Jakarta, ID" }
    ]
  }
};

export async function POST(request: Request) {
  const { trackingNumber } = await request.json();

  if (!trackingNumber) {
    return NextResponse.json(
      { error: "Nomor resi wajib diisi" },
      { status: 400 }
    );
  }

  // 1. Cek apakah ini nomor resi mock
  const mock = MOCK_DATA[trackingNumber.toUpperCase()];
  if (mock) {
    return NextResponse.json({
      "status": 200,
      "message": "Successfully tracked package (Mock Data)",
      "data": {
        "summary": {
          "awb": trackingNumber,
          "courier": "JNE Express (Mock)",
          "service": "REG*",
          "status": mock.status,
          "date": mock.history[0].date,
          "desc": mock.desc,
          "amount": "0",
          "weight": "0.5Kg"
        },
        "detail": {
          "origin": "JAPAN",
          "destination": "INDONESIA",
          "shipper": "JAPAN STORE",
          "receiver": "TEST USER"
        },
        "history": mock.history
      }
    });
  }

  try {
    // 2. Jika bukan mock, panggil API Binderbyte asli
    const response = await fetch(
      `https://api.binderbyte.com/v1/track?api_key=${BINDERBYTE_API_KEY}&courier=jne&awb=${trackingNumber}`
    );

    const result = await response.json();

    if (result.status === 200) {
      return NextResponse.json(result);
    }

    // 3. Fallback jika resi tidak ditemukan (Asumsikan status awal di Jepang)
    return NextResponse.json({
      "status": 200,
      "message": "Resi belum terdaftar di kurir lokal, asumsikan masih di Jepang",
      "data": {
        "summary": {
          "awb": trackingNumber,
          "courier": "JNE Express",
          "service": "REG*",
          "status": "PURCHASED_IN_JAPAN",
          "date": new Date().toISOString(),
          "desc": "Paket sedang diproses di Jepang",
          "amount": "0",
          "weight": "0Kg"
        },
        "detail": {
          "origin": "JAPAN",
          "destination": "INDONESIA",
          "shipper": "JAPAN WAREHOUSE",
          "receiver": "CUSTOMER"
        },
        "history": [
          {
            "date": new Date().toISOString(),
            "desc": "PURCHASED IN JAPAN - Paket sedang disiapkan untuk pengiriman ke Indonesia",
            "location": "Tokyo, Japan"
          }
        ]
      }
    });

  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Gagal melacak paket. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
