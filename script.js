/* =========================
FIREBASE IMPORT
========================= */

import {
initializeApp,
getApps,
getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
set,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
getAuth,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
CONFIG FIREBASE
========================= */

const firebaseConfig = {

 apiKey: "AIzaSyCvco9APepbM1YRhDLGzE2uxFBVtLL2NLs",
  authDomain: "fauz2327-b8dfa.firebaseapp.com",
  databaseURL: "https://fauz2327-b8dfa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fauz2327-b8dfa",
  storageBucket: "fauz2327-b8dfa.firebasestorage.app",
  messagingSenderId: "625104866445",
  appId: "1:625104866445:web:129165fbc539edb36466c4",
};

/* =========================
INIT FIREBASE
========================= */

const app = !getApps().length
? initializeApp(firebaseConfig)
: getApp();

const firebaseDB =
getDatabase(app);

const auth = getAuth(app);

/* =========================
TOKO DEFANA FULL SCRIPT
========================= */

let produk = [];
let kategoriAktif = 'Semua';
let cart = [];
let selectedProduct = null;
/* TAMBAHAN */
let uangBayarGlobal = 0;
let kembalianGlobal = 0;
/* =========================
LOAD AWAL
========================= */

document.addEventListener('DOMContentLoaded', () => {

loadProduk();

toggleQR();

updateCart();

toggleMetode();

});

/* =========================
LOAD PRODUK FIREBASE
========================= */

function loadProduk(){

const produkRef =
ref(firebaseDB);

onValue(produkRef,(snapshot)=>{

const data = snapshot.val();

if(!data){

console.log('Data kosong');

return;

}

produk = Object.values(data);

renderKategori();

renderProduk();

});

}

/* =========================
FILTER KATEGORI
========================= */

window.filterKategori = function(kat){

kategoriAktif = kat;

renderProduk();

}

/* =========================
RENDER PRODUK
========================= */

window.renderProduk = function(){

const list =
document.getElementById('productList');

if(!list) return;

const searchInput =
document.getElementById('searchInput');

const search =
searchInput
? searchInput.value.toLowerCase()
: '';

list.innerHTML='';

const filtered =
produk.filter(item=>{

/* FILTER KATEGORI */

const cocokKategori =

kategoriAktif === 'Semua'
||
(item.kategori || '') === kategoriAktif;

/* FILTER PENCARIAN */

const nama =
(item.nama || '')
.toLowerCase();

const kategori =
(item.kategori || '')
.toLowerCase();

const cocokSearch =

nama.includes(search)
||
kategori.includes(search);

return cocokKategori && cocokSearch;

});

if(filtered.length===0){

list.innerHTML = `
<p style="padding:20px;">
Produk tidak ditemukan
</p>
`;

return;

}

filtered.forEach(p => {

list.innerHTML += `

<div class="produk-card
${Number(p.stok) <= 0 ? 'produk-habis' : ''}"
onclick="openPopup('${p.id}')">

<div class="produk-left">

<div class="produk-kategori">
${p.kategori}
</div>

<div class="produk-stok">
stok : ${p.stok}
</div>

</div>

<div class="produk-nama">
${p.nama}
</div>

<div class="produk-harga">
Rp ${formatRupiah(p.harga)}
</div>

</div>

`;
});

} // <- INI YANG KURANG

function formatRupiah(angka){

return Number(angka || 0)
.toLocaleString('id-ID');

}
/* =========================
POPUP PRODUK
========================= */

window.openPopup = function(id){

selectedProduct =
produk.find(
p => p.id == id
);

if(!selectedProduct){
return;
}

if(Number(selectedProduct.stok) <= 0){

showToast('Stok habis');

return;

}

document.getElementById(
'popupNama'
).innerHTML =
selectedProduct.nama;

document.getElementById(
'popupHarga'
).innerHTML =

'Rp ' +
Number(
selectedProduct.harga
).toLocaleString();

document.getElementById(
'popupQty'
).value = 1;

document.getElementById(
'popupBox'
).classList.add('active');

}

/* =========================
TUTUP POPUP
========================= */

window.closePopup = function(){

document.getElementById(
'popupBox'
).classList.remove('active');

}

/* =========================
QTY +
========================= */

window.popupTambah = function(){

const qty =
document.getElementById(
'popupQty'
);

const jumlah =
parseInt(qty.value);

const stok =
parseInt(selectedProduct.stok || 0);

if(jumlah >= stok){

showToast(
'Stock hanya tersisa ' + stok
);

return;

}

qty.value = jumlah + 1;

}

/* =========================
QTY -
========================= */

window.popupKurang = function(){

const qty =
document.getElementById(
'popupQty'
);

if(qty.value > 1){

qty.value--;

}

}

/* =========================
CONFIRM TAMBAH CART
========================= */
window.confirmAddCart = function(){

const qty =
parseInt(
document.getElementById(
'popupQty'
).value
);

const stok =
parseInt(
selectedProduct.stok || 0
);

const existing =
cart.find(
i => i.id == selectedProduct.id
);

/* =========================
VALIDASI STOCK
========================= */

if(qty > stok){

showToast(
'Jumlah melebihi stock'
);

return;

}

/* =========================
JIKA SUDAH ADA DI CART
========================= */

if(existing){

/* RESET JIKA MELEBIHI */

if(existing.qty >= stok){

existing.qty = 0;

}

/* TOTAL BARU */

const totalQty =
existing.qty + qty;

/* VALIDASI */

if(totalQty > stok){

showToast(
'Maksimal stock hanya ' + stok
);

existing.qty = stok;

}else{

existing.qty = totalQty;

}

}else{

cart.push({

...selectedProduct,

qty:qty

});

}

updateCart();

toggleMetode();

closePopup();

showToast(
selectedProduct.nama +
' ditambahkan ke keranjang'
);

}

/* =========================
CLEAR SEARCH
========================= */

window.clearSearch = function(){

document.getElementById(
'searchInput'
).value='';

renderProduk();

}

/* =========================
TOGGLE CART
========================= */

window.toggleCart = function(){

document
.getElementById('cartBox')
.classList
.toggle('active');

}

/* =========================
TOGGLE QR
========================= */

window.toggleQR = function(){

const pembayaran =
document.getElementById('pembayaran');

const qr =
document.getElementById('qrBox');

if(!pembayaran || !qr) return;

if(pembayaran.value==='Transfer'){

qr.style.display='block';

}else{

qr.style.display='none';

}

}

function updateCart(){

const menuCart =
document.querySelector('.menu-cart');

const cartBox =
document.getElementById('cartItems');

const totalBox =
document.getElementById('cartTotal');

const countBox =
document.getElementById('cartCount');

const bottomCount =
document.getElementById('bottomCartCount');

if(!cartBox) return;

cartBox.innerHTML = '';

let total = 0;

/* CART KOSONG */

if(cart.length===0){

if(menuCart){

menuCart.classList.remove('active');

}

cartBox.innerHTML =
'<p>Keranjang kosong</p>';

if(totalBox){
totalBox.innerHTML='';
}

if(countBox){
countBox.innerHTML='0';
}

if(bottomCount){
bottomCount.innerHTML='0';
}

return;

}

/* CART ADA ISI */

if(menuCart){

menuCart.classList.add('active');

}

cart.forEach((item,index)=>{

const subtotal =
item.harga * item.qty;

total += subtotal;

cartBox.innerHTML += `

<div class="cart-item">

<h4>${item.nama}</h4>

<p>
${item.qty} x
Rp ${Number(item.harga).toLocaleString()}
</p>

<b>
Rp ${subtotal.toLocaleString()}
</b>

<br><br>

<button
class="btn-hapus-modern"
onclick="hapusCart(${index})">

🗑 Hapus

</button>

</div>

`;

});

/* TOTAL */

if(totalBox){

totalBox.innerHTML =

'Total : Rp ' +
total.toLocaleString();

}

/* JUMLAH */

if(countBox){
countBox.innerHTML = cart.length;
}

if(bottomCount){
bottomCount.innerHTML = cart.length;
}

}
/* TOTAL */

if(totalBox){

let warning = '';

if(total < 50000){

const kurang = 50000 - total;

warning = `

<div style="
margin-top:10px;
padding:10px;
background:#ffebeb;
color:#d60000;
border-radius:8px;
font-size:14px;
font-weight:bold;
">

⚠️ Belanja kurang Rp${kurang.toLocaleString()}
lagi untuk checkout WA dan diantar

</div>

`;

}else{

warning = `

<div style="
margin-top:10px;
padding:10px;
background:#e8fff0;
color:#009944;
border-radius:8px;
font-size:14px;
font-weight:bold;
">

✅ Checkout WhatsApp tersedia

</div>

`;

}

totalBox.innerHTML =

'Total : Rp ' +
total.toLocaleString()
+ warning;

}

/* JUMLAH CART */

if(countBox){
countBox.innerHTML = cart.length;
}

const bottomCount =
document.getElementById('bottomCartCount');

if(bottomCount){
bottomCount.innerHTML = cart.length;
}
/* =========================
HAPUS CART
========================= */

window.hapusCart = function(index){

cart.splice(index,1);

updateCart();

toggleMetode();

}

/* =========================
KIRIM REKAP GOOGLE SHEET
========================= */

async function kirimRekap(
nama,
pengiriman,
pembayaran,
total,
items
){

const data={

nama:nama,
pengiriman:pengiriman,
pembayaran:pembayaran,
total:total,
items:items

};

try{

await fetch(

'https://script.google.com/macros/s/AKfycbxWfHVxDop4n8SqwP1vxGLj1D4jnTe7_iTrqGJ4bm9dDW0BiDDSxOPpy7X5Dcvb1dEa/exec',

{
method:'POST',
mode:'no-cors',

headers:{
'Content-Type':'text/plain'
},

body:JSON.stringify(data)

}

);

console.log(
'Rekap berhasil dikirim'
);

}catch(error){

console.log(
'Error kirim rekap:',
error
);

}

}

/* =========================
TOGGLE METODE
========================= */

window.toggleMetode = function(){

const pengiriman =
document.getElementById(
'pengiriman'
);

const btnWA =
document.getElementById(
'btnWA'
);

const btnStruk =
document.getElementById(
'btnStruk'
);

const passwordBox =
document.getElementById(
'passwordStrukBox'
);

if(
!pengiriman ||
!btnWA ||
!btnStruk ||
!passwordBox
) return;

btnWA.style.display='none';

btnStruk.style.display='none';

passwordBox.style.display='none';

if(cart.length===0){
return;
}

if(
pengiriman.value==='Diantar'
){

btnWA.style.display='flex';

}

if(
pengiriman.value==='Ambil Sendiri'
){

passwordBox.style.display='block';

}

}

window.cekPasswordStruk = async function(){

const password =
document.getElementById(
'passwordStruk'
).value;

/* EMAIL ADMIN TETAP */
const email = 'adminku@gmail.com';

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

/* JIKA BERHASIL */

document.getElementById(
'btnStruk'
).style.display='flex';

showToast('Akses struk dibuka');

}catch(error){

showToast('Password salah');

console.log(error);

}

}

