import { Route, Routes, useNavigate, useParams } from "react-router";
import ListenerApp from "./ListenerAppBase";
import { useEffect, useState } from "react";

function MenuDishOptions({dish,category,table,onSubmit,...props}){
    const nav = useNavigate();
    const [_,redraw] = useState(0);
    const [count,setCount] = useState(props.count||1);
    const [ingredients] = useState(props.ingredients||{});
    const menu = MobileWaiterApp.instance.menu;

    if(!menu)return <div>Loading</div>;
    else dish = menu[dish];

    if(!props.url&&dish.category!==category)
        return nav(`${MobileWaiterApp.instance.startingPageURL}/${table}/order/${dish.category}/${dish.code}`);

    console.log(ingredients);
    function toggleIngredient(title){console.log(title)
        if(ingredients[title])delete ingredients[title];
        else ingredients[title] = true;
        console.log(ingredients[title])
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
                <div className=" waiter-dishopts-add-to-cart">
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
    return  <div style={{padding:"15px"}}>
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
    return  <div style={{padding:"15px"}}>
                <div className="waiter-x-selector">
                    {MobileWaiterApp.instance.menuCategories.map(cat=>
                            <button key={cat} className="waiter-order-option-button" onClick={()=>nav(cat)}>{cat}</button>
                    )}
                    <BackButton url={`${MobileWaiterApp.instance.startingPageURL}/${table}`}/>
                </div>
            </div>
}

function TableOptionsPage({table}){
    const nav = useNavigate();
    const canOrder = MobileWaiterApp.instance.placeSession.getLatestTableSession(table)?.canOrder;
    return <div className="waiter-table-options">
        <div>
            <button className={canOrder?"green-wide-button":"auto-detect-button"} onClick={canOrder?()=>nav("order"):null}>
                Προσθήκη
            </button>
        </div>
        <div>
            <button className="green-wide-button" onClick={()=>nav("cart")}>
                Καλάθι
            </button>
        </div>
        <div>
            <button className="green-wide-button" onClick={()=>nav("pay")}>
                Εξόφληση λογαριασμού
            </button>
        </div>
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
                <button style={{width:"100%",height:"100%"}} className="green-wide-button" onClick={()=>nav("layout")}></button>
            </div>
            <div style={{padding:"18px"}}>
                <button style={{width:"100%",height:"100%"}} className="delete-button" onClick={()=>nav("self")}></button>
            </div>
        </div>
}

function SelfPage(){
    return <div>
        <h2>Προφιλ: Θανάσης Μπαρτζώκας</h2>
        <div>

        </div>
        <BackButton url={MobileWaiterApp.instance.startingPageURL}/>
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
                    {map.length>0?map:<div style={{textAlign:"center"}}>Άδειο καλάθι</div>}
                </div>
                </div>
                <BackButton url={MobileWaiterApp.instance.startingPageURL+"/"+table}/>
            </div>,
            map.length>0?<button key="send" className="waiter-br-button" onClick={sendOrder}/>:null
        ]
}

function PaymentPage({table}){
    return <div>
        <div>Λογαριασμός για {table}</div>
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


    const ingredientObj = {};
    for(let i of entry.ingredients)ingredientObj[i]=true;
    return <MenuDishOptions
                table={table}
                dish={dish.code}
                onSubmit={r=>MobileWaiterApp.instance.changeCartEntry(table,entryToEdit,r)}
                ingredients={ingredientObj}
                count={entry.count}
                url={`${MobileWaiterApp.instance.startingPageURL}/${table}/cart/`}
            />;
}

export default class MobileWaiterApp extends ListenerApp{
    nav;
    carts={};
    placeId;
    startingPageURL;
    /**
     * @type {MobileWaiterApp}
     */
    static instance;
    constructor(props){
        super(props);
        this.placeId = props.placeId;
        this.startingPageURL = `/dashboard/waiter/${this.placeId}`;
        MobileWaiterApp.instance = this;
        //ListenerApp.menuPromise.then(()=>this.forceUpdate());
    }
    changeCartEntry(table,key,newEntry){
        this.wsh.send({type:"change-in-cart",table,key,newEntry});
    }
    addToCart(table,entry){
        this.wsh.send({type:"add-to-cart",table,entry});
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
    render(){
        return <Routes>
            <Route path="layout" element={<LayoutPage layout={this.layoutSVG}/>}/>
            <Route path="self" element={<SelfPage/>}/>
            <Route path=":table/*" element={<this._TablePage/>}/>
            <Route path="" element={<Overview/>}/>
        </Routes>
    }
}

window.MobileWaiterApp = MobileWaiterApp;