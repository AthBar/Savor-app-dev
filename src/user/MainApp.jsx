import { Routes, Route, useNavigate } from "react-router";
import CartPage from './Cart.jsx';
import TablePage from './TablePage.jsx';
import  MainPage from './MainPage.jsx';
import AddressPage from './AddressPage.jsx';
import QRPage from './QR.jsx';
import TestPage from './TestPage.jsx';
import TableClientClientHandler from '../common/TableClientSocket.js';
import React from 'react';
import { TableSession } from "../common/VirtualSessions.js";
import { API } from "../common/functions.js";
import { EventComponent } from "../common/Event.js";
import GoodbyePage from "./GoodbyePage.jsx";

function Router(){//Empty string is root, * is unmatched
    UserApp.instance.nav = useNavigate();
    return <Routes>
            <Route path="" element={<TablePage/>}/>
            <Route path="menu" element={<MainPage/>}/>
            <Route path="cart" element={<CartPage/>}/>
            <Route path="destination-selector" element={<AddressPage/>}/>
            <Route path="QR" element={<QRPage/>}/>
            <Route path="test" element={<TestPage/>}/>
            <Route path="complete" element={<GoodbyePage/>}/>
            <Route path="*" element={<p>404</p>}/>
        </Routes>
}

function Disabled(){
    return <div style={{
        display:"flex",
        justifyContent:"center",
        flexDirection:"column",
        height:"100%",
        textAlign:"center",
        fontSize:"2em",
    }}>Αυτή η εφαρμογή προορίζεται για κινητά τηλέφωνα σε κάθετο προσανατολισμό (πορτρέτο)</div>
}

function PlaceClosedPopup({placeName}){
    return <div style={{padding:"25px",background:"white"}}>
        <div style={{fontSize:"large",textAlign:"center"}}>Η επιχείρηση {placeName} δεν δέχεται παραγγελίες αυτή την στιγμή</div><br/>
        <div style={{fontSize:"small"}}>
            Πιθανότατα είναι κλειστή. 
            Άν όχι, ενημερώστε έναν υπάλληλο. 
            Μπορείτε να περιμένετε μέχρι η επιχείρηση να επανέλθει ή να <a href={`/place/${UserApp.instance.place.id}/menu`}>δείτε απλώς τον κατάλογο</a>
        </div>
    </div>
}

export default class UserApp extends EventComponent{
    /**
     * @type {UserApp}
     */
    static instance;
    static destinationPromise;
    static menuPromise;
    static placePromise;
    
    /**
     * @type {TableClientClientHandler}
     */
    wsh;
    /**
     * @type {TableSession}
     */
    tableSession;
    place;
    placeClosedPopupOn=false;

