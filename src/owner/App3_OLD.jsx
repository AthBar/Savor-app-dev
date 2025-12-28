import React, { createRef, useEffect, useState } from "react";
import LayoutSVG from "./LayoutSVG";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { PlaceSession } from "../common/VirtualSessions";
import { EventComponent } from "../common/Event";
import { API } from "../common/functions";
import OwnerApp from "./OwnerApp";

function OrderOverviewDish({dish}){console.log(dish)
    return  <div className="order-overview-dish" style={{"--cc":Math.min(5,Math.ceil(dish.ingredients.length/5))}}>
                <div className="title">{dish.count}x {dish.title}</div>
                <hr/>
                {dish.ingredients.length>0?
                <ul>
                    {dish.ingredients.map((r,i)=>
                        <li className="dish-ingredient" key={i}>{r[0].toUpperCase()+r.slice(1)}</li>
                    )}
                </ul>
                :<div className="comment empty" style={{margin:"25px 0"}}>Καμία τροποίηση</div>}
                <hr/>
                {dish.info?.comments?<div className="comment">Σχόλια: {dish.info.comments}</div>:<div className="comment empty">Κανένα σχόλιο</div>}
            </div>
}

function OrderButtons({order}){
    const btn = order=>{
        if(order.delivered)return <div className="order-complete">Ολοκληρώθηκε</div>;
        if(order.rejected)return <button className="order-reject">Απορρίφθηκε από την κουζίνα</button>;
        if(order.accepted)return <button className="order-deliver" onClick={()=>OwnerApp3.instance.deliverOrder(order.session.table)}>Παράδοση παραγγελίας</button>;
        else return [
                <button className="order-accept" onClick={()=>OwnerApp3.instance.acceptOrder(order.session.table)} key="acc">Αποδοχή</button>,
                <button className="order-reject" onClick={()=>OwnerApp3.instance.rejectOrder(order.session.table)} key="rej">Απόρριψη</button>
            ];
    }
    return <div className="order-overview-bottom">{btn(order)}</div>;
}

function OrderViewer({order, menu}){
    const cart = order?.cart;
    if(!Array.isArray(cart)||cart.length<=0)return <div className="order-overview empty"></div>
    return <div className="order-overview">
        <div className="order-overview-main">
            {cart.map((r,i)=>
                <OrderOverviewDish key={i} dish={{...menu[r.code],...r}}/>
            )}
        </div>
        <OrderButtons order={order}/>
    </div>;
}
/**
 * 
 * @param {Date} date 
 * @returns 
 */
function timeString(date){
    const n = i=>i>=10?i:`0${i}`;
    return `${date.getHours()}:${n(date.getMinutes())}.${n(date.getSeconds())}`;
}
function OrderHistoryOverview({orderList,table,setOrder}){
    return  <div className="order-history-container">
                {
                    Array.isArray(orderList)&&orderList.length>0?
                    orderList.toReversed().map((r,i)=>
                        <div key={i} className={"history-order"+(!r.accepted&&!r.rejected?" pending-order":"")} onClick={()=>setOrder(r)}>Παραγγελία {table}-{orderList.length-i} ({timeString(r.time)})</div>
                    ):
                    <div className="no-orders">Καμία παραγγελία</div>
                }
            </div>
}
function TableSessionManager({table}){
    const [_,redraw] = useState(0);
    const [order, setOrder] = useState(null);
    const sess = OwnerApp3.instance.placeSession.getLatestTableSession(table);
    const orderList = sess.orders;

    if(sess)sess.on("change",()=>redraw(_+1),true);
    useEffect(()=>{console.log("Change")
        setOrder(false)
    },[table]);

    if(!table)return <div className="no-orders">Πατήστε πάνω σε ένα τραπέζι για να δείτε τις παραγγελίες του</div>;
    else return <div className="table-session-viewer">
        <div className="left">
            <h2>Τραπέζι {table}</h2>
            <OrderHistoryOverview orderList={orderList} table={table} setOrder={setOrder}/>
        </div>
        <OrderViewer menu={OwnerApp3.instance.menu} order={order}/>
    </div>;
}
function NoFullscreen(){
    return <div>
        <div>Προτείνεται να εισέλθετε σε πλήρη οθόνη για καλύτερη ορατότητα και λειτουργικότητα</div>
        <div><button className="green-wide-button" onClick={()=>document.querySelector("#root").requestFullscreen()}>Πλήρης οθόνη</button></div>
    </div>;
}
//[{code: "S002", count: 3, ingredients: ["λάχανο", "μαρούλι", "ντομάτα", "αγγούρι"]}]
let popupOpened=false;
export default class OwnerApp3 extends EventComponent{
    layoutSVG;
    #workerList = ["Θανάσης","Γιάννης","Μαρία"];
    draggingWorker = false;
    #zoom=5;
    zoomSensitivity = 1;

    placeId;
    wsh;
    placeSession;
    menu;
    menuLoaded;
    sessions={};

    blinks={};

