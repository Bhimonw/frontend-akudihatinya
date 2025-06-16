import Swal from 'sweetalert2';

const MySwal = Swal.mixin({
  // Menentukan class kustom untuk berbagai elemen Swal
  customClass: {
    popup: 'swal-popup-custom',
    title: 'swal-title-custom',
    confirmButton: 'btn-swal-confirm', // Class untuk tombol "OK" atau "Confirm"
    cancelButton: 'btn-swal-cancel',   // Class untuk tombol "Cancel"
    denyButton: 'btn-swal-deny',       // Class untuk tombol "Deny" (jika ada)
  },
  // WAJIB false agar class kustom di atas bisa diterapkan pada tombol
  buttonsStyling: false,
  // Membalik posisi tombol (tombol konfirmasi di kanan)
  reverseButtons: true,
});

// Ekspor instance yang sudah dikonfigurasi
export default MySwal;