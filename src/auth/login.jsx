import React, { createRef } from "react";
import { API } from "../common/functions";

export default class LoginPage extends React.Component{
    #a=createRef();
    #b=createRef();
    login(){
        LoginPage.login(this.#a.current.value,this.#b.current.value);
    }
    logout(){
        return API("/auth/logout")
    }
    render(){
        return <div className="auth-form">
            <div className="form-title">Login</div>
            <hr/>
            <div className="form-main">
                <div className="label">Email</div>
                <input type="email" ref={this.#a}></input>
                <div className="label">Password</div>
                <input type="password" ref={this.#b}></input>
            </div>
            <hr/>
            <div className="form-footer">
                <button onClick={()=>this.login()}>Submit</button>
                <button onClick={()=>this.logout()}>Logout</button>
            </div>
        </div>;
    }
}

LoginPage.login = function(email,password){
    API("/auth/login","POST",{email,password}).then(console.log)
}
window.LoginPage = LoginPage;