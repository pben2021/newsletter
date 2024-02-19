import GetNewsletters from "../Components/GetNewsletters"
import Navbar from "../Components/Navbar"
import useUser from "../Hooks/useUser";
import { useState, useEffect } from "react";

// home page that displays the most recent newsletters for each group
function Home() {
  const [name, setName] = useState('');
  const { user, isLoading } = useUser();

  useEffect(() => {
    async function loadInfo() {
      setName(user.displayName)
    }
    if (user) {
      loadInfo();
    }
  }, [isLoading, user]);

  return (
    <div class="container-fluid">
        <Navbar page={"home"}/>

        <div class="row p-3 mt-5">
            <h1 class="text-center pb-5">Hey <span class="text-primary">{name && name}</span>, here are your most recent newsletters</h1>
        </div>
        <div class="row mx-5">
          <GetNewsletters type="recent" /> 
        </div>

    </div>
  )
}


export default Home
