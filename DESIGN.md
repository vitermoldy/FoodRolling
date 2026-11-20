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

