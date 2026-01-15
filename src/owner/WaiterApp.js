import { Unit } from "../common/VirtualSessions";
import ListenerApp from "./ListenerAppBase";

export default class WaiterApp extends ListenerApp{
    startingPageURL;
    constructor(placeId){
        super(placeId);
        this.startingPageURL = `/dashboard/waiter/${this.placeId}`;
    }
    async initialize(){
        await this._initialize();
        this.isLoaded = true;
        this.change();
    }
    async _initialize(){
        await ListenerApp.prototype._initialize.call(this);
        
        this.wsh.on("handshake-rejected",()=>{
            localStorage.removeItem("clocked-in");
            this.nav(this.startingPageURL);
        });

        this.wsh.on("waiter-disconnected",()=>{
            localStorage.removeItem("clocked-in");
            this.nav(this.startingPageURL);
        });

        this.wsh.on("handshake-finished",()=>{
            //Now with the new place session (a listener is added first in the ListenerApp constructor)
            this.placeSession.on("waiter-change",waiter=>{
                if(waiter.id==this.waiter.id&&waiter.title==false){
                    localStorage.removeItem("clocked-in");
                    this.nav(this.startingPageURL);
                }
            })
        })
    }
}