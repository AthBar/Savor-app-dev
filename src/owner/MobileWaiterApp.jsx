import { Route, Routes, useNavigate, useParams } from "react-router";
import ListenerApp from "./ListenerAppBase";
import { useEffect, useState } from "react";
import { API, currency } from "../common/functions";
import { Waiter } from "../common/VirtualSessions";

function MenuDishOptions({dish,category,table,onSubmit,...props}){
    const nav = useNavigate();
    const [_,redraw] = useState(0);
    const [ingredients] = useState(props.ingredients||{});
    const [count,setCount] = useState(props.count||1);
    const menu = MobileWaiterApp.instance.menu;

    useEffect(()=>{
        for(let i of menu?.[dish]?.ingredients||[])
            if(i.defaultOn)ingredients[i.title]=true;
    },[]);

    if(!menu)return <div>Loading</div>;
    else dish = menu[dish];

    if(!props.url&&dish.category!==category)
        return nav(`${MobileWaiterApp.instance.startingPageURL}/${table}/order/${dish.category}/${dish.code}`);

    function toggleIngredient(title){
        if(ingredients[title])delete ingredients[title];
        else ingredients[title] = true;

        redraw(_+1);
    }

    function submit(){
        if(onSubmit)onSubmit({
            ingredients:Object.keys(ingredients),
            code:dish.code,
            count
        });
        nav(props.url||`${MobileWaiterApp.instance.startingPageURL}/${table}`);
    }

    const map = [];
    for(let r of dish.ingredients)
        if(!r.nonRemovable)
            map.push(<button 
                key={r.title} 
                className={"waiter-order-option-button"+(ingredients[r.title]?" on":"")}
                onClick={()=>toggleIngredient(r.title)}>{r.title}</button>);

    return  <div className="waiter-dishopts-wrapper">
                <div className="waiter-fixed-title">
                    {dish.category} / {dish.title} ({dish.code})
                </div>
                <div className="waiter-dishopts-main">
                    <div className="waiter-x-selector">
                        {map.length>0?map:<div style={{textAlign:"center"}}>Δεν υπάρχουν αφαιρέσιμα υλικά</div>}
                    </div>
                </div>
                <div className="waiter-fixed-bottom">
                    <div className="waiter-dishopts-count">
                        <button onClick={()=>setCount(Math.max(count-1,1))}>-</button>
                        <div>{count}</div>
                        <button onClick={()=>setCount(Math.min(count+1,99))}>+</button>
                    </div>
                    <button className="green-wide-button" onClick={submit}>{props.url?
                        "Εφαρμογή αλλαγών":"Προσθήκη στο καλάθι"
                    }</button>
                </div>
                <BackButton url={props.url||`${MobileWaiterApp.instance.startingPageURL}/${table}/order/${dish.category}`}/>
            </div>
}

function MenuDishSelector({table,category}){
    const dishes=[];const nav = useNavigate();
    if(!MobileWaiterApp.instance.menuByCategory)return <div>Φόρτωση καταλόγου</div>;
    return  <div style={{padding:"70px 15px"}}>
                <div className="waiter-fixed-title">
                    {category}
                </div>
                <div className="waiter-x-selector">
                    {MobileWaiterApp.instance.menuByCategory[category].map(dish=>
                        <button key={dish.code} className="waiter-order-option-button" onClick={()=>nav(dish.code)}>{dish.title}</button>
                    )}
                    <BackButton url={`${MobileWaiterApp.instance.startingPageURL}/${table}/order`}/>
                </div>
            </div>
}

function MenuCategorySelector({table,category}){
    if(!MobileWaiterApp.instance.menu)return <div>Φόρτωση καταλόγου</div>;
    const nav = useNavigate();
    return  <div style={{padding:"70px 15px"}}>
                <div className="waiter-fixed-title">
                    Κατηγορίες
                </div>
                <div className="waiter-x-selector">
                    {MobileWaiterApp.instance.menuCategories.map(cat=>
                            <button key={cat} className="waiter-order-option-button" onClick={()=>nav(cat)}>{cat}</button>
                    )}
                    <BackButton url={`${MobileWaiterApp.instance.startingPageURL}/${table}`}/>
                </div>
            </div>
}

