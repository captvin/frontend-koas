import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert, TextField, IconButton, InputAdornment, Modal } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { keyframes } from '@emotion/react';
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

const PassPage = ({ onHome }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConPassword, setShowConPassword] = useState(false);
    const [open, setOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const setAuthToken = (token) => {
        if (token) {
            // Jika token tersedia, set header Authorization
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Jika token tidak tersedia, hapus header Authorization
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const handleClose = () => setOpen(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleClickShowConPassword = () => {
        setShowConPassword(!showConPassword);
    };


    
    const handleChangePassword = () => {
        if(newPassword !== confirmNewPassword){
            setErrorMessage('New Password dan Confirmation New Password harus sama')
            setOpenSnackbar(true)
        } else {
            axios.post('/user/changePass', {oldPass: currentPassword, newPass: newPassword})
            .then((res) => {
                setOpen(true);
            })
            .catch((err) => {
                if (err.response.status === 404) {
                    setErrorMessage('User tidak ditemukan');
                } else if (err.response.status === 401) {
                    setErrorMessage('Password salah');
                } else if (err.response.status === 500) {
                    setErrorMessage('Server error');
                }
                setOpenSnackbar(true);
            })
        }
    }
    


    useEffect(() => {
        const token = sessionStorage.getItem('token'); // Gantilah dengan token Anda yang sebenarnya
        setAuthToken(token);

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
                <TextField
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowNewPassword}>
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Confirm New Password"
                    type={showConPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowConPassword}>
                                    {showConPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button 
                    onClick={handleChangePassword} 
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                >
                    Change Password
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
                                Sukses Ubah Password
                            </Typography>
                            <Button
                                onClick={onHome}
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
    );
};

export default PassPage;
