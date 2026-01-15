import { useState } from "react";

const _=_=>_;
window.topbar = {
    setTitle:_
};

export default function(){
    const [_,redraw] = useState(0);
    const [title,setTitle] = useState("");

    window.topbar.setTitle = setTitle;
    document.addEventListener("fullscreenchange",()=>redraw(_+1));

    return <div className="dashboard-topbar">
        <div style={{
            fontSize:"2em",
            marginLeft:"20px",
            maxHeight:"100%",
            backgroundImage:`url("/images/logo.png")`,
            backgroundSize:"contain",
            backgroundRepeat:"no-repeat",
            backgroundPosition:"center",
            width:"100px",
            userSelect:"none",
            }}></div>
        <div style={{textAlign:"left",padding:"0 50px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>{title}</div>
            <div style={{display:"flex",gap:"15px"}}>
                {document.fullscreenElement?
                <button onClick={()=>document.exitFullscreen()}>Έξοδος από πλήρη οθόνη</button>:
                <button onClick={()=>document.querySelector("#root")?.requestFullscreen()}>Είσοδος σε πλήρη οθόνη</button>}
                
            </div>
        </div>
    </div>;
}