function TableOptionsPage({table}){
    const [_,redraw] = useState(0);
    const nav = useNavigate();

    const sess = MobileWaiterApp.instance.placeSession.getLatestTableSession(table);
    const canOrder = sess?.canOrder;

    useEffect(()=>sess.on("change",()=>redraw(_+1),true));

    function Normal(){
        return [<div key="order">
                    <button className="waiter-order-option-button" onClick={canOrder?()=>nav("order"):null}>
                        Προσθήκη
                    </button>
                </div>,
                <div key="cart">
                    <button className="waiter-order-option-button" onClick={()=>nav("cart")}>
                        Καλάθι
                    </button>
                </div>,
                <div key="bill">
                    <button className="waiter-order-option-button" onClick={()=>nav("pay")}>
                        Εξόφληση λογαριασμού
                    </button>
                </div>
            ];
    }
    function CantOrder(){
        const nav = useNavigate();
        function cancel(){
            MobileWaiterApp.instance.cancelOrder(table);
        }

        return [<div key="order">
                    <button className="waiter-order-option-button" onClick={canOrder?()=>nav("order"):null}>
                        Παρακολούθηση παραγγελίας
                    </button>
                </div>,
                <div key="cart">
                    <button className="waiter-order-option-button" onClick={()=>nav("cart")}>
                        Καλάθι
                    </button>
                </div>,
                <div key="bill">
                    <button className="waiter-order-option-button" onClick={()=>nav("pay")}>
                        Εξόφληση λογαριασμού
                    </button>
                </div>
            ];
    }
    return <div className="waiter-x-selector" style={{padding:"15px"}}>
                {canOrder?<Normal/>:<CantOrder/>}
                <BackButton url={`${MobileWaiterApp.instance.startingPageURL}/layout`}/>
            </div>
}

function BackButton({url}){
    const nav = useNavigate();
    return <button className="mobile-app-back-button" onClick={()=>nav(url)}>&lt;</button>
}

function Overview(){
    const nav = useNavigate();
    return<div style={{
            display:"grid",
            width:"100%",
            height:"100%",
            gridTemplateColumns:"1fr 1fr"
        }}>
            <div style={{padding:"18px"}}>
                <button style={{width:"100%",height:"100%"}} className="green-wide-button" onClick={()=>nav("layout")}>Έναρξη</button>
            </div>
            <div style={{padding:"18px"}}>
                <button style={{width:"100%",height:"100%"}} className="delete-button" onClick={()=>nav("self")}>Πληροφορίες</button>
            </div>
        </div>
}
function TimeSince({startDate}){
    const [_,redraw] = useState(0);
    useEffect(()=>{
        const id = setTimeout(()=>redraw(_+1),1000);
        return ()=>clearTimeout(id);
    });
    const now = Date.now();
    const diff = now - startDate;
    
    const seconds = Math.floor(diff/1000);
    const minutes = Math.floor(seconds/60);
    const hours = Math.floor(minutes/60);

    const hstr = hours?hours.toString().padStart(2,"0")+":":"";
    const mstr = (minutes%60).toString().padStart(2,"0")+":";
    const sstr = (seconds%60).toString().padStart(2,"0");
    return hstr+mstr+sstr;
}

function ProfilePage(){
    const [_,redraw] = useState(0);

    const app = MobileWaiterApp.instance;
    useEffect(()=>{
        MobileWaiterApp.placePromise.then(()=>{
            redraw(_+1);
            MobileWaiterApp.instance.placeSession.on("change",()=>redraw(_+1))
        });
    },[]);
    useEffect(()=>window.topbar.setTitle(""))

    function unixToTimeString(unix){
        const date = new Date(unix);
        const hours = date.getHours().toString().padStart(2,"0");
        const minutes = date.getMinutes().toString().padStart(2,"0");
        return `${hours}:${minutes}`;
    }
    let clockInTime = 0;

    try{
        clockInTime = JSON.parse(localStorage.getItem("clocked-in")).clockInTime
    }
    catch(e){}
    

    return <div>
        <h2 style={{textAlign:"center"}}>Μέλος προσωπικού: {MobileWaiterApp.instance.waiter?.title}</h2>
        <div style={{padding:"10px",lineHeight:"1.5"}}>
            <div>Επιχείρηση: {app.place.title}</div>
            <div>Ώρα σύνδεσης: {clockInTime?unixToTimeString(clockInTime):"Μή διαθέσιμη"}</div>
            <div>Ρόλος: {clockInTime?"Εξυπηρέτηση πελατών":"Διαχείρηση"}</div>
            <div>Συνδεδεμένος για: {clockInTime?<TimeSince startDate={clockInTime}/>:"Μη διαθέσιμο"}</div>
        </div>
        <BackButton url={app.startingPageURL}/>
    </div>
}

function LayoutPage({layout}){
    MobileWaiterApp.instance.nav = useNavigate();
    return <div style={{padding:"16px"}}>
        {layout}
        <BackButton url={MobileWaiterApp.instance.startingPageURL}/>
    </div>
}

