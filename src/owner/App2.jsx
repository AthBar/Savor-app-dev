import React, { createRef, useState } from "react";
import { MainHistoryList } from "./BigApp"
import OwnerApp from "./OwnerApp";
import LayoutSVG from "./LayoutSVG";
import { WorkersList } from "./WorkersList";
import TestWindow from "./Window";
import SelectedTableView from "./SelectedTableView";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { PlaceSession } from "../common/VirtualSessions";
import { EventComponent } from "../common/Event";

class MyWindowManager extends React.Component{
    #windows=[];
    #windowRefs=[];
    #f=()=>this.#resetMaxDims();
    constructor(props){
        super(props);
        let ind=0;
        for(let i of props.windows||[]){
            const ref = createRef();
            this.#windowRefs.push(ref);
            this.#windows.push(<TestWindow minY="75" width={i.width} title={i.title} x={i.x} y={i.y} height={i.height} hidden={i.hidden} ref={ref} key={ind++}>{i.element}</TestWindow>);
        }
        this.state = {
            mounted:false,
            windows:this.#windows
        }
    }
    #resetMaxDims(){
        for(let i of this.#windows){
            const w = i.props.ref.current;
            w.maxX = innerWidth;
            w.maxY = innerHeight;
        }
    }
    componentWillUnmount(){
        removeEventListener("resize",this.#f);
    }
    componentDidMount(){
        this.setState({
            mounted:true
        });
        addEventListener("resize",this.#f)
    }
    render(){
        if(!this.state.mounted)return [<div className="window-manager" key="P"/>];
        return [
            <div className="window-manager" key="P">
            {this.#windows.map(
                (w,i)=><button onClick={()=>w.props.ref.current.toggleVisibility()} key={i}>{this.#windowRefs[i].current?this.#windowRefs[i].current.state.title||i:i}</button>
            )}
            </div>,
            this.state.windows
        ];
    }
}
let popupOpened=false;
export default class OwnerApp2 extends EventComponent{
    layoutSVG;
    #workerList = ["Θανάσης","Γιάννης","Μαρία"];
    draggingWorker = false;
    #zoom=25;
    zoomSensitivity = 1;

    placeId;
    wsh;
    placeSession;
    menu;
    menuLoaded;
    sessions={};

    static instance;
    static menuPromise
    #f=m=>this.#onWSMessage(m);
    constructor(props){
        if(!window.opener&&!popupOpened){
            popupOpened = window.open(`/dashboard/watch/${props.placeId}`,"Savor manager",
                `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0,resizable=yes,scrollbars=no`
            );
            
            return location.assign("/dashboard");
        }
        else document.title = "Παρακολούθηση επιχείρησης";

        super(props);
        
        this.placeId=props.placeId;
        this.layoutSVG = <LayoutSVG placeId={props.placeId} ref={createRef()}/>
        this.state = {
            pad:this.#zoom
        }
        window.app=this;

        this.wsh = new ListenerClientHandler(props.placeId);
        //this.layoutManager = new LayoutSVGManager(placeId);
        this.placeSession = new PlaceSession(props.placeId);

        this.wsh.on("message",this.#f);

        OwnerApp2.menuPromise = API(`/place/menu/${props.placeId}`).then(r=>this.menu=r.data);
        OwnerApp2.instance = this;
    }
    componentWillUnmount(){
        this.wsh.off("message",this.#f);
    }
    componentDidMount(){
        OwnerApp2.menuPromise.then(()=>this.forceUpdate());
        setTimeout(()=>{
            console.log(LayoutSVG.instance)
        },5000)
    }
    zoom(dY){
        const newZoom = this.#zoom+dY;
        if(newZoom<0||newZoom>40)return;

        this.#zoom = newZoom;
        this.setState({pad:this.#zoom});
    }
    #onWSMessage(msg){
        //Do all types that don't require table first
        switch(msg.type){
            case "place-open":return
        }

        //The rest require table info. Might as well stop trying if there is no table
        if(!msg.table)return console.trace("No table in message: ", msg);
        const table = msg.table;
        const tbl = this.placeSession.getLatestTableSession(table);
        delete msg.table;
        switch(msg.type){
            case "connected":
                return this.placeSession.tableConnect(table);
            case "disconnected":
                return this.placeSession.tableDisconnect(table);
            case "create-order":
                LayoutSVG.instance.setBlink(table,"black","#a00");
                this.do("create-order",msg);
                return tbl.createOrder(msg);
            case "cancel-order":
                return tbl.activeOrder.cancel(msg);
            case "order-accepted":
                LayoutSVG.instance.setBlink(table,"#dd0","#dd0");
                return tbl.activeOrder.accept();
            case "order-rejected":
                return tbl.activeOrder.reject(msg.msg);
            case "order-delivered":
                LayoutSVG.instance.setBlink(table,"black","black");
                return tbl.activeOrder.deliver(msg);
            case "bill":
                return tbl.requests.push(msg);
            case "bill-paid":
                return tbl.requests.push(msg);
        }
    }
    render(){
        return <div className="listener-app-2">
            <div className="listener-layout-view" style={{padding:`0 ${this.state.pad}%`}} onWheel={e=>this.zoom(e.deltaY*this.zoomSensitivity/100)}>
                <div className="layout-edit-btn-wrapper">
                    <a href="/owner/layout" target="_blank" rel="noopener noreferrer" className="no-default">Επεξεργασία κάτοψης</a>
                </div>
                {this.layoutSVG}
            </div>
            <MyWindowManager windows={[
                {element:<MainHistoryList/>,width:500,title:"Παραγγελίες"},
                {element:<SelectedTableView/>,title:"Επιλεγμένο τραπέζι",width:300,hidden:true,x:500},
                {element:<WorkersList workers={this.#workerList}/>,title:"Σερβιτόροι",width:200,y:400},
            ]}/>
        </div>;
    }
}