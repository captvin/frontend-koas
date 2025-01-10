import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SharelocPage from "./pages/SharelocPage"
import ListPolePage from './pages/ListPolePage';
import SplashScreen from './components/SplashScreen';
import KuPage from './pages/KuPage';
import DcPage from './pages/DcPage';
// import OdcbPage from './pages/OdcbPage';
// import EvidencePage from './pages/EvidencePage';
import PassPage from './pages/PassPage';
import AddressPage from './pages/AddressPage';
import axios from './axios';

function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasFetched = useRef(false);
  const [page, setPage] = useState(sessionStorage.getItem('page'))
  const [type, setType] = useState('')

  const setAuthToken = (token) => {
    if (token) {
      // Jika token tersedia, set header Authorization
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Jika token tidak tersedia, hapus header Authorization
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Set token saat aplikasi dimulai (misalnya setelah login)
  // useEffect(() => {

  // }, []);

  const handleLogin = () => {
    // Set isLoggedIn to true after successful login
    setIsLoggedIn(true);
  };

  const handlePage = (page) => {
    setPage(page)
    sessionStorage.setItem('page', page)
  }

  const handleType = (type) => {
    setType(type)
  }


  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const sesPage =  sessionStorage.getItem('page')
    // console.log(sesPage)
    setPage(sesPage ? parseInt(sesPage, 10) : 0);

    const token = sessionStorage.getItem('token'); // Gantilah dengan token Anda yang sebenarnya
    setAuthToken(token);

    

    setTimeout(() => {
      setLoading(false);
    }, 3000)

    // Panggil endpoint /proses/sto hanya sekali saat komponen dimount

    axios.get('/proses/sto')
      .then((res) => {
        setIsLoggedIn(true);
      })
      .catch((err) => {
        sessionStorage.clear();
        localStorage.clear();
        setIsLoggedIn(false);
        setPage(0);
      });
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  
  let currentPage
  // eslint-disable-next-line

  console.log(page)
  switch (page) {
    case 0:
      currentPage = <LandingPage onNext={() => handlePage(1)} onChangePass={() => handlePage(99)}/>;
      break
    case 1:
      currentPage = <SharelocPage onNext={() => handlePage(2)} onPrev={() => handlePage(0)} />;
      break
    case 2:
      currentPage = <ListPolePage onNext={() => {handlePage(3); handleType('exist')}} onPrev={() => handlePage(1)} onNew={() => {handlePage(98); handleType('new')}} />;
      break
    case 3:
      currentPage = <KuPage onNext={() => handlePage(4)} onPrev={() => handlePage(type === 'new' ? 98 : 2)} />;
      break
    case 4:
      currentPage = <DcPage onNext={() => handlePage(5)} onPrev={() => handlePage(3)} />;
      break
    case 5:
      currentPage = <OdcbPage onNext={() => handlePage(6)} onPrev={() => handlePage(4)} />;
      break
    case 6:
      currentPage = <EvidencePage onPrev={() => handlePage(5)} onHome={() => handlePage(0)}/>;
      break
    case 99:
      currentPage = <PassPage onHome={() => handlePage(0)}/>;
      break
    case 98:
      currentPage = <AddressPage onNext={() => handlePage(3)} onPrev={() => handlePage(2)}/>;
      break
    default :
      console.log('tidak ada page')
      break
  }

  // console.log(currentPage)
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? currentPage : <LoginPage onLogin={handleLogin} />}
        />
      </Routes>
    </Router>
  );
}

export default App;