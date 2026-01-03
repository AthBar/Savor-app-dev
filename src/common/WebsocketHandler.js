
import MyEventTarget from "./Event";

const PROTOCOL = import.meta.env.VITE_WS_PROTOCOL || "ws";
const HOST = import.meta.env.VITE_API_HOST || "api.savor.com.gr";
const ORIGIN = PROTOCOL+"://"+HOST;

export class WebsocketHandler extends MyEventTarget{
    /**
     * @type {WebSocket}
     */
    websocket;
    //List of pending messages to send to the websocket
    messageQueue=[];
    event_history=[];
    onMessageFns=new Set();
    #blocked = true;
    #ready=false; //If websocket handshake is done and messages can be sent
    connected=true; //If websocket is connected with the server (including handshake stage)
    #url;#protocols;
    constructor(url,protocols){
        super();
        this.#url=ORIGIN+url;
        this.#protocols=protocols;
        this.websocket = new WebSocket(this.#url,protocols);
        this.#setCloseEvents();
        addEventListener("offline",()=>{
            this.websocket.close(4000,"Client went offline");
            addEventListener("online",()=>this.#reopenLoop(),{once:true})
        });
    }
    #setCloseEvents(){
        this.websocket.addEventListener("close",e=>{
            if(e.code==1006){
                console.log("WebSocket (live system) closed unexpectedly. Attempting to reconnect...", e);
                this.#reopenLoop();
            }
            else if(e.code==4000){
                console.log("WebSocket (live system) closed due to client going offline. Waiting for connection to reconnect...");
            }
            else if(!this.#ready){
                this.do("handshake-rejected",e);
            }
            else if(e.code==1008){
                try{
                    let json = JSON.parse(e.reason);

                    console.log("Αποβολή WebSocket. Αυτό δεν θα έπρεπε να συμβεί. Παρακαλώ ενημερώστε την υποστήριξη: ",json)
                }
                catch(e){
                    console.warn("Αποβολή WebSocket από τον server (1008) με non-JSON response. Αυτό δεν θα έπρεπε να συμβεί. Παρακαλώ ενημερώστε την υποστήριξη")
                }
            }
            else{
                console.warn("WebSocket closed with unknown close frame. Please notify support: ",e);
            }
            this.connected = false;
            this.#ready = false;
        });
    }
    #reopens = 0;
    async #reopenLoop(){
        console.log("Attempting to reconnect WebSocket (live system)...");

        return this.reopen()
        .then(e=>{
            this.#reopens = 0;
            this.#setCloseEvents();
            this._handshake();
            console.log("WebSocket (live system) reconnected successfully");
        },()=>{
            const nextDelay = Math.min((2**this.#reopens),30);
            console.log(`Couldn't connect to WebSocket server. Attempting a reconnect in ${nextDelay} seconds`);
            setTimeout(()=>this.#reopenLoop(),nextDelay*1000);
            this.#reopens++
        });
    }
    /**
     * Basic handshake, common for all clients. Responsible for synchronizing the client with any past events and waiting for
     * the READY message. After that, unblocks the messaging loop
     */
    async _handshake(){
        this.reconnect_attempts = 0;
        this.connected = true;

        await new Promise(r=>{
            switch(this.websocket.readyState){
                case WebSocket.OPEN:
                    return r(this.websocket);
                case WebSocket.CONNECTING:
                    return this.websocket.addEventListener("open",r)
                case WebSocket.CLOSING:
                case WebSocket.CLOSED:
                    console.log("Closing or closed");
                    return;
            }
        });
        this.websocket.send("SYNC");

        await new Promise((r,j)=>{
            const syncF = e=>{
                let data;
                try{
                    data = JSON.parse(e.data);
                }catch(err){return j("Unexpected: Sync data couldn't be parsed: " + JSON.stringify(e.data))}

                this.syncData = data;
                this.parseSyncData(data);
                
                this.websocket.removeEventListener("message",syncF);
                r();
            };
            this.websocket.addEventListener("message",syncF);
        });
        
        this.websocket.send("READY");

        //Start the basic message listener
        this.websocket.addEventListener("message",e=>{
            if(e.data=="ACK")return this.blocked = false;
            else try{e=JSON.parse(e.data)}
            catch(e){return}
            this.do("message",e);
            this.websocket.send("ACK");
        })
        //Wait for start to unblock the messages
        const startF = e=>{
            if(e.data=="START"){
                this.#ready = true;
                this.blocked = false;
                this.websocket.removeEventListener("message",startF);
                this.do("handshake-finished");
            }
        };
        this.websocket.addEventListener("message",startF);
    }
    parseSyncData(data){
        //console.log("Συγχρονισμός WebSocket με δεδομένα: ",data);
    }
    #reconnectPromise;
    /**
     * 
     * @returns {Promise}
     */
    reopen(){
        try{
            //Open the new WebSocket object
            this.websocket = new WebSocket(this.#url,this.#protocols);
            
        }catch(e){console.log("Error making ws:",e)}

        //Return a promise that resolves if the new WebSocket opens, and rejects if it closes
        return this.#reconnectPromise = new Promise((s,j)=>{
            //Function generator that empties the existing reconnect promise and resolves/rejects it
            const f = (s)=>e=>{
                this.#reconnectPromise=null;
                s(e);
            };

            this.websocket.addEventListener("open",f(s));
            this.websocket.addEventListener("error",f(j));
            this.websocket.addEventListener("close",f(j));
        });
    }
    get blocked(){return this.#blocked}
    set blocked(v){if(!this.#ready)return;
        v=!!v;
        this.#blocked=v;
        //If we are setting it to unblocked, immediately send the next message in the queue
        if(!v)setTimeout(()=>this.#sendNext(),1);
    }
    async #sendNext(){
        if(this.#blocked||this.messageQueue.length<=0)return false;
        if(this.websocket.readyState==WebSocket.CLOSED)try{
            await this.reopen();
        }catch(e){console.log(e)}
        if(this.websocket.readyState==WebSocket.CONNECTING){
            try{
                await new Promise((s,j)=>{
                    this.websocket.addEventListener("open",s);
                    this.websocket.addEventListener("error",j);
                    this.websocket.addEventListener("close",j);
                });
            }
            catch(e){
                return console.log("Αλλαγή στην κατάσταση websocket κατά την διάρκεια αποστολής: ", e);
            }
        }

        //Send the message
        const msg = this.messageQueue.shift();
        this.websocket.send(msg[0]);

        //Wait for the server response
        const responseF = e=>{
            this.websocket.removeEventListener("message",responseF);
            if(e.data=="ACK")this.blocked=false;

            if(typeof e.data !== "string")return msg[2]("Receieved non-string response: ", e.data);
            if(e.data.startsWith("NO"))return msg[2](e.data.slice(3));
            if(e.data=="ACK")return msg[1]("ACK");
        }
        this.websocket.addEventListener("message",responseF);
        return this.blocked = true;
    }
    send(msg){
        if(msg instanceof Object)msg = JSON.stringify(msg);
        if(this.messageQueue.length>10)console.warn(`Message queue length exceeded 10 for a websocket`);
        return new Promise((s,j)=>{
            this.messageQueue.push([msg,s,j]);
            
            //If not blocked, send the message, initiating an ACK chain
            if(!this.#blocked)this.#sendNext();
        })
    }
}
//Get a promise that resolves after the handshake is done
WebsocketHandler.connect = wsh=>new Promise(r=>wsh._handshake(false,[],r));