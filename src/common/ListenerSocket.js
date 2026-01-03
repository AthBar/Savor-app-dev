import { WebsocketHandler } from "./WebsocketHandler.js";

export class ListenerClientHandler extends WebsocketHandler{
    //Since this is used on the client side, only allow one instance for the whole state, because we are not able to change place ID
    static instance;
    event_history=[];
    
    constructor(placeId){
        if(!placeId.match(/^([a-zA-Z0-9_-]{36})$/g))throw new SyntaxError("Invalid place id format");
        super(`/listener/${placeId}`);
        this.placeId=placeId;
        
        this._handshake();
        ListenerClientHandler.instance = this;
        this.websocket.addEventListener("close",e=>{
            switch(e.code){
                case 4001:
                    this.do("auth-error",e);
                    break;
                case 4002:
                    this.do("waiter-auth-error",e);
                    break;
                case 4003:
                    this.do("waiter-disconnected",e);
                    break;
                case 1008:
                    console.log(e)
                    debugger;
                    break;
                default:
                    console.log("WS closure: ",e);
                    break
            }
        })
    }
    doHandshake(){
        return 
    }
}