import React, { createRef, useEffect, useState } from "react";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { PlaceSession } from "../common/VirtualSessions";
import { EventComponent } from "../common/Event";
import { API } from "../common/API";
import SynchronizedLayoutSVG from "./SynchronizedLayoutSVG";

function OrderOverviewDish({dish}){
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
    const cart = Object.values(order?.cart||{});
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
                        <div key={i} className={"history-order"+(!r.accepted&&!r.rejected?" pending-order":"")} onClick={()=>setOrder(r)}>{table}-{orderList.length-i} ({timeString(r.time)})</div>
                    ):
                    <div className="no-orders content-centered">Καμία παραγγελία</div>
                }
            </div>
}
export function TableSessionManager({table}){
    const [_,redraw] = useState(0);
    const [order, setOrder] = useState(null);

    useEffect(()=>setOrder(false),[table]);

    if(!table)return <div className="no-orders content-centered">Πατήστε πάνω σε ένα τραπέζι για να δείτε τις παραγγελίες του</div>;

    const sess = ListenerApp.instance.placeSession.getLatestTableSession(table);
    const orderList = sess.orders;
    if(sess)sess.on("change",()=>redraw(_+1),true);

    return <div className="table-session-viewer">
        <div className="left">
            <h2>Τραπέζι {table}</h2>
            <OrderHistoryOverview orderList={orderList} table={table} setOrder={setOrder}/>
            <div className="bottom content-centered">
                Συνδέσεις: {sess.connects}
            </div>
        </div>
        <OrderViewer menu={ListenerApp.instance.menu} order={order}/>
    </div>;
}

export default class ListenerApp extends EventComponent{
    layoutSVG;
    placeId;
    place;
    
    wsh;
    /**
     * @type {PlaceSession}
     */
    placeSession;
    sess_changes = 0;

    menu;
    menuLoaded;
    menuCategories;
    menuByCategory;

    sessions={};
    blinks={};

    /**
     * @type {ListenerApp}
     */
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
        

        this.wsh.on("handshake-finished",()=>{
            this.placeSession.off("change",this.#u);

            this.placeSession = PlaceSession.import(this.placeId,this.wsh.syncData);
            this.placeSession.on("change",this.#u);

            this.layoutSVG = <SynchronizedLayoutSVG key={this.sess_changes++} placeId={this.placeId} selectedTable={this.state.selectedTable} onTableSelect={t=>this.selectTableByCode(t)} placeSession={this.placeSession}/>;

            this.do("session-refresh",this.placeSession);
            this.forceUpdate();
        });
        this.wsh.on("message",this.#f);

        ListenerApp.menuPromise = API(`/place/menu/${props.placeId}`).then(r=>{
            const o={};
            const cats={};
            const categorized={};
            for(let i of r.data){
                o[i.code]=i;
                cats[i.category] = true;
                if(categorized[i.category])categorized[i.category].push(i);
                else categorized[i.category] = [i];
            }
            this.menuByCategory = categorized;
            this.menuCategories = Object.keys(cats);
            this.menu = o;
        }).catch(e=>console.log("Failed to load menu for listener app"));

        this.place = {id:this.placeId,title:"Φόρτωση"};

        ListenerApp.placePromise = API(`/place/view/${props.placeId}`).then(r=>{
            this.place.title=r.name;
        })
        ListenerApp.instance = this;
    }
    calculatePrice(entry){
        if(!this.menu)return 0;
        
        const dish = this.menu[entry.code];
        if(!dish)return 0;

        const basePrice = dish.price;
        let ingredientPrice = 0;
        for(let i of this.menu[entry.code].ingredients){
            if(i.price&&entry.ingredients.includes(i.title))
                ingredientPrice += i.price;
        }
        return (basePrice+ingredientPrice)*(entry.count||1);
    }
    #u = ()=>window.requestAnimationFrame(()=>this.forceUpdate());
    componentWillUnmount(){
        this.wsh.off("message",this.#f);
        this.placeSession.off("change",this.#u);
    }
    componentDidMount(){
        this.placeSession.on("change",this.#u);
        ListenerApp.menuPromise.then(()=>{
            this.wsh.doHandshake();
            
            this.forceUpdate();
        });
    }
    selectTableByCode(selectedTable){
        if(!selectedTable)return this.setState({selectedTable:false});
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
    serializeOrder(order){
        console.log(order)
        return "hehe";
    }
    #onWSMessage(msg){
        //Do all types that don't require table first
        switch(msg.type){
            case "state":return msg.open;
            case "waiter-change":
                this.do("waiter-change",msg);
                this.placeSession.setWaiter(msg);
                return;
            case "opened":
                this.do("state-change",false);
                this.placeSession.open();
                return;
            case "closed":
                this.do("state-change",true);
                this.placeSession.close();
                return;
            case "terminated":console.log("Terminated")
                this.do("terminated");
                return;
        }

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

            case "cart-addition":
                tbl.addToCart(msg.key,msg.entry);
                break;
            
            case "cart-change":
                tbl.changeInCart(msg.key,msg.newEntry);
                break;
            
            case "cart-removal":
                tbl.removeFromCart(msg.key);
                break;

            case "order-sent":
                tbl.sendOrder();
                break;

            case "order-cancelled":
                tbl.activeOrder.cancel(msg);
                break;

            case "order-accepted":
                window?.$savor?.send?.("ping",this.serializeOrder(tbl.activeOrder));
                tbl.activeOrder.accept();
                break;

            case "order-rejected":
                tbl.activeOrder.reject(msg.message);
                break;

            case "order-delivered":
                tbl.activeOrder.deliver(msg);
                break;

            case "paid":
                tbl.pay();
                break;
            
            case "left":
                tbl.leave();
                break;
            
            default:
                this.do("unknown-message",msg);
                break;
        }
    }
}

