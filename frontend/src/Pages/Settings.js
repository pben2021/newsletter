
import Navbar from "../Components/Navbar"
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";
import { getAuth, deleteUser } from "firebase/auth";

//delete an account
function Settings() {
  const { user } = useUser();
  const nav = useNavigate();

  async function deleteAccount() {
    const token = user && await user.getIdToken();
    const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};
    const response = await fetch('http://127.0.0.1:8000/api/delete-account', {
      method: "PUT",
      headers: headers,
    });

    if (response.ok) {
      const user = getAuth().currentUser;
      deleteUser(user).then(() => {
        nav('/')
      })
        .catch((error) => {
          console.log(error)
        });

    }
    else console.error("error")
  }

  return (
    <div class="container-fluid">
      <Navbar page="settings"/>
      <div class="row p-3 mt-5">
        <h1 class="text-center pb-5">Settings</h1>
        <button class="btn btn-danger" onClick={() => deleteAccount()}>Delete Your Account</button>
      </div>
    </div>
  )
}

export default Settings
