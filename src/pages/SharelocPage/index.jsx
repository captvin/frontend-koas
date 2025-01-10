import React, { useState } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert } from '@mui/material';
import { keyframes } from '@emotion/react';
// import LocationOnIcon from '@mui/icons-material/LocationOn';

const waveAnimation = keyframes`
  0% {
    clip-path: path('M0,100 C150,200 300,0 450,100 C600,200 750,0 900,100 C1050,200 1200,0 1350,100 L1500,200 L1500,00 L0,0 Z');
  }
  50% {
    clip-path: path('M0,120 C180,220 350,20 530,120 C710,220 880,20 1060,120 C1240,220 1410,20 1590,120 L1800,240 L1800,00 L0,0 Z');
  }
  100% {
    clip-path: path('M0,100 C150,200 300,0 450,100 C600,200 750,0 900,100 C1050,200 1200,0 1350,100 L1500,200 L1500,00 L0,0 Z');
  }
`;

const SharelocPage = ({ onNext }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  // const userData = JSON.parse(sessionStorage.getItem('userData'));

  // const handleChangePage = (act) => {
  //   if (act === 'next') {
  //     onNext();
  //   }
  // };

  const handleShareloc = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Lakukan sesuatu dengan latitude dan longitude, misalnya, kirim ke server
      const dataToSend = {
        lat : latitude,
        long : longitude
      }
      
      await sessionStorage.setItem('dataToSend', JSON.stringify(dataToSend))

      onNext()

    } catch (error) {
      console.error("Gagal mendapatkan lokasi:", error);
      // Tampilkan snackbar jika gagal mendapatkan lokasi
      setOpenSnackbar(true);
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xs" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'transparent',
          padding: 2,
          zIndex: 2,
        }}
      >
        <img src={`${process.env.PUBLIC_URL}/shareloc.gif`} alt="Robot" style={{ maxWidth: '100%', height: 'auto', marginBottom: 16 }} />
        <Typography variant="body1" sx={{ marginBottom: 3, textAlign: 'center' }}>
          Kami akan mendeteksi tiang di sekitar anda
        </Typography>
        {/* <LocationOnIcon sx={{ fontSize: '4rem', color: '#FF0000', marginBottom: 3 }} /> */}
        <img src={`${process.env.PUBLIC_URL}/titik.gif`} alt="Robot" style={{ maxWidth: '100%', height: 'auto', marginBottom: 3 }} />
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#8A0707',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1.5rem',
            '&:hover': {
              backgroundColor: '#8A0707',
            },
          }}
          onClick={handleShareloc}
        >
          Shareloc
        </Button>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '150px',
          bgcolor: '#ffcccc',
          animation: `${waveAnimation} 5s infinite ease-in-out`,
          zIndex: 1,
          transform: 'scaleY(-1)',
        }}
      />
      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                Tidak dapat mendapatkan lokasi pengguna. Pastikan Anda telah mengizinkan akses lokasi.
                </Alert>
            </Snackbar>
    </Container>
  );
};

export default SharelocPage;