/* =========================
CHECKOUT WHATSAPP
========================= */

window.checkoutWA = async function(){

const btn =
document.getElementById('btnWA');

if(btn.disabled) return;

const nama =
document.getElementById('namaPemesan').value;

const pembayaran =
document.getElementById('pembayaran').value;

const pengiriman =
document.getElementById('pengiriman').value;

if(!nama){

showToast('Nama wajib diisi');

return;

}

if(cart.length <= 0){

showToast('Keranjang kosong');

return;

}

/* LOADING */

btn.disabled = true;

btn.innerHTML = 'Mengirim...';

let text =
`*PESANAN BARU TOKO DEFANA*%0A%0A`;

text += `👤 Nama : ${nama}%0A`;

text += `💳 Pembayaran : ${pembayaran}%0A`;

text += `🚚 Pengiriman : ${pengiriman}%0A%0A`;

text += `🛒 *Rincian Pesanan*%0A`;

let total = 0;

cart.forEach(item => {

const subtotal =
item.harga * item.qty;

total += subtotal;

text +=
`- ${item.nama} x${item.qty}%0A`;

text +=
`Rp ${formatRupiah(subtotal)}%0A%0A`;

});

text += `💰 Total : Rp ${formatRupiah(total)}%0A%0A`;

/* AMBIL LOKASI */

const izinLokasi =
await ambilLokasiUser();

if(!izinLokasi){

showToast(
'Lokasi wajib diaktifkan'
);

btn.disabled = false;

btn.innerHTML =
'📲 Pesan via WhatsApp';

return;

}

/* KIRIM LOKASI PEMBELI */

text +=
`📍 Lokasi Pembeli:%0A`;

text +=
`${lokasiUser}%0A%0A`;

const nomor =
'6281554041777';
/* RESET CART */

cart = [];

updateCart();

toggleMetode();

localStorage.removeItem(
'cartDefana'
);
window.location.href =
`https://wa.me/${nomor}?text=${text}`;

/* KEMBALIKAN TOMBOL */

setTimeout(()=>{

btn.disabled = false;

btn.innerHTML =
'📲 Pesan via WhatsApp';

},3000);

}

