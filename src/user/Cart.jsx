import Topbar from "./Topbar.jsx";
import { useSyncExternalStore } from "react";
import OrderPreview from "./OrderPreview.jsx";
import { currency, useApp } from "./MainApp.jsx";
import IngredientSelector from "./IngredientSelector.jsx";
import UserApp from "./UserApp.js";

function OrderItem({entryKey,editFn}){
    const {app} = useApp();
    const entry = app.cart[entryKey];
    const dish = app.menu[entry.code];
    console.log("Item update",dish.title)
    useSyncExternalStore(app.subscription,()=>app.cart[entryKey]);

    const edit = ()=>app.editEntry(app.cart[entryKey],newEntry=>app.changeInCart(entryKey,newEntry));
    return (
        <div className="menu-item">
            <div className="item-title">
                <div>
                    {dish.title}
                    <span style={{fontSize:"0.75em"}}>{entry.count>1?` (x${entry.count})`:""}</span>
                </div>
                <div>
                    <button className="info" onClick={edit}>i</button>
                    <button className="remove" onClick={()=>app.removeFromCart(entryKey)}>-</button>
                </div>
            </div>
            <hr/>
            <div className="item-details">
                <div className="item-ingredients">{
                    entry.ingredients.join(", ")
                }</div>
                <div className="price-tag">
                    {currency(app.calculatePrice(entry))}
                </div>
            </div>
        </div>
    )
}
function OrderList({editFn}){
    const {app} = useApp();
    const cartKeys = Object.keys(app.cart);
    
    useSyncExternalStore(app.subscription,()=>app.cart);

    return (
        <div className="item-list">{
            cartKeys.length<=0?
            "Άδειο καλάθι":
            cartKeys.map(key=>
                <OrderItem key={key} entryKey={key} editFn={editFn}/>
            )
        }</div>
    )
}

export default function CartPage(){
    function edit(key){
        IngredientSelector.instance.open(UserApp.instance.tableSession.cart[key]);
    }
    return (
        <div className="content cart-page">
            <Topbar previous="../menu"/>
            <div className="cart-grid">
                <div className="order-title" style={{borderBottom: "1px solid black"}}>Καλάθι</div>
                <OrderList menu={UserApp.instance.menu} editFn={edit}/>
                
                <OrderPreview cartMode/>
                <IngredientSelector buttonText="Αποθήκευση" onSubmit={e=>this.editFinished(e)}/>
            </div>
        </div>
    )
}