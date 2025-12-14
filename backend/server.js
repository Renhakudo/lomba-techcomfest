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
    // Catatan: Pastikan nama model benar. Biasanya 'gemini-1.5-flash' atau 'gemini-2.0-flash-exp'
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    console.log('✅ Gemini AI berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Gagal inisialisasi Gemini:', error.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY tidak ditemukan di .env');
}

// --- 3. SYSTEM PROMPT ---
const createSystemPrompt = (modulesListText) => {
  return `
  KAMU ADALAH "SkillUp Assistant" UNTUK SEBUAH PLATFORM BELAJAR WEB.
  
  TUGAS UTAMA:
  Membantu user yang bingung dengan materi belajar, dan SELALU mengarahkan mereka untuk membuka MODUL yang tersedia di database kita.

  DAFTAR MODUL BESERTA LINK NYATA:
  ${modulesListText}

  ATURAN MENJAWAB:
  1. Jawab dengan bahasa Indonesia yang santai, suportif, dan ramah (seperti mentor).
  2. Jangan terpaku pada kata kunci persis. Pahami maksud user.
  3. [PENTING] Jika menyarankan modul, GUNAKAN FORMAT LINK MARKDOWN.
      Formatnya: [Judul Modul](Link URL)
      Contoh output: "Kamu bisa belajar ini di modul [HTML Dasar](http://link-tadi) ya."
  4. JANGAN menyarankan materi di luar platform ini.
  5. Jika modul tidak ditemukan, minta maaf dan tawarkan modul terdekat.
  `;
};

// --- 4. ENDPOINT HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'SkillUp Backend Running' });
});

// Root endpoint biar ga 404 kalau dibuka langsung
app.get('/', (req, res) => {
    res.send("SkillUp Backend is Live!");
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
      return res.status(500).json({ success: false, response: "Maaf, database sedang gangguan." });
    }

    // Format daftar modul
    let modulesContext = "Belum ada modul tersedia.";
    if (modules && modules.length > 0) {
      modulesContext = modules.map((m, idx) => {
        // Menggunakan URL dinamis
        const link = `${FRONTEND_BASE_URL}/${m.id}`;
        return `${idx + 1}. Modul: "${m.title}"\n   Link: ${link}\n   Isi: ${m.description}`;
      }).join('\n\n');
    }

    // B. LOGIKA AI (GEMINI)
    if (geminiModel) {
      try {
        const finalPrompt = `
          ${createSystemPrompt(modulesContext)}
          
          PERTANYAAN USER SEKARANG:
          "${message}"
          
          JAWABAN KAMU:
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
      response: "Maaf, asisten AI sedang istirahat. Tapi kamu bisa langsung cek menu 'Modul' untuk melihat materi lengkap kami ya!",
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
        console.log(`🚀 BACKEND LOCAL BERJALAN DI: http://localhost:${PORT}`);
        console.log(`🔗 Cek status: http://localhost:${PORT}/api/health`);
        console.log('='.repeat(50) + '\n');
    });
}

// WAJIB: Export app agar Vercel bisa menjalankannya
module.exports = app;