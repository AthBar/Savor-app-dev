import MyEventTarget from "./Event";

class Unit extends MyEventTarget{
    type="unit";
    constructor(type){
        super();
        this.type=type;
    }
}
class Order extends Unit{
    cart;
    comments;
    accepted=false;
    rejected=false;
    delivered=false;
    session;
    time;
    constructor(tableSession,cart,comments,timestamp){
        super("order");
        this.cart=cart;
        this.comments=comments;
        this.time=new Date(timestamp);
        if(tableSession instanceof TableSession){
            this.session=tableSession;
        }
    }
    //To clear up confusion:
    // "cancel": order cancelled by the client
    // "accept": order accepted by the store
    // "reject": order rejected by the store
    // "deliver": after being accepted, order delivered by a waiter and received by the table
    // Also I'm making all that very error-prone, keeping in mind that it will only be called by savor.
    // If someone decides to mess with it that's none of my concern
    cancel(){
        const arr = this.session.orders;
        arr.splice(arr.indexOf(this),1);
        this.do("change");
    }
    accept(){
        this.accepted = true;
        this.rejected = false;
        this.do("change");
    }
    reject(msg){
        this.accepted = false;
        this.rejected = true;
        this.do("change",msg);
    }
    deliver(){
        this.delivered = true;
        this.do("change");
    }
    export(){
        const obj = {
            cart:this.cart,
            timestamp:this.timestamp
        };

        if(this.rejected)obj.rejected=true;
        if(this.accepted)obj.accepted=true;
        if(this.delivered)obj.delivered=true;

        return obj;
    }
}

export class TableSession extends MyEventTarget{
    place;
    table;
    /**
     * @type {Array<Order>}
     */
    orders=[];
    requests=[];
    #active=true;
    total=0;
    paid=0;
    connects=0; //Number of connections. Can act as a boolean (0=false) or the number of connections currently on the session
    constructor(place,table){
        super();
        this.place=place;
        this.table=table;
    }
    request(){

    }
    requestAccepted(){

    }
    //Once again, this is unsafe, but I assume the server will not send data that will cause this to happen
    createOrder(msg,totalPrice){
        const order = new Order(this, msg.cart, msg.comments||"",msg.timestamp||performance.now());
        order.on("change",(...args)=>this.do("change",...args));

        if(msg.accepted)order.accept();
        if(msg.rejected)order.reject();
        if(msg.delivered)order.deliver();

        this.orders.push(order);
        this.total += totalPrice;
        this.do("change");
    }
    acceptOrder(){
        this.orders.at(-1).accept();
        this.do("change");
    }
    rejectOrder(){
        if(!this.orders.at(-1).delivered)this.orders.at(-1).rejected = true;
        this.do("change");
    }
    deliverOrder(){
        this.orders.at(-1).deliver();
        this.do("change");
    }
    pay(amount){
        this.paid += amount;
        this.do("change");
    }
    get balance(){
        return this.total-this.paid;
    }
    get activeOrder(){
        const candidate = this.orders.at(-1);
        return candidate.delivered?null:candidate;
    }
    connected(){
        this.connects++;
        this.do("change");
    }
    disconnected(){
        if(this.connects>0){
            this.connects--;
            this.do("change");
        }
    }
    get active(){
        return this.#active;
    }
    set active(v){
        if(this.#active&&!v){
            this.#active=false;
            this.do("change");
        }
    }
    export(){
        return {
            table:this.table,
            orders:this.orders.map(o=>o.export()),
            requests:this.requests
        }
    }
}
export class PlaceSession extends MyEventTarget{
    placeId;
    tables={};
    #f;
    constructor(placeId){
        super();
        this.placeId=placeId;
        this.#f=(...args)=>this.do("change",...args);
    }
    tableConnect(table){
        let sessList = this.tables[table];
        if(sessList){
            sessList[sessList.length-1].connected()
        }
        else{
            let sess = this.#session(table);
            sess.connects = 1;

            this.tables[table] = [sess];
        }
        this.do("change");
    }
    //Make new table session
    #session(table){
        const sess = new TableSession(this.placeId,table);
        sess.on("change",this.#f);
        this.#f();

        if(Array.isArray(this.tables[table]))this.tables[table].push(sess);
        else this.tables[table] = [sess];
        return sess;
    }
    tableDisconnect(table){
        let list = this.tables[table];
        if(list){
            const sess = list.at(-1);
            sess.disconnected();
            sess.off("change",this.#f);
        }
        this.do("change");
    }
    getLatestTableSession(table){
        const list = this.tables[table];
        if(list)return list[list.length-1];
        else return this.#session(table); //Set list and return first element
    }
    /**
     * Get a list of every single order made on this session sorted by time (for listener view) (including closed sessions?)
     */
    getGlobalOrderList(){
        //Set an object with key being the timestamp and value being the order data
        const timedList = {};

        //Elegant demure aesthetic loop. We assume no two events happened at the exact milisecond in which case fuck everything
        for(let i of Object.keys(this.tables))
            for(let sess of this.tables[i]){
                for(let o of sess.orders){
                    o.table = sess.table;
                    timedList[o.timestamp] = o;
                }
                for(let r of sess.requests){
                    r.table = sess.table;
                    timedList[r.timestamp] = r;
                }
            }

        //Then, create a sorted list using these keys
        const sortedList = [];

        //I don't know shit about sorting algorithms. I just do shit
        const keys = Object.keys(timedList);
        for(let i=0;i<keys.length;i++){
            let maximum = -Infinity;
            for(let k of Object.keys(timedList)){
                if(k>maximum)maximum=k;
            }
            sortedList.push(timedList[maximum]);
            delete timedList[maximum];
        }
        return sortedList;
    }
    export(){
        return {
            placeId:this.placeId,
            tables:{}
        }
    }
}