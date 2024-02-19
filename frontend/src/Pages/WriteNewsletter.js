import Navbar from "../Components/Navbar"
import { useState, useEffect } from "react";
import useUser from "../Hooks/useUser";

//allows you to add to a group's newsletter and submit it
function WriteNewsletter() {
  const { user, isLoading } = useUser();
  const [myGroups, setMyGroups] = useState([]);
  const [sgroup, setGroup] = useState('');
  const [select, showSelect] = useState(true);
  const [allowed, setAllowed] = useState(true);
  const [message, setMessage] = useState('');


  useEffect(() => {
    async function loadInfo() {
      const token = user && await user.getIdToken();
      const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};
      const response = await fetch('http://127.0.0.1:8000/api/groups', {
        headers: headers
      });

      if (response.ok) {
        const data = await response.json()
        setMyGroups([...data])
      }
      else setMessage("We're having trouble getting your groups. Try again later.")

    }
    if (user) {
      loadInfo();
    }

  }, [isLoading, user, myGroups]);

  //function to submit newsletter to database
  async function submit(e) {
    e.preventDefault();
    const newsletter = e.target[0].value
    const date = new Date().toJSON().slice(0, 10);

    const token = user && await user.getIdToken();
    const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};

    const response = await fetch('http://127.0.0.1:8000/api/post-partials', {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ gid: sgroup, text: newsletter, date: date, name: user.displayName }),
    });

    if (response.ok) {
      setMessage("Your newsletter has been posted! Come back tomorrow to submit another entry.")
      showSelect(true)
      setAllowed(true)
      setGroup('')
    }
    else setMessage("Something wen't wrong, try again")
  }

  //determines if the user has already submitted a daily newsletter or if a newsletter is incoming. <- if either is true, user can't submit one.
  function checkAllowed(selectedGroup) {
    setGroup(selectedGroup.gid);
    showSelect(false)

    const currentTime = new Date();
    const cutoffTime = new Date(selectedGroup.cutoffDate);
    const hoursUntilNewsletter = (cutoffTime - currentTime) / (1000 * 60 * 60);

    if (selectedGroup.cantPost.includes(user.uid)) {
      setMessage("You've already added to this group's newsletter today. Come back tomorrow to submit another one.");
      setAllowed(false);
    } else if (hoursUntilNewsletter <= 2) {
      setMessage("We're putting together your group's newsletter. Check back in a few hours.");
      setAllowed(false);
    } else {
      setMessage('')
      setAllowed(true);
    }
  }

  return (
    <div className="container-fluid">
        <Navbar page={"write"}/>
        <div className="row p-3 my-3">
              <h1 className="text-center pb-5">Add To Newsletter</h1>
        </div>

        {myGroups.length > 0 ? (
          <div>
            <div>
            <h2>Select a group to add to:</h2>
            </div>
              
              <div className="row row-cols-3" id="writebox">
                {myGroups.map((group, index) => (
                  <div className="col-4 g-3" key={index}>
                    <div className="list-group text-center h-100" onClick={() => checkAllowed(group)}>
                      <div className="p-4 d-flex align-items-center justify-content-center">
                        <a className={`list-group-item list-group-item-action ${sgroup === group.gid ? 'active':null}`} href="#write">{group.name}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <> 
                {/* once user selects group, check if they can submit. If they can, show textbox else show an alert. */}
                {!select ? (
                  <>
                    {allowed ? (
                      <div class="my-5 py-5">
                        <h4 id="write" class="pb-3">You can only submit 1 newsletter per day so make it count!</h4>
                        <div data-bs-spy="scroll" data-bs-target="#writebox" data-bs-smooth-scroll="true" className="mb-3">
                          <form className="form-group" onSubmit={(e) => submit(e)}>
                            <div >
                              <label htmlFor="exampleFormControlTextarea1">Not sure where to start? Here are a few prompts: <span class="fst-italic">What's the most interesting thing that has happened to you today? What's something that has surprised you recently? What did you dream about? What's the last time you felt strongly about something? </span></label>
                              <textarea disabled={!allowed} className="form-control" rows="25" placeholder="Start writing!"></textarea>
                            </div>
                            <button type="my-3 submit" className="btn btn-primary">
                              Submit
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (null)}
                  </>
                ) : (null)}
              {message ?(
                <div class="col-8 alert alert-warning alert-dismissible fade show position-absolute bottom-0 start-50 translate-middle-x" role="alert">
                {message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={()=>{
                  showSelect(true)
                  setAllowed(true)
                  setGroup('')
                  setMessage('')
                }}></button>
            </div>
              ):(null)}
            </>
          </div>
        ) : (
          <div class="bg-warning-subtle text-center align-items-center">
          <h2>Before adding to a newsletter, you have to <a href="join-group">join a group or create your own.</a></h2>
        </div>
        )}
    </div>
  )


}

export default WriteNewsletter