function CartPage({table}){
    const [_,redraw] = useState(0);
    if(!MobileWaiterApp.instance.menu)ListenerApp.menuPromise.then(()=>redraw(_+1));
    const nav = useNavigate();
    const tableSession = MobileWaiterApp.instance.placeSession.getLatestTableSession(table);
    let cart = tableSession.cart||{};

    cart = Object.keys(cart);

    const map = cart.map(key=>{
        const entry = tableSession.cart[key];
        const dish = MobileWaiterApp.instance.menu[entry.code];
        return <button key={key} onClick={()=>nav(key.toString())} className="waiter-order-option-button">{entry.count}x {dish.title}</button>
    });

    function sendOrder(){
        MobileWaiterApp.instance.sendOrder(table)
        nav(`${MobileWaiterApp.instance.startingPageURL}/layout`)
    }

    return [
            <div style={{}} key="main">
                <div className="waiter-fixed-title">Καλάθι για {table}</div>
                <div style={{height:"100%",padding:"50px"}}>
                <div className="waiter-x-selector">
                    {map.length>0?map:<div style={{textAlign:"center",fontSize:"1.5em"}}>Άδειο καλάθι</div>}
                </div>
                </div>
                <BackButton url={MobileWaiterApp.instance.startingPageURL+"/"+table}/>
            </div>,
            map.length>0?<button key="send" className="waiter-br-button send" onClick={sendOrder}/>:null
        ]
}

function PaymentPage({table}){
    if(!MobileWaiterApp.instance.menu)return <div>Φόρτωση...</div>;
    const tableSession = MobileWaiterApp.instance.placeSession.getLatestTableSession(table);
    let orders = tableSession.orders||[];
    let total = 0;
    const mainPart = orders.map((o,i)=>o.delivered&&!o.paid?
                        <div key={i} className="waiter-summary-order">
                            <h3 style={{textAlign:"center"}}>Παραγγελία:</h3>
                            <hr/>
                            {Object.values(o.cart).map((entry,j)=>{
                                const dish = MobileWaiterApp.instance.menu[entry.code];
                                const price = MobileWaiterApp.instance.calculatePrice(entry);
                                total += price;
                                return <div key={j}>
                                    {entry.count}x {dish.title} - {currency(price)}
                                </div>
                            })}
                        </div>
                    :null);
    let hasOrders = false;
    for(let i of mainPart)if(hasOrders=i)break;

    return <div>
        <div className="waiter-fixed-title">Λογαριασμός για {table}</div>
        <div className="waiter-summary-wrapper">
            <div className="waiter-summary-main">
                {hasOrders?mainPart:
                    <div className="content-centered" style={{width:"100%",fontSize:"1.5em"}}>Καμία παραγγελία δεν οφείλεται</div>
                }
            </div>
        </div>
        <div className="waiter-fixed-bottom">
            <div style={{padding:"10px",fontSize:"1.5em"}}>Σύνολο: {currency(total)}</div>
        </div>
        {total>0?
            <button className="waiter-br-button confirm" onClick={()=>MobileWaiterApp.instance.onPaid(table)}/>
        :null}
        <BackButton url={MobileWaiterApp.instance.startingPageURL+"/"+table}/>
    </div>
}

function CartEditPage({entryToEdit,table}){
    const fail = ()=><MobileWaiterApp.instance._AutoRedirect url={`${MobileWaiterApp.instance.startingPageURL}/${table}/cart`}/>;
    if(!Number(entryToEdit)&&Number(entryToEdit)!==0)return fail();

    const entries = MobileWaiterApp.instance.placeSession.getLatestTableSession(table)?.cart;
    if(!entries)return fail();

    const entry = entries[entryToEdit];
    if(!entry)return fail();

    const dish = MobileWaiterApp.instance.menu[entry.code]
    if(!dish)return fail();

    function onClick(){
        return MobileWaiterApp.instance.removeFromCart(table,entryToEdit)
    }

    const ingredientObj = {};
    for(let i of entry.ingredients)ingredientObj[i]=true;
    return [<MenuDishOptions key="main"
                table={table}
                dish={dish.code}
                onSubmit={r=>MobileWaiterApp.instance.changeCartEntry(table,entryToEdit,r)}
                ingredients={ingredientObj}
                count={entry.count}
                url={`${MobileWaiterApp.instance.startingPageURL}/${table}/cart/`}
            />,<button key="send" className="waiter-br-button delete" onClick={onClick}/>];
}