/* =========================
KURANGI STOCK CHECKOUT
========================= */

async function kurangiStockCheckout(){

  for(let i = 0; i < cart.length; i++){

    const itemCart = cart[i];

    const indexProduk = produk.findIndex(p => p.id == itemCart.id);

    if(indexProduk === -1) continue;

    const stokSekarang = Number(produk[indexProduk].stok || 0);

    const stokBaru = Math.max(stokSekarang - itemCart.qty, 0);

    await set(
      ref(firebaseDB, indexProduk + '/stok'),
      stokBaru
    );

    produk[indexProduk].stok = stokBaru;

  }

}

/* =========================
RESET CART
========================= */

window.resetCart = function(){

  if(cart.length === 0){
    showToast('Keranjang sudah kosong');
    return;
  }

  const yakin = confirm('Yakin ingin mengosongkan keranjang?');

  if(!yakin) return;

  cart = [];

  updateCart();

  toggleMetode();

  showToast('Keranjang dikosongkan');

};

window.closeSidebar = function(){

  const sidebar =
  document.querySelector('.sidebar');

  const overlay =
  document.querySelector('.sidebar-overlay');

  sidebar.classList.remove('active');

  overlay.classList.remove('active');

};

/* TOGGLE SIDEBAR */

window.toggleSidebar = function(){

  const sidebar =
  document.querySelector('.sidebar');

  const overlay =
  document.querySelector('.sidebar-overlay');

  sidebar.classList.toggle('active');

  overlay.classList.toggle('active');

};

