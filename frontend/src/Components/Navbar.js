
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from 'firebase/auth';

function Navbar({page}) {
    const nav = useNavigate();
    const auth = getAuth();

    function logOut() {
        signOut(auth).then(() => {
            nav("/")
        }).catch((error) => {
            console.error("error logging out: ", error)
        });
    }


    return (
        <div>
            <nav class="navbar border-bottom navbar-dark bg-white bg-opacity-25 sticky-top">
                <div class="container-fluid">
                    <button class="btn btn-warning text-dark" onClick={logOut}>Log Out</button>
                    <a class="navbar-brand friend-newsletter text-black" href="home">Friend Newsletter</a>
                    <button class="navbar-toggler =" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon bg-warning"></span>
                    </button>
                    <div class="offcanvas offcanvas-end text-bg-dark bg-opacity-100" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
                        <div class="offcanvas-header">
                            <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Menu</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                                <li class="nav-item">
                                    <a class={`nav-link ${page==='home' ? 'active':''}`} href="home">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class={`nav-link ${page==='write' ? 'active':''}`} href="write">Add To Newsletter</a>
                                </li>
                                <li class="nav-item">
                                    <a class={`nav-link ${page==='past' ? 'active':''}`} href="groups">Past Newsletters</a>
                                </li>
                                <li class="nav-item">
                                    <a class={`nav-link ${page==='manage' ? 'active':''}`} href="join-group">Manage Groups</a>
                                </li>
                                <li class="nav-item">
                                    <a class={`nav-link ${page==='settings' ? 'active':''}`} href="settings">Settings</a>
                                </li>
                            </ul>

                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
