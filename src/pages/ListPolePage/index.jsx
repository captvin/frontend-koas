import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, List, ListItem, ListItemText, ListItemIcon, Paper, ListItemSecondaryAction } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@emotion/react';
import axios from '../../axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import qs from 'qs';

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

const ListPolePage = ({ onNext, onNew }) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [dataToSend, setDataToSend] = useState(JSON.parse(sessionStorage.getItem('dataToSend')))
    const [poles, setPoles] = useState([]);

    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };


    useEffect(() => {
        const token = sessionStorage.getItem('token'); // Gantilah dengan token Anda yang sebenarnya
        setAuthToken(token);

        const fetchLocation = async () => {
            try {
                const latitude = dataToSend.lat;
                const longitude = dataToSend.long;

                setLocation({ latitude, longitude });
            } catch (error) {
                console.error("Gagal mendapatkan lokasi:", error);
                setOpenSnackbar(true);
            }
        };

        const getPole = async () => {
            const lat = await dataToSend.lat;
            const long = await dataToSend.long;
            await axios.post('/proses/pole', { lat: lat, long: long })
                .then((res) => {
                    setPoles(res.data)
                })
                .catch((err) => {
                    if (err.response.status === 500 || (err.response.status >= 501 && err.response.status <= 599)) {
                        setErrorMessage('Server error')
                    } else if (err.response.status === 404) {
                        setErrorMessage('API not found')
                    } else if (err.response.status === 401 || err.response.status === 402 || err.response.status === 403) {
                        setErrorMessage('Session experied')
                    }
                    setOpenSnackbar(true);
                })
        };

        // fetchData(); // Memanggil fetchData di sini agar dijalankan pertama kali saat komponen pertama kali di-mount

        // Memanggil fetchLocation dan getPole setiap kali dataToSend berubah
        fetchLocation();
        getPole();
    }, []);


    const handleShareloc = async () => {
        if (location) {
            try {
                const dataToSend = {
                    lat: location.latitude,
                    long: location.longitude
                };

                await sessionStorage.setItem('dataToSend', JSON.stringify(dataToSend));
                onNext();
            } catch (error) {
                console.error("Gagal menyimpan data:", error);
                setOpenSnackbar(true);
            }
        } else {
            setOpenSnackbar(true);
        }
    };

    const handleNewPole = () =>{
        sessionStorage.setItem('type', 'new')
        onNew();
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handlePoleClick = async (pole) => {
        // console.log('Pole clicked:', pole);
        const newDataToSend = {
            lat: dataToSend.lat,
            long: dataToSend.long,
            idPole: pole.id
        }

        await sessionStorage.setItem('dataToSend', JSON.stringify(newDataToSend))
        await sessionStorage.setItem('type', 'exist')
        await onNext()
        // Add additional logic to handle the pole click, e.g., navigating to a detail page or opening a modal
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
                <img src={`${process.env.PUBLIC_URL}/titik.gif`} alt="Location Icon" style={{ maxWidth: '30%', height: 'auto', marginBottom: 5 }} />
                <Box sx={{ width: '80%', backgroundColor: '#F6E3E3', padding: 2, borderRadius: 1, textAlign: 'center', marginBottom: 3 }}> {/* Menambahkan Box untuk kotak merah */}
                    <Typography variant="body1">
                        Anda berada di lokasi
                    </Typography>
                    {location && (
                        <Typography variant="body2">
                            Latitude: {location.latitude.toFixed(6)}<br />
                            Longitude: {location.longitude.toFixed(6)}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ width: '98%', textAlign: 'left', marginBottom: 1, }}> {/* Menambahkan textAlign: 'left' dan menetapkan lebar maksimum */}
                    <Typography variant="body1">
                        List tiang di sekitar anda
                    </Typography>
                </Box>

                <Box sx={{ maxHeight: '50vh', overflowY: 'auto', width: '100%' }}> {/* Atur ketinggian maksimum dan overflowY */}
                    <List sx={{ width: '100%' }}>
                        {poles.map((pole, index) => (
                            <Paper key={index} elevation={0} sx={{ marginBottom: 2, backgroundColor: '#F5F5F5' }}>
                                {/* Ubah warna dan opacity */}
                                <ListItem button onClick={() => handlePoleClick(pole)}>
                                    <ListItemIcon>
                                        <LocationOnIcon sx={{ color: '#FF0000' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={`Tiang ID: ${pole.id}`} secondary={pole.distance.toFixed(1) + 'm'} />
                                    <ListItemSecondaryAction>
                                        {pole.status === 'checked' && <CheckCircleIcon sx={{ color: '#00FF00' }} />}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                </Box>
                <Typography variant="body2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                    Pilih salah satu tiang tersebut untuk menambahkan data atau
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
                        fontSize: '1.5rem',
                        '&:hover': {
                            backgroundColor: '#8A0707',
                        },
                    }}
                    onClick={handleNewPole}
                >
                    Input Tiang Baru
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
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ListPolePage;
