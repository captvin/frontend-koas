import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, TextField, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Delete from '@mui/icons-material/Delete';
import { keyframes } from '@emotion/react';
import StepTracker from '../../components/StepTracker';
import axios from '../../axios';
import Webcam from 'react-webcam'; // Import react-webcam
import Jimp from 'jimp';

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

const OdcbPage = ({ onNext, onPrev }) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [dataToSend, setDataToSend] = useState(JSON.parse(sessionStorage.getItem('dataToSend')));

    const [odpName, setOdpName] = useState('');
    const [odpPhoto, setOdpPhoto] = useState(null);
    const [odcbName, setOdcbName] = useState('');
    const [odcbPhoto, setOdcbPhoto] = useState(null);
    const [alpro, setAlpro] = useState('')

    const [showWebcam, setShowWebcam] = useState(false); // State untuk mengontrol tampilan Webcam

    const webcamRef = React.useRef(null);

    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const handleNext = () => {
        if (odpName !== '' && odpName && !odpPhoto) {
            setErrorMessage('Jika anda mengisikan nama ODP maka evidence ODP juga harus terisi')
            setOpenSnackbar(true)
        } else if (odpPhoto && odpName === '' && !odpName){
            setErrorMessage('Jika anda mengisikan evidence ODP maka nama ODP juga harus terisi')
            setOpenSnackbar(true)
        } else if (odcbName !== '' && odcbName && !odcbPhoto){
            setErrorMessage('Jika anda mengisikan nama ODCB maka evidence ODCB juga harus terisi')
            setOpenSnackbar(true)
        } else if (odcbPhoto && odcbName === '' && !odcbName){
            setErrorMessage('Jika anda mengisikan evidence ODCB maka nama ODCB juga harus terisi')
            setOpenSnackbar(true)
        } else{
            if(odpPhoto){
                sessionStorage.setItem('ODPImage', odpPhoto) 
            }
            if(odcbPhoto){
               sessionStorage.setItem('ODCBImage', odcbPhoto) 
            }

            const ODP = {
                comment: odpName
            }
            const ODCB = {
                comment: odcbName
            }

            if(odpName !== '' && odcbName !== '') {
                sessionStorage.setItem('dataToSend', JSON.stringify({...dataToSend, ODP, ODCB}))
            } else if (odpName !== '' && odcbName === ''){
                sessionStorage.setItem('dataToSend', JSON.stringify({...dataToSend, ODP}))
            } else if(odpName === '' && odcbName !== ''){
                sessionStorage.setItem('dataToSend', JSON.stringify({...dataToSend, ODCB}))
            }
            onNext();
        }    
    };

    const handlePrevious = () => {
        onPrev();
    };

    const addWm = async (imageSrc, lat, long, currentTime) => {
        try {
            const img = new Image();
            img.src = imageSrc;

            // Tunggu sampai gambar selesai dimuat
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const context = canvas.getContext('2d');

            // Gambar gambar ke canvas
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Tambahkan teks ke gambar
            context.font = '24px Arial';
            context.fillStyle = '#ffffff';
            context.fillText(lat, 20, canvas.height - 70);
            context.fillText(long, 20, canvas.height - 40);
            context.fillText(currentTime, 20, canvas.height - 10);

            // Dapatkan data URL dari canvas
            const finalImageBuffer = canvas.toDataURL('image/jpeg');

            return finalImageBuffer;
        } catch (error) {
            console.error('Error adding overlay to image:', error);
            throw error;
        }
    };

    const takePhotoWithLocation = async () => {
        try {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const currentTime = new Date().toLocaleString();
                const { latitude, longitude } = location || {};
                const lat = `Latitude: ${latitude.toFixed(6)}`
                const long = `Longitude: ${longitude.toFixed(6)}`
                const finalImage = await addWm(imageSrc, lat, long, currentTime);

                if (alpro === 'odp') {
                    setOdpPhoto(finalImage);
                } else if (alpro === 'odcb') {
                    setOdcbPhoto(finalImage);
                }

                setShowWebcam(false);
                // console.log('Foto diambil:', finalImage);
            } else {
                throw new Error('Gagal mengambil foto dari webcam');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            setOpenSnackbar(true);
        }
    };

    const handleOpenWebcam = (alpro) => {
        setShowWebcam(true);
        setAlpro(alpro)
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
    }, []);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <>
            {/* // MAIN CONTENT */}
            {!showWebcam && (
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

                        <StepTracker currentStep={2} />

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
                                Input Data ODP dan ODCB
                            </Typography>
                            <TextField
                                label="Nama ODP"
                                value={odpName}
                                onChange={(e) => setOdpName(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                            {!odpPhoto ? (
                                <label htmlFor="capture-camera">
                                    <Box
                                        component="div"
                                        onClick={() => handleOpenWebcam('odp')}
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            backgroundColor: '#F6E3E3',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: '#aa0000',
                                            },
                                            marginTop: '15px'
                                        }}

                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60, color: '#fff' }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box sx={{ textAlign: 'center', display: 'flex', marginTop: '15px' }}>
                                    <img
                                        src={odpPhoto}
                                        alt="Preview"
                                        style={{ width: '65%', height: 'auto', objectFit: 'contain', borderRadius: '8px', marginBottom: 2 }}
                                    />
                                    <IconButton color="secondary" onClick={() => setOdpPhoto(null)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>
                                </Box>
                            )}


                            <TextField
                                label="Nama ODCB"
                                value={odcbName}
                                onChange={(e) => setOdcbName(e.target.value)}
                                fullWidth
                                margin="normal"
                                sx={{
                                    marginTop: '30px'
                                }}
                            />
                            {!odcbPhoto ? (
                                <label htmlFor="capture-camera">
                                    <Box
                                        component="div"
                                        onClick={() => handleOpenWebcam('odcb')}
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            backgroundColor: '#F6E3E3',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: '#aa0000',
                                            },
                                            marginTop: '15px'
                                        }}

                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60, color: '#fff' }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box sx={{ textAlign: 'center', display: 'flex', marginTop: '15px' }}>
                                    <img
                                        src={odcbPhoto}
                                        alt="Preview"
                                        style={{ width: '65%', height: 'auto', objectFit: 'contain', borderRadius: '8px', marginBottom: 2 }}
                                    />
                                    <IconButton color="secondary" onClick={() => setOdcbPhoto(null)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        <Typography variant="body2" sx={{ marginBottom: 3, textAlign: 'center' }}>
                            Inputkan ODP & ODCB pada tiang tersebut
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
            )}

            {/* // SHOW WEBCAM */}
            {showWebcam && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: 'black' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: 'environment', // Menggunakan kamera belakang jika tersedia
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                        color="primary"
                        onClick={takePhotoWithLocation}
                        sx={{
                            position: 'absolute',
                            bottom: 100,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10000,
                            backgroundColor: '#F6E3E3',
                            '&:hover': {
                                backgroundColor: '#820D0D',
                            },
                            borderRadius: '50%',
                            padding: 2,
                        }}
                    >
                        <PhotoCameraIcon sx={{ fontSize: 40, color: '#820D0D', '&:hover': { color: '#F6E3E3' } }} />
                    </IconButton>
                </Box>
            )}
        </>
    );
};

export default OdcbPage;
