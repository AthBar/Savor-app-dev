import React, { createRef } from "react";
import { API, API_ORIGIN } from "../common/API";
import { useSearchParams } from "react-router";

const REASONS = {
    "bad_input":"Άκυρη εισαγωγή",
    "not_found":"Ο χρήστης δεν υπάρχει",
    "wrong_passwd":"Λάθος κωδικός"
}

export default function LoginPage(){
    const [params] = useSearchParams();
    const next = params.get("next") || "/";
    const uri = encodeURIComponent(next);

    const reason = params.get("reason");
    console.log(uri)

    return <form className="auth-form" method="post" action={API_ORIGIN+"/auth/login?next="+uri}>

            <div className="form-title">
                <img src="/images/logo.svg" style={{height:"50px"}}/><hr/>
                <h2>Login</h2>
            </div>
            
            <div className="form-main">
                <div className="label">Email</div>
                <input type="email" name="email" value={window.$savor?"thanasisbartzokas@gmail.com":""}></input>
                <div className="label">Password</div>
                <input type="password" name="password"></input>
                <div style={{textAlign:"center",gridColumn:"1/3"}}>
                    {reason?REASONS[reason]||reason:null}
                    {window?.$savor?
                    <div>
                        <hr/>
                        Χρησιμοποιείτε το Savor Desktop™ v{$savor.version} <br/>
                        <sub>© {$savor.copyright}</sub>
                    </div>
                    :null}
                </div>
            </div>
            <hr/>
            <div className="form-footer">
                <button >Submit</button>
                <button type="button" onClick={()=>API("/auth/logout","POST")}>Logout</button>
            </div>
        </form>;
}