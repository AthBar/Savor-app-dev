import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ConnectionStateVisualizer } from "../common/WshVisuals.jsx";
import PlaceStateManager from "./PlaceStateManager";
import TableSessionManager from "./TableSessionManager.jsx";
import WaiterManager from "./WaiterManagement";
import { LayoutVisualizer } from "./LayoutSVG.jsx";
import WatchApp from "./WatchApp.js";
import { ListenerAppContext } from "./ListenerAppBase.jsx";

function NoFullscreen(){
    return <div>
        <div>Προτείνεται να εισέλθετε σε πλήρη οθόνη για καλύτερη ορατότητα και λειτουργικότητα</div>
        <div><button className="green-wide-button" onClick={()=>document.querySelector("#root").requestFullscreen()}>Πλήρης οθόνη</button></div>
    </div>;
}

function InvalidClosurePopup({e}){
    return <div className="big-container">
        <h2 style={{textAlign:"center"}}>Αναπάντεχη αποσύνδεση</h2>
        <hr/>
        <p>
            Η σύνδεσή σας με το Savor τερματίστηκε αναπάντεχα.<br/>
            Ακολουθούν οι πληροφορίες αποσύνδεσης:
            <span style={{padding:"5px",background:"#ddd"}}>{e.code}:{e.reason}</span>
        </p>
        {JSON.stringify({placeId:app.placeId})}
    </div>
}

function PostTerminationPopup(){
    return <div className="big-container">
        <h2 style={{textAlign:"center"}}>Τερματισμός λειτουργίας επιχείρησης</h2>
        <hr/>
        <p>Η λειτουργία της επιχείρησής σας τερματίστηκε. 
            Αυτό σημαίνει ότι δεν μπορούν πλέον οι πελάτες σας να συνδεθούν στον κατάλογό σας, 
            τα μέλη του προσωπικού σας αποσυνδέθηκαν, όπως και οποιαδήποτε συσκευή στο δίκτυο.
        </p>
        <p style={{textAlign:"center"}}>Ευχόμαστε να τα ξαναπούμε σύντομα!</p>
        <hr/>
        <button className="green-wide-button" onClick={()=>location.assign("/watch")}>Πίσω στην σελίδα παρακολούθησης</button>
    </div>
}

export default function OwnerApp4({placeId}){
    const app = useMemo(()=>new WatchApp(placeId),[]);
    const [_,redraw]=useState(0);

    function onClose(e){
        console.log(e)
        if(e.reason=="terminated"){
            window.popup(<PostTerminationPopup/>,"terminated",true);
            ConnectionStateVisualizer.disable();
        }
    }

    useEffect(()=>{
        app.initialize()
        .then(()=>app.wsh.on("close",onClose));
        
        return ()=>app.wsh.off("close",onClose);
    },[app]);

    useSyncExternalStore(app.subscription,()=>app.isConnected);

    //useEffect(()=>{setTimeout(()=>redraw(_+1),1000)});

    if(!app.isConnected)return "Loadingstate";
    return <ListenerAppContext.Provider value={app}>
        <div className="listener-app-3">
            <ConnectionStateVisualizer wsh={app.wsh}/>
            <div className="listener-layout-view listener-top-center" style={{padding:"15px"}}>
                <div className="layout-edit-btn-wrapper">
                    <a href={`/dashboard/${app.placeId}/edit-layout`} target="_blank" rel="noopener noreferrer" className="no-default">Επεξεργασία κάτοψης</a>
                </div>
                <LayoutVisualizer app={app}/>
            </div>
            <div className="listener-full-left">
                <WaiterManager key={app.sess_changes}/>
            </div>
            <div className="listener-bottom-center" style={{borderTop:"1px solid"}}>
                <TableSessionManager/>
            </div>
            <div className="listener-full-right">
                <PlaceStateManager/>
            </div>
        </div>
    </ListenerAppContext.Provider>;
}
OwnerApp4.instance = {
    open:()=>this.wsh.send({type:"open"}),
    close:()=>this.wsh.send({type:"close"}),
    terminate:()=>this.wsh.send({type:"terminate"})
};

//[{code: "S002", count: 3, ingredients: ["λάχανο", "μαρούλι", "ντομάτα", "αγγούρι"]}]
// let popupOpened=false;
// export default class OwnerApp3 extends ListenerApp{
//     #zoom=5;
//     zoomSensitivity = 1;
//     #f=e=>this.onClose(e);
    
//     static instance;
//     constructor(props){
//         super(props);
        
//         //Load the electron overlay if detected
//         if(window.$savor)import("../watch/overlay-entry.jsx");

//         this.state = {
//             ...this.state,
//             pad:this.#zoom
//         }
//         this.wsh.on("auth-error",e=>{
//             console.log("Auth error: ",e);debugger;
//             //location.replace("/auth/login")
//         });
//         this.wsh.on("close",this.#f);
//         OwnerApp3.instance = this;
//     }
//     onClose(e){
//         console.log(e)
//         if(e.reason=="terminated"){
//             window.popup(<PostTerminationPopup/>,"terminated",true);
//             ConnectionStateVisualizer.disable();
//         }
//     }
//     zoom(dY){
//         const newZoom = this.#zoom+dY;
//         if(newZoom<0||newZoom>40)return;

//         this.#zoom = newZoom;
//         this.setState({pad:this.#zoom});
//     }
//     open(){
//         this.wsh.send({type:"open"});
//     }
//     close(){
//         this.wsh.send({type:"close"});
//     }
//     terminate(){
//         this.wsh.send({type:"terminate"});
//     }
//     render(){
//         return (
//             <div className="listener-app-3">
//                 <ConnectionStateVisualizer wsh={this.wsh}/>
//                 <div className="listener-layout-view listener-top-center" style={{padding:`0 ${this.state.pad}%`}} onWheel={e=>this.zoom(e.deltaY*this.zoomSensitivity/100)}>
//                     <div className="layout-edit-btn-wrapper">
//                         <a href={`/dashboard/${this.placeId}/edit-layout`} target="_blank" rel="noopener noreferrer" className="no-default">Επεξεργασία κάτοψης</a>
//                     </div>
//                     {this.layoutSVG||
//                         <div style={{
//                             textAlign:"center",
//                             fontSize:"3em",
//                             justifyContent:"center",
//                             display:"flex",
//                             flexDirection:"column",
//                             height:"100%"}}>
//                                 Φόρτωση κάτοψης...
//                         </div>
//                     }
//                 </div>
//                 <div className="listener-full-left">
//                     <WaiterManager key={this.sess_changes}/>
//                 </div>
//                 <div className="listener-bottom-center" style={{borderTop:"1px solid"}}>
//                     <TableSessionManager/>
//                 </div>
//                 <div className="listener-full-right">
//                     <PlaceStateManager/>
//                 </div>
//             </div>
//         );
//     }
// }
// window.LiveViewApp = OwnerApp3;