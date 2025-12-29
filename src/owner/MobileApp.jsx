import React from "react";
import LayoutSVG from "./LayoutSVG";
import { Route, Routes, useNavigate, useParams } from "react-router";
import ListenerApp, { TableSessionManager } from "./ListenerAppBase";

function _OverviewPage({placeId}){
    const nav = useNavigate();
    MobileApp.nav = nav;
    return  <div style={{padding:"10px"}}>
                {MobileApp.instance.layoutSVG}
            </div>;
}
function _TablePage(){
    const {table} = useParams();
    MobileApp.nav = useNavigate();
    return <TablePage key={table} table={table}/>
}

class TablePage extends React.Component{
    table;
    constructor(props){
        super(props);
        this.table = props.table;
        this.session = MobileApp.instance.placeSession.getLatestTableSession(props.table);
        console.log(this)
    }
    getSpecificTotal(cart){
        let total = 0;
        for(let entry of cart){
            const dish = MobileApp.instance.menu[entry.code];
            let entryTotal = dish.price;
            for(let ingredient of Object.values(dish.ingredients)){
                if(!ingredient.price)continue;
                if(entry.ingredients.includes(ingredient.title))entryTotal += ingredient.price;
            }
            total += entryTotal * entry.count;
        }
        return total;
    }
    getTotal(){
        return this.getSpecificTotal(this.session.orders.flatMap(r=>r.rejected?[]:r.cart));
    }
    render(){
        return [
            <TableSessionManager table={this.table} key="sess"/>,
            <button className="mobile-app-back-button" onClick={()=>MobileApp.instance.navToStartingPage()} key="nav">&lt;</button>
        ]
    }
}

function FullscreenPrompt(){
    function tryEnterFullscreen(){
        document.querySelector("#root").requestFullscreen();
    }
    return  <div className="fullscreen-prompt">
                Ενεργοποίηση πλήρους οθόνης
                Η εφαρμογή σερβιτόρου (savor στο κινητό) απαιτεί λειτουργία πλήρους οθόνης για να δουλέψει
                <button onClick={()=>tryEnterFullscreen()}>Πλήρης οθόνη</button>
            </div>
}

class MobileApp extends ListenerApp{
    placeId;
    static nav;
    /**
     * @type {MobileApp}
     */
    static instance;
    constructor(props){
        super(props);
        this.placeId=props.placeId;
        MobileApp.instance = this;
        document.addEventListener("fullscreenchange",()=>this.forceUpdate());
    }
    get isInFullscreen(){
        //return true;
        return document.fullscreenElement?.id=="root";
    }
    selectTableByCode(table){
        MobileApp.nav(table)
    }
    render(){
        if(!this.isInFullscreen)
        return  <FullscreenPrompt/>;
        return  <Routes>
            <Route path="" element={<_OverviewPage placeId={this.placeId}/>}/>
                <Route path="/:table/*" element={
                    <_TablePage/>
                }/>
        </Routes>
    }
    navToStartingPage(){
        return MobileApp.nav(`/dashboard/watch/${this.placeId}/`)
    }
}
window.MobileApp=MobileApp;
export default MobileApp;