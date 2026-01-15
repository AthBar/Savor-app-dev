import { useNavigate } from "react-router";
import DashboardTab from "./DashboardTab";
import { useDashboard } from "./Dashboard";
import { LayoutVisualizer } from "../owner/LayoutSVG";
import { useMemo } from "react";
import LayoutManager from "../owner/LayoutManager";

function ViewButton({placeId}){
    const nav = useNavigate();
    return <button style={{padding:"25px"}} onClick={()=>nav(`/dashboard/watch/${placeId}`,"_black","popup")}>Προβολή</button>
}

export default function DashboardBasicsTab(){
    const {place} = useDashboard();
    const manager = useMemo(()=>new LayoutManager(place.id,true));

    return <div className="dashboard-basics-tab-container">
        <h1 style={{textAlign:"center"}}>Όνομα: <span contentEditable suppressContentEditableWarning>{place.name}</span></h1>
        <div style={{width:"50%"}}>
            <LayoutVisualizer manager={manager}/>
        </div>
        <ViewButton placeId={place.id}/>
    </div>
}