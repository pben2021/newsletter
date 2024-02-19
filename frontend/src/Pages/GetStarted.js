
// starting page with login and create account buttons

function GetStarted() {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100">

      <div class="container text-center ">
        <div class="row ">
          <h1>Welcome to <span class="friend-newsletter">Friend Newsletter</span></h1>
          <h3 class="text-body-secondary py-3">A new way to keep in touch. </h3>
        </div>

        <div class="row py-3">
          <div class="col py-2 border-end border-info">
            <p>Join a group or create a group. </p>
          </div>

          <div class="col py-2 border-end border-info">
            <p> Each day, update your portion of the newsletter by writing an entry. </p>
          </div>

          <div class="col py-2">
            <p> Check back in a day, week, or month to see what others in your group wrote!</p>
          </div>
        </div>

        <div class="vstack gap-2 col-md-5 mx-auto">
            <a href="login">
              <button type="button" class="btn btn-warning">Login</button>
            </a>
            <a href="create-account">
              <button type="button" class="btn btn-info">Create Account</button>
            </a>
        </div>
      </div>
    </div>
  )
}

export default GetStarted

/*
- remove console logs
- hide all api keys and auth keys

- encrypt passwords on server end

*/