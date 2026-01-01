import { useState } from "react";
import OwnerApp from "./OwnerApp";
import { API } from "../common/functions";


export default function ClockInPrompt({placeId}){
    const [workerList,setWorkerList] = useState([]);
    
    if(!workerList.length) API(`/place/${placeId}/waiter-list`).then(r=>{
        if(r.success)setWorkerList(r.data);
        else console.log("Failed to fetch worker list");
    })
    
    const [id,setID] = useState(0);
    const [pin,setPIN] = useState("");    

    function submit(){
        if(id==-1)return;
        if(pin.length!=6)return;
        API(`/dashboard/${placeId}/clock-in`,"POST",{id,pin}).then(r=>{
            if(r.success){
                localStorage.setItem("clocked-in",JSON.stringify({placeId,id,pin,clockInTime:Date.now()}));
                location.replace(`/dashboard/waiter/${placeId}`);
            }
        })
    }

    function pinInput(e){
        let val = e.target.value;
        if(val.length>6)val=val.slice(0,6);
        setPIN(val);
    }

    return <div className="worker-login">
        <div>Συνδεθείτε ως μέλος προσωπικού</div>
        <div><div>Όνομα</div>
            <select onChange={e=>setID(e.target.value)} defaultValue={-1}>
                <option value={-1} disabled>Επιλέξτε όνομα</option>
            {workerList.map(w=>w.title?
                <option key={w.id} value={w.id}>{w.title}</option>:null
            )}</select>
        </div>
        <div><div>PIN</div><input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="PIN" maxLength="6" onInput={pinInput} value={pin}/></div>
        <div><button onClick={submit}>Συνδεθείτε</button></div>
    </div>
}