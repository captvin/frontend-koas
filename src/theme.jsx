import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Outfit', // Font utama
      'sans-serif',
    ].join(','),
  },
  palette: {
    background: {
      default: '#1a1e36', // Warna background default
    },
    text: {
        primary: '#ffffff', // Warna teks utama menjadi putih
      },
  },
  breakpoints: {
    // Menyesuaikan ukuran breakpoint jika perlu
    values: {
      xs: 0,  // Mobile pertama (lebih kecil dari 600px)
      sm: 600, // Tablet / breakpoint berikutnya
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
