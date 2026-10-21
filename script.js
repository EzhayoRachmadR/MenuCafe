
"use strict";

/*
========================================================
  MENU KITA - MENU DIGITAL CAFE
  File: script.js

  Fungsi:
  1. Menyimpan data menu tanpa database.
  2. Menampilkan kartu makanan dan minuman.
  3. Mencari menu berdasarkan kata kunci.
  4. Menyaring menu berdasarkan kategori.
  5. Menampilkan harga dan ketersediaan.
  6. Mengatur informasi cafe dan tahun footer.
  7. Menampilkan status koneksi.
  8. Mendaftarkan service worker untuk dukungan offline.

  File yang diperlukan:
  - index.html
  - style.css
  - script.js
  - sw.js (untuk dukungan offline)
  - images/ (untuk foto menu)
========================================================
*/


// ======================================================
// BAGIAN 1: IDENTITAS DAN INFORMASI CAFE
// Ubah bagian ini sesuai identitas cafe yang digunakan.
// ======================================================

const cafeInfo = {
    name: "MenuKita Cafe",
    openingHours: "08.00 - 22.00 WIB",
    address: "Malang, Jawa Timur"
};


// ======================================================
// BAGIAN 2: DATA MENU
//
// Semua data disimpan langsung di dalam JavaScript.
// Tidak memerlukan database atau backend.
//
// category hanya boleh menggunakan:
// "makanan", "camilan", "kopi", atau "nonkopi".
//
// available:
// true  = menu tersedia
// false = menu habis
//
// Ganti nama, harga, deskripsi, dan foto sesuai kebutuhan.
// Harga ditulis sebagai angka tanpa tanda titik.
// ======================================================

const menuData = [
    {
        id: 1,
        name: "Nasi Goreng Spesial",
        category: "makanan",
        price: 18000,
        description: "Nasi goreng dengan telur dan sayuran.",
        image: "images/nasi-goreng.jpg",
        available: true
    },
    {
        id: 2,
        name: "Mie Goreng",
        category: "makanan",
        price: 15000,
        description: "Mie goreng gurih dengan sayuran segar.",
        image: "images/mie-goreng.jpg",
        available: true
    },
    {
        id: 3,
        name: "Ayam Geprek",
        category: "makanan",
        price: 20000,
        description: "Ayam renyah dengan sambal pilihan.",
        image: "images/ayam-geprek.jpg",
        available: true
    },
    {
        id: 4,
        name: "Kentang Goreng",
        category: "camilan",
        price: 12000,
        description: "Kentang goreng renyah dan gurih.",
        image: "images/kentang-goreng.jpg",
        available: true
    },
    {
        id: 5,
        name: "Roti Bakar Cokelat",
        category: "camilan",
        price: 13000,
        description: "Roti bakar dengan isian cokelat manis.",
        image: "images/roti-bakar.jpg",
        available: true
    },
    {
        id: 6,
        name: "Pisang Goreng",
        category: "camilan",
        price: 10000,
        description: "Pisang goreng hangat untuk teman bersantai.",
        image: "images/pisang-goreng.jpg",
        available: false
    },
    {
        id: 7,
        name: "Es Kopi Susu",
        category: "kopi",
        price: 15000,
        description: "Perpaduan kopi, susu, dan es yang menyegarkan.",
        image: "images/es-kopi-susu.jpg",
        available: true
    },
    {
        id: 8,
        name: "Americano",
        category: "kopi",
        price: 12000,
        description: "Kopi dengan cita rasa kuat dan sederhana.",
        image: "images/americano.jpg",
        available: true
    },
    {
        id: 9,
        name: "Es Cokelat",
        category: "nonkopi",
        price: 14000,
        description: "Minuman cokelat dingin dengan rasa creamy.",
        image: "images/es-cokelat.jpg",
        available: true
    },
    {
        id: 10,
        name: "Lemon Tea",
        category: "nonkopi",
        price: 10000,
        description: "Teh segar dengan perpaduan rasa lemon.",
        image: "images/lemon-tea.jpg",
        available: true
    }
];


// ======================================================
// BAGIAN 3: MENGAMBIL ELEMEN HTML
//
// JavaScript mencari elemen berdasarkan ID di index.html.
// Jika ID tidak cocok, fungsi terkait tidak akan bekerja.
// ======================================================

const menuGrid = document.getElementById("menuGrid");
const menuCount = document.getElementById("menuCount");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(
    ".category-button"
);
const emptyState = document.getElementById("emptyState");
const resetButton = document.getElementById("resetButton");

const cafeNameElement = document.getElementById("cafeName");
const footerCafeName = document.getElementById("footerCafeName");
const openingHoursElement = document.getElementById("openingHours");
const cafeAddressElement = document.getElementById("cafeAddress");
const currentYearElement = document.getElementById("currentYear");

