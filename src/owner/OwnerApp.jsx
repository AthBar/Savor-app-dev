import MyEventTarget, { EventComponent } from "../common/Event";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { Route, Routes, useParams } from "react-router";
import OwnerApp2 from "./App2";
import LayoutSVG from "./LayoutSVG";
import LayoutDesigner from "./LayoutDesigner";
import { PlaceSession } from "../common/VirtualSessions";
import PlaceSelection from "../dashboard/PlaceSelection";
import DashboardTopbar from "../dashboard/DashboardTopbar";
import Dashboard from "../dashboard/Dashboard";
import React, { useState } from "react";
import OwnerApp3 from "./App3";
import LayoutEditor from "./LayoutEditor";
import MobileApp from "./MobileApp";
import MobileWaiterApp from "./MobileWaiterApp";
import ClockInPrompt from "./WaiterClockInPrompt";

const PLACE_REGEX = /^[A-Za-z0-9_-]{36}$/g;
function OwnerRouter(){
    const path = location.pathname.split("/");
    path.shift();
    
    if(path.at(-1).match(PLACE_REGEX))return <OwnerApp2 placeId={path.at(-1)}/>
    else return <div>"404"</div>;
}

class DashboardRouter extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return  <Routes key="main">
            <Route path="" element={<PlaceSelection/>}/>
            <Route path=":id/edit-layout" element={<this._LayoutEditor/>}/>
            <Route path="watch/:id/*" element={<this._Watch/>}/>
            <Route path="waiter/:id/*" element={<this._Waiter/>}/>
            <Route path=":id/*" element={<this._Dashboard/>}/>
        </Routes>
    }
    _Waiter(){
        const {id} = useParams();
        const [_,redraw] = useState(0);

        const toShow = localStorage.getItem("clocked-in")?<MobileWaiterApp placeId={id}/>:<ClockInPrompt placeId={id}/>;
        const match = window.matchMedia('(pointer: coarse)');
        const shouldShowMobileApp = match.matches;
        match.addEventListener("change",()=>redraw(_+1));


        return shouldShowMobileApp?toShow:<div>Πρέπει να βρίσκεστε σε συσκευή με οθόνη αφής</div>;
    }
    _LayoutEditor(){
        const {id} = useParams();
        return <LayoutEditor placeId={id}/>
    }
    _Dashboard(){
        const {id} = useParams();
        return <Dashboard placeId={id}/>
    }
    _Watch(){
        const {id} = useParams();
        const [_,redraw] = useState(0);
        const match = window.matchMedia('(pointer: fine)');
        const shouldShowPCApp = match.matches;
        match.addEventListener("change",()=>redraw(_+1));

        console.log(shouldShowPCApp)
        return shouldShowPCApp?<OwnerApp3 placeId={id}/>:<MobileApp placeId={id}/>;
    }
}

export default class OwnerApp extends EventComponent{
    /**
     * @type {OwnerApp}
     */
    static instance;

    #onclose=()=>{};
    wsh;
    sessions={};
    /**
     * @type {LayoutSVG}
     */
    layoutSVG;
    history=[];
    //layoutManager;
    constructor(props){
        super(props);

        window.listenerInstance = OwnerApp.instance = this;

        document.title = "Διαχείρηση επιχείρησης";
        this.state={popup:false}
    }
    popup(popup,onClose){
        this.#onclose();
        if(this.state.popup.oncloseaspopup instanceof Function)this.state.popup.oncloseaspopup();
        this.setState({popup});

        if(onClose)this.#onclose = onClose;
    }
    onClick(e){
        if(e.target&&e.target.classList.contains("popup-background")||e.target.classList.contains("popup-wrapper"))
            this.popup(false)
    }
    render(){
        return <div className="dashboard-page-main" key="main">
                    {this.state.popup?
                    <div className="popup-background" onMouseDown={e=>this.onClick(e)}>
                        <div className="popup-wrapper">
                            {this.state.popup}
                        </div>
                    </div>
                    :null}
                    <DashboardTopbar key="topbar"/>
                    <DashboardRouter/>
                </div>;
    }
}
window.OwnerApp = OwnerApp;