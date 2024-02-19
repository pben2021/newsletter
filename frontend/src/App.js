import { BrowserRouter, Routes, Route } from "react-router-dom"
import GetStarted from "./Pages/GetStarted"; 
import Home from "./Pages/Home";
import WriteNewsletter from "./Pages/WriteNewsletter";
import Newsletters from "./Pages/Newsletters";
import Settings from "./Pages/Settings";
import ManageGroups from "./Pages/ManageGroups";
import CreateAccount from "./Pages/CreateAccount";
import Login from "./Pages/Login";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<GetStarted/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/create-account" element={<CreateAccount/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/groups" element={<Newsletters />} />
          <Route path="/write" element={<WriteNewsletter/>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/join-group" element={<ManageGroups />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
