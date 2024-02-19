import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// login form 
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function signIn() {
    setErr('')
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      nav('/home');
    }
    catch (error) {
      setErr("Email or password is incorrect. Try again.");
    }
  }
  
  async function resetPassword() {
    try {
      await sendPasswordResetEmail(getAuth(), email);
      setErr("A password reset email has been sent");
      setPassword('')

    }
    catch (error) { 
      setErr("An error occured. Try again.");
    }
  }
  return (
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100">
      <div class="col-6 rounded text-center">
        <h1 class="">Login to your Account</h1>
          <div class="row input-group py-2">
            <input class="form-control" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required/>
          </div>
          <div class="row input-group  py-2">
            <input class="form-control" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
          </div>
          <div class="row input-group py-2">
            <button class="btn btn-warning" onClick={signIn}>Login</button>
          </div>
        {err && <p class="text-danger">{err}</p>}
        <div class="row text-center py-2">
          <Link onClick={resetPassword}>Reset Password</Link>
        </div>
        <div class="row text-center py-2">
          <Link to="/create-account">Don't have an account? Create one here</Link>
        </div>
      </div>
    </div>
  )
}

export default Login




