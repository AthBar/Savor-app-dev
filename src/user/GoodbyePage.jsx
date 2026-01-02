import { useEffect } from "react";
import { useNavigate } from "react-router";
import UserApp from "./MainApp";

export default function GoodbyePage(){
    const nav = useNavigate();
    useEffect(()=>{
        if(!UserApp.instance.left){
            nav("/store");
        }
    });
    return <div>
        adios
    </div>
}