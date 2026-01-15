import React, { createRef, useEffect, useMemo, useState } from "react";
import { ListenerClientHandler } from "../common/ListenerSocket";
import { PlaceSession, Unit } from "../common/VirtualSessions";
import { EventComponent } from "../common/Event";
import { API } from "../common/API";
import { LayoutVisualizer } from "./LayoutSVG.jsx";
import SynchronizedLayoutManager from "./SynchronizedLayoutSVG.jsx";

export default class ListenerApp extends Unit{
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
    isLoaded=false;
    isConnected=false;

    selectedTable;
    layoutManager;

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
        
    }
    async initialize(){
        await this.#initialize();
        this.isLoaded = true;
        this.change();
    }
    async #initialize(){
        const r = await API(`/place/menu/${this.placeId}`)
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

        
        this.wsh = new ListenerClientHandler(this.placeId);
        this.placeSession = new PlaceSession(this.placeId);
        

        this.wsh.on("handshake-finished",()=>{
            this.placeSession.off("change",this.#u);

            this.placeSession = PlaceSession.import(this.placeId,this.wsh.syncData);
            this.placeSession.on("change",this.#u);

            this.layoutManager = new SynchronizedLayoutManager(this.placeId,this.placeSession);
            this.layoutManager.initialize();
            this.layoutSVG = <LayoutVisualizer key={this.sess_changes++} placeId={this.placeId} placeSession={this.placeSession}/>;

            this.do("session-refresh",this.placeSession);
            this.isConnected = true;
            this.change();
        });
        this.wsh.on("message",this.#f);

        this.place = {id:this.placeId,title:"Φόρτωση",session:this.placeSession};

        API(`/place/view/${this.placeId}`).then(r=>{
            this.place.title=r.name;
        }).catch("error")
    }
    selectTable(id){console.log("Selecting table",id)
        this.selectedTable = id;
        this.layoutManager.selectTable(id);
        this.change();
    }
    forceUpdate(){
        console.log("Change")
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
    #u = ()=>this.change();
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
    open(){
        this.wsh.send({type:"open"});
    }
    close(){
        this.wsh.send({type:"close"});
    }
    terminate(){
        this.wsh.send({type:"terminate"});
    }
    #onWSMessage(msg){console.log("WSH message ",msg);
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
                this.placeSession.tableLeave(table);
                break;
            
            default:
                this.do("unknown-message",msg);
                break;
        }
    }
}

