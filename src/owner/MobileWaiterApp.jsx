import { Route, Routes, useNavigate, useParams } from "react-router";
import ListenerApp, { ListenerAppContext, useListenerApp } from "./ListenerAppBase";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { currency } from "../common/API";
import { TimeSince, unixToTimeString } from "../common/TimeComponents";
import WaiterApp from "./WaiterApp";
import { LayoutVisualizer } from "./LayoutSVG";

function MenuDishOptions({dish,category,table,onSubmit,...props}){
    const nav = useNavigate();
    const app = useListenerApp();
    const [_,redraw] = useState(0);
    const ingredients = useMemo(()=>(props.ingredients||{}),[]);
    const [count,setCount] = useState(props.count||1);
    const menu = app.menu;

    useEffect(()=>{
        for(let i of menu?.[dish]?.ingredients||[])
            if(i.defaultOn)ingredients[i.title]=true;
    },[]);

    if(!menu)return <div>Loading</div>;
    else dish = menu[dish];

    if(!props.url&&dish.category!==category)
        return nav(`${app.startingPageURL}/${table}/order/${dish.category}/${dish.code}`);

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
        nav(props.url||`${app.startingPageURL}/${table}`);
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
                <BackButton url={props.url||`${app.startingPageURL}/${table}/order/${dish.category}`}/>
            </div>
}

function MenuDishSelector({table,category}){
    const app = useListenerApp();
    const nav = useNavigate();
    return  <div style={{padding:"70px 15px"}}>
                <div className="waiter-fixed-title">
                    {category}
                </div>
                <div className="waiter-x-selector">
                    {app.menuByCategory[category].map(dish=>
                        <button key={dish.code} className="waiter-order-option-button" onClick={()=>nav(dish.code)}>{dish.title}</button>
                    )}
                    <BackButton url={`${app.startingPageURL}/${table}/order`}/>
                </div>
            </div>
}

function MenuCategorySelector({table,category}){
    const app = useListenerApp();
    const nav = useNavigate();
    return  <div style={{padding:"70px 15px"}}>
                <div className="waiter-fixed-title">
                    Κατηγορίες
                </div>
                <div className="waiter-x-selector">
                    {app.menuCategories.map(cat=>
                            <button key={cat} className="waiter-order-option-button" onClick={()=>nav(cat)}>{cat}</button>
                    )}
                    <BackButton url={`${app.startingPageURL}/${table}`}/>
                </div>
            </div>
}

