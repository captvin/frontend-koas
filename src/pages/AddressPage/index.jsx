import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, TextField, MenuItem} from '@mui/material';
import { keyframes } from '@emotion/react';
import StepTracker from '../../components/StepTracker';
import axios from '../../axios';

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

const AddressPage = ({ onNext, onPrev }) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [dataToSend, setDataToSend] = useState(JSON.parse(sessionStorage.getItem('dataToSend')));
    const [sto, setSto] = useState('')
    const [nomorTiang, setNomorTiang] = useState('')
    const [address, setAddress] = useState('')
    const [stos, setStos] = useState([])
    const [nomorTiangs, setNomorTiangs] = useState([])


    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };


    const handleNext = async () => {
        if (sto === ''){
            setErrorMessage('field STO harus terisi')
            setOpenSnackbar(true)
        } else if(nomorTiang ===''){
            setErrorMessage('field Nomor Tiang harus terisi')
            setOpenSnackbar(true)
        } else if(address === ''){
            setErrorMessage('field Alamat harus terisi')
            setOpenSnackbar(true)
        } else {
            sessionStorage.setItem('dataToSend', JSON.stringify({...dataToSend, sto, jenisTiang: nomorTiang, address}))
            onNext();
        }
    };

    const handlePrevious = () => {
        onPrev();
    };


    const getSto = async () => {
        await axios.get('/proses/sto')
            .then((res) => {
                const data = res.data.map(item => ({
                    label: item.STO,
                    value: item.STO
                }))
                setStos(data)
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
    }

    const getJenis = async () => {
        await axios.get('/proses/jenis')
            .then((res) => {
                const data = res.data.map(item => ({
                    desc: item.deskripsi,
                    value: item.nomor_tiang
                }))
                setNomorTiangs(data)
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
    }

    useEffect(() => {
        const token = sessionStorage.getItem('token'); // Gantilah dengan token Anda yang sebenarnya
        setAuthToken(token);

        const fetchLocation = async () => {
            try {
                const latitude = dataToSend.lat;
                const longitude = dataToSend.long;

                setLocation({ latitude, longitude });
            } catch (error) {
                console.error('Gagal mendapatkan lokasi:', error);
                setOpenSnackbar(true);
            }
        };

        fetchLocation();
        getSto()
        getJenis()
    }, []);

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

                <StepTracker currentStep={-1} />

                {/* BUAT FORM DISINI */}
                <Box
                    component="form"
                    sx={{
                        width: '100%',
                        p: 2,
                        marginBottom: 3,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Input Detail Tiang
                    </Typography>
                    <TextField
                        select
                        label="STO"
                        value={sto}
                        onChange={(e) => setSto(e.target.value)}
                        fullWidth
                        margin="normal"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    margin: '10px 0', // Atur margin sesuai kebutuhan Anda
                                },
                            },
                        }}
                    >
                        {stos.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Nomor Tiang"
                        value={nomorTiang}
                        onChange={(e) => setNomorTiang(e.target.value)}
                        fullWidth
                        margin="normal"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    margin: '10px 0', // Atur margin sesuai kebutuhan Anda
                                },
                            },
                        }}
                    >
                        {nomorTiangs.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.desc} ({option.value})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label='Address'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        fullWidth
                        margin='normal'
                        multiline
                        rows={4}
                    />



                </Box>

                <Typography variant="body2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                    Inputkan alpro kompetitor & evidence tiang
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '20px 0' }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#820D0D',
                            color: '#FFFFFF',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1.5rem',
                            '&:hover': {
                                backgroundColor: '#660a0a',
                            },
                        }}
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#820D0D',
                            color: '#FFFFFF',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1.5rem',
                            '&:hover': {
                                backgroundColor: '#660a0a',
                            },
                        }}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Box>
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

export default AddressPage;
