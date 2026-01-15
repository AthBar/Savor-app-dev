import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "../common/API";

function PlaceOption({data}){
    return <div className="place-option" onClick={()=>location.assign(`/dashboard/${data.id}`)}>
        <div className="name">{data.name}</div>
        <div className="location">Ν.Αγχίαλος</div>
        <div></div>
        <div>end</div>
    </div>;
}

export default function PlaceSelection(){
    const [list,setList] = useState(null);

    useEffect(()=>{
        API("/dashboard/places").then(l=>{
            if(l.success)setList(l.data);
            else debugger;
        })
    },[]);

    if(!list)return "Loading...";
    return <div className="place-selector">
        <div className="selector-head">
            Επιλογή επιχείρησης
        </div>
        <div className="selector-options">
            {list.map((c,i)=><PlaceOption key={i} data={c}/>)}
        </div>
        <div className="selector-footer">
            Σύνολο: {list.length==1?"1 επιχείρηση":`${list.length} επιχειρήσεις`}
        </div>
    </div>;
}