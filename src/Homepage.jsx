import { Link } from "react-router";

export default function(){
    return <div style={{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:"150px"}}>
        <h2>Savor:</h2>
        <hr/>
        <div style={{display:"flex",flexDirection:"column"}}>
            <a href="/dashboard">Dashboard</a><br/>
            <Link to="/auth/login">Login</Link><br/>
            <Link to="/auth/signup">Signup</Link><br/>
        </div>
    </div>
}