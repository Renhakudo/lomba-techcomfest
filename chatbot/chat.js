import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * CATATAN PENTING:
 * - Tidak pakai express
 * - Tidak pakai cors()
 * - Tidak pakai app.listen()
 * - Semua logic tetap sama
 */

// [EDIT] Base URL modul (GANTI ke domain kamu nanti)
const FRONTEND_BASE_URL = "https://domain-kamu.vercel.app/module";

// --- 1. INISIALISASI SUPABASE ---
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ FATAL ERROR: SUPABASE ENV TIDAK DITEMUKAN');
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// --- 2. INISIALISASI GEMINI ---
let geminiModel = null;

if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    console.log('✅ Gemini AI siap');
  } catch (err) {
    console.error('❌ Gagal init Gemini:', err.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY tidak ada');
}

// --- 3. SYSTEM PROMPT (TETAP SAMA) ---
const createSystemPrompt = (modulesListText) => `
KAMU ADALAH "SkillUp Assistant" UNTUK SEBUAH PLATFORM BELAJAR WEB.

TUGAS UTAMA:
Membantu user yang bingung dengan materi belajar, dan SELALU mengarahkan mereka untuk membuka MODUL yang tersedia di database kita.

DAFTAR MODUL BESERTA LINK NYATA:
${modulesListText}

ATURAN MENJAWAB:
1. Jawab dengan bahasa Indonesia yang santai, suportif, dan ramah (seperti mentor).
2. Jangan terpaku pada kata kunci persis. Pahami maksud user.
3. [PENTING] Jika menyarankan modul, GUNAKAN FORMAT LINK MARKDOWN.
   Format: [Judul Modul](Link URL)
4. JANGAN menyarankan materi di luar platform ini.
5. Jika modul tidak ditemukan, minta maaf dan tawarkan modul terdekat.
`;

// ======================================================
// 🔥 SERVERLESS HANDLER (PENGGANTI app.post)
// ======================================================
export default async function handler(req, res) {

  // --- HEALTH CHECK ---
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      service: 'SkillUp Serverless Running'
    });
  }

  // --- VALIDASI METHOD ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📨 Pesan masuk:', req.body?.message);

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Pesan tidak boleh kosong'
      });
    }

    // --- A. AMBIL DATA MODUL DARI SUPABASE ---
    const { data: modules, error: dbError } = await supabase
      .from('modules')
      .select('id, title, description');

    if (dbError) {
      console.error('❌ Supabase Error:', dbError.message);
      return res.status(500).json({
        success: false,
        response: "Maaf, database sedang gangguan."
      });
    }

    let modulesContext = "Belum ada modul tersedia.";
    if (modules && modules.length > 0) {
      modulesContext = modules.map((m, idx) => {
        const link = `${FRONTEND_BASE_URL}/${m.id}`;
        return `${idx + 1}. Modul: "${m.title}"
Link: ${link}
Isi: ${m.description}`;
      }).join('\n\n');
    }

    // --- B. GEMINI AI ---
    if (geminiModel) {
      try {
        const finalPrompt = `
${createSystemPrompt(modulesContext)}

PERTANYAAN USER:
"${message}"

JAWABAN KAMU:
`;

        const result = await geminiModel.generateContent(finalPrompt);
        const responseAI = result.response.text();

        return res.status(200).json({
          success: true,
          response: responseAI,
          source: 'gemini'
        });

      } catch (aiError) {
        console.error('❌ Gemini Error:', aiError.message);
        // lanjut fallback
      }
    }

    // --- C. FALLBACK ---
    return res.status(200).json({
      success: true,
      response: "Maaf, asisten AI sedang istirahat. Tapi kamu bisa langsung cek menu 'Modul' untuk melihat materi lengkap kami ya!",
      source: 'fallback'
    });

  } catch (err) {
    console.error('🔥 CRITICAL ERROR:', err);
    return res.status(500).json({
      success: false,
      response: "Terjadi kesalahan sistem internal."
    });
  }
}