const connectionIndicator = document.getElementById(
    "connectionIndicator"
);
const connectionText = document.getElementById("connectionText");


// ======================================================
// BAGIAN 4: VARIABEL FILTER
//
// selectedCategory menyimpan kategori yang sedang dipilih.
// Nilai awal "semua" berarti menampilkan seluruh menu.
// ======================================================

let selectedCategory = "semua";


// ======================================================
// BAGIAN 5: FORMAT HARGA
//
// Contoh:
// 15000 menjadi Rp15.000
// ======================================================

function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);
}


// ======================================================
// BAGIAN 6: MENGATUR INFORMASI CAFE
//
// Informasi di HTML diambil dari objek cafeInfo.
// Cukup ubah objek tersebut untuk mengganti identitas cafe.
// ======================================================

function renderCafeInfo() {
    if (cafeNameElement) {
        cafeNameElement.textContent = cafeInfo.name;
    }

    if (footerCafeName) {
        footerCafeName.textContent = cafeInfo.name;
    }

    if (openingHoursElement) {
        openingHoursElement.textContent = cafeInfo.openingHours;
    }

    if (cafeAddressElement) {
        cafeAddressElement.textContent = cafeInfo.address;
    }

    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Memperbarui judul tab browser.
    document.title = `${cafeInfo.name} - Menu Digital`;
}


// ======================================================
// BAGIAN 7: MEMBUAT KARTU MENU
//
// Setiap produk ditampilkan sebagai kartu yang berisi:
// - Foto
// - Nama menu
// - Deskripsi
// - Harga
// - Status tersedia atau habis
//
// Elemen dibuat menggunakan DOM, bukan innerHTML,
// agar teks data menu tidak diperlakukan sebagai HTML.
// ======================================================

function createMenuCard(menu) {
    // Elemen pembungkus kartu.
    const card = document.createElement("article");
    card.className = "menu-card";

    // Simpan kategori sebagai atribut HTML.
    card.dataset.category = menu.category;

    // ---------- FOTO MENU ----------
    const image = document.createElement("img");

    image.src = menu.image;
    image.alt = menu.name;
    image.loading = "lazy";
    image.decoding = "async";

    // Jika foto tidak ditemukan, tampilkan placeholder.
    image.addEventListener("error", function () {
        image.hidden = true;

        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder";
        placeholder.textContent = "🍽️";
        placeholder.setAttribute("aria-label", "Foto belum tersedia");

        image.replaceWith(placeholder);
    }, { once: true });

    card.appendChild(image);


    // ---------- INFORMASI MENU ----------
    const details = document.createElement("div");
    details.className = "menu-details";

    // Nama produk.
    const name = document.createElement("h3");
    name.className = "menu-name";
    name.textContent = menu.name;

    // Deskripsi produk.
    const description = document.createElement("p");
    description.className = "menu-description";
    description.textContent = menu.description;

    // Harga produk.
    const price = document.createElement("p");
    price.className = "menu-price";
    price.textContent = formatPrice(menu.price);

    details.append(name, description, price);


    // ---------- STATUS KETERSEDIAAN ----------
    const status = document.createElement("span");
    status.className = menu.available
        ? "menu-status available"
        : "menu-status unavailable";

    status.textContent = menu.available
        ? "Tersedia"
        : "Habis";

    status.setAttribute("aria-label", `Status: ${status.textContent}`);

    details.appendChild(status);
    card.appendChild(details);

    return card;
}


// ======================================================
// BAGIAN 8: MENAMPILKAN DAFTAR MENU
//
// Fungsi ini menerima daftar produk yang akan ditampilkan.
// Bisa berupa semua menu atau hasil pencarian/filter.
// ======================================================

function renderMenu(menus) {
    // Pastikan area menu tersedia di HTML.
    if (!menuGrid) {
        console.error("Elemen #menuGrid tidak ditemukan.");
        return;
    }

    // Hapus kartu lama sebelum menampilkan hasil baru.
    menuGrid.replaceChildren();

    // Perbarui jumlah menu yang ditemukan.
    if (menuCount) {
        menuCount.textContent =
            `${menus.length} menu ditemukan`;
    }

    // Jika tidak ada hasil, tampilkan pesan kosong.
    if (emptyState) {
        emptyState.hidden = menus.length !== 0;
    }

    // Sembunyikan area kartu jika hasilnya kosong.
    menuGrid.hidden = menus.length === 0;

    // Tandai bahwa proses menampilkan menu selesai.
    menuGrid.setAttribute("aria-busy", "false");

    // Buat kartu untuk setiap produk.
    const fragment = document.createDocumentFragment();

    menus.forEach(function (menu) {
        const card = createMenuCard(menu);
        fragment.appendChild(card);
    });

    // Masukkan seluruh kartu sekaligus ke halaman.
    menuGrid.appendChild(fragment);
}


