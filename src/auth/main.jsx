import { Route, Routes } from "react-router";
import LoginPage from "./login";
import SignupPage from "./signup";

export default function AuthPage(){
    return <Routes>
        <Route path="login" element={<LoginPage/>}/>
        <Route path="signup" element={<SignupPage/>}/>
    </Routes>
}