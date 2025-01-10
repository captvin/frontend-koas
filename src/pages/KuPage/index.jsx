import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, TextField, MenuItem, List, ListItem, ListItemText, ListItemIcon, Paper, ListItemSecondaryAction, Modal, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
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

const KuPage = ({ onNext, onPrev }) => {
    const [open, setOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [provider, setProvider] = useState('');
    const [jumlahKU, setJumlahKU] = useState(null);
    const [kuList, setKuList] = useState([]);
    const [dataToSend, setDataToSend] = useState(JSON.parse(sessionStorage.getItem('dataToSend')))
    const [providers, setProviders] = useState([])

    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const handleOpen = () => {
        setProvider('');
        setJumlahKU('');
        setOpen(true);
    };

    const handleNext = () => {
        if(kuList.length > 0){
            const KU = kuList
            sessionStorage.setItem('dataToSend', JSON.stringify({KU, ...dataToSend}))
        }
        onNext()
    }

    const handlePrevious = () => {
        onPrev();
    }

    const handleClose = () => setOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (provider && jumlahKU) {
            // Periksa apakah provider sudah ada dalam kuList
            const existingKU = kuList.find(ku => ku.provider === provider);
            if (existingKU) {
                setErrorMessage('Provider tersebut sudah ditambahkan sebelumnya');
                setOpenSnackbar(true);
            } else {
                // Jika provider belum ada, tambahkan ke kuList
                const qty = jumlahKU
                const newKU = { provider, qty };
                setKuList([...kuList, newKU]);
                setProvider('');
                setJumlahKU(null);
                handleClose();
            }
        } else {
            setErrorMessage('Semua field harus diisi');
            setOpenSnackbar(true);
        }
    };

    const handleRemoveProvider = (providerToRemove) => {
        const updatedKUList = kuList.filter(ku => ku.provider !== providerToRemove);
        setKuList(updatedKUList);
    };

    const getProvider = async () => {
        await axios.get('/proses/provider')
            .then((res) => {
                const data = res.data.map(item => ({
                    label: item.name,
                    value: item.id
                }))
                setProviders(data)
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
                console.error("Gagal mendapatkan lokasi:", error);
                setOpenSnackbar(true);
            }
        };



        fetchLocation();
        getProvider();

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

                <StepTracker currentStep={0} />

                <Box sx={{ width: '98%', textAlign: 'left', marginBottom: 1, }}> {/* Menambahkan textAlign: 'left' dan menetapkan lebar maksimum */}
                    <Typography variant="body1">
                        Input kabel udara
                    </Typography>
                </Box>

                <Box sx={{ maxHeight: '50vh', minHeight: '40vh', overflowY: 'auto', width: '100%' }}> {/* Atur ketinggian maksimum dan overflowY */}
                    <List sx={{ width: '100%' }}>
                        {kuList.map((ku, index) => (
                            <Paper key={index} elevation={0} sx={{ marginBottom: 2, backgroundColor: '#F5F5F5' }}>
                                <ListItem>
                                    <ListItemText primary={providers.find(prv => prv.value === ku.provider).label} secondary={'jumlah: ' + ku.qty} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveProvider(ku.provider)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Paper>
                            // <Box key={index} sx={{ p: 2, border: '1px solid #ccc', mb: 1 }}>
                            //     <div>Provider: {ku.provider}</div>
                            //     <div>Jumlah KU: {ku.jumlahKU}</div>
                            // </Box>
                        ))}
                    </List>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant='contained'
                            sx={{
                                bgcolor: '#c4534b',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#8A0707', // Warna saat hover
                                }
                            }}
                            onClick={handleOpen}
                        >
                            Tambah Kabel Udara
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                    Inputkan kabel udara pada tiang tersebut
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


            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            select
                            label="Provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            // onChange={(e) => console.log(e.target.value.value)}
                            fullWidth
                            margin="normal"
                        >
                            {providers.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Jumlah KU"
                            value={jumlahKU}
                            type="number" // Hanya menerima input numeric
                            InputProps={{
                                inputProps: {
                                    min: 0, // Nilai minimum yang diterima
                                },
                            }}
                            onChange={(e) => setJumlahKU(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" color="primary">Submit</Button>
                    </form>
                </Box>
            </Modal>

            <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default KuPage;
