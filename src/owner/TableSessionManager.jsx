import { useEffect, useState, useSyncExternalStore } from "react";
import { useListenerApp } from "./ListenerAppBase";

function OrderOverviewDish({dish}){
    return  <div className="order-overview-dish" style={{"--cc":Math.min(5,Math.ceil(dish.ingredients.length/5))}}>
                <div className="title">{dish.count}x {dish.title}</div>
                <hr/>
                {dish.ingredients.length>0?
                <ul>
                    {dish.ingredients.map((r,i)=>
                        <li className="dish-ingredient" key={i}>{r[0].toUpperCase()+r.slice(1)}</li>
                    )}
                </ul>
                :<div className="comment empty" style={{margin:"25px 0"}}>Καμία τροποίηση</div>}
                <hr/>
                {dish.info?.comments?<div className="comment">Σχόλια: {dish.info.comments}</div>:<div className="comment empty">Κανένα σχόλιο</div>}
            </div>
}

function OrderButtons({order}){
    const app = useListenerApp();
    
    useSyncExternalStore(order.subscription,()=>order.updateCounter);

    const btn = order=>{
        if(order.delivered)return <div className="order-complete">Ολοκληρώθηκε</div>;
        if(order.rejected)return <button className="order-reject">Απορρίφθηκε από την κουζίνα</button>;
        if(order.accepted)return <button className="order-deliver" onClick={()=>app.deliverOrder(order.session.table)}>Παράδοση παραγγελίας</button>;
        else return [
                <button className="order-accept" onClick={()=>app.acceptOrder(order.session.table)} key="acc">Αποδοχή</button>,
                <button className="order-reject" onClick={()=>app.rejectOrder(order.session.table)} key="rej">Απόρριψη</button>
            ];
    }
    return <div className="order-overview-bottom">{btn(order)}</div>;
}

function OrderViewer({order, menu}){
    const cart = Object.values(order?.cart||{});
    if(!Array.isArray(cart)||cart.length<=0)return <div className="order-overview empty"></div>
    return <div className="order-overview">
        <div className="order-overview-main">
            {cart.map((r,i)=>
                <OrderOverviewDish key={i} dish={{...menu[r.code],...r}}/>
            )}
        </div>
        <OrderButtons order={order}/>
    </div>;
}
/**
 * 
 * @param {Date} date 
 * @returns 
 */
function timeString(date){
    const n = i=>i>=10?i:`0${i}`;
    return `${date.getHours()}:${n(date.getMinutes())}.${n(date.getSeconds())}`;
}
function OrderHistoryOverview({tableSession,setOrder}){
    const orderList = tableSession.orders.toReversed();
    const {table} = tableSession;

    useSyncExternalStore(tableSession.subscription,()=>tableSession.orders.length);

    return  <div className="order-history-container">
                {
                    tableSession.orders?.length>0?
                    orderList.map((r,i)=>
                        <div key={i} 
                            className={"history-order"+(!r.accepted&&!r.rejected&&!r.delivered?" pending-order":"")} 
                            onClick={()=>setOrder(r)}
                        >
                            {table}-{orderList.length-i} ({timeString(r.time)})
                        </div>
                    ):
                    <div className="no-orders content-centered">Καμία παραγγελία</div>
                }
            </div>
}
export default function TableSessionManager(){
    const app = useListenerApp();
    const [order, setOrder] = useState(null);

    const table = app.selectedTable;

    useSyncExternalStore(app.subscription,()=>app.selectedTable);
    useEffect(()=>setOrder(null),[table]);

    if(!table)return <div className="no-orders content-centered">Πατήστε πάνω σε ένα τραπέζι για να δείτε τις παραγγελίες του</div>;

    const sess = app.placeSession.getLatestTableSession(table);
    return <div className="table-session-viewer">
        <div className="left">
            <h2>Τραπέζι {table}</h2>
            <OrderHistoryOverview tableSession={sess} setOrder={setOrder}/>
            <div className="bottom content-centered">
                Συνδέσεις: {sess.connects}
            </div>
        </div>
        {order?<OrderViewer menu={app.menu} order={order}/>:null}
    </div>;
}