    nav;
    #cart=[];
    #globals={made:false};
    menu;
    sess_changes=0;
    constructor(props){
        super(props);

        const media = matchMedia("screen and (orientation: portrait) and (min-width:300px) and (pointer:coarse)");
        this.state={
            dimensionsRight: media.matches,
            menu:null,
            destination:null,
            cart:this.#cart,
            draw:0,
            placeData:{},
            isOpen:true,
            popup:false,
            popupCanClose:true
        }
        media.addEventListener("change", e=>this.dimensionsRight=e.matches);

        makePromises();

        UserApp.destinationPromise.then(destination=>{
            if(!destination.success)return location.replace("/");

            this.place = window.place = {id:destination.place};
            UserApp.menuPromise = API(`/place/menu/${destination.place}`).then(r=>r.data)
            this.setState({destination});

            this.tableSession = new TableSession(destination.place,destination.table);
        });
        UserApp.menuPromise.then(menuData=>{
            const menu = {};
            for(let i of menuData)menu[i.code]=i;
            this.menu = menu;
        });
        UserApp.placePromise.then(placeData=>{
            this.setState({placeData});
            UserApp.instance.place.name = placeData.name;
        });

        Promise.all([UserApp.destinationPromise, UserApp.menuPromise]).then(([destination])=>{
            this.wsh = new TableClientClientHandler(destination.place,destination.table);
            this.wsh.on("handshake-rejected",e=>this.#handleRejection(e));
            this.wsh.on("handshake-finished",()=>this.#sync());
            this.wsh.on("message",m=>this.#onWshMessage(m));
        });

        UserApp.instance = this;
    }
    #handleRejection(e){
        let json,str;
        try{
            json = JSON.parse(e.reason);
            str = ["The websocket system has closed. Reason:\n"];

            switch(json.code){
                case "not-open":
                    str.push("- The place is not open");
                    break;
                default:
                    delete json.code;
                    str.push("- The reason is unrecognizable. JSON:\n", json);
                    break;
            }
        }
        catch(e){
            str = ["Reason for WebSocket closure is unknown (not in JSON): ", e.reason];
        }

        console.warn(...str);
    }
    leave(){
        this.wsh.send({type:"leave"});
    }
    addToCart(entry){
        this.wsh.send({type:"add-to-cart",entry})
    }
    changeInCart(key,newEntry){
        this.wsh.send({type:"change-in-cart",key,newEntry})
    }
    removeFromCart(key){console.log("removing")
        this.wsh.send({type:"remove-from-cart",key})
    }
    #sync(){
        const dest = this.state.destination;
        const prev = this.tableSession;

        this.tableSession = TableSession.import(dest.place.id,dest.table,this.wsh.syncData);
        this.do("session-refresh",prev);
        this.sess_changes++;

        this.forceUpdate();
    }
    #onpopupclose=()=>{};
    popup(popup,cantClose,onClose){
        this.#onpopupclose();
        if(this.state.popup.oncloseaspopup instanceof Function)this.state.popup.oncloseaspopup();
        if(popup!==null)this.setState({popup});
        if(cantClose!==undefined&&cantClose!==null)this.state.popupCanClose = !cantClose;

        if(onClose instanceof Function)this.#onpopupclose = onClose;
    }
    onClick(e){
        //If popup is allowed to close, and the click event has a target, and the target is one of the dark elements
        if(this.state.popupCanClose&&e.target&&(e.target.classList.contains("popup-background")||e.target.classList.contains("popup-wrapper")))
            this.popup(false)
    }
    get total(){
        return this.tableSession.orders.reduce((c,v)=>{
            if(v.rejected||v.cancelled||v.paid)return c;
            else return c+Object.values(v.cart).reduce((c,v)=>c+this.calculatePrice(v),0);
        },0)
    }
    set dimensionsRight(v){
        this.setState({
            dimensionsRight:!!v
        });
    }
    set menu(menu){
        if(menu instanceof Object){
            this.setState({menu});
        }
    }
    get socket(){
        return UserApp.socket;
    }
    set socket(v){
        if(v instanceof TableClientClientHandler){
            UserApp.socket=v;
        }
    }
    set isOpen(isOpen){this.setState({isOpen})}
    get isOpen(){return this.state.isOpen}
    //To ease us in other files
    get destination(){return this.state.destination}
    get placeName(){return this.state.placeData.name}
    get menu(){return this.state.menu}
    get cart(){return this.#cart}
    get hasActiveOrder(){
        return !this.tableSession.canOrder
    }
    // addToCart(i){
    //     this.#cart.push(i);

    //     return this.setState({
    //         cart:this.#cart
    //     });
    // }
    // removeFromCart(i){
    //     let index = this.#cart.indexOf(i);
    //     if(index!=-1)this.#cart.splice(index,1);

    //     return this.setState({
    //         cart:this.#cart
    //     })
    // }
    emptyCart(){
        this.#cart.splice(0,this.#cart.length);

        return this.setState({
            cart:this.#cart
        })
    }
    calculatePrice(entry){
        if(!this.menu)return false;
        
        const dish = this.menu[entry.code];
        if(!dish)return 0;

        const basePrice = dish.price;
        let ingredientPrice = 0;
        for(let i of this.menu[entry.code].ingredients){
            if(i.price&&entry.ingredients.includes(i.title))
                ingredientPrice += i.price;
        }
        return (basePrice+ingredientPrice)*(entry.count||1);
    }
    pay(amount){
        console.log("Paying",amount);
        this.wsh.send({type:"payment",amount});
    }
    set paid(v){
        if(!this.tableSession.paid)this.tableSession.paid=v;
    }
    get balance(){
        return this.tableSession.balance;
    }
    sendOrder(){
        this.wsh.send({type:"send-order"});
    }
    setState(state,...o){
        this.#globals.made = false;
        return this.constructor.prototype.__proto__.setState.call(this,state,...o);
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
            case "order-sent":
                location.replace("/store");
                UserApp.instance.canOrder = false;
                this.tableSession.sendOrder();
                break;
            case "order-cancelled":
                UserApp.instance.canOrder = true;
                this.tableSession.cancelOrder();
                break;
            case "order-accepted":
                this.tableSession.acceptOrder();
                break;
            case "order-delivered":
                UserApp.instance.canOrder = true;
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
                this.nav("/store/complete");
                break;
            case "state":
                if(!this.#placeClosedPopupOn){
                    UserApp.placePromise.then(place=>{
                        this.popup(<PlaceClosedPopup placeName={place.name}/>,true)
                        this.#placeClosedPopupOn = true;
                    });   
                }
                else this.popup(this.#placeClosedPopupOn=false);
                break;
            default:return console.warn("Invalid message type: ",msg);
        }
    }
    #placeClosedPopupOn;
    render(){
        if(this.left)this.nav("/store/complete");
        if(!this.state.destination)return "Loading...";
        return this.state.dimensionsRight?
        [<Router key={this.sess_changes}/>,
            this.state.popup?
                    <div key="popup" className="popup-background" onMouseDown={e=>this.onClick(e)}>
                        <div className="popup-wrapper">
                            {this.state.popup}
                        </div>
                    </div>
            :null
        ]
        :<Disabled/>;
    }
}
let inited=false;
function makePromises(){
    if(inited)return;
    inited=true;
    UserApp.destinationPromise = API("/order/destination");
    UserApp.menuPromise = UserApp.destinationPromise.then(d=>
        API(`/place/menu/${d.place}`).then(r=>r.data)
    );
    UserApp.placePromise = UserApp.destinationPromise.then(d=>
        API(`/place/basic/${d.place}`)
    );
    window.UserApp = UserApp;
}

export function currency(price){
    return (price/100||0).toFixed(2)+"€";
}