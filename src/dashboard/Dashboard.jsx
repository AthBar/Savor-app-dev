//The main dashboard entry point for a specific place

import React from "react";
import DashboardMainTabRouter from "./DashboardMainTabRouter";
import DashboardSidebar from "./DashboardSidebar";
import { API } from "../common/functions";

export default class Dashboard extends React.Component{
    //Keep this here for other elements to access from within
    place;
    /**
     * @type {Dashboard}
     */
    static instance;
    static currency = p=>(p/100||0).toFixed(2)+"€";
    constructor(props){
        super(props);
        this.state={
            placeLoaded:false
        };
        Dashboard.instance = this;
        API(`/dashboard/${props.placeId}/watch`,"GET").then(r=>{
            if(!r.success){debugger;location.replace("/")}
        });
        API(`/place/view/${props.placeId}`,"GET").then(r=>{
            this.place = r;
            if(!r.success)return this.setState({failure:true});
            delete r.success;
            delete r.code;
            this.setState({placeLoaded:true});
        })
    }
    render(){
        if(this.state.failure)return <div>{"Error: "+this.place.code}</div>;
        return <div className="dashboard-editor-wrapper">
            <DashboardSidebar/>
            <div className="dashboard-tab-wrapper">
                {this.state.placeLoaded?<DashboardMainTabRouter/>:<div style={{fontSize:"25px",fontWeight:"bold"}}>Φόρτωση...</div>}
            </div>
        </div>
    }
}