# Dokumentasi Proyek: BALLS Loyalty System

## Deskripsi Proyek

**BALLS Loyalty System** adalah aplikasi manajemen program loyalitas yang dirancang untuk Borneo Anfield Stadium. Sistem ini memungkinkan pelanggan untuk mengumpulkan poin loyalitas dari setiap pemesanan lapangan dan menukarkannya dengan berbagai hadiah menarik. Aplikasi ini juga menyediakan antarmuka admin untuk verifikasi pembayaran, pengelolaan hadiah, dan persetujuan penukaran, serta antarmuka super admin untuk manajemen pengguna dan pemantauan sistem.

**Fitur Utama:**

- **Registrasi & Login Pengguna:** Sistem otentikasi berbasis email dan password.
- **Upload Bukti Pembayaran:** Pelanggan dapat mengunggah bukti pembayaran booking untuk mendapatkan poin.
- **Manajemen Poin:** Pelanggan dapat melihat total poin, poin yang tersedia, dan riwayat transaksi poin.
- **Penukaran Hadiah:** Pelanggan dapat menukarkan poin mereka dengan hadiah yang tersedia, dengan proses persetujuan admin.
- **Verifikasi Admin:** Admin dapat meninjau dan menyetujui/menolak bukti pembayaran dan permintaan penukaran hadiah.
- **Manajemen Program Loyalitas:** Admin dapat membuat, mengedit, dan menghapus program hadiah.
- **Manajemen Akun Admin (Super Admin):** Super Admin dapat mengelola akun admin dan memantau statistik sistem serta log audit.


## Peran Pengguna

Sistem ini memiliki tiga peran pengguna utama:

1. **CUSTOMER:**

1. Mengunggah bukti pembayaran booking.
2. Melihat riwayat upload pembayaran.
3. Melihat dashboard poin loyalitas (total poin, poin tersedia, dll.).
4. Melihat daftar hadiah yang tersedia.
5. Mengajukan penukaran hadiah.
6. Melihat riwayat penukaran hadiah.



2. **ADMIN:**

1. Memverifikasi dan menyetujui/menolak upload bukti pembayaran dari pelanggan.
2. Mengelola program loyalitas (menambah, mengedit, menghapus hadiah).
3. Memverifikasi dan menyetujui/menolak permintaan penukaran hadiah.
4. Menggunakan QR Code Scanner untuk menandai hadiah yang sudah digunakan.
5. Mengatur pengaturan poin default.



3. **SUPER_ADMIN:**

1. Memiliki semua kemampuan peran **ADMIN**.
2. Mengelola akun admin (menambah, mengedit, menghapus, mengaktifkan/menonaktifkan).
3. Melihat statistik sistem secara keseluruhan (jumlah pelanggan, upload, penukaran, dll.).
4. Melihat log audit untuk melacak aktivitas penting dalam sistem.





## Cara Menjalankan Proyek

Ikuti langkah-langkah sederhana ini untuk menyiapkan dan menjalankan proyek di lingkungan lokal Anda:

### Prasyarat

Pastikan Anda telah menginstal yang berikut:

- **Node.js** (versi 18 atau lebih tinggi)
- **pnpm** atau **npm**
- **PostgreSQL** database


### Langkah-langkah Instalasi

1. **Klon Repositori:**

```shellscript
git clone [URL_REPOSITORI_ANDA]
cd balls-loyalty-system
```


2. **Instal Dependensi:**

```shellscript
npm install
# atau
pnpm install
```


3. **Konfigurasi Variabel Lingkungan:**

1. Salin konten dari `.env.local` ke `.env`.
2. Isi variabel-variabel berikut:

1. `DATABASE_URL`: URL koneksi ke database PostgreSQL Anda (misalnya: `postgresql://user:password@localhost:5432/balls_loyalty`).
2. `NEXTAUTH_URL`: URL aplikasi Anda (misalnya: `http://localhost:3000`).
3. `NEXTAUTH_SECRET`: Kunci rahasia acak yang kuat untuk NextAuth. Anda bisa menghasilkan satu dengan `openssl rand -base64 32`.






4. **Siapkan Database:**

1. Buat skema database menggunakan Prisma:

```shellscript
npx prisma db push
npx prisma generate
npx prisma db seed
npx prisma studio
```


2. Untuk mengisi data awal (termasuk akun Super Admin default), Anda dapat menjalankan skrip SQL yang disediakan. Gunakan klien PostgreSQL pilihan Anda (misalnya `psql`, DBeaver, pgAdmin) untuk menjalankan perintah dari file `scripts/init-database.sql` dan `scripts/seed-additional-data.sql` terhadap database Anda.

1. **Akun Super Admin Default:**

1. **Email:** `superadmin@balls.com`
2. **Password:** `admin123`









5. **Jalankan Aplikasi:**

1. Mulai server pengembangan:

```shellscript
npm run dev
# atau
pnpm dev
```





6. **Akses Aplikasi:**

1. Buka browser Anda dan navigasikan ke `http://localhost:3000`.
