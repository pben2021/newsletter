import GetNewsletters from "../Components/GetNewsletters"
import Navbar from "../Components/Navbar"

//gets all newsletters
function Newsletters() {

  return (
    <div class="container-fluid">
          <Navbar page="past"/>

          <div class="row p-3 mt-5">
            <h1 class="text-center pb-5">Past newsletters</h1>
          </div>

          <div class="row mx-5">
          <GetNewsletters type="recent" /> 
        </div>

    </div>
  )
}

export default Newsletters