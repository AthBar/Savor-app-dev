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
            if(e.code==1008){
                debugger;
            }
        })
    }
    doHandshake(){
        return 
    }
}