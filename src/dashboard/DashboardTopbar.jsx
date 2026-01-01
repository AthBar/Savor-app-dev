import { useState } from "react";


export default function({title}){
    const [_,redraw]=useState(0);
    document.addEventListener("fullscreenchange",()=>redraw(_+1));
    return <div className="dashboard-topbar">
        <div style={{
            fontSize:"2em",
            marginLeft:"20px",
            maxHeight:"100%",
            backgroundImage:`url("/images/logo.svg")`,
            backgroundRepeat:"no-repeat",
            backgroundPosition:"center",
            width:"100px",
            userSelect:"none",
            }}></div>
        <div style={{textAlign:"left",paddingLeft:"50px",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
            <div>{title}</div>
            <div>
                {document.fullscreenElement?
                <button onClick={()=>document.exitFullscreen()}>Έξοδος από πλήρη οθόνη</button>:
                <button onClick={()=>document.querySelector("#root")?.requestFullscreen()}>Είσοδος σε πλήρη οθόνη</button>}
            </div>
        </div>
    </div>;
}