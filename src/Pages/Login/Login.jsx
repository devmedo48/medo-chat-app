import { useRef, useState } from "react";
import assets from "../../assets/assets";
import "./Login.css";
import { login, resetPass, signup } from "../../config/firebase";
import { toast } from "react-toastify";
function Login() {
  let [state, setState] = useState("signup");
  let [username, setUsername] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [btnClicked, setBtnClicked] = useState(false);
  let term = useRef("");
  function handleSubmit(e) {
    e.preventDefault();
    setBtnClicked(true);
    if (state === "signup") {
      if (term.current.checked) {
        signup(username, email, password);
      } else {
        toast.info("you should check term frist");
      }
    } else {
      login(email, password);
    }
    setBtnClicked(false);
  }
  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{state === "signup" ? "Sign up" : "Login"}</h2>
        {state === "signup" && (
          <div className="form-input">
            <img src={assets.person_icon} alt="" />
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}
        <div className="form-input">
          <img src={assets.mail_icon} alt="" />
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-input">
          <img src={assets.lock_icon} alt="" />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="login-button"
          style={{ opacity: btnClicked ? ".5" : "1" }}
        >
          {state === "signup" ? "Create account" : "Login now"}
        </button>
        {state === "signup" && (
          <div className="login-term">
            <input type="checkbox" id="term" ref={term} />
            <label htmlFor="term">
              Agree to the terms of use & privacy policy.
            </label>
          </div>
        )}
        <div className="login-forgot">
          {state === "signup" ? (
            <p className="login-toggle">
              Already have an account?{" "}
              <span onClick={() => setState("login")}>Login here</span>
            </p>
          ) : (
            <>
              <p className="login-toggle">
                Forgot password?{" "}
                <span onClick={() => resetPass(email)}>Click here</span>
              </p>
              <p className="login-toggle">
                Don&apos;t have an account?{" "}
                <span onClick={() => setState("signup")}>Create account</span>
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default Login;
