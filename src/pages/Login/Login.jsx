import React, { useState } from 'react'
import './Login.css'
import assets from './../../assets/assets';
import { signup, login,resetPass } from '../../config/firebase';

const Login = () => {
  

    const [curState,setCurState]=useState("SignUp");
    const [userName, setUserName]=useState("");
  const [email, setEmail]=useState("");
  const [password, setPassword]=useState("");

  const onSubmitHandler=(event)=>{
    event.preventDefault();
    if(curState==="SignUp"){
      signup(userName,email,password)
    }
    else{
      login(email,password)
    }
  }
  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form  onSubmit={onSubmitHandler} className="login-form">
        <h2>{curState}</h2>
        {curState==="SignUp"? <input type="text" onChange={(e)=>setUserName(e.target.value)}  value={userName}  placeholder="username" className="form-input"  required />: ""}
        <input type="email"   onChange={(e)=>setEmail(e.target.value)}  value={email} placeholder=" Email address" className="form-input" required/>
        <input type="password"  onChange={(e)=>setPassword(e.target.value)}  value={password} placeholder=" Password" className="form-input" required/>
        <button type='submit'> {curState==="SignUp"? "Create an Account": "Login"}</button>
        <div className="login-term">
            <input type="checkbox"/>
            <p>Agree to the terms of use and privacy policy</p>
        </div>
        <div className="login-forward">
            {curState==="SignUp"? <p className="login-toggle"> already have an account <span onClick={()=>setCurState("Login")}>login here</span></p> :  <p className="login-toggle" >Create an account <span onClick={()=>setCurState("SignUp")}>Clickhere</span></p>}
           
           { curState==='Login'? <p className="login-toggle" >Forgot Password? <span onClick={()=>resetPass(email)}>Reset Here</span></p>: null}
        </div>
      </form>
    </div>
  )
}

export default Login
