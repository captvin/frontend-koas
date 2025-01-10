import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, TextField, IconButton, MenuItem, Modal } from '@mui/material';
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

const EvidencePage = ({ onHome, onPrev }) => {
    const [open, setOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalMessage, setModalMessage] = useState('')
    const [dataToSend, setDataToSend] = useState(JSON.parse(sessionStorage.getItem('dataToSend')));
    const [provider, setProvider] = useState('')
    const [type, setType] = useState('')
    const [comment, setComment] = useState('')
    const [providers, setProviders] = useState([])

    const [alproImage, setAlproImage] = useState(null)
    const [poleImage, setPoleImage] = useState(null)
    const [kudcImage, setKudcImage] = useState(null)

    const [field, setField] = useState('')

    const [showWebcam, setShowWebcam] = useState(false); // State untuk mengontrol tampilan Webcam

    const webcamRef = React.useRef(null);

    const handleClose = () => setOpen(false);

    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const base64ToBlob = (base64, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: contentType });
    };

    const handleSubmit = async () => {
        let data = new FormData()
        if (provider !== '' && type === '' && comment === '' && !alproImage) {
            setErrorMessage('Jika anda mengisikan provider kompetitor maka semua field dan evidence kompetitor harus terisi')
            setOpenSnackbar(true)
        } else if (provider === '' && type !== '' && comment === '' && !alproImage) {
            setErrorMessage('Jika anda mengisikan tipe alpro kompetitor maka semua field dan evidence kompetitor harus terisi')
            setOpenSnackbar(true)
        } else if (provider === '' && type === '' && comment !== '' && !alproImage) {
            setErrorMessage('Jika anda mengisikan keterangan alpro kompetitor maka semua field dan evidence kompetitor harus terisi')
            setOpenSnackbar(true)
        } else if (provider === '' && type === '' && comment === '' && alproImage) {
            setErrorMessage('Jika anda mengisikan evidence alpro kompetitor maka semua field kompetitor harus terisi')
            setOpenSnackbar(true)
        } else if (!kudcImage) {
            setErrorMessage('Evidence kabel KU/DC harus terisi')
            setOpenSnackbar(true)
        } else if (!poleImage) {
            setErrorMessage('Evidence tiang keseluruhan harus terisi')
            setOpenSnackbar(true)
        } else {
            // console.log(kudcImage)
            if (kudcImage) {
                sessionStorage.setItem('kudcImage', kudcImage)
                const kudcImageRTS = await base64ToBlob(kudcImage.split(',')[1], 'image/jpg')
                data.append('kudcImage', kudcImageRTS)
            }
            if (poleImage) {
                sessionStorage.setItem('poleImage', poleImage)
                const poleImageRTS = await base64ToBlob(poleImage.split(',')[1], 'image/jpg')
                data.append('poleImage', poleImageRTS)
            }
            if (alproImage) {
                sessionStorage.setItem('alproImage', alproImage)
                const alproImageRTS = await base64ToBlob(alproImage.split(',')[1], 'image/jpg')
                data.append('alproImage', alproImageRTS)
            }

            let ODCBImage = sessionStorage.getItem('ODCBImage')
            let ODPImage = sessionStorage.getItem('ODPImage');

            if (ODCBImage) {
                ODCBImage = await base64ToBlob(ODCBImage.split(',')[1], 'image/jpg')
                data.append('ODCBImage', ODCBImage)
            }

            if (ODPImage) {
                ODPImage = await base64ToBlob(ODPImage.split(',')[1], 'image/jpg')
                data.append('ODPImage', ODPImage)
            }

            const alproKompetitor = {
                type,
                comment,
                prov: provider
            }


            if (type !== '') {
                sessionStorage.setItem('dataToSend', JSON.stringify({ ...dataToSend, alproKompetitor }))
                for (const key of Object.keys(dataToSend)) {
                    const value = dataToSend[key];
                    if (typeof value === 'object') {
                        data.append(key, JSON.stringify(value));
                    } else {
                        data.append(key, value);
                    }
                }

                data.append('alproKompetitor', JSON.stringify(alproKompetitor))
            } else {
                for (const key of Object.keys(dataToSend)) {
                    const value = dataToSend[key];
                    if (typeof value === 'object') {
                        data.append(key, JSON.stringify(value));
                    } else {
                        data.append(key, value);
                    }
                }
            }

            const status = sessionStorage.getItem('type')

            if (status === 'exist') {
                await axios.post('/proses/tag', data)
                    .then((res) => {
                        setModalMessage(res.data.message)
                        setOpen(true)
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
            } else if (status === 'new') {
                await axios.post('/proses/new', data)
                    .then((res) => {
                        setModalMessage(res.data.message)
                        setOpen(true)
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

        }
    };

    const handleBackHome = () => {
        sessionStorage.removeItem('page')
        sessionStorage.removeItem('dataToSend')
        sessionStorage.removeItem('type')
        sessionStorage.removeItem('kudcImage')
        sessionStorage.removeItem('poleImage')
        sessionStorage.removeItem('ODPImage')
        sessionStorage.removeItem('ODCBImage')
        onHome()
    }

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

                if (field === 'alpro') {
                    setAlproImage(finalImage);
                } else if (field === 'kudc') {
                    setKudcImage(finalImage);
                } else if (field === 'pole') {
                    setPoleImage(finalImage);
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
        setField(alpro)
    }

    const getProvider = async () => {
        await axios.get('/proses/provider')
            .then((res) => {
                const data = res.data.map(item => ({
                    label: item.name,
                    value: item.name
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
                console.error('Gagal mendapatkan lokasi:', error);
                setOpenSnackbar(true);
            }
        };

        fetchLocation();
        getProvider()
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

                        <StepTracker currentStep={3} />

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
                                Input Kompetitor dan Evidence
                            </Typography>
                            <TextField
                                select
                                label="Provider Kompetitor"
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
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
                                {providers.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label='Type Alpro Kompetitor'
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                fullWidth
                                margin='normal'
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            margin: '10px 0', // Atur margin sesuai kebutuhan Anda
                                        },
                                    },
                                }}
                            >
                                <MenuItem key='ODP' value='ODP' >
                                    ODP
                                </MenuItem>
                                <MenuItem key='non-ODP' value='non-ODP'>
                                    non-ODP
                                </MenuItem>
                            </TextField>
                            <TextField
                                label='Keterangan'
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                fullWidth
                                margin='normal'
                            />

                            {/* EVIDENCE ALPRO KOMPETITOR */}
                            <Typography variant='body1' sx={{ marginTop: '10px' }}>
                                Evidence Alpro Kompetitor
                            </Typography>
                            {!alproImage ? (
                                <label htmlFor="capture-camera">
                                    <Box
                                        component="div"
                                        onClick={() => handleOpenWebcam('alpro')}
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
                                            marginTop: '5px'
                                        }}

                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60, color: '#fff' }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box sx={{ textAlign: 'center', display: 'flex', marginTop: '15px' }}>
                                    <img
                                        src={alproImage}
                                        alt="Preview"
                                        style={{ width: '65%', height: 'auto', objectFit: 'contain', borderRadius: '8px', marginBottom: 2 }}
                                    />
                                    <IconButton color="secondary" onClick={() => setAlproImage(null)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>
                                </Box>
                            )}


                            {/* EVIDENCE KUDC */}
                            <Typography variant='body1' sx={{ marginTop: '10px' }}>
                                Evidence Kabel KU/DC
                            </Typography>
                            {!kudcImage ? (
                                <label htmlFor="capture-camera">
                                    <Box
                                        component="div"
                                        onClick={() => handleOpenWebcam('kudc')}
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
                                            marginTop: '5px'
                                        }}

                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60, color: '#fff' }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box sx={{ textAlign: 'center', display: 'flex', marginTop: '15px' }}>
                                    <img
                                        src={kudcImage}
                                        alt="Preview"
                                        style={{ width: '65%', height: 'auto', objectFit: 'contain', borderRadius: '8px', marginBottom: 2 }}
                                    />
                                    <IconButton color="secondary" onClick={() => setKudcImage(null)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>
                                </Box>
                            )}


                            {/* EVIDENCE TIANG */}
                            <Typography variant='body1' sx={{ marginTop: '10px' }}>
                                Evidence Tiang Keseluruhan
                            </Typography>
                            {!poleImage ? (
                                <label htmlFor="capture-camera">
                                    <Box
                                        component="div"
                                        onClick={() => handleOpenWebcam('pole')}
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
                                            marginTop: '5px'
                                        }}

                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60, color: '#fff' }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box sx={{ textAlign: 'center', display: 'flex', marginTop: '15px' }}>
                                    <img
                                        src={poleImage}
                                        alt="Preview"
                                        style={{ width: '65%', height: 'auto', objectFit: 'contain', borderRadius: '8px', marginBottom: 2 }}
                                    />
                                    <IconButton color="secondary" onClick={() => setPoleImage(null)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>
                                </Box>
                            )}

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
                                onClick={handleSubmit}
                            >
                                Submit
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
                            <Typography id="modal-title" variant="h6" component="h2">
                                Sukses Input Data
                            </Typography>
                            <Typography id="modal-description" sx={{ mt: 2 }}>
                                {modalMessage.split('<br />')[0]}
                            </Typography>
                            <Typography id="modal-description" sx={{ mt: 2 }}>
                                {modalMessage.split('<br />')[1]}
                            </Typography>
                            <Button
                                // onClick={onHome}
                                onClick={handleBackHome}
                                variant="contained"
                                sx={{ 
                                    mt: 3,
                                    backgroundColor: '#820D0D',
                                }}
                            >
                                Go Back Home
                            </Button>
                        </Box>
                    </Modal>

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

export default EvidencePage;
