import { use, useEffect, useState } from "react";
import OwnerApp from "./OwnerApp";
import { API } from "../common/functions";
import { useNavigate } from "react-router";


export default function ClockInPrompt({placeId}){
    const nav = useNavigate();
    const [workerList,setWorkerList] = useState([]);
    const [placeName,setPlaceName] = useState("...");
    
    if(!workerList.length) API(`/place/${placeId}/waiter-list`).then(r=>{
        if(r.success)setWorkerList(r.data);
        else console.log("Failed to fetch worker list");
    })
    
    const [id,setID] = useState(0);
    const [pin,setPIN] = useState("");    

    useEffect(()=>{
        API(`/place/basic/${placeId}`).then(r=>setPlaceName(r.name))
    },[]);

    function submit(){
        if(id==-1)return;
        if(pin.length!=6)return;
        API(`/dashboard/${placeId}/clock-in`,"POST",{id,pin}).then(r=>{
            if(r.success){
                localStorage.setItem("clocked-in",JSON.stringify({placeId,id,pin,clockInTime:Date.now()}));
                nav(`/dashboard/waiter/${placeId}`);
            }
        })
    }

    function pinInput(e){
        let val = e.target.value;
        if(val.length>6)val=val.slice(0,6);
        setPIN(val);
    }

    let hasWorker = false;
    for(let i of workerList)if(hasWorker=i)break;

    return <div className="worker-login">
        <div>
            <h2 style={{textAlign:"center"}}>{placeName}</h2>
            <div style={{textAlign:"center"}}>Συνδεθείτε ως μέλος προσωπικού</div>
            <hr/>
            <div>
                <div>
                    <div>Όνομα:</div>
                    <select onChange={e=>setID(e.target.value)} defaultValue={-1} disabled={!hasWorker}>
                        <option value={-1} disabled>
                            {hasWorker?"Επιλέξτε όνομα":"Δεν υπάρχει προσωπικό"}
                        </option>

                        {workerList.map(w=>w.title?
                        <option key={w.id} value={w.id}>{w.title}</option>:null
                        )}
                    </select>
                </div>
                <div>
                    <div>PIN:</div>
                    <input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="PIN" maxLength="6" onInput={pinInput} value={pin} disabled={!hasWorker}/>
                </div>
                <div>
                    <button onClick={submit}>Συνδεθείτε</button>
                </div>
            </div>
        </div>
    </div>
}