import { use, useEffect, useState } from "react";
import OwnerApp from "./OwnerApp";
import { API } from "../common/API";
import { useNavigate } from "react-router";
import ListenerApp from "./ListenerAppBase";

let tm,tm2,canReloadWorkers = true;
export default function ClockInPrompt({placeId,after=_=>_}){
    const nav = useNavigate();

    const [workerList,setWorkerList] = useState([]);
    const [placeName,setPlaceName] = useState("...");
    const [errors,setErrors] = useState(null);
    const [id,setID] = useState(-1);
    const [pin,setPIN] = useState("");    

    useEffect(()=>{
        API(`/place/basic/${placeId}`)
        .catch((e)=>setErrors("Ο API server απάντησε εσφαλμένα: "+e))
        .then(r=>setPlaceName(r.name));
        

        reloadWorkers()
    },[]);

    //Reset errors
    useEffect(()=>{
        if(tm)clearTimeout(tm);
        tm = setTimeout(()=>{
            tm = null;
            setErrors(null);
        },5000);
    },[errors]);

    async function reloadWorkers(){
        if(!canReloadWorkers)return;
        
        clearTimeout(tm2);
        tm2 = setTimeout(()=>canReloadWorkers=true,1000);
        canReloadWorkers = false;

        return API(`/watch/${placeId}/waiter-list`).then(r=>
            r.success?setWorkerList(r.data):null
        );
    }

    function submit(){
        if(!hasWorker)return setErrors("Δεν υπάρχει προσωπικό");
        if(id<0)return setErrors("Επιλέξτε όνομα");
        if(pin.length!=6)return setErrors("Εισάγετε ένα πλήρες PIN");
        API(`/watch/${placeId}/clock-in`,"POST",{id,pin}).then(r=>{
            if(r.success){
                localStorage.setItem("clocked-in",JSON.stringify({placeId,id,pin,clockInTime:Date.now()}));
                nav(`/dashboard/waiter/${placeId}/`);
                //after();
            }
            else if (r.code==1) return setErrors("Λάθος PIN");
        })
    }

    function pinInput(e){
        let val = e.target.value;
        if(val.length>6)val=val.slice(0,6);
        setPIN(val);
    }

    let hasWorker = false;
    for(let i of workerList)if(hasWorker=i.title)break;

    return <div className="worker-login">
        <div>
            <div style={{margin:"10px",display:"flex",alignItems:"center",flexDirection:"row"}}>
                <h1 style={{textAlign:"center", margin: "0px",flexGrow:1}}>{placeName}</h1>
                <button style={{
                        backgroundColor:"white",
                        border:"none",
                        height:"25px",
                        width:"30px",
                        backgroundImage:"url('/reload.svg')",
                        backgroundRepeat:"no-repeat",
                        backgroundPosition:"center",
                        padding:"2px",
                    }} 
                onClick={()=>reloadWorkers()}/>
            </div>
            <div style={{textAlign:"center"}}>Συνδεθείτε ως μέλος προσωπικού</div>
            <hr/>
            <div>
                <div>
                    <div>Όνομα:</div>
                    <select onChange={e=>setID(e.target.value)} defaultValue={-1} disabled={!hasWorker}>
                        <option value={-1} disabled hidden>
                            {hasWorker?"Επιλέξτε όνομα":"Δεν υπάρχει προσωπικό"}
                        </option>

                        {workerList.map(w=>w.title?
                        <option key={w.id} value={w.id}>{w.title}</option>:null
                        )}
                    </select>
                </div>
                <div>
                    <div>PIN:</div>
                    <input 
                        type="number" 
                        inputMode="numeric" 
                        pattern="[0-9]*" 
                        placeholder="PIN" 
                        maxLength="6" 
                        onInput={pinInput} 
                        value={pin} 
                        disabled={!hasWorker||id<0}
                    />
                </div>
                <span style={{color:errors?"red":"white",textAlign:"center"}}>{errors||"-"}</span>
                <hr style={{margin:0}}/>
                <div>
                    <button onClick={submit}>Συνδεθείτε</button>
                </div>
            </div>
        </div>
    </div>
}