/* =========================
BUTTON LOADING
========================= */

function setButtonLoading(button,text){

  if(!button) return;

  button.disabled = true;

  button.classList.add('btn-loading');

  button.innerHTML = text;

}

function resetButton(button,text){

  if(!button) return;

  button.disabled = false;

  button.classList.remove('btn-loading');

  button.innerHTML = text;

}

/* =========================
RENDER KATEGORI (UPDATED)
========================= */
function renderKategori(){
const kategoriList =
document.getElementById('kategoriList');
  const kategoriSidebar =
  document.getElementById('kategoriListSidebar');

  if(!kategoriSidebar) return;

  const kategoriUnik = [
    'Semua',
    ...new Set(
      produk.map(
        item => item.kategori || 'Lainnya'
      )
    )
  ];

 if(kategoriSidebar){
kategoriSidebar.innerHTML = '';
}

  if(kategoriSidebar){
    kategoriSidebar.innerHTML = '';
  }

  kategoriUnik.forEach(kat => {

    const isAktif =
    (kat === kategoriAktif)
    ? 'class="active"'
    : '';

    const tombol = `
      <button
      ${isAktif}
      onclick="pilihKategori(this, '${kat}')">

      ${kat}

      </button>
    `;
   if(kategoriSidebar){

kategoriSidebar.innerHTML += tombol;

}
  });

}

