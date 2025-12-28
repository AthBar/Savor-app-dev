import { useNavigate, useParams } from "react-router";
import Dashboard from "./Dashboard";

function DashboardSidebarMain(){
    function e(e){
        const sibling = e.target.nextSibling;
        if(sibling&&sibling.matches(".row-list"))sibling.classList.toggle("expanded");
    }
    const {id} = useParams();
    const json = {
       //Title: link
        "Βασικές πληροφορίες":"",
        "Μενού":{
            _:"menu",
            "Πιάτα":"dishes",
            "Σχεδιασμός μενού":"design",
            "Επιλογή μενού":"assign",
            "Προσφορές":"offers"
        },
        "Κατόψεις":"layouts",
        "Κωδικοί QR":"qr",
        "Λειτουργείες":"features"
    };
    const path = location.pathname.split("/").slice(1);
    const nav = useNavigate();
    function makeRowList(json,root=`/dashboard/${id}`){
        const arr=[];
        for(let title of Object.keys(json)){
            if(title=="_")continue;

            if(json[title] instanceof Object){
                const sub = json[title]._;
                const targetLink = root+"/"+sub;
                arr.push(
                    <div key={title} className={"row"+(path.at(-1)==sub?" selected":"")} onClick={()=>nav(targetLink)}>{title}</div>,
                    <div key={title+"-list"} className={"row-list"+(path.includes(sub)?" expanded":"")}>{makeRowList(json[title],targetLink)}</div>
                );
            }
            else {
                arr.push(<div key={title} className={"row"+(path.at(-1)==json[title]?" selected":"")} onClick={()=>nav(root+"/"+json[title])}>{title}</div>);
            }
        }
        return arr;
    }
    const core = <div className="dashboard-sidebar">
        {makeRowList(json)}
    </div>

    return core;
}

export default function DashboardSidebar(){
    return <div className="dashboard-sidebar-wrapper">
        <div className="dashboard-sidebar-title">{Dashboard.instance.state.placeLoaded?Dashboard.instance.place.name:"Φόρτωση..."}</div>
        <DashboardSidebarMain/>
    </div>
}