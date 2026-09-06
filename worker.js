export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- API: baca & simpan data inventory secara terpusat ---
    if (url.pathname === "/api/state") {
      // Ambil data tersimpan
      if (request.method === "GET") {
        const data = await env.INV_KV.get("state");
        return new Response(data || "null", {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      }

      // Simpan data terbaru (dipanggil setiap ada perubahan: tambah barang,
      // pengambilan stok, restock, dll)
      if (request.method === "POST") {
        try {
          const body = await request.text();
          // Validasi ringan: pastikan body adalah JSON yang valid sebelum disimpan
          JSON.parse(body);
          await env.INV_KV.put("state", body);
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return new Response("Method Not Allowed", { status: 405 });
    }

    // --- Selain /api/*, sajikan file statis seperti biasa (index.html, dll) ---
    return env.ASSETS.fetch(request);
  },
};
