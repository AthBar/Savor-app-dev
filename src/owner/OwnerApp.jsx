import MyEventTarget, { EventComponent } from "../common/Event";
import { Route, Routes, useNavigate, useParams } from "react-router";
import PlaceSelection from "../dashboard/PlaceSelection";
import DashboardTopbar from "../dashboard/DashboardTopbar";
import Dashboard from "../dashboard/Dashboard";
import React, { useEffect, useState } from "react";
import OwnerApp3 from "./App3";
import LayoutEditor from "./LayoutEditor";
import MobileWaiterApp, { MobileWaiterApp2 } from "./MobileWaiterApp";
import ClockInPrompt from "./WaiterClockInPrompt";
import { API } from "../common/API";

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
        const nav = useNavigate();
        
        //Check if clocked in and if not, then make sure we are in the starter page
        const clockedIn = localStorage.getItem("clocked-in");
        const [allowed,setAllowed] = useState(clockedIn);
        const [loaded,setLoaded] = useState(false);
        
        useEffect(()=>{
            //If not clocked in, check user permissions before showing the waiter app
            if(!clockedIn){
                if(!window.permissionPromise)window.permissionPromise=API(`/dashboard/${id}/permission`);
                window.permissionPromise.then(r=>{console.log(r)
                    const l = `/dashboard/waiter/${id}`;
                    setLoaded(true);
                    if(r.success)setAllowed(true);
                    else if(location.pathname!=l)nav(l);
                    else setAllowed(false); //For shits and giggles
                }).catch(()=>setLoaded(true));
            }
            else {
                setLoaded(true);
                setAllowed(true);
            }
        },[]);

        const toShow = allowed?<MobileWaiterApp2 placeId={id}/>:<ClockInPrompt placeId={id} after={()=>redraw(_+1)}/>;
        const match = window.matchMedia('screen and (pointer: coarse) and (orientation:landscape)');
        const shouldShowMobileApp = match.matches;
        match.addEventListener("change",()=>redraw(_+1));

        function Disabled(){
            return <div className="content-centered" style={{fontSize:"2em"}}>
                Πρέπει να βρίσκεστε σε συσκευή με οθόνη αφής σε οριζόντιο προσανατολισμό (πορτρέτο)
                <div style={{padding:"20px"}}><img src="/rotate.svg" width="50"/></div>
            </div>
        }

        if(!shouldShowMobileApp)return <Disabled/>;
        if(!loaded)return <img src="/images/logo.png" id="loading-screen"/>;
        return toShow;
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
        const match = window.matchMedia('screen and (pointer: fine) and (min-width:700px)');
        const shouldShowPCApp = match.matches;
        match.addEventListener("change",()=>redraw(_+1));

        return <OwnerApp3 placeId={id}/>;
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