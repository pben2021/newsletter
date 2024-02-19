//return newsletters
import { useState, useEffect } from "react";
import useUser from "../Hooks/useUser";

//all purpose component that fetches newsletters from database and puts them together
function GetNewsletters({ type }) { //type tells us if we should display all the newsletters or just the mmost recent ones
  const { user, isLoading } = useUser();
  const [newsletters, setNewsletters] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  //two use effects -- one gets all related groups, the other gets all newsletters in each group
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
      else setMyGroups([])

    }

    if (user) {
      getGroups();
    }

  }, [isLoading, user]);

  useEffect(() => {
    async function fetchNewsletters() {
      const token = user && await user.getIdToken();
      const headers = token ? { 'Content-Type': 'application/json', 'authtoken': token } : {};

      for (let group of myGroups) {
        const response = await fetch(`http://127.0.0.1:8000/api/newsletters/${group.gid}`, {
          headers: headers
        });

        if (response.ok) {
          var data = await response.json()
          if (data.length > 0) {
            data = data.filter(item => Object.keys(item.newsletterParts).length > 0)
            setNewsletters(newsletters => [...data, newsletters])

          }

        }
        else setNewsletters([])
      }
    }
    if (myGroups.length > 0) {
      fetchNewsletters();
    }
  }, [user, myGroups]);

  //displays the most recent newsletter of each group
  function displayMostRecent() {
    const flattenNewsletters = newsletters.flat().filter(item => item !== null && item !== undefined)
    var latestEntry = []
    
    for (let group of myGroups) {
      const validGroup = flattenNewsletters.filter(item => item.gid === group.gid)
      console.log(group.gid, validGroup)
      if(validGroup.length > 0) latestEntry.push(validGroup.pop())
    }
    latestEntry.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA
    })

    return (
      <div>
        {latestEntry.map((newsletterGroup, index) => (
          <div className="bg-light border rounded mb-5 px-3" key={index}>
            {newsletterGroup ? (
              <div className="py-3">
                <h2 className="mb-2 text-center shadow-sm bg-warning-subtle"><span className="text-primary">{newsletterGroup.groupName}'s</span> {new Date(newsletterGroup.date).toDateString().slice(4, 10)} Newsletter</h2>
                {Object.entries(newsletterGroup.newsletterParts).map(([uid, userBody], index) => (
                  <div key={index} className="my-5">
                    {userBody[1] ? (
                      <>
                        <h3 className="friend-newsletter fst-italic">{userBody[0]}</h3>
                        {userBody.slice(1).map((entry, ind) => (
                          <div key={ind}>
                            <p className="text-primary mb-0">{new Date(entry.date).toDateString()}</p>
                            <p className="paragraph mb-2">{entry.text}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p>No one has posted yet. Be the first to post!</p>
                    )}

                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    )

  }
  //displays all newsletters from most recent to least recent
  function displayAll() {
    const flattenNewsletters = newsletters.flat().filter(item => item !== null && item !== undefined)
    var new2Old = [...flattenNewsletters].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA
    })

    return (
      <div>
        {new2Old.map((newsletterGroup, index) => (
          <div class="border rounded mb-5 px-3" key={index}>
            {newsletterGroup.gid ? (
              <div class="py-3">
                <h2 class="mb-2 text-center bg-warning"><span class="text-white">{newsletterGroup.groupName}'s</span> {new Date(newsletterGroup.date).toDateString().slice(4, 10)} Newsletter</h2>
                {Object.entries(newsletterGroup.newsletterParts).map(([_, userBody], index) =>
                  <div key={index} class="my-5">
                    {userBody[1] ? (
                      <>
                    <h3 class="friend-newsletter ">{userBody[0]}</h3>
                    {userBody.slice(1).map((entry, ind) => (
                      <div key={ind}>
                        <p class="text-primary mb-0">{new Date(entry.date).toDateString()}</p>
                        <p class="paragraph mb-2"> {entry.text}</p>
                      </div>
                    ))}
                    </>
                    ):(null)}
                  </div>
                )}
              </div>
            ) : (null)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {newsletters.length > 0 ? (
        <div>
          {type === 'recent' ? (displayMostRecent())
            : (displayAll())
          }
        </div>
      ) : (
        <div class="bg-warning-subtle text-center align-items-center">
          <h2>You have no newsletters. Try <a href="write">adding to a newsletter</a>, <a href="join-group">joining a group</a>, or <a href="join-group">creating a new group</a>. </h2>
        </div>
      )}
    </div>

  );

}


export default GetNewsletters
