
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// create account form
function CreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  
  async function create() {
    try {
      if (password !== confirmPassword) {
        setErr('Password and confirm password do not match');
        return;
      }
      const userCreds = await createUserWithEmailAndPassword(getAuth(), email, password);
      const token = userCreds.user && await userCreds.user.getIdToken();
      const auth = token ? token : null;

      const response = await fetch(`http://127.0.0.1:8000/api/create-user/${auth}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'authtoken': auth,
        },
        body: JSON.stringify({ email: email, name: name }),
      });


      if (response.ok) {
        //additional function to store a name with the account
        updateProfile(getAuth().currentUser, {
          displayName: name
        }).then(() =>
          nav('/home'));
      } else {
        setErr("An error occured. Try again.")
      }
    }
    catch (error) {
      if (error.code == "auth/email-already-in-use"){
        setErr("Email already in use.")
      }
      else if (error.code == "auth/weak-password"){
        setErr("Your password is too weak. It must be at least 8 characters.")
      }
      else {
        setErr("An error occured. Try again later.")
      }
        
      ;
    }
  }


  return (
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100">
      <div class="col-6 rounded text-center">
        <h1>Create Account</h1>
        
        <div class="row input-group py-2">
          <input class="form-control" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required/>
        </div>
        <div class="row input-group py-2">
          <input class="form-control" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <div class="row input-group py-2">
          <input class="form-control" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
        </div>
        <div class="row input-group py-2">
          <input class="form-control" type="password" placeholder="Reenter Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required/>
        </div>
        <div class="row input-group py-2">
          <button class="btn btn-info" onClick={create}>Create Account</button>
        </div>
        {err && <p class="text-danger">{err}</p>}
        <div class="text-center">
          <Link to="/login">Already have account? Login here</Link>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount

