import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { keyframes } from '@emotion/react';

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

const LandingPage = ({ onNext, onChangePass }) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  const handleChangePage = (act) => {
    if(act === "next"){
      
      onNext();
    }
  }

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
          <Box sx={{ alignSelf: 'flex-start', padding: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1, textAlign: 'left' }}>
              Halo, {userData.name}!
            </Typography>
          </Box>
          <img src={`${process.env.PUBLIC_URL}/landingPage.gif`} alt="Robot" style={{ maxWidth: '100%', height: 'auto', marginBottom: 16 }} />
          <Typography variant="body1" sx={{ marginBottom: 3, textAlign: 'center' }}>
            Anda terdaftar sebagai Teknisi Witel {userData.witel}
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#8A0707',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textTransform: 'none',
              
              fontSize: '1.5rem', // Perbesar ukuran teks
              '&:hover': {
                backgroundColor: '#8A0707',
              },
            }}
            onClick={() => handleChangePage("next")}
          >
            Klik untuk melanjutkan
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#8A0707',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textTransform: 'none',
              marginTop: 3,
              
              fontSize: '1.5rem', // Perbesar ukuran teks
              '&:hover': {
                backgroundColor: '#8A0707',
              },
            }}
            onClick={() => onChangePass()}
          >
            Rubah Password
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
    </Container>
  );
};

export default LandingPage;
