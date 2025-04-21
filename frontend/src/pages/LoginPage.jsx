// src/pages/LoginPage.jsx
import Login from '../components/Login';

const LoginPage = () => {
  return (
    <div
      style={{
        backgroundImage: 'url(/src/assets/forest.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <Login />
    </div>
  );
};

export default LoginPage;
