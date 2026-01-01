import MyEventTarget from "./Event";

class Unit extends MyEventTarget{
    type="unit";
    constructor(type){
        super();
        this.type=type;
    }
}

export class Waiter extends Unit{
    id;#title=false;#pin;
    constructor(id,pin){
        super("waiter");
        this.id=id;
        this.#pin=pin;
    }
    set title(v){
        this.#title = v;
        this.do("change");
    }
    get title(){return this.#title}
    set pin(v){
        this.#pin=v;
        this.do("change");
    }
    get pin(){return this.#pin}
}

class Order extends Unit{
    cart;
    comments;
    accepted=false;
    rejected=false;
    delivered=false;
    cancelled=false;
    session;
    time;
    paid=false;
    constructor(tableSession,cart,comments,timestamp=Date.now()){
        super("order");
        this.cart=cart;
        this.comments=comments;
        this.time=new Date(timestamp);
        if(tableSession instanceof TableSession){
            this.session=tableSession;
        }
    }
    pay(){
        this.paid = true;
        this.do("change");
    }
    cancel(){
        this.cancelled=true;
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
    static import(tableSession,data){
        const _this = new Order(tableSession,data.cart);

        if(data.rejected)_this.rejected=true;
        if(data.accepted)_this.accepted=true;
        if(data.delivered)_this.delivered=true;
        if(data.cancelled)_this.cancelled=true;
        if(data.paid)_this.paid=true;

        return _this;
    }
    export(){
        const obj = {
            cart:this.cart,
            timestamp:this.timestamp
        };

        if(this.rejected)obj.rejected=true;
        if(this.accepted)obj.accepted=true;
        if(this.delivered)obj.delivered=true;
        if(this.cancelled)obj.cancelled=true;
        if(this.paid)obj.paid=true;

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
    cart={};
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
    
    sendOrder(){
        const order = new Order(this,this.cart,null);
        this.orders.push(order);
        order.on("change",()=>this.do("change"));

        this.cart = {};
        this.do("change");
        return order;
    }
    cancelOrder(){
        const order = this.activeOrder;
        if(!order)return;
        order.cancel();
        this.do("change");
    }
    changeInCart(key,newEntry){
        this.cart[key] = newEntry;
        this.do("change");
    }
    removeFromCart(key){
        delete this.cart[key];
        this.do("change");
    }
    addToCart(key,entry){
        this.cart[key] = entry;
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
    /**
     * @returns {Order}
     */
    get activeOrder(){
        const candidate = this.orders.at(-1);
        return (candidate?.delivered||candidate?.cancelled)?null:candidate;
    }
    get canOrder(){
        return !this.activeOrder;
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
    sync(syncData){
        const orders = [];
        for(let i of syncData.orders){
            const order = new Order(this,i.cart,null,i.timestamp);

            if(i.accepted)order.accept();
            if(i.delivered)order.deliver();
            if(i.rejected)order.reject();
            if(i.cancelled)order.cancel();
            if(i.paid)order.pay();

            //Listen to change events after the order has been initialized
            order.on("change",()=>this.do("change"));
            orders.push(order);
        }
        this.orders = orders;
        this.cart = syncData.cart;
        this.connects = syncData.connections;
        this.paid = syncData.paid;

        this.do("change");
    }
    static import(placeId,table,data){
        const _this = new TableSession(placeId,table);
        const orders = [];
        for(let i of data.orders){
            const order = Order.import(_this,i);

            orders.push(order);
            order.on("change",()=>_this.do("change"));
        }
        _this.orders = orders;
        _this.cart = data.cart;
        _this.connects = data.connections;
        //_this.paid = data.paid;

        return _this;
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
    waiters={};
    #f;
    constructor(placeId){
        super();
        this.placeId=placeId;
        this.#f=(...args)=>this.do("change",...args);
    }
    addWaiter(waiter){
        if(this.waiters[waiter.id] instanceof Waiter)return;
        this.waiters[waiter.id] = waiter;
        waiter.on("change",this.#f);
    }
    setWaiter({id,title,pin}){
        const waiter = this.waiters[id];
        if(!waiter)return false;

        if(pin)waiter.pin = pin;
        if(title!==undefined)waiter.title = title;
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
    /**
     * @returns {TableSession}
     */
    getLatestTableSession(table){
        const list = this.tables[table];
        if(list)return list.at(-1);
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
    static import(placeId, data){
        const _this = new PlaceSession(placeId);
        for(let i of Object.keys(data.tables)){
            const table = TableSession.import(placeId,i,data.tables[i]);
            _this.tables[i] = [table];
            table.on("change",()=>_this.do("change"));
        }
        for(let id of Object.keys(data.waiters)){
            const src = data.waiters[id];
            const dest = new Waiter(id,src.pin);
            _this.addWaiter(dest);
            
            dest.title = src.title||false;
        }
        return _this;
    }
    export(){
        return {
            placeId:this.placeId,
            tables:{}
        }
    }
}