import { useNavigate } from "react-router";
import React, { createRef, useEffect, useRef, useState } from "react";
import UserApp, { currency } from "./MainApp";
import { PriceInput } from "../common/Form";

function TablePageHeader(){
    return <div className="table-topbar">{UserApp.instance.placeName}</div>
}
class PaymentWindow extends React.Component{
    #payPart;
    constructor(props){
        super(props);
        this.state = {total:UserApp.instance.balance,amount:1};
        UserApp.instance.tableSession.on("change",()=>{
            const total = UserApp.instance.balance;
            this.setState({
                total,
                amount:Math.max(Math.min(this.state.amount,total),0)
            })
        }); 
    }
    render(){
        const Pay = ()=>{if(this.state.total<=0)return <hr/>
            return this.#payPart;
        }
        return <div className="ask-to-pay">
                    <h1 style={{textAlign:"center"}}>Λογαριασμός</h1>
                    <hr/>
                    <div>Υπόλοιπο: {currency(this.state.total)}</div>
                    <div>
                        <div>Πληρωμή:</div>
                        <div style={{display:"flex"}}>
                            <input name="pay-amount" type="range" min={1} max={this.state.total} value={this.state.amount} onChange={e=>this.setState({amount:e.target.value})} disabled={this.state.total<=0}/>
                            <PriceInput onValueChanged={amount=>this.setState({amount})} price={this.state.amount} disabled={this.state.total<=0}/>
                        </div>
                        <hr/>
                    </div>
                    <div className="yes-no-container">
                        <button className="yes" onClick={()=>UserApp.instance.pay(this.state.amount)}>Ναι</button>
                        <button className="no" onClick={()=>UserApp.instance.popup(false)}>Όχι</button>
                    </div>
                </div>
    }
}

export class OrderHistory extends React.Component{
    #f=()=>this.forceUpdate();
    #scrollRef = createRef();
    constructor(props){
        super(props);
        this.state = {menu:undefined};
        
        
        UserApp.menuPromise.then(l=>{
            const menu = {};
            for(let i of l){
                i = {...i};
                menu[i.code] = i;
                delete i.code;
            }
            this.setState({menu});
        });
    }
    componentDidMount(){
        this.#sync();
        UserApp.instance.on("session-refresh",prev=>this.#sync(prev));

        const el = this.#scrollRef.current;
        if(el)el.scrollTo(0,el.scrollHeight);
    }
    componentDidUpdate(){
        const el = this.#scrollRef.current;
        if(el)el.scrollTo(0,el.scrollHeight);
    }
    #sync(prev){
        if(prev)prev.off("change",this.#f);
        UserApp.instance.tableSession.on("change",this.#f);
    }
    CreateOrder(data,key){
        return <div className="history-group" key={key}>
                    <div className="history-text">Παραγγελία</div>{Object.values(data.cart).map(
                (o,i)=> <div className="history-unit" key={i}>
                        <div className="history-joiner"/>
                        <div className="history-text">{o.count>1?o.count+"x ":null}{this.state.menu[o.code].title}</div>
                    </div>
                )}
                </div>
    }
    OrderHistoryUnit(data,key){
        const arr = [this.CreateOrder(data,key)];
        if(data.cancelled)arr.push(<div className="history-text" key={key+"-canc"}>Ακύρωση παραγγελίας (από προσωπικό)</div>)
        if(data.accepted)arr.push(<div className="history-text" key={key+"-acc"}>Αποδοχή παραγγελίας</div>)
        if(data.rejected)arr.push(<div className="history-text" key={key+"-rej"}>Απόρριψη παραγγελίας</div>)
        if(data.delivered)arr.push(<div className="history-text" key={key+"-del"}>Παράδοση παραγγελίας</div>)
        return arr;
    }
    render(){
        if(!this.state.menu)return <div className="history"/>
        return <div className="history">
                    <div className="history-title" style={{textAlign:"center"}}>Σύνολο: {currency(UserApp.instance.total)}</div>
                    <div className="history-contents" ref={this.#scrollRef}>
                        {UserApp.instance.tableSession.orders.map((u,i)=>this.OrderHistoryUnit(u,i))}
                    </div>
                </div>
    }
}

function Buttons(){
    const nav = useNavigate();
    const orderingOff = !UserApp.instance.canOrder;
    return  <div className="options">
                <div className={"option"+(orderingOff?"":" animating")} onClick={()=>nav("/store/menu")}>
                    {orderingOff?"Περιήγηση στον κατάλογο":"Παραγγελία"}
                </div>
                {UserApp.instance.total<=0&&UserApp.instance.tableSession.orders.length>0?
                <div className="option animating" onClick={()=>UserApp.instance.leave()}>
                    Αποχώρηση
                </div>
                :null}
            </div>
}

function ClosedTablePage(){
    return  <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Η επιχείρηση κλείνει</h1>
                    <p>Μπορείτε ακόμη να περιηγηθείτε στον κατάλογο, χωρίς να στείλετε παραγγελία</p>
                    </div>
                    <div>
                        <hr/>
                        <Buttons/>
                    </div>
                </div>
            </div>
}

function DefaultTablePage(){
    const [_,redraw] = useState(0);

    useEffect(()=>{
        const f = ()=>redraw(_+1);
        console.log(UserApp.instance.tableSession);
        UserApp.instance.tableSession.on("change",f);
        return ()=>UserApp.instance.tableSession.off("change",f);
    },[]);

    const openPaymentPopup = ()=>UserApp.instance.popup(<PaymentWindow/>);
    let destination = UserApp.instance.destination;
    return <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Τραπέζι {destination.table}</h1>
                    </div>
                    <OrderHistory/>
                    <Buttons openPaymentPopup={openPaymentPopup}/>
                </div>
            </div>
}

export default function TablePage(){console.log("update")
    const orderingOff = UserApp.instance.hasActiveOrder;
    const placeClosed = UserApp.instance.tableSession.closed;
    return placeClosed?<ClosedTablePage/>:<DefaultTablePage/>;
}