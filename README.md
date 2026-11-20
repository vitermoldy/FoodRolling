# FoodRolling

Game idle restoran sabuk berjalan di browser. Chef memasak di pulau tengah, piring berputar di sabuk,
dan pelanggan mengambil piring yang lewat di depan kursinya. Buka enam restoran berurutan, dari bar
sushi kaiten di Jepang sampai bistro di Paris.

## Cara main

1. **Lihat meter Dapur dan Kursi.** Pendapatan mengikuti sisi yang lebih lambat: kalau pelanggan
   menunggu makanan, dapur yang menahan; kalau piring menumpuk di sabuk, kursi yang menahan.
2. **Upgrade restoran:**
   - **Pendapatan** menaikkan harga semua piring 10% per level, dan di level 5, 12, 20, dan 30
     menambah hidangan yang lebih mahal ke menu.
   - **Kecepatan** mempercepat chef memasak, pelanggan makan, dan sabuk berputar.
   - **Jumlah chef** menambah chef di pulau tengah (sampai 6).
   - **Tempat duduk** menambah kursi di sekeliling sabuk (sampai 16).
   Pilih x1, x10, atau Maks untuk membeli beberapa level sekaligus.
3. **Bantu sendiri.** Seret sabuk untuk memutarnya, ketuk chef untuk mempercepat masakannya. Di keyboard,
   tombol "Bantu chef" melakukan hal yang sama.
4. **Buka restoran berikutnya.** Setiap restoran harus dibeli, dan hanya bisa dibuka berurutan. Restoran
   lama tetap berjalan dan menghasilkan uang, juga saat kamu melihat restoran lain.

| No | Restoran | Negara | Harga buka | Suasana |
|---|---|---|---|---|
| 1 | Kaiten Hinoki | Jepang | gratis | Dinding kayu hinoki, shoji, noren, lentera kertas |
| 2 | Trattoria Basilico | Italia | 3 rb | Dinding bata, taplak kotak-kotak, rak botol, oven batu |
| 3 | Rumah Makan Gonjong | Indonesia | 180 rb | Ukiran Minang, atap gonjong, etalase piring Padang, sate |
| 4 | Taquería Nopal | Meksiko | 7,5 jt | Papel picado, ubin talavera, kaktus, comal |
| 5 | Rasoi Kesar | India | 330 jt | Lengkung jharokha, kalung marigold, lampu kuningan, tandoor |
| 6 | Bistro Lumière | Prancis | 15 M | Lantai mosaik, cermin emas, papan menu kapur |

Warna piring menandai harga: biru, hijau, merah, emas, hitam, dari termurah sampai termahal. Tab
Menu menampilkan hidangan restoran di sabuk menu dari `Prompt.txt`.

Progres tersimpan otomatis di `localStorage` setiap 5 detik dan saat tab ditutup. Selama game ditutup,
restoran tetap menghasilkan uang sampai 8 jam.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5191
npm run build      # hasil di dist/, bisa dibuka dari host statis mana pun
npm test           # tes aturan game dan simulasi sabuk (vitest)
npm run balance    # bot rakus memainkan game dan mencetak kapan tiap restoran terbuka
```

Butuh Node 22 atau lebih baru. Di Windows, jalankan vitest dari `C:\...` (huruf besar), bukan `c:\...`.
Vite sudah dikunci ke satu ejaan lewat `vite.config.ts`. Tambahkan `?debug` ke alamat untuk membuka
`window.__stage` (simulasi dan tata letak panggung) bagi skrip uji klik.

