import { API } from "../common/API";
import TableClientClientHandler from "../common/TableClientSocket";
import { TableSession } from "../common/VirtualSessions";

export default class UserApp{
    place;
    isActive = false;
    isLoaded = false;
    isFinished = false;
    menu;
    destination;
    rejection=null;
    /**
     * @type {TableSession}
     */
    tableSession;
    #counter=0;

    #editingEntry;

    #listeners = new Set();
    /**
     * @type {TableClientClientHandler}
     */
    wsh;
    #initialized=false; //Turns to true when initialize is called
    static instance;
    constructor(){
        console.log(this)
        UserApp.instance = this;
    }
    async initialize(){
        return this.#initialize().then(()=>{
            this.isLoaded = true;
            this.#change();
        });
    }
    //This will be used in useEffect
    async #initialize(){
        if(this.#initialized)throw new Error("Tried to initialized while already initialized");
        this.#initialized = true;

        const destinationResponse = await API("/order/destination");
        if(!destinationResponse.success)return;

        const destination = destinationResponse.response;
        this.destination = destination;

        const status = (await API(`/place/status/${destination.placeId}`)).status;
        if(!status.isActive)return;
        this.isActive = true;
        
        this.tableSession = new TableSession(destination.placeId,destination.table);

        const placeData = await API(`/place/basic/${destination.placeId}`);
        this.place = {
            id:destination.placeId,
            name:placeData.name,
            status
        };

        const menuData = await API(`/place/menu/${destination.placeId}`);
        this.menu = {};
        for(let i of menuData.data)this.menu[i.code]=i;

        this.wsh = new TableClientClientHandler(destination.placeId,destination.table);
        this.wsh.on("handshake-rejected",e=>this.#handleRejection(e));
        this.wsh.on("handshake-finished",()=>this.#sync());
        this.wsh.on("message",m=>this.#onWshMessage(m));
        this.wsh.on("expected-close",()=>this.finish());
    }
    editEntry(entry,cb=()=>{}){
        this.#editingEntry = entry?{...entry,cb}:null;
        this.#change();
    }
    set editingEntry(v){
        this.editEntry(v);
    }
    get editingEntry(){
        return this.#editingEntry;
    }
    startDishEditing(code){
        this.editEntry({code},entry=>this.addToCart(entry));
    }
    sendOrder(){
        this.wsh.send({type:"send-order"});
    }
    finish(){
        this.isFinished = true;
        this.#change();
        console.log("session finished");
    }
    #handleRejection(e){
        this.rejection=e;
        console.log(e);
    }
    #sync(){
        const dest = this.destination;
        this.tableSession = TableSession.import(dest.placeId,dest.table,this.wsh.syncData);
        this.#change();
    }
    get updateCounter(){
        return this.#counter;
    }
    #onWshMessage(msg){
        switch(msg.type){
            case "cart-removal":
                this.tableSession.removeFromCart(msg.key);
                break;
            case "cart-addition":
                this.tableSession.addToCart(msg.key,msg.entry);
                break;
            case "cart-change":
                this.tableSession.changeInCart(msg.key,msg.newEntry);
                break;
            case "cart-emptied":
                this.tableSession.emptyCart();
                break;
            case "order-sent":
                this.tableSession.sendOrder();
                break;
            case "order-cancelled":
                this.tableSession.cancelOrder();
                break;
            case "order-accepted":
                this.tableSession.acceptOrder();
                break;
            case "order-delivered":
                this.tableSession.deliverOrder();
                break;
            case "order-rejected":
                this.tableSession.rejectOrder(msg.message);
                break;
            case "connected":
                this.tableSession.connected();
                break;
            case "disconnected":
                this.tableSession.disconnected();
                break;
            case "paid":
                this.tableSession.pay();
                break;
            case "left":
                this.left = true;
                break;
            case "closed":
                this.place.status.closed = true;
                break;
            case "opened":
                this.place.status.closed = false;
                break;
            default:return console.warn("Invalid message type: ",msg);
        }
        this.#change();
    }
    get cart(){
        return this.tableSession.cart;
    }
    get canOrder(){
        return !this.place.status.closed&&!this.tableSession.activeOrder;
    }
    get canLeave(){
        //No pending order, no money owed and having at least ordered one thing
        return !this.tableSession.activeOrder&&this.total<=0&&this.tableSession.orders.length>0;
    }
    get total(){
        return this.calculateTotal(
            this.tableSession.orders.flatMap(r=>r.delivered&&!r.paid?Object.values(r.cart):null)
        )
    }
    get cartTotal(){
        return this.calculateTotal(Object.values(this.cart));
    }
    get subscription(){
        return this.#subscribe.bind(this);
    }
    leave(){
        this.wsh.send({type:"leave"});
    }
    calculateTotal(entries){
        return entries.reduce(
                (c,v)=> v? c + this.calculatePrice(v) : c
            ,0);
    }
    calculatePrice(entry){
        if(!this.menu)return false;
        
        const dish = this.menu[entry.code];
        if(!dish)return 0;

        const basePrice = dish.price;
        let ingredientPrice = 0;
        if(!entry.ingredients)return basePrice*(entry.count||1);
        for(let i of this.menu[entry.code].ingredients){
            if(i.price&&entry.ingredients.includes(i.title))
                ingredientPrice += i.price;
        }
        return (basePrice+ingredientPrice)*(entry.count||1);
    }
    addToCart(entry){console.log("adding to cart")
        this.wsh.send({type:"add-to-cart",entry});
    }
    changeInCart(key,newEntry){
        this.wsh.send({type:"change-in-cart",key,newEntry});
    }
    removeFromCart(key){
        this.wsh.send({type:"remove-from-cart",key});
    }
    emptyCart(){
        this.wsh.send({type:"empty-cart"});
    }
    #subscribe(listener){
        this.#listeners.add(listener);
        return ()=>this.#listeners.delete(listener);
    }
    sum=0;
    add(){
        this.sum++;
        this.#change();
    }
    #change(){
        this.#counter++;
        for(let i of this.#listeners)i();
    }
}