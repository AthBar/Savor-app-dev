import { useEffect, useState } from "react";
import { API } from "../common/functions";
import { useNavigate } from "react-router";

function PlaceEntry({data}){
    const nav = useNavigate();
    return <div className="place-option" onClick={()=>location.assign(`${data.id}`)}>
        <div className="name">{data.name}</div>
        <div className="location">Ν.Αγχίαλος</div>
        <div>Ανοιχτή</div>
        <div>end</div>
    </div>;
}

let placeListQuery;
export default function PlaceSelector(){
    const [placeList, setPlaceList] = useState([]);

    useEffect(()=>{(placeListQuery?placeListQuery:placeListQuery=API("/dashboard/places"))
        .then(r=>setPlaceList(r.data))}
    ,[]);

    return  <div className="place-selector">{placeList.map((r,i)=>
                <PlaceEntry key={i} data={r}/>
          )}</div>
}