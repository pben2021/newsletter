
import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar"
import useUser from "../Hooks/useUser";

//allows user to join, create, delete, or edit groups
function ManageGroups() {
  const { user, isLoading } = useUser();
  const [status, setStatus] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState("");

  useEffect(() => {
    async function getGroups() {
      const token = user && await user.getIdToken();
      const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};
      const response = await fetch('http://127.0.0.1:8000/api/groups', {
        headers: headers
      });

      if (response.ok) {
        const data = await response.json()
        setMyGroups(data)
      }
      else setError("We're having trouble getting you're groups. Try again later.")

    }

    if (user) {
      getGroups();
    }

  }, [isLoading, user]);

  async function joinGroup(e) {
    e.preventDefault();
    setError("")

    const groupid = e.target[0].value
    const password = e.target[1].value

    const token = user && await user.getIdToken();
    const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};

    const response = await fetch(`http://127.0.0.1:8000/api/join-group/${groupid}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ password: password }),

    })

    if (response.ok) {
      const newGroup = await response.json()
      setMyGroups([...myGroups, { gid: newGroup.gid, name: newGroup.name, owner: false, cantPost: newGroup.cantPost, cutoffDate: newGroup.cutoffDate }])
      setSelectedGroup('')
      setStatus("You have successfully been added.")
    }
    else if (response.status == 406) {
      setError("The password you entered is incorrect.")
    }
    else {
      setError("That group does not exist. Try again.")
    }
  }

  async function createGroup(e) {
    e.preventDefault();
    setError("")

    const name = e.target[0].value
    const password = e.target[1].value
    const verifypass = e.target[2].value
    const frequency = e.target[3].value

    if (password === verifypass) {
      let groupid = (Math.random() + 1).toString(36).substring(3);

      const token = user && await user.getIdToken();
      const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};

      const response = await fetch(`http://127.0.0.1:8000/api/create-group/${groupid}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ name: name, password: password, frequency: frequency }),
      });
      if (response.ok) {
        const newGroup = await response.json()
        setMyGroups([...myGroups, { gid: newGroup.gid, name: newGroup.name, owner: true, cantPost: newGroup.cantPost, cutoffDate: newGroup.cutoffDate }])
        setStatus(`You have succesfully created a new group. Here's the group code: ${groupid}. Now invite some friends by using this code.`)

      }
      else setStatus("An error occured. Try again later.")

    }
    else setError("The password you entered is incorrect.")


  }

  async function deleteGroup(e) {
    const token = user && await user.getIdToken();
    const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};
    const groupid = e.target.value
    const response = await fetch(`http://127.0.0.1:8000/api/delete-group/${groupid}`, {
      method: "PUT",
      headers: headers,
    });
    if (response.ok) {
      setMyGroups(myGroups.filter(g => g.gid !== groupid))
      setStatus("You have successfully been removed.")
    }
    else setStatus("An error occured. Try again.")
  }

  //change frequency let's the user change the frequency of a group
  async function changeFrequency(e, gid) {
    e.preventDefault();

    const token = user && await user.getIdToken();
    const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};
    const frequency = e.target[0].value

    const response = await fetch(`http://127.0.0.1:8000/api/change-freq/${gid}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ frequency: frequency }),
    });
    if (response.ok) {
      setStatus(`${selectedGroup.name}'s frequency has successfully been changed.`)
    }
    else setStatus('Something went wrong. Try again.')

    setSelectedGroup('')
    setError('')
  }

  return (
    <div className="container-fluid">
      <Navbar page="manage" />

      <div class="row p-3 mt-5">
        <h1 class="text-center pb-5">Manage Groups</h1>
      </div>


      <div className="mt-0 mb-5 row justify-content-center">
        <div className="col-4 text-center">
          <button type="button" className="btn btn-primary btn-lg h-100" data-bs-toggle="modal" data-bs-target="#joinGroup">Join A Group</button>
        </div>
        <div className="col-4 text-center">
          <button type="button" className="btn btn-primary btn-lg h-100" data-bs-toggle="modal" data-bs-target="#createGroup" >Create A Group</button>
        </div>
      </div>

      <div className="m-4 list-group">
        <h3 class="fw-bold">Your Groups:</h3>
        {myGroups.length > 0 ? (
          <>
            {myGroups.map((group, index) => (
              <div key={index} class="col-6 list-group-item bg-light bg-opacity-50 rounded-end">
                <div>
                  <h5 class="text-primary pb-2">{group.name}</h5>
                </div>
                <div class="row g-4 px-4">

                  <button type="button" data-bs-toggle="modal" data-bs-target="#frequency" value={group.gid} className="btn btn-warning text-white" onClick={() => {
                    setSelectedGroup(group)
                  }}>Change Newsletter Frequency</button>

                  <button type="button" value={group.gid} className="btn btn-warning text-white" onClick={(e) => {
                    setSelectedGroup(group)
                    deleteGroup(e)
                  }}>Leave Group</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div class="bg-warning-subtle text-center align-items-center">
            <h2>You have no groups. </h2>
          </div>
        )}
      </div>

      <div class="modal" id="joinGroup">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Join a group</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" onClick={() => {
                setSelectedGroup('')
                setError('')
              }}></button>
            </div>
            <div class="modal-body">
              <form onSubmit={(e) => joinGroup(e)}>
                <div class="py-2">
                  <label class="mx-2">Enter Group ID:</label>
                  <input type="text" placeholder="Group ID" name="group" />
                </div>
                <div class="py-2">
                  <label class="mx-2">Enter Group Password: </label>
                  <input type="password" placeholder="Group password" />
                </div>
                {error && <p class="mx-2 ">{error}</p>}
                <div class="modal-footer">
                  <button class="btn btn-primary" data-bs-dismiss={status ? null : 'modal'}>Join group</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" id="createGroup">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Create a new group</h1>
              <button type="button" class="btn-close" data-bs-dismiss={status ? null : 'modal'} onClick={() => {
                setSelectedGroup('')
                setError('')
              }}></button>
            </div>
            <div class="modal-body">
              <form onSubmit={(e) => createGroup(e)}>
                <div class="py-2">
                  <label class="mx-2">Group name: </label>
                  <input type="text" placeholder="Enter a group name" required/>
                </div>
                <div class="py-2">
                  <label class="mx-2">Password: </label>
                  <input type="password" placeholder="Set a password" required/>
                </div>
                <div class="py-2">
                  <label class="mx-2">Reenter Password: </label>
                  <input type="password" placeholder="Confirm password" required/>
                </div>
                <div class="py-2">
                  <label class="mx-2">How often should the group receive newsletters? </label>
                  <select>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Biweekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                {error && <p class="mx-2 text-danger">{error}</p>}
                <div class="modal-footer">
                  <button class="btn btn-primary" data-bs-dismiss={status ? null : 'modal'}>Submit</button>
                </div>
              </form>


            </div>
          </div>
        </div>
      </div>

      <div class="modal" id="frequency">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Change {selectedGroup.name}'s Frequency</h1>
              <button type="button" class="btn-close" data-bs-dismiss={status ? null : 'modal'} onClick={() => {
                setSelectedGroup('')
                setError('')
              }}></button>
            </div>
            <div class="modal-body">
              <form onSubmit={(e) => changeFrequency(e, selectedGroup.gid)}>
                <div class="py-2">
                  <label class="mx-2">Select a new frequency for your group's newsletter: </label>
                  <select>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Biweekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                {error && <p class="mx-2 text-danger">{error}</p>}
                <div class="modal-footer">
                  <button class="btn btn-primary" data-bs-dismiss={status ? null : 'modal'}>Change Frequency</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {status ? (
        <div class="col-8 alert alert-warning alert-dismissible fade show position-absolute bottom-0 start-50 translate-middle-x" role="alert">
          {status}
          <button type="button" class="btn-close" data-bs-dismiss="alert" onClick={() => {
            setSelectedGroup('')
            setError('')
            setStatus('')
          }}></button>
        </div>
      ) : (null)}

    </div>
  )

}



export default ManageGroups