export default class MobileWaiterApp extends ListenerApp{
    nav;
    waiter;
    carts={};
    startingPageURL;
    /**
     * @type {MobileWaiterApp}
     */
    static instance;
    constructor(props){
        super(props);
        this.startingPageURL = `/dashboard/waiter/${this.placeId}`;
        MobileWaiterApp.instance = this;

        this.wsh.on("handshake-rejected",()=>{
            localStorage.removeItem("clocked-in");
            this.nav(this.startingPageURL);
        });

        this.wsh.on("waiter-disconnected",()=>{
            localStorage.removeItem("clocked-in");
            this.nav(this.startingPageURL);
        })

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
    onPaid(table){
        this.wsh.send({type:"pay",table});
        // const sess = this.placeSession.getLatestTableSession(table);
        // if(!sess)return;

        // for(let i of sess.orders)i.pay();
    }
    componentDidMount(){
        ListenerApp.prototype.componentDidMount.call(this);
        const clockIn = localStorage.getItem("clocked-in");
        if(!clockIn)return;
        try{
            const json = JSON.parse(clockIn);
            this.wsh.on("handshake-finished",()=>
                this.waiter = this.placeSession.waiters?.[json.id]
            )
        }
        catch(e){
            localStorage.removeItem("clocked-in")
            console.error("You are NOT authorized",e,clockIn);
        }
    }
    changeCartEntry(table,key,newEntry){
        this.wsh.send({type:"change-in-cart",table,key,newEntry});
    }
    addToCart(table,entry){
        this.wsh.send({type:"add-to-cart",table,entry});
    }
    removeFromCart(table,key){
        this.wsh.send({type:"remove-from-cart",table,key});
    }
    cancelOrder(table){
        this.wsh.send({type:"cancel-order",table});
        this.forceUpdate();
    }
    sendOrder(table){
        this.wsh.send({type:"send-order",table});
        this.forceUpdate();
    }
    selectTableByCode(code){
        if(code)this.nav(`${this.startingPageURL}/${code}`);
    }
    _DishPage(){
        const {dish,category,table} = useParams();
        return  <MenuDishOptions 
                    dish={dish}
                    category={category}
                    table={table}
                    onSubmit={entry=>MobileWaiterApp.instance.addToCart(table,entry)}
                />
    }
    _CategoryPage(){
        const {table,category} = useParams();
        return <Routes>
            <Route path="" element={<MenuDishSelector table={table} category={category}/>}/>
            <Route path=":dish/*" element={<MobileWaiterApp.instance._DishPage/>}/>
        </Routes>
    }
    _CartPage(){
        const {table} = useParams();
        return <CartPage table={table}/>;
    }
    _CartEditPage(){
        const {entryToEdit,table} = useParams();
        return <CartEditPage table={table} entryToEdit={entryToEdit}/>
    }
    _PaymentPage(){
        const {table} = useParams();
        return <PaymentPage table={table}/>;
    }
    _AutoRedirect({url}){
        const nav = useNavigate();
        useEffect(()=>nav(url),[]);
    }
    _Starting(){
        return <Overview/>;
    }
    _TablePage(){
        const {table} = useParams();
        return <Routes>
            <Route path="order/:category/*" element={<MobileWaiterApp.instance._CategoryPage/>}/>
            <Route path="order" element={<MenuCategorySelector table={table}/>}/>
            <Route path="cart" element={<MobileWaiterApp.instance._CartPage/>}/>
            <Route path="cart/:entryToEdit" element={<MobileWaiterApp.instance._CartEditPage/>}/>
            <Route path="pay" element={<MobileWaiterApp.instance._PaymentPage/>}/>
            <Route path="" element={<TableOptionsPage table={table}/>}/>
            <Route path="*" element={<MobileWaiterApp.instance._AutoRedirect url={MobileWaiterApp.instance.startingPageURL+"/"+table}/>}/>
        </Routes>
    }
    _Router({_this}){
        useEffect(()=>{
            const waiter = MobileWaiterApp.instance.placeSession.waiters[_this.waiter?.id];
            window.topbar.setTitle("Συνδεδεμένος ως "+(waiter?.title||"admin"));
        });
        
        useEffect(()=>()=>window.topbar.setTitle(""),[]);
        _this.nav = useNavigate();

        return <Routes>
            <Route path="layout" element={<LayoutPage layout={_this.layoutSVG}/>}/>
            <Route path="self" element={<ProfilePage/>}/>
            <Route path=":table/*" element={<_this._TablePage/>}/>
            <Route path="" element={<_this._Starting/>}/>
        </Routes>
    }
    render(){
        return <this._Router _this={this}/>
    }
}

window.MobileWaiterApp = MobileWaiterApp;