    static instance;
    static menuPromise
    #f=m=>this.#onWSMessage(m); //Set a function to be able to unbind later
    constructor(props){
        if(false){//window.menubar.visible&&!popupOpened
            popupOpened = window.open(`/dashboard/watch/${props.placeId}`,"Savor manager",
                `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0,resizable=yes,scrollbars=no`
            );
            
            return location.assign("/dashboard");
        }
        else document.title = "Παρακολούθηση επιχείρησης";

        super(props);
        
        this.placeId=props.placeId;
        this.layoutSVG = <LayoutSVG placeId={props.placeId}/>
        this.state = {
            pad:this.#zoom,
            selectedTable:false,
            fullscreen:false
        }
        window.app=this;

        this.wsh = new ListenerClientHandler(props.placeId);
        this.placeSession = new PlaceSession(props.placeId);

        this.wsh.on("message",this.#f);

        OwnerApp3.menuPromise = API(`/place/menu/${props.placeId}`).then(r=>{
            const o={};
            for(let i of r.data)o[i.code]=i;
            this.menu = o;
        });
        OwnerApp3.instance = this;
    }
    componentWillUnmount(){
        this.wsh.off("message",this.#f);
    }
    componentDidMount(){
        OwnerApp3.menuPromise.then(()=>{
            LayoutSVG.instance.on("table-select",t=>this.selectTableByCode(t));
            this.wsh.doHandshake();
            
            this.forceUpdate();
        });
        LayoutSVG.instance.on("layout-parsed",()=>this.#syncTableBlinks());
    }
    selectTableByCode(selectedTable){
        if(!selectedTable)this.setState({selectedTable:false});
        if(selectedTable.match(/[A-Za-z0-9_-]{1,4}/))this.setState({selectedTable});
    }
    acceptOrder(table){
        return this.wsh.send({type:"accept-order",table})
    }
    deliverOrder(table){
        return this.wsh.send({type:"deliver-order",table})
    }
    rejectOrder(table,message){
        return this.wsh.send({type:"reject-order",table,message})
    }
    zoom(dY){
        const newZoom = this.#zoom+dY;
        if(newZoom<0||newZoom>40)return;

        this.#zoom = newZoom;
        this.setState({pad:this.#zoom});
    }
    tableColor(table,startColor,endColor=startColor){
        return LayoutSVG.instance.setBlink(table,startColor,endColor);
    }
    #syncTableBlinks(){
        const list = this.placeSession.tables;
        for(let table of Object.keys(list)){
            const sess = list[table].at(-1);
            const lastOrder = sess.orders.at(-1);
            if(lastOrder){
                if(lastOrder.rejected){
                    this.tableColor(table,"black");
                    continue;
                }
                if(!lastOrder.accepted){
                    this.tableColor(table,"black","#a00");
                    continue;
                }
                if(!lastOrder.delivered){
                    this.tableColor(table,"#dd0");
                    continue;
                }
            }
            if(sess.connects>0){
                this.tableColor(table,"gray");
            }
        }
    }
    #syncBlinksFor(table){
        const sess = this.placeSession.tables[table].at(-1);
        const lastOrder = sess.orders.at(-1);
        const black = sess.connects>0?"black":"gray";
        if(lastOrder){
            if(lastOrder.rejected){
                this.tableColor(table,black);
                return;
            }
            if(!lastOrder.accepted){
                this.tableColor(table,black,"#a00");
                return;
            }
            if(!lastOrder.delivered){
                this.tableColor(table,"#dd0");
                return;
            }
        }
        this.tableColor(table,black)
    }
    #onWSMessage(msg){
        //Do all types that don't require table first
        switch(msg.type){
            case "state":return msg.open;
        }

        //The rest require table info. Might as well stop trying if there is no table
        if(!msg.table)return console.trace("No table in message: ", msg);
        const table = msg.table;
        const tbl = this.placeSession.getLatestTableSession(table);
        delete msg.table;
        switch(msg.type){
            case "connected":
                this.placeSession.tableConnect(table);
                return this.#syncBlinksFor(table);

            case "disconnected":
                this.placeSession.tableDisconnect(table);
                return this.#syncBlinksFor(table);

            case "create-order":
                this.do("create-order",msg);
                tbl.createOrder(msg);
                return this.#syncBlinksFor(table);

            case "cancel-order":
                return tbl.activeOrder.cancel(msg);

            case "order-accepted":
                tbl.activeOrder.accept();
                return this.#syncBlinksFor(table);

            case "order-rejected":
                tbl.activeOrder.reject(msg.message);
                return this.#syncBlinksFor(table);;

            case "order-delivered":
                tbl.activeOrder.deliver(msg);
                return this.#syncBlinksFor(table);

            case "bill":
                tbl.requests.push(msg);
                return this.#syncBlinksFor(table);

            case "bill-paid":
                tbl.requests.push(msg);
                return this.#syncBlinksFor(table);
        }
    }
    render(){
        return (
            <div className="listener-app-3">
                <div className="listener-layout-view listener-top-center" style={{padding:`0 ${this.state.pad}%`}} onWheel={e=>this.zoom(e.deltaY*this.zoomSensitivity/100)}>
                    <div className="layout-edit-btn-wrapper">
                        <a href={`/dashboard/${this.placeId}/edit-layout`} target="_blank" rel="noopener noreferrer" className="no-default">Επεξεργασία κάτοψης</a>
                    </div>
                    {this.layoutSVG}
                </div>
                <div className="listener-full-left">
                    <NoFullscreen/>
                </div>
                <div className="listener-bottom-center" style={{borderTop:"1px solid"}}>
                    <TableSessionManager table={this.state.selectedTable}/>
                </div>
                <div className="listener-full-right">
                    a
                </div>
            </div>
        );
    }
}
window.LiveViewApp = OwnerApp3;

window.addEventListener("load", function() { window. scrollTo(0, 1); console.log("Fullscreening") });