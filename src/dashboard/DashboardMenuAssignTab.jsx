import React from "react";
import DashboardTab from "./DashboardTab";

const WEEKDAYS = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"];

class Assigner extends React.Component{
    render(){
        return <div className="menu-assigner">
            {WEEKDAYS.map((w,i)=>
                <div key={i} className="weekday">
                    <div>{w}</div>
                    <div>
                        <div className="menu-period" style={{left:5*i+"%",width:10*i+10+"%",["--bg"]:"#faa"}}>Main</div>
                    </div>
                </div>
            )}
        </div>
    }
}

export default class DashboardMenuAssignTab extends DashboardTab{
    render(){
        return <Assigner/>
    }
}