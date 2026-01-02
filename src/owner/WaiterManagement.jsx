import React, { useState } from "react";
import ListenerApp from "./ListenerAppBase";
import OwnerApp3 from "./App3";

function HideablePin({ pin }) {
  const [visible, setVisible] = useState(true);

  return (
    <span
      onClick={() => setVisible(v => !v)}
      style={{
        backgroundColor: '#ccc',
        color: '#000',
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: '3px',
        fontFamily: 'monospace',
        fontSize:"1.25em",
        textAlign:"center",
        userSelect: "none",
        whiteSpace:"nowrap"
      }}
      title={`Κάνετε κλικ για να ${visible?"κρύψετε":"δείτε"} το PIN`}
    >
      {visible?pin:"- - -"}
    </span>
  )
}

function RerollPin({id}){
    return <button style={{
        background: "#ddd",
        borderRadius: "3px",
        textAlign: "center",
        userSelect:"none",
        border:"none",
        cursor:"pointer"
    }} 
    className="content-centered" 
    title="Κάνετε κλικ για να αλλάξετε το PIN"
    onClick={()=>WaiterManager.instance.rerollPin(id)}>
        ~
    </button>;
}

function PinDisplay({id,pin}){
    return  <div style={{
                display:"grid",
                gridTemplateColumns:"1fr 25px",
                height:"25px",
                gap:"5px"
            }}>
                <HideablePin pin={pin}/>
                <RerollPin id={id}/>
            </div>
}

class WaiterWidget extends React.Component{
    self;
    constructor(props){
        super(props);
        this.self=props.self;
        this.state = {
            title:this.self.title,
            pin:this.self.pin
        }
    }
    #f=()=>this.setState({
        title:this.self.title,
        pin:this.self.pin
    });
    componentDidMount(){
        this.self.on("change",this.#f);
    }
    componentWillUnmount(){
        this.self.off("change",this.#f);
    }
    setName(title){
        ListenerApp.instance.wsh.send({
            type:"set-waiter",
            id:this.self.id,
            title
        });
    }
    //Has errors but I assume proper input
    pinToString(pin){
        const PIN_LENGTH = 6;
        return "0".repeat(PIN_LENGTH-pin.length)+pin;
    }
    render(){
        if(this.state.title==false)
            return <div className="waiter-instance">
                <button className="green-wide-button" onClick={()=>this.setName(`Υπάλληλος ${Math.floor(this.self.id)+1}`)}>+</button>
            </div>
        return <div className="waiter-instance">
                <div>Όνομα:</div>
                <input type="text" defaultValue={this.state.title} onBlur={e=>this.setName(e.target.value)}/>
                <div>PIN:</div>
                <PinDisplay id={this.self.id} pin={this.state.pin}/>
                <button className="delete" onClick={()=>this.setName(false)}/>
        </div>
    }
}

export default class WaiterManager extends React.Component{
    static instance;
    constructor(props){
        super(props);
        const app = ListenerApp.instance;
        WaiterManager.instance = this;
        this.state = {
            waiters:app.placeSession.waiters
        }
        app.on("session-refresh",sess=>{
            this.setState({waiters:sess.waiters})
        });
    }
    #canReroll=true;
    rerollPin(id){
        if(!this.#canReroll)return;
        if(!this.state.waiters[id])return;
        this.#canReroll = false;
        setTimeout(()=>this.#canReroll=true,2000);
        return ListenerApp.instance.wsh.send({type:"reroll-waiter-pin",id});
    }
    render(){
        const waiterList = Object.values(this.state.waiters);
        return  <div className="waiter-mgmt-page">
                    <div>
                        <h2 style={{textAlign:"center"}} key="title">Προσωπικό</h2>
                        <hr/>
                    </div>
                    <div className="waiter-list" key="list">
                        {waiterList.map((w,i)=>
                            <WaiterWidget self={w} key={i}/>
                        )}
                    </div>
                    <div className="waiters-bottom">
                        <hr/>
                        &nbsp;Μέγιστο: {waiterList.length}
                    </div>
                </div>
    }
}