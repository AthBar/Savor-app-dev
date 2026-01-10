import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "../common/API";

function PlaceOption({data}){
    const nav = useNavigate();
    return <div className="place-option" onClick={()=>nav(`/watch/${data.id}`)}>
        <div className="name">{data.name}</div>
        <div className="location">Ν.Αγχίαλος</div>
        <div>{data.hasSession?"Ενεργή":"Ανενεργή"}</div>
        <div>end</div>
    </div>;
}

export default function PlaceSelection(){
    const [list,setList] = useState(null);
    
    useEffect(()=>{
        API("/dashboard/places").then(l=>{
            if(l.success)setList(l.data);
            else location.replace("/auth/login?next=%2Fwatch"); 
        },()=>{debugger});
    },[]);
    if(!list)return "Loading...";

    return <div className="place-selector fixed-centered">
                <div className="selector-head">
                    Επιλογή επιχείρησης για προβολή
                </div>
                <div className="selector-options">
                    {list.map((c,i)=><PlaceOption key={i} data={c}/>)}
                </div>
                <div className="selector-footer">
                    Σύνολο: {list.length==1?"1 επιχείρηση":`${list.length} επιχειρήσεις`}
                </div>
            </div>;
}