function TableOptionsPage({table}){
    const app = useListenerApp();
    const nav = useNavigate();


    const sess = app.placeSession.getLatestTableSession(table);

    useSyncExternalStore(sess.subscription,()=>sess.canOrder);

    function Normal(){
        return [<div key="order">
                    <button className="waiter-order-option-button" onClick={sess.canOrder?()=>nav("order"):null}>
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
            app.cancelOrder(table);
        }

        return [<div key="order">
                    <button className="waiter-order-option-button" onClick={()=>nav("order")}>
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
                {sess.canOrder?<Normal/>:<CantOrder/>}
                <BackButton url={`${app.startingPageURL}/layout`}/>
            </div>
}

function BackButton({url}){
    const nav = useNavigate();
    return <button className="mobile-app-back-button" onClick={e=>{e.stopPropagation();nav(url);console.log("clicked ",url)}}>&lt;</button>
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


function ProfilePage(){
    const app = useListenerApp();
    const [_,redraw] = useState(0);

    useEffect(()=>window.topbar.setTitle(""))

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
    const app = useListenerApp();
    const nav = useNavigate();
    const table = app.layoutManager.selectedTable;

    useSyncExternalStore(app.subscription,()=>app.layoutManager.selectedTable);

    useEffect(()=>{
        if(!table)return;
        nav(`../${table}`);
        return ()=>app.layoutManager.selectTable(null);
    })

    return <div style={{padding:"16px"}}>
        <LayoutVisualizer app={app}/>
        <BackButton url={app.startingPageURL}/>
    </div>
}

function CartPage({table}){
    const app = useListenerApp();

    const nav = useNavigate();
    const tableSession = app.placeSession.getLatestTableSession(table);
    let cart = tableSession.cart||{};

    useSyncExternalStore(tableSession.subscription,()=>tableSession.updateCounter);

    cart = Object.keys(cart);

    const map = cart.map(key=>{
        const entry = tableSession.cart[key];
        const dish = app.menu[entry.code];
        return <button key={key} onClick={()=>nav(key.toString())} className="waiter-order-option-button">{entry.count}x {dish.title}</button>
    });

    function sendOrder(){
        app.sendOrder(table);
        nav(`${app.startingPageURL}/layout`)
    }

    return [
            <div style={{}} key="main">
                <div className="waiter-fixed-title">Καλάθι για {table}</div>
                <div style={{height:"100%",padding:"50px"}}>
                <div className="waiter-x-selector">
                    {map.length>0?map:<div style={{textAlign:"center",fontSize:"1.5em"}}>Άδειο καλάθι</div>}
                </div>
                </div>
                <BackButton url={app.startingPageURL+"/"+table}/>
            </div>,
            map.length>0?<button key="send" className="waiter-br-button send" onClick={sendOrder}/>:null
        ]
}

function OrderList({orders}){
    const app = useListenerApp();
    return orders.map((o,i)=>o?
                        <div key={i} className="waiter-summary-order">
                            <h3 style={{textAlign:"center"}}>Παραγγελία:</h3>
                            <hr/>
                            {Object.values(o.cart).map((entry,j)=>{
                                const dish = app.menu[entry.code];
                                const price = app.calculatePrice(entry);
                                return <div key={j}>
                                    {entry.count}x {dish.title} - {currency(price)}
                                </div>
                            })}
                        </div>
                    :null);
}

function PaymentPage({table}){
    const app = useListenerApp();
    const tableSession = app.placeSession.getLatestTableSession(table);
    let orders = tableSession.orders||[];

    //Calculates total
    let total = orders.reduce((currentTotal,order)=>
        order.delivered&&!order.paid?currentTotal+
            Object.values(order.cart).reduce(
                (orderTotal,entry)=>orderTotal+app.calculatePrice(entry)
            ,0)
        :currentTotal
    ,0);
    const owedOrders = [];

    for(let order of orders)if(order.delivered&&!order.paid)owedOrders.push(order);

    return <div>
        <div className="waiter-fixed-title">Λογαριασμός για {table}</div>
        <div className="waiter-summary-wrapper">
            <div className="waiter-summary-main">
                {owedOrders.length>0?
                    <OrderList orders={owedOrders}/>:
                    <div className="content-centered" style={{width:"100%",fontSize:"1.5em"}}>Καμία παραγγελία δεν οφείλεται</div>
                }
            </div>
        </div>
        <div className="waiter-fixed-bottom">
            <div style={{padding:"10px",fontSize:"1.5em"}}>Σύνολο: {currency(total)}</div>
        </div>
        {total>0?
            <button className="waiter-br-button confirm" onClick={()=>app.onPaid(table)}/>
        :null}
        <BackButton url={app.startingPageURL+"/"+table}/>
    </div>
}

function CartEditPage({entryToEdit,table}){
    const app = useListenerApp();
    const nav = useNavigate();
    if(!Number(entryToEdit)&&Number(entryToEdit)!==0)return fail();

    const tableSession = app.placeSession.getLatestTableSession(table);

    let entries,entry,dish;
    function getFailed(){
        entries = tableSession?.cart;
        if(!entries)return true;

        entry = entries[entryToEdit];
        if(!entry)return true;

        dish = app.menu[entry.code]
        if(!dish)return true;
    }

    function onClick(){
        app.removeFromCart(table,entryToEdit)
        return nav(`${app.startingPageURL}/${table}/cart/`);
    }
    const failed = getFailed();
    useEffect(()=>{
        if(failed)nav(`${app.startingPageURL}/${table}/cart/`)
    },[])

    if(failed)return null;
    console.log(entry);
    const ingredientObj = Object.fromEntries(
        entry.ingredients.map(
            ingredient=>[ingredient,true]
        )
    );
    //for(let i of entry.ingredients)ingredientObj[i]=true;
    return [<MenuDishOptions key="main"
                table={table}
                dish={dish.code}
                onSubmit={r=>app.changeCartEntry(table,entryToEdit,r)}
                ingredients={ingredientObj}
                count={entry.count}
                url={`${app.startingPageURL}/${table}/cart/`}
            />,<button key="send" className="waiter-br-button delete" onClick={onClick}/>];
}

function OrderWatchPage({tableSession}){
    const app = useListenerApp();
    const {activeOrder} = tableSession;
    const nav = useNavigate();

    const table = tableSession.table;
    const backURL = `${app.startingPageURL}/layout`;

    function deliver(){
        app.deliverOrder(table);
        nav(backURL);
    }

    return  <div style={{padding:"70px 15px"}}>
                <div className="waiter-fixed-title">
                    Τρέχουσα παραγγελία ({table})
                </div>
                <div className="waiter-x-selector">
                    <OrderList orders={[activeOrder]}/>
                    {activeOrder.accepted?
                    <button className="waiter-order-option-button" onClick={deliver}>Παραδόθηκε</button>:
                    <div style={{fontSize:"1.5em"}} className="content-centered">Αναμονή για αποδοχή από την κουζίνα</div>
                    }
                    
                </div>
                <BackButton url={backURL}/>
            </div>
}

export function MobileWaiterApp2({placeId,waiterID}){
    const app = useMemo(()=>new WaiterApp(placeId),[]);
    const [waiter,setWaiter] = useState({});
    
    useEffect(()=>{
        app.initialize();
    },[app]);

    function _DishPage(){
        const {dish,category,table} = useParams();
        return  <MenuDishOptions 
                    dish={dish}
                    category={category}
                    table={table}
                    onSubmit={entry=>app.addToCart(table,entry)}
                />
    }
    function _CategoryPage(){
        const {table,category} = useParams();
        return <Routes>
            <Route path="" element={<MenuDishSelector table={table} category={category}/>}/>
            <Route path=":dish/*" element={<_DishPage/>}/>
        </Routes>
    }
    function _CartPage(){
        const {table} = useParams();
        return <CartPage table={table}/>;
    }
    function _CartEditPage(){
        const {entryToEdit,table} = useParams();
        return <CartEditPage table={table} entryToEdit={entryToEdit}/>
    }
    function _PaymentPage(){
        const {table} = useParams();
        return <PaymentPage table={table}/>;
    }
    function _AutoRedirect({url}){
        const nav = useNavigate();
        useEffect(()=>nav(url),[]);
    }
    function _OrderPage(){
        const {table} = useParams();
        const sess = app.placeSession.getLatestTableSession(table);

        return sess?.canOrder?<MenuCategorySelector table={table}/>:<OrderWatchPage tableSession={sess}/>;
    }
    function _Starting(){
        return <Overview/>;
    }
    function TablePage(){
        const {table} = useParams();
        const nav = useNavigate();

        useSyncExternalStore(app.layoutManager.subscription,()=>app.layoutManager.updateCounter);
        const tableExists = app.layoutManager.containsTable(table);
        useEffect(()=>{
            if(!tableExists)nav(`${app.startingPageURL}/layout`);
        },[tableExists])
        if(!tableExists)return null;
        return <Routes>
            <Route path="order/:category/*" element={<_CategoryPage/>}/>
            <Route path="order" element={<_OrderPage/>}/>
            <Route path="cart" element={<_CartPage/>}/>
            <Route path="cart/:entryToEdit" element={<_CartEditPage/>}/>
            <Route path="pay" element={<_PaymentPage/>}/>
            <Route path="" element={<TableOptionsPage table={table}/>}/>
            <Route path="*" element={<_AutoRedirect url={app.startingPageURL+"/"+table}/>}/>
        </Routes>
    }

    useEffect(()=>{
        if(!app.placeSession)return;
        window.topbar.setTitle("Συνδεδεμένος ως "+(waiter?.title||"admin"));
    });
    
    useEffect(()=>{
        const clockIn = localStorage.getItem("clocked-in");
        if(!clockIn)return;
        try{
            const json = JSON.parse(clockIn);
            app.wsh.on("handshake-finished",()=>
                setWaiter(this.placeSession.waiters?.[json.id])
            )
        }
        catch(e){
            localStorage.removeItem("clocked-in")
            console.error("You are NOT authorized",e,clockIn);
        }
    },[]);

    useEffect(()=>()=>window.topbar.setTitle(""),[]);
    const nav = useNavigate();

    useSyncExternalStore(app.subscription,()=>app.isLoaded);
    useSyncExternalStore(app.subscription,()=>app.isConnected);

    if(!app.isLoaded||!app.isConnected){
        console.log("Nothing")
        return null;
    }
    console.log("Something")
    return <ListenerAppContext.Provider value={app}>
                <Routes>
                    <Route path="layout" element={<LayoutPage layout={app.layoutSVG}/>}/>
                    <Route path="self" element={<ProfilePage/>}/>
                    <Route path=":table/*" element={<TablePage/>}/>
                    <Route path="" element={<_Starting/>}/>
                </Routes>
            </ListenerAppContext.Provider>
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
    _OrderPage(){
        const {table} = useParams();
        const sess = MobileWaiterApp.instance.placeSession.getLatestTableSession(table);

        return sess?.canOrder?<MenuCategorySelector table={table}/>:<OrderWatchPage tableSession={sess}/>;
    }
    _Starting(){
        return <Overview/>;
    }
    _TablePage(){
        const {table} = useParams();
        return <Routes>
            <Route path="order/:category/*" element={<MobileWaiterApp.instance._CategoryPage/>}/>
            <Route path="order" element={<MobileWaiterApp.instance._OrderPage/>}/>
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