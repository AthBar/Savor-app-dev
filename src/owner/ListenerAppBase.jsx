import React, { createRef, useEffect, useState } from "react";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { PlaceSession } from "../common/VirtualSessions";
import { EventComponent } from "../common/Event";
import { API } from "../common/functions";
import SynchronizedLayoutSVG from "./SynchronizedLayoutSVG";

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
        if(order.accepted)return <button className="order-deliver" onClick={()=>ListenerApp.instance.deliverOrder(order.session.table)}>Παράδοση παραγγελίας</button>;
        else return [
                <button className="order-accept" onClick={()=>ListenerApp.instance.acceptOrder(order.session.table)} key="acc">Αποδοχή</button>,
                <button className="order-reject" onClick={()=>ListenerApp.instance.rejectOrder(order.session.table)} key="rej">Απόρριψη</button>
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
export function TableSessionManager({table}){
    const [_,redraw] = useState(0);
    const [order, setOrder] = useState(null);
    const sess = ListenerApp.instance.placeSession.getLatestTableSession(table);
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
        <OrderViewer menu={ListenerApp.instance.menu} order={order}/>
    </div>;
}

export default class ListenerApp extends EventComponent{
    layoutSVG;
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
        super(props);
        
        this.placeId=props.placeId;
        this.state = {
            selectedTable:false,
            fullscreen:false
        }
        window.app=this;

        this.wsh = new ListenerClientHandler(props.placeId);
        this.placeSession = new PlaceSession(props.placeId);
        this.layoutSVG = <SynchronizedLayoutSVG key="SVG" placeId={this.placeId} onTableSelect={t=>this.selectTableByCode(t)} placeSession={this.placeSession}/>

        console.log(this.wsh)
        this.wsh.on("message",this.#f);

        ListenerApp.menuPromise = API(`/place/menu/${props.placeId}`).then(r=>{
            const o={};
            for(let i of r.data)o[i.code]=i;
            this.menu = o;
        });
        ListenerApp.instance = this;
    }
    componentWillUnmount(){
        this.wsh.off("message",this.#f);
    }
    componentDidMount(){
        ListenerApp.menuPromise.then(()=>{
            this.wsh.doHandshake();
            
            this.forceUpdate();
        });
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
    #onWSMessage(msg){console.log("MSG:",msg)
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
                break;

            case "disconnected":
                this.placeSession.tableDisconnect(table);
                break;

            case "create-order":
                this.do("create-order",msg);
                tbl.createOrder(msg);
                break;

            case "cancel-order":
                tbl.activeOrder.cancel(msg);
                break;

            case "order-accepted":
                tbl.activeOrder.accept();
                break;

            case "order-rejected":
                tbl.activeOrder.reject(msg.message);
                break;

            case "order-delivered":
                tbl.activeOrder.deliver(msg);
                break;

            case "bill":
                tbl.requests.push(msg);
                break;

            case "bill-paid":
                tbl.requests.push(msg);
                break;
        }
    }
}