import { useEffect, useState } from "react";

export function unixToTimeString(unix,showSeconds=false,skipHours=true){
    const date = new Date(unix);
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();

    const hstr = (skipHours&&!hours)?"":hours.toString().padStart(2,"0")+":";
    const mstr = (minutes%60).toString().padStart(2,"0");
    const sstr = ":"+(seconds%60).toString().padStart(2,"0");
    
    return hstr+mstr+(showSeconds?sstr:"");
}

export function TimeSince({startDate}){
    const [_,redraw] = useState(0);
    useEffect(()=>{
        const id = setTimeout(()=>redraw(_+1),1000);
        return ()=>clearTimeout(id);
    });
    const now = Date.now();
    const diff = now - startDate;
    
    return unixToTimeString(diff,true);
}

export function LiveTime({startDate=Date.now(),showSeconds=true}){
    const [_,redraw] = useState(0);

    useEffect(()=>{
        const id = setTimeout(()=>redraw(_+1),1000);
        return ()=>clearTimeout(id);
    });
    const now = Date.now();
    

    return unixToTimeString(now,showSeconds,false);
}