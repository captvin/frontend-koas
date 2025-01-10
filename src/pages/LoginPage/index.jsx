import React, { useState } from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    IconButton,
    InputAdornment,
    Avatar,
    Snackbar,
    Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "../../axios";
import { keyframes } from "@emotion/react";

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

const LoginPage = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Reset error state
        setError("");
        setErrorMessage("");

        // Validate inputs
        if (!username || !password) {
            setError("Username dan password harus diisi");
            setOpenSnackbar(true);
            return;
        }

        // Example login API request
        axios
            .post("/user/login", { username, password })
            .then((res) => {
                sessionStorage.setItem("userData", JSON.stringify(res.data.data));
                sessionStorage.setItem("token", res.data.token);
                onLogin();
            })
            .catch((err) => {
                if (err.response.status === 404) {
                    setErrorMessage("User tidak ditemukan");
                } else if (err.response.status === 401) {
                    setErrorMessage("Password salah");
                } else if (err.response.status === 500) {
                    setErrorMessage("Server error");
                }
                setOpenSnackbar(true);
            });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container
            maxWidth="xs"
            sx={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "#1a1e36",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mt: 8,
                    p: 4,
                    borderRadius: 2,
                    bgcolor: "transparent",
                    zIndex: 2,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Pole Management
                </Typography>
                <img
                    src={`login.gif`}
                    alt="Welcome"
                    style={{
                        width: "150px",
                        margin: "20px 0",
                        backgroundColor: "transparent",
                    }}
                />

                <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{ alignSelf: "flex-start" }}
                    >
                        Login
                    </Typography>
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        <Link
                            href="https://t.me/adheDevin"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                            sx={{
                                color: "#635C5C",
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            Lupa Password?
                        </Link>
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, bgcolor: "#8b0000", color: "white" }}
                    >
                        Login
                    </Button>
                </Box>
                <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                    sx={{ mt: 2 }}
                >
                    Silahkan menghubungi administrator apabila belum mendaftar
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Link
                        href="https://t.me/adheDevin"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Avatar sx={{ bgcolor: "#ccc", width: 70, height: 70 }}>
                            <img src={`/tele.png`} alt="Telegram" style={{ width: "50px" }} />
                        </Avatar>
                    </Link>
                </Box>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "150px",
                    bgcolor: "#ffcccc",
                    animation: `${waveAnimation} 5s infinite ease-in-out`,
                    zIndex: 1,
                    transform: "scaleY(-1)",
                }}
            />

            <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                sx={{
                    maxWidth: '100%', // Pastikan snackbar tidak melampaui lebar container
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {errorMessage || error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default LoginPage;
