import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "266880689848-nef0s3uqnigkfhm6ct691u0ujqnb5m52.apps.googleusercontent.com";

const LoginScreenUI = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser.isAdmin) {
        navigate(redirect === '/' ? '/admin' : `/${redirect}`);
      } else {
        navigate(redirect === 'admin' ? '/' : `/${redirect}`);
      }
    }
  }, [navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      if (isForgotPassword) {
        if (forgotStep === 1) {
          const response = await axios.post('/api/users/forgot-password', { email }, config);
          setSuccessMsg(response.data.message);
          setForgotStep(2);
        } else {
          const response = await axios.post('/api/users/reset-password', { email, otp, new_password: newPassword }, config);
          setSuccessMsg(response.data.message);
          setIsForgotPassword(false);
          setIsLogin(true);
          setOtp('');
          setNewPassword('');
          setPassword('');
        }
      } else if (isLogin) {
        const response = await axios.post('/api/users/login', { email, password }, config);
        const data = response.data;
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate(data.isAdmin ? (redirect === '/' ? '/admin' : `/${redirect}`) : (redirect === 'admin' ? '/' : `/${redirect}`));
      } else {
        if (!isOtpStep) {
          const response = await axios.post('/api/users/register', { name, email, password }, config);
          setIsOtpStep(true);
          setSuccessMsg(response.data.message || 'Please check your email for the verification code.');
        } else {
          const response = await axios.post('/api/users/verify-email', { email, otp }, config);
          const data = response.data;
          localStorage.setItem('userInfo', JSON.stringify(data));
          navigate(data.isAdmin ? (redirect === '/' ? '/admin' : `/${redirect}`) : (redirect === 'admin' ? '/' : `/${redirect}`));
        }
      }
    } catch (err) {
      if (err.response?.status === 403 && isLogin && !isForgotPassword) {
        setIsLogin(false);
        setIsOtpStep(true);
        setError('Please verify your email to continue.');
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const response = await axios.post('/api/users/google-login', { token: tokenResponse.access_token });
        const data = response.data;
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate(data.isAdmin ? (redirect === '/' ? '/admin' : `/${redirect}`) : (redirect === 'admin' ? '/' : `/${redirect}`));
      } catch (err) {
        setError(err.response?.data?.detail || 'Google login failed');
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsOtpStep(false);
    setIsForgotPassword(false);
    setError('');
    setSuccessMsg('');
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setForgotStep(1);
    setError('');
    setSuccessMsg('');
  };

  const backToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px', boxSizing: 'border-box' }}>
      <StyledWrapper>
        <form className="form" onSubmit={submitHandler} autoComplete="off">
          <h2 className="form-title">
            {isForgotPassword 
              ? (forgotStep === 1 ? 'Reset Password' : 'Enter OTP & New Password') 
              : isLogin ? 'Welcome Back' : isOtpStep ? 'Verify Email' : 'Create Account'}
          </h2>

          {error && <div style={{ color: 'red', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
          {successMsg && <div style={{ color: 'green', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>{successMsg}</div>}

          {!isLogin && !isOtpStep && !isForgotPassword && (
            <>
              <div className="flex-column"><label>Full Name</label></div>
              <div className="inputForm">
                <input type="text" className="input" placeholder="Enter your Name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="new-password" />
              </div>
            </>
          )}

          {(!isOtpStep && (!isForgotPassword || forgotStep === 1)) && (
            <>
              <div className="flex-column"><label>Email</label></div>
              <div className="inputForm">
                <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></g></svg>
                <input type="email" className="input" placeholder="Enter your Email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isOtpStep || (isForgotPassword && forgotStep === 2)} autoComplete="new-password" />
              </div>
            </>
          )}

          {!isOtpStep && !isForgotPassword && (
            <>
              <div className="flex-column"><label>Password</label></div>
              <div className="inputForm">
                <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg>        
                <input type={showPassword ? "text" : "password"} className="input" placeholder="Enter your Password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <div onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', paddingRight: '10px', color: '#6b7280'}}>
                  {showPassword ? (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </div>
              </div>
            </>
          )}

          {(isOtpStep || (isForgotPassword && forgotStep === 2)) && (
             <>
             <div className="flex-column"><label>6-Digit OTP</label></div>
             <div className="inputForm">
               <input type="text" className="input" placeholder="Enter 6-digit code" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" autoComplete="off" />
             </div>
           </>
          )}

          {(isForgotPassword && forgotStep === 2) && (
             <>
             <div className="flex-column"><label>New Password</label></div>
             <div className="inputForm">
               <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg>        
               <input type={showNewPassword ? "text" : "password"} className="input" placeholder="Enter New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
               <div onClick={() => setShowNewPassword(!showNewPassword)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', paddingRight: '10px', color: '#6b7280'}}>
                  {showNewPassword ? (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </div>
             </div>
           </>
          )}

          {(!isOtpStep && !isForgotPassword && isLogin) && (
            <div className="flex-row">
              <div>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember" style={{ marginLeft: '5px' }}>Remember me</label>
              </div>
              <span className="span" onClick={handleForgotPassword}>Forgot password?</span>
            </div>
          )}

          <button className="button-submit" type="submit" disabled={loading}>
             {loading ? 'Please wait...' : 
              isForgotPassword ? (forgotStep === 1 ? 'Send OTP' : 'Reset Password') :
              isLogin ? 'Sign In' : isOtpStep ? 'Verify OTP' : 'Sign Up'}
          </button>
          
          {isForgotPassword && (
            <p className="p" style={{marginTop: '10px'}}>
              Remember your password? <span className="span" onClick={backToLogin}>Login here</span>
            </p>
          )}

          {!isOtpStep && !isForgotPassword && (
            <>
              <p className="p">
                {isLogin ? "Don't have an account?" : "Already have an account?"} 
                <span className="span" onClick={toggleAuthMode}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
              
              <p className="p line">Or With</p>
              <div className="flex-row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn google" onClick={() => googleLoginHandler()} style={{ width: '100%' }}>
                  <svg version="1.1" width={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{enableBackground: 'new 0 0 512 512'}} xmlSpace="preserve">
                    <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z" />
                    <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451 c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535 c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
                    <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512 c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771 c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
                    <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012 c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0 C318.115,0,375.068,22.126,419.404,58.936z" />
                  </svg>
                  Google 
                </button>
              </div>
            </>
          )}
        </form>
      </StyledWrapper>
    </div>
  );
};

const LoginScreen = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <LoginScreenUI />
  </GoogleOAuthProvider>
);

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #ffffff;
    padding: 30px;
    width: 100%; /* Changed from 450px */
    max-width: 450px; /* Added */
    border-radius: 20px;
    box-shadow: 0px 10px 30px rgba(0,0,0,0.05);
    box-sizing: border-box; /* Added to prevent overflow */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .form-title {
    text-align: center;
    margin: 0 0 15px 0;
    font-size: 24px;
    font-weight: bold;
  }

  ::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .form button {
    align-self: flex-end;
  }

  .flex-column > label {
    color: #151717;
    font-weight: 600;
  }

  .inputForm {
    border: 1.5px solid #ecedec;
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
  }

  /* Browser Autofill Background Override */
  .input:-webkit-autofill,
  .input:-webkit-autofill:hover, 
  .input:-webkit-autofill:focus, 
  .input:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s;
    -webkit-text-fill-color: black !important;
  }

  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 85%;
    height: 100%;
    background: transparent;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .flex-row > div > label {
    font-size: 14px;
    color: black;
    font-weight: 400;
  }

  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
  }

  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #151717;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
  }

  .button-submit:hover {
    background-color: #252727;
  }

  .button-submit:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .p {
    text-align: center;
    color: black;
    font-size: 14px;
    margin: 5px 0;
  }

  .btn {
    margin-top: 10px;
    width: 100%;
    height: 50px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    border: 1px solid #ededef;
    background-color: white;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  .btn:hover {
    border: 1px solid #2d79f3;
  }

  /* Responsive Design for Mobile Devices */
  @media (max-width: 480px) {
    .form {
      padding: 25px 20px;
      border-radius: 15px;
    }
    
    .form-title {
      font-size: 22px;
    }

    .inputForm, .btn, .button-submit {
      height: 45px;
    }

    .button-submit {
      font-size: 14px;
    }

    .flex-row > div > label, .span, .p {
      font-size: 13px;
    }

    .flex-column > label {
      font-size: 14px;
    }
  }
`;

export default LoginScreen;