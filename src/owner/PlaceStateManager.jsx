import { useEffect, useSyncExternalStore } from "react";
import { useState } from "react";
import OwnerApp3, { useWatchApp } from "./App3";
import ListenerApp from "./ListenerAppBase";

let timeout;
//I realized react functions are the norm
export default function PlaceStateManager(){
    const app = useWatchApp();
    const closed = app.placeSession.closed;
    const [active,setActive] = useState(false);

    useEffect(()=>{
        setActive(false);

        if(timeout)clearTimeout(timeout);
        timeout = setTimeout(()=>setActive(true),1000+1000*Math.random());
    },[closed]);

    useSyncExternalStore(app.subscription,()=>app.updateCounter)

    const onClick = closed?()=>app.open():()=>app.close();
    const normalButton =<button className={closed?"green-wide-button":"delete-button"} onClick={onClick}>
                            {closed?"Άνοιγμα":"Κλείσιμο"}
                        </button>;

    let terminate;
    if(closed){terminate=true;for(let i of Object.values(app.placeSession.tables))if(!(terminate=!i.at(-1)?.isActive))break;}

    function terminateF(){
        if(terminate)app.terminate();
    }

    return  <div style={{padding:"10px"}}>
                <div className="state-title">{closed?"Κλειστά":"Ανοιχτά"}</div>
                <div className="state-desc">{closed?
                "Δεν θα γίνουν δεκτές νέες συνδέσεις":
                "Μπορούν να γίνουν νέες συνδέσεις"
                }</div>
                <hr/>
                {active?normalButton:<button className="auto-detect-button" style={{cursor:"default"}}>Περιμένετε...</button>}
                {terminate?
                <div>
                    <hr/>
                    <div className="state-title">Τερματισμός</div>
                    <div className="state-desc">Δεν έχει απομείνει κανένας πελάτης. Μπορείτε τώρα να τερματίσετε την λειτουργία της επιχείρησης</div>
                    <hr/>
                    <button className="delete-button" onClick={terminateF}>Τερματισμός</button>
                </div>
                :null}
            </div>
}