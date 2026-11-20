# DESIGN.md: FoodRolling (game idle restoran)

## Arah

Arah visual datang dari komponen yang diberikan pemilik proyek di `Prompt.txt`: **sushi conveyor menu**,
sabuk kaiten berbentuk stadion yang dilihat agak dari atas, dengan piring yang cincinnya berwarna
menurut harga. Game ini meneruskan bahasa itu: ruang restoran 2.5D yang digambar sebagai ilustrasi
datar dengan bayangan lembut, sabuk yang sama di tengah, dan warna piring sebagai penanda harga di
mana pun harga muncul.

Keputusan pemilik (20 November 2026): gaya ilustrasi 2.5D (bukan pixel art, bukan 3D), semua restoran
yang sudah dibeli tetap berjalan, dan enam restoran berurutan: Jepang, Italia, Indonesia, Meksiko,
India, Prancis.

Design read: game idle restoran untuk pemain santai yang senang melihat dapur bekerja, dalam bahasa
ilustrasi sabuk kaiten dari komponen prompt.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2

- ENERGY 2: panggung restoran menjadi pusat perhatian; panel tenang seperti kartu menu kertas supaya
  angka mudah dibaca.
- RHYTHM 2: dua kolom yang konsisten (panggung, panel) dengan satu perubahan besar: restoran yang
  belum dibuka memakai kartu buka di tengah ruangan kosongnya.
- MOTION 2: gerak hanya ada di panggung (sabuk, chef, pelanggan, piring terbang, koin). Panel hanya
  punya transisi tombol.

## Motif identitas: warna piring

Seperti bar kaiten sungguhan, warna piring adalah harganya. Lima warna yang sama dipakai di sabuk,
di tumpukan piring di depan pelanggan, di legenda menu, di ikon Pendapatan, dan di bar kemajuan.

| Warna | Hex | Harga (x harga dasar restoran) |
|---|---|---|
| Biru | #3a7cc2 | 1 |
| Hijau | #3f9450 | 1,8 |
| Merah | #cf4430 | 3,2 |
| Emas | #c99317 | 5,5 |
| Hitam | #2b2a28 | 9 |

## Keputusan dan alasannya

| Keputusan | Alasan |
|---|---|
| Palet "olive on bone": latar #ecebe7, permukaan #e1dfd9, kertas #f8f7f3, tinta zaitun #38450f, teks kedua #56622f | Dipilih oleh `start.mjs deal --page gaming --trade restaurant` dari taste-skill (pilihan pertama). Batu hangat dan zaitun terbaca seperti kartu menu dan linen dapur, netral di samping enam ruangan yang warnanya ramai. |
| Satu tema terang, tanpa mode gelap | Ruangan adalah restoran terang yang digambar dengan warna tetap. Versi gelap butuh pencahayaan ulang semua ilustrasi. `dark:` dari komponen prompt diikat ke kelas yang tidak pernah dipasang, sehingga komponen tetap terang di sistem bermode gelap. |
| Satu aksen per restoran (merah lentera, merah bata, merah Padang, biru talavera, hijau tosca, biru Paris) | Aksen hanya dipakai untuk grafik: penanda tab restoran, cincin progres chef, bar meter yang menahan, garis tab panel. Tidak pernah untuk teks, jadi kontras teks tidak bergantung pada restoran. |
| Urbanist untuk semua teks | Pasangan pertama dari deal yang sama. Bentuk geometris yang ramah, cocok untuk game santai, dan tetap jelas di ukuran 12 px di panel. |
| DM Mono untuk angka uang, harga, dan laju | Angka berbaris rapi seperti kolom harga di struk atau menu, dan lebarnya tetap saat uang bertambah setiap detik. |
| Panggung kanvas, panel DOM | Sabuk, 16 pelanggan, 6 chef, dan 21 piring digambar ulang 60 kali per detik; kanvas menjaga ini ringan. Semua kontrol tetap tombol asli supaya bisa dipakai dengan keyboard dan pembaca layar. |
| Geometri sabuk dari komponen prompt | `along` dan `project` di `src/stage/geometry.ts` adalah parametrisasi loop dan proyeksi perspektif komponen, sehingga sabuk game dan sabuk menu terlihat satu keluarga. |
| Dua orientasi panggung | Di layar lebar loop membentang ke samping; di ponsel loop berdiri tegak sehingga chef dan piring tetap besar. Simulasi tidak berubah, hanya cara menggambarnya. |
| Semua gambar dibuat dengan kode | 36 hidangan (SVG, dilihat dari atas), chef, pelanggan, dan dekorasi ruangan digambar sendiri. Foto contoh dari 21st.dev di prompt tidak dipakai. |
| Dekorasi khas per negara | Jepang: dinding hinoki, shoji, noren, lentera. Italia: bata, jendela lengkung, rak botol, taplak kotak-kotak, oven batu. Indonesia: ukiran Minang, atap gonjong, etalase piring Padang, panel batik kawung, panggangan sate. Meksiko: papel picado, ubin talavera, kaktus, comal. India: lengkung jharokha dengan jaali, kalung marigold, lampu kuningan, tandoor. Prancis: wainscot hijau, cermin berbingkai emas, papan menu kapur, lantai mosaik, panci tembaga. |
| Chef berpakaian sesuai negara | Hachimaki (Jepang), toque (Italia), peci (Indonesia), bandana (Meksiko), topi pendek (India), toque tinggi (Prancis); celemek memakai warna restoran. |
| Kartu upgrade dengan bobot berbeda | Upgrade yang memberi laju terbesar per koin mendapat garis tepi zaitun dan label "Paling untung untuk harganya". Chef atau kursi yang belum menambah apa pun (karena sisi lain yang menahan) menulis itu terang-terangan. |
| Meter Dapur dan Kursi | Inti strategi: pendapatan mengikuti sisi yang lebih lambat. Bar yang menahan memakai warna aksen dan kalimat di bawahnya menyebut apa yang perlu dibeli. |
| Radius 10 sampai 14 px, tanpa pil kecuali di dalam komponen prompt | Sudut membulat kecil seperti kartu menu. Komponen prompt mempertahankan bentuk aslinya. |
| Tombol nonaktif bergaris putus-putus | Status nonaktif dibedakan oleh bentuk juga, bukan hanya warna. |
| Ikon digambar sendiri | Tumpukan piring (Pendapatan), stopwatch (Kecepatan), toque (Chef), bangku (Kursi), panci beruap (Bantu chef), gembok, koin. Bentuk penuh, bukan pustaka ikon bergaris tipis. |
| Tanpa logo gambar | Nama FoodRolling ditulis dengan huruf tampilan. Favicon (`public/favicon.svg`) masih sementara: piring merah dengan salmon nigiri dari set hidangan yang sama, sampai pemilik memilih ikon sendiri. |
| Tombol kecil komponen prompt dinaikkan ke 44 px | Tombol sebelumnya, jeda, dan berikutnya di sabuk menu (asli 32 px) dan tombol Tutup di dialognya mengikuti batas sentuh 44 px. |

## Isi dalam game

Nama restoran (Kaiten Hinoki, Trattoria Basilico, Rumah Makan Gonjong, Taquería Nopal, Rasoi Kesar,
Bistro Lumière) adalah fiksi permainan. Pelanggan dan chef adalah karakter ilustrasi acak, bukan orang
sungguhan. Semua angka (harga, waktu masak, pendapatan) adalah aturan permainan dari
`src/game/balance.ts` dan `src/game/restaurants.ts`.

## Gerak

- Sabuk berjalan terus selama restoran dibuka; tombol Jeda menghentikannya (restoran tetap menghasilkan
