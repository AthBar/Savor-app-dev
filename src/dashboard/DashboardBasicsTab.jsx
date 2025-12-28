import { useNavigate } from "react-router";
import LayoutSVG from "../owner/LayoutSVG";
import DashboardTab from "./DashboardTab";

function ViewButton({placeId}){
    const nav = useNavigate();
    return <button style={{padding:"25px"}} onClick={()=>nav(`/dashboard/watch/${placeId}`,"_black","popup")}>Προβολή</button>
}

export default class DashboardBasicsTab extends DashboardTab{
    render(){
        return <div className="dashboard-basics-tab-container">
            <h1 style={{textAlign:"center"}}>Όνομα: <span contentEditable suppressContentEditableWarning>{this.place.name}</span></h1>
            <div style={{width:"50%"}}>
                <LayoutSVG placeId={this.place.id} viewOnly/>
            </div>
            <ViewButton placeId={this.place.id}/>
        </div>
    }
}