import { useState } from "react";


export default function(){
    const [_,redraw]=useState(0);
    document.addEventListener("fullscreenchange",()=>redraw(_+1));
    return <div className="dashboard-topbar">
        <div style={{fontSize:"2em"}}>Savor</div>
        <div style={{textAlign:"left",paddingLeft:"50px",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
            Θανάσης Μπαρτζώκας <span style={{color:"#a00"}}>(admin)</span>
            <div>
                {document.fullscreenElement?
                <button onClick={()=>document.exitFullscreen()}>Έξοδος από πλήρη οθόνη</button>:
                <button onClick={()=>document.querySelector("#root")?.requestFullscreen()}>Είσοδος σε πλήρη οθόνη</button>}
            </div>
        </div>
    </div>;
}