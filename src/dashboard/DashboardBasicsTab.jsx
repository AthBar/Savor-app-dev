import { useNavigate } from "react-router";
import LayoutSVG from "../owner/LayoutSVG";
import DashboardTab from "./DashboardTab";
import { useDashboard } from "./Dashboard";

function ViewButton({placeId}){
    const nav = useNavigate();
    return <button style={{padding:"25px"}} onClick={()=>nav(`/dashboard/watch/${placeId}`,"_black","popup")}>Προβολή</button>
}

export default function DashboardBasicsTab(){
    const {place} = useDashboard();
    return <div className="dashboard-basics-tab-container">
        <h1 style={{textAlign:"center"}}>Όνομα: <span contentEditable suppressContentEditableWarning>{place.name}</span></h1>
        <div style={{width:"50%"}}>
            <LayoutSVG placeId={place.id} viewOnly/>
        </div>
        <ViewButton placeId={place.id}/>
    </div>
}