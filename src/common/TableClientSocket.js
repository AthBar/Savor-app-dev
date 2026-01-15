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

        super(`/table-client`);
        this.placeId = placeId;
        this.table = table;

        this._handshake();
        TableClientClientHandler.instance = this;
        this.on("close",(code,reason)=>{
            if(window.UserApp&&code==1000&&reason=="Place not open")
                window.UserApp.instance.isOpen = false;
        })
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