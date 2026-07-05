import Swal from 'sweetalert2'

const base = {
    confirmButtonColor: '#007bff',
    cancelButtonColor: '#6c757d',
}

export const toast = (icon, title, text) =>
    Swal.fire({ ...base, icon, title, text, confirmButtonText: 'OK' })

export const toastAuto = (icon, title, text, timer = 2000) =>
    Swal.fire({ ...base, icon, title, text, timer, showConfirmButton: false })

export const confirm = (title, text, confirmText = 'Yes') =>
    Swal.fire({ ...base, title, text, icon: 'warning', showCancelButton: true, confirmButtonText: confirmText })
