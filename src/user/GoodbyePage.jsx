import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function GoodbyePage(){
    const nav = useNavigate();
    useEffect(()=>{
        if(!_UserApp.instance.left){
            nav("/store");
        }
    });
    return <div>
        adios
    </div>
}