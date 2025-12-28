import { WebsocketHandler } from "./WebsocketHandler.js";

export class ListenerClientHandler extends WebsocketHandler{
    //Since this is used on the client side, only allow one instance for the whole state, because we are not able to change place ID
    static instance;
    event_history=[];
    
    constructor(placeId){
        if(ListenerClientHandler.instance instanceof ListenerClientHandler)return ListenerClientHandler.instance;
        if(!placeId.match(/^([a-zA-Z0-9_-]{36})$/g))throw new SyntaxError("Invalid place id format");
        super(`ws://${location.hostname}:7288/listener/${placeId}`);
        this.placeId=placeId;
        
        this._handshake();
        ListenerClientHandler.instance = this;
        this.websocket.addEventListener("close",e=>{
            console.log(e);
            if(e.code==1008){
                debugger;
            }
        })
    }
    doHandshake(){
        return 
    }
    parseSyncData(data){
        for(let table of Object.keys(data)){
            const state = data[table];

            for(let c=0;c<state.connections;c++)this.do("message",{type:"connected",table});

            for(let m of state.orders){
                this.do("message",{type:"create-order",cart:m.cart,table,timestamp:m.timestamp});

                if(m.accepted)this.do("message",{type:"order-accepted",table});
                if(m.rejected)this.do("message",{type:"order-rejected",table});
                if(m.delivered)this.do("message",{type:"order-delivered",table});
            }
        }

    }
}