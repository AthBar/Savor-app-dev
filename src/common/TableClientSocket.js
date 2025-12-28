
import UserApp from "../user/MainApp.jsx";
import { WebsocketHandler } from "./WebsocketHandler.js";

export default class TableClientClientHandler extends WebsocketHandler{
    static instance;
    placeId;
    table;
    history=[];
    constructor(placeId,table){
        if(TableClientClientHandler.instance)return TableClientClientHandler.instance;
        if(!placeId.match(/^([a-zA-Z0-9_-]{36})$/g))throw new SyntaxError("Invalid place id format");
        //I don't call them table ids in the code but "invalid table" would imply something else in speech
        if(!table.match(/^[a-zA-Z0-9_-]{4}$/g))throw new SyntaxError("Invalid table id format");

        super(`ws://${location.hostname}:7288/table-client/${placeId}/${table}`);
        this.placeId = placeId;
        this.table = table;

        this._handshake();
        TableClientClientHandler.instance = this;
        this.on("close",(code,reason)=>{
            if(window.UserApp&&code==1000&&reason=="Place not open")
                window.UserApp.instance.isOpen = false;
        })
    }
    parseSyncData(data){
        //Parses connections
        for(let c=0;c<data.connections;c++)this.do("message",{type:"connected",table:this.table});
        
        //Parses orders
        //Translates the order data to a simple order creation message with the cart contents and sends it for handling
        //Then if the order has been accepted creates an oreder acceptance message and also sends it for handling
        //Same for if the order has been delivered
        for(let m of data.orders){
            m.type="create-order";
            m.table = this.table;
            if(!m.delivered)UserApp.instance.canOrder=false;
            this.do("message",m);

            if(m.accepted)this.do("message",{type:"order-accepted"});
            if(m.delivered)this.do("message",{type:"order-delivered"});
        }
        UserApp.instance.paid = data.paid;
    }
    async sendOrderData(data){
        return UserApp.destinationPromise.then(d=>d?
            UserApp.destinationPromise.then(()=>UserApp.socket.send(data))
            :fetch("/api/order/send", {
                method: "POST",
                headers:{
                    "Content-type":"application/json"
                },
                body:JSON.stringify(data)
            })
        );
    }
}

export class ClientSideTableSession{
    websocket;
    placeId;
    table;
    constructor(placeId,table){
        this.websocket = new TableClientClientHandler(this.placeId=placeId,this.table=table);
        this.send({type:"bill"});
    }
}