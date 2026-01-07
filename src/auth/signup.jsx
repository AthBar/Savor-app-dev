import React, { createRef } from "react";
import { API } from "../common/API";

export default class SignupPage extends React.Component{
    #a=createRef();
    #b=createRef();
    login(){
        SignupPage.signup(this.#a.current.value,this.#b.current.value);
    }
    logout(){
        return API("/auth/logout","POST");
    }
    render(){
        return <div className="auth-form">
            <div className="form-title">Create User</div>
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
    static signup(email,password){
        return API("/auth/signup","POST",{email,password}).then(console.log)
    }
}