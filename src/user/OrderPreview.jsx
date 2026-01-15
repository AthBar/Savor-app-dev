import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { currency, useApp } from "./MainApp";

export function MyOrderSendButton({inCart}){
    const {app} = useApp();
    const nav = useNavigate();
    const disabled = Object.keys(app.cart).length<=0||app.hasActiveOrder;
    const next = disabled?"/store/menu":(inCart?"/store":"/store/cart");
    const text = disabled?"Πίσω":(inCart?`Αποστολή στο τραπέζι ${app.tableSession.table}`:"Συνέχεια");

    function onClick(){
        nav(next);
        if(disabled)return;
        if(inCart)app.sendOrder();
        if(!inCart)return nav("/store/cart");
    }

    return <button className={"green-wide-button"+(disabled?" disabled":"")} onClick={onClick}>
                {text}
            </button>
}

export default function OrderPreview({cartMode}){
    const {app} = useApp();
    const cartKeys = Object.keys(app.cart);

    useSyncExternalStore(
        app.subscription,
        cartMode?()=>app.cartTotal:()=>app.total
    );

    const text = cartMode?"Σύνολο":cartKeys.length+" αντικείμενα";
    return <div className="order-sender">
        <div className="item-details">
            <div className="cart-total">{text}</div>
            <div className="price-tag">{currency(app.cartTotal)}</div>
        </div>
        <MyOrderSendButton inCart={cartMode}/>
    </div>
}