window.pilihKategori = function(element, kat) {

  window.filterKategori(kat);

  renderKategori();

  closeSidebar();

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });

}

window.bukaPopupBayar = function(){

if(cart.length === 0){

showToast('Keranjang kosong');

return;

}

/* TUTUP KERANJANG */

document
.getElementById('cartBox')
.classList.remove('active');

/* HITUNG TOTAL */

let total = 0;

cart.forEach(item=>{

total += item.harga * item.qty;

});

/* TAMPILKAN TOTAL */

document.getElementById(
'totalBayarText'
).innerHTML =

'Rp ' +
total.toLocaleString();

/* BUKA POPUP */

document.getElementById(
'popupBayar'
).classList.add('active');

}
window.tutupPopupBayar = function(){

document.getElementById(
'popupBayar'
).classList.remove('active');

}

window.prosesCetakStruk = async function(){

const btn =
document.querySelector(
'#popupBayar .popup-btn'
);

/* LOADING */

btn.disabled = true;

btn.innerHTML = 'Mencetak...';

/* HITUNG TOTAL */

let total = 0;

cart.forEach(item=>{

total += item.harga * item.qty;

});

/* AMBIL UANG */

const uang =
parseInt(
document.getElementById(
'uangBayar'
).value
.replace(/\./g,'')
) || 0;

/* VALIDASI */

if(uang < total){

showToast('Uang kurang');

btn.disabled = false;

btn.innerHTML = 'Cetak';

return;

}

/* SIMPAN */

uangBayarGlobal = uang;

kembalianGlobal = uang - total;

/* TUTUP POPUP */

tutupPopupBayar();

/* LOADING GLOBAL */

showLoading(
'Mencetak struk...'
);

/* DELAY */

setTimeout(async()=>{

await cetakStruk();

hideLoading();

btn.disabled = false;

btn.innerHTML = 'Cetak';

showToast(
'Kembalian : Rp ' +
kembalianGlobal.toLocaleString()
);

},1200);

}
window.formatInputUang = function(input){

/* HAPUS SEMUA SELAIN ANGKA */

let angka =
input.value.replace(/\D/g,'');

/* FORMAT RIBUAN */

input.value =
Number(angka)
.toLocaleString('id-ID');

}
let currentSlide = 0;

const slides =
document.querySelectorAll('.slide');

const track =
document.querySelector('.slider-track');

let autoSlide;

/* UPDATE SLIDE */
function updateSlide(){

  track.style.transform =
  `translate3d(-${currentSlide * 100}%,0,0)`;

}

/* AUTO SLIDE */
function startSlide(){

  autoSlide = setInterval(() => {

    currentSlide++;

    if(currentSlide >= slides.length){
      currentSlide = 0;
    }

    updateSlide();

  }, 3500);

}

/* STOP SAAT DIKLIK */
slides.forEach(slide => {

  slide.addEventListener('click', () => {

    clearInterval(autoSlide);

    setTimeout(() => {
      startSlide();
    }, 4000);

  });

});
/* =========================
TOAST
========================= */

window.showToast = function(text){

let toast =
document.getElementById('toast');

if(!toast){

toast =
document.createElement('div');

toast.id = 'toast';

document.body.appendChild(toast);

}

toast.innerHTML = text;

toast.classList.add('show');

setTimeout(()=>{

toast.classList.remove('show');

},2500);

}
/* =========================
POPUP BANTUAN
========================= */

window.openBantuan = function(){

document
.getElementById(
'popupBantuan'
)
.classList.add('active');

}

window.closeBantuan = function(){

document
.getElementById(
'popupBantuan'
)
.classList.remove('active');

}