// ======================================================
// BAGIAN 9: PENCARIAN DAN FILTER KATEGORI
//
// Menu akan ditampilkan jika:
// 1. Nama, kategori, atau deskripsinya sesuai pencarian.
// 2. Kategorinya sesuai dengan kategori yang dipilih.
//
// Kedua kondisi harus terpenuhi.
// ======================================================

function filterMenu() {
    // Ambil teks pencarian dan ubah menjadi huruf kecil.
    const keyword = searchInput
        ? searchInput.value.trim().toLocaleLowerCase("id-ID")
        : "";

    // Saring data menu berdasarkan pencarian dan kategori.
    const filteredMenus = menuData.filter(function (menu) {
        const searchableText = [
            menu.name,
            menu.description,
            menu.category
        ].join(" ").toLocaleLowerCase("id-ID");

        // Periksa apakah kata kunci ditemukan.
        const matchesSearch = searchableText.includes(keyword);

        // Periksa apakah kategori sesuai.
        const matchesCategory =
            selectedCategory === "semua" ||
            menu.category === selectedCategory;

        // Produk ditampilkan jika kedua kondisi terpenuhi.
        return matchesSearch && matchesCategory;
    });

    // Tampilkan hasil penyaringan.
    renderMenu(filteredMenus);
}


// ======================================================
// BAGIAN 10: EVENT PENCARIAN
//
// Setiap kali pelanggan mengetik, daftar menu diperbarui.
// ======================================================

if (searchInput) {
    searchInput.addEventListener("input", filterMenu);
}


// ======================================================
// BAGIAN 11: EVENT TOMBOL KATEGORI
//
// Saat tombol kategori ditekan:
// - Simpan kategori yang dipilih.
// - Perbarui tampilan tombol aktif.
// - Jalankan filter menu.
// ======================================================

categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedCategory = button.dataset.category || "semua";

        // Perbarui status visual dan aksesibilitas tombol.
        categoryButtons.forEach(function (item) {
            const isActive = item === button;

            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        // Tampilkan menu sesuai kategori baru.
        filterMenu();
    });
});


// ======================================================
// BAGIAN 12: TOMBOL RESET
//
// Mengembalikan pencarian dan kategori ke kondisi awal.
// ======================================================

if (resetButton) {
    resetButton.addEventListener("click", function () {
        // Kosongkan kolom pencarian.
        if (searchInput) {
            searchInput.value = "";
        }

        // Kembalikan kategori ke "semua".
        selectedCategory = "semua";

        // Perbarui semua tombol kategori.
        categoryButtons.forEach(function (button) {
            const isAll = button.dataset.category === "semua";

            button.classList.toggle("active", isAll);
            button.setAttribute("aria-pressed", String(isAll));
        });

        // Tampilkan semua produk.
        filterMenu();
    });
}


// ======================================================
// BAGIAN 13: STATUS KONEKSI
//
// navigator.onLine menunjukkan status koneksi perangkat.
// Status ini bukan jaminan bahwa website atau internet
// benar-benar dapat dijangkau.
// ======================================================

function updateConnectionStatus() {
    const isOnline = navigator.onLine;

    if (connectionText) {
        connectionText.textContent = isOnline
            ? "Online"
            : "Offline — koneksi terputus";
    }

    if (connectionIndicator) {
        connectionIndicator.classList.toggle("online", isOnline);
        connectionIndicator.classList.toggle("offline", !isOnline);
    }
}

// Periksa status ketika halaman dibuka.
updateConnectionStatus();

// Periksa kembali saat koneksi berubah.
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);


// ======================================================
// BAGIAN 14: SERVICE WORKER
//
// Service worker membantu menyimpan aset website agar
// dapat dibuka kembali ketika perangkat offline.
//
// File sw.js harus dibuat secara terpisah.
// Pendaftaran memerlukan HTTPS atau localhost.
// Membuka index.html langsung melalui file://
// tidak mendukung service worker.
// ======================================================

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        // Gunakan alamat relatif agar dapat bekerja
        // pada repository GitHub Pages bersubfolder.
        navigator.serviceWorker.register("./sw.js")
            .then(function (registration) {
                console.log(
                    "Service worker berhasil didaftarkan.",
                    registration.scope
                );
            })
            .catch(function (error) {
                console.error(
                    "Service worker gagal didaftarkan:",
                    error
                );
            });
    });
}


// ======================================================
// BAGIAN 15: MENJALANKAN WEBSITE
//
// Fungsi dijalankan ketika script selesai dimuat.
// ======================================================

function initializeMenuKita() {
    // Isi informasi cafe.
    renderCafeInfo();

    // Tampilkan semua menu saat halaman pertama dibuka.
    renderMenu(menuData);
}

// Jalankan inisialisasi.
initializeMenuKita();
