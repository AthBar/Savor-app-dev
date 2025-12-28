import React from "react";
import DashboardTopbar from "./DashboardTopbar";
import { useNavigate } from "react-router";
import { API } from "../common/functions";

function PlaceOption({data}){
    const nav = useNavigate();
    return <div className="place-option" onClick={()=>location.assign(`/dashboard/${data.id}`)}>
        <div className="name">{data.name}</div>
        <div className="location">Ν.Αγχίαλος</div>
        <div>Ανοιχτή</div>
        <div>end</div>
    </div>;
}

export default class PlaceSelection extends React.Component{
    #candidates=[];
    constructor(props){
        super(props);
        this.state={list:false};
        API("/dashboard/places").then(l=>{
            if(l.success)this.setState({list:l.data})
            else debugger;
        });
    }
    render(){
        if(!this.state.list)return "Loading...";

        return <div className="place-selector">
            <div className="selector-head">
                Επιλογή επιχείρησης
            </div>
            <div className="selector-options">
                {this.state.list.map((c,i)=><PlaceOption key={i} data={c}/>)}
            </div>
            <div className="selector-footer">
                Σύνολο: 1 επιχείρηση
            </div>
        </div>;
    }
}