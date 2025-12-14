const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// --- PENGATURAN URL FRONTEND (PENTING) ---
// Di Vercel nanti, tambahkan Environment Variable: FRONTEND_URL = https://link-web-kamu.vercel.app
// Jika tidak ada, dia akan pakai localhost (untuk testing di laptop)
const FRONTEND_BASE_URL = (process.env.FRONTEND_URL || "http://localhost:8080") + "/module";

// --- MIDDLEWARE (CORS UPDATE) ---
// Kita izinkan semua origin (*) sementara agar saat lomba tidak ada error 'Blocked by CORS'
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// --- 1. INISIALISASI SUPABASE ---
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ FATAL ERROR: SUPABASE_URL atau KEY hilang di file .env');
}
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '', 
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// --- 2. INISIALISASI GEMINI AI ---
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Catatan: Pastikan nama model benar sesuai akses API Anda (misal: 'gemini-1.5-flash')
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    console.log('✅ Gemini AI berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Gagal inisialisasi Gemini:', error.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY tidak ditemukan di .env');
}

// --- 3. SYSTEM PROMPT (UPDATED FOR TERA) ---
const createSystemPrompt = (modulesListText) => {
  return `
  KAMU ADALAH "Tera Assistant", ASISTEN PINTAR UNTUK PLATFORM PENGEMBANGAN KOMPETENSI GURU.
  
  TUGAS UTAMA:
  Membantu rekan guru atau pengguna yang membutuhkan panduan terkait materi Koding & Kecerdasan Artifisial (KKA), dan SELALU mengarahkan mereka untuk membuka MODUL yang tersedia di database kami.

  DAFTAR MODUL TERSEDIA BESERTA LINK AKSES:
  ${modulesListText}

  ATURAN MENJAWAB:
  1. Jawab dengan bahasa Indonesia yang profesional namun hangat, suportif, dan memotivasi (seperti rekan sejawat atau mentor yang asik).
  2. Jangan terpaku pada kata kunci persis. Pahami konteks kebutuhan pembelajaran mereka.
  3. [PENTING] Jika menyarankan materi, WAJIB GUNAKAN FORMAT LINK MARKDOWN.
     Formatnya: [Judul Modul](Link URL)
     Contoh output: "Untuk memperdalam topik ini, Ibu/Bapak bisa mempelajari modul [Dasar Pemrograman Visual](http://link-tadi) yang telah kami siapkan."
  4. JANGAN menyarankan materi atau platform di luar ekosistem Tera.
  5. Jika modul spesifik tidak ditemukan, minta maaf dengan sopan dan tawarkan modul yang paling relevan atau mendekati topik tersebut.
  `;
};

// --- 4. ENDPOINT HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Tera Backend Running' });
});

// Root endpoint biar ga 404 kalau dibuka langsung
app.get('/', (req, res) => {
    res.send("Tera Backend is Live!");
});

// --- 5. ENDPOINT CHAT UTAMA ---
app.post('/api/chat', async (req, res) => {
  console.log('📨 Pesan masuk:', req.body.message);

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Pesan tidak boleh kosong' });
    }

    // A. AMBIL DATA DARI SUPABASE
    const { data: modules, error: dbError } = await supabase
      .from('modules')
      .select('id, title, description'); 

    if (dbError) {
      console.error('❌ Supabase Error:', dbError.message);
      return res.status(500).json({ success: false, response: "Mohon maaf, sistem database sedang mengalami kendala." });
    }

    // Format daftar modul
    let modulesContext = "Belum ada modul tersedia saat ini.";
    if (modules && modules.length > 0) {
      modulesContext = modules.map((m, idx) => {
        // Menggunakan URL dinamis
        const link = `${FRONTEND_BASE_URL}/${m.id}`;
        return `${idx + 1}. Modul: "${m.title}"\n   Link: ${link}\n   Deskripsi: ${m.description}`;
      }).join('\n\n');
    }

    // B. LOGIKA AI (GEMINI)
    if (geminiModel) {
      try {
        const finalPrompt = `
          ${createSystemPrompt(modulesContext)}
          
          PERTANYAAN PENGGUNA SAAT INI:
          "${message}"
          
          JAWABAN TERA ASSISTANT:
        `;

        const result = await geminiModel.generateContent(finalPrompt);
        const responseAI = result.response.text();
        
        console.log('✅ AI Menjawab');
        return res.json({ success: true, response: responseAI, source: 'gemini' });

      } catch (aiError) {
        console.error('❌ Gemini Error:', aiError.message);
        // Lanjut ke fallback
      }
    }

    // C. FALLBACK
    console.log('⚠️ Menggunakan Fallback Response');
    res.json({
      success: true,
      response: "Mohon maaf, asisten Tera sedang istirahat sejenak. Namun, Anda tetap bisa mengeksplorasi materi lengkap kami melalui menu 'Modul'. Semangat belajar!",
      source: 'fallback'
    });

  } catch (serverError) {
    console.error('🔥 CRITICAL SERVER ERROR:', serverError);
    res.status(500).json({ 
      success: false, 
      response: "Terjadi kesalahan sistem internal. Server tetap berjalan." 
    });
  }
});

// --- 6. KONFIGURASI SERVER (VERCEL COMPATIBLE) ---
// Hanya jalankan app.listen kalau di local (bukan production Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log(`🚀 BACKEND TERA BERJALAN DI: http://localhost:${PORT}`);
        console.log(`🔗 Cek status: http://localhost:${PORT}/api/health`);
        console.log('='.repeat(50) + '\n');
    });
}

// WAJIB: Export app agar Vercel bisa menjalankannya
module.exports = app;