import React, { useState } from "react";
import OwnerApp from "../owner/OwnerApp";
import Dashboard from "./Dashboard";
import DashboardTab from "./DashboardTab";
import { API } from "../common/functions";
import { PriceInput } from "../common/Form";

function TitleInput({title,className,onBeforeChange,onChange,onBlur,placeholder}){
    return <input className={className} placeholder={placeholder}
    onChange={e=>{
        e.target.value = e.target.value.trimStart().replaceAll(/ +/g," ");
        if(onChange)onChange(e);
    }} 
    onBeforeInput={onBeforeChange}
    onBlur={e=>{
        e.target.value=e.target.value.trim().replaceAll(/ +/g," ");
        if(onBlur)onBlur(e);
    }} 
    defaultValue={title}/>
}

function IngredientAdder({dish}){
    const [title,setName] = useState("");
    function save(){
        console.log(title);
        DashboardMenuDishesTab.instance.createIngredient(dish,{title});
        OwnerApp.instance.popup(false)
    }
    return <div className="dish-adder-popup">
        <div className="title">Νέο υλικό</div>
        <div>
            <br/>
            <input placeholder="Όνομα υλικού" onChange={e=>setName(e.target.value)}/>
        </div>
        <div>
            <button onClick={save}>Προσθήκη</button>
            <button onClick={()=>OwnerApp.instance.popup(false)}>Close</button>
        </div>
    </div>
}

class DishAdder extends React.Component{
    codeValue="";
    titleValue="";
    priceValue=0;
    constructor(props){
        super(props);
        this.state={error:false};
    }
    close(){
        OwnerApp.instance.popup(false)
    }
    error(r){
        console.log("POPUP: There was an error")
    }
    save(){
        DashboardMenuDishesTab.instance.createDish(this.codeValue,this.titleValue,this.priceValue).then(r=>{
            if(r)OwnerApp.instance.popup(false);
            else this.error()
        });
    }
    render(){
        return <div className="dish-adder-popup">
            <div className="title">Νέο Πιάτο</div>
            <div>
                <br/>
                <input placeholder="Κωδικός" maxLength="4" onBeforeInput={e=>this.onchange(e)} onChange={e=>this.codeValue=e.target.value}/><br/>
                <TitleInput onBlur={e=>this.titleValue=e.target.value} placeholder="Όνομα"/><br/>
                <PriceInput onChange={e=>this.priceValue=parseInt(e.target.value.replaceAll(".",""))}/><br/>
                {this.state.error?
                    <span style={{color:"red",fontSize:"0.75em"}}>{this.state.error}</span>
                :null}
            </div>
            <div>
                <button onClick={e=>this.save(e)}>Προσθήκη</button>
                <button onClick={this.close}>Close</button>
            </div>
        </div>
    }
    onchange(e){
        const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
        if(!allowedChars.includes(e.data)){
            e.preventDefault();
            this.setState({error:`Ο κωδικός πιάτου πρέπει να περιέχει μόνο λατινικούς χαρακτήρες, αριθμούς και παύλες (-). Προσπαθήσατε να γράψετε: "${e.data}"`})
        }
        else this.setState({error:false});
    }
}

class IngredientChanger extends React.Component{
    #ingredient;#dish;#categories=[];
    static formatTitle = raw=>{
        const v = raw.trim().replaceAll(/ +/g," ").toLowerCase();
        return (v[0]||"").toUpperCase()+v.slice(1);
    };
    constructor(props){
        super(props);
        this.#dish = props.dish;  

        for(let v of this.#dish.ingredients){
            if(v.title==this.props.title){
                this.#ingredient = v;
                this.state = {
                    title:v.title,
                    defaultOn:v.defaultOn,
                    category:v.category,
                    price:v.price,
                    nonRemovable:v.nonRemovable
                };
            }
            if(v.category&&!this.#categories.includes(v.category))
                this.#categories.push(v.category);
        }
    }
    simplifyTitle(raw){
        const replacementTable = {
            "ά":"α",
            "έ":"ε",
            "ί":"ι",
            "ό":"ο",
            "ύ":"υ",
            "ώ":"ω"
        };
        let f = IngredientChanger.formatTitle(raw);
        for(let i of Object.keys(replacementTable))
            f = f.replaceAll(i,replacementTable[i]);

        return f;
    }
    compareTitles(a,b){
        return this.simplifyTitle(a)==this.simplifyTitle(b);
    }
    componentDidMount(){console.log(this.#categories)

    }
    delete(){
        const arr = this.#dish.ingredients;
        for(let i in arr)
        if(arr[i].title==this.state.title){
            arr.splice(i,1);
            this.#dish.changed = true;
            OwnerApp.instance.popup(false);
        }
    }
    save(){
        const i = this.#ingredient;
        const v = this.state;

        if(i.title.length<3)return 1;
        for(let t of this.#dish.ingredients)
            if(t!==i&&this.compareTitles(t.title,v.title))return 2;

        i.title = v.title;
        i.category = v.category;
        if(v.nonRemovable)i.nonRemovable = true;
        else{
            i.price = v.price;
            i.defaultOn = !!v.defaultOn;
        }
        delete i.removable;
        if(!i.category)delete i.category;
        if(!i.price)delete i.price;
        if(!i.defaultOn)delete i.defaultOn;
        if(!this.#dish.changed)this.#dish.changed=true;
        return false;
    }
    trySaveAndClose(){
        const s = this.save();
        if(s)return console.log("Issue: ",s);
        OwnerApp.instance.popup(false);
    }
    render(){
        return <div className="dish-adder-popup">
            <h2 style={{textAlign:"center"}}>Επεξεργασία υλικού</h2>
            <div>
            <table>
            <tbody>
                <tr>
                    <td style={{width:"300px"}} title="Το όνομα με το οποίο θα εμφανίζεται το συγκεκριμένο υλικό. Αυτόματη εναλλαγή πεζών/κεφαλαίων">Όνομα:</td>
                    <td style={{width:"200px"}}>
                        <input 
                            defaultValue={this.state.title} 
                            onChange={e=>this.setState({title: IngredientChanger.formatTitle(e.target.value)})}
                            onBlur={e=>e.target.value = IngredientChanger.formatTitle(e.target.value)}
                        />
                    </td>
                </tr>
                <tr>
                    <td title="Εάν ο χρήστης έχει την επιλογή να αφαιρέσει/προσθέσει το συγκεκριμένο υλικό">Αφαιρέσιμο</td>
                    <td>
                        <input type="checkbox" defaultChecked={!this.state.nonRemovable} onChange={e=>this.setState({nonRemovable:!e.target.checked})}/>
                    </td>
                </tr>
                {this.state.nonRemovable?null:
                <tr key={0}>
                    <td title="Εάν το συκγεκριμένο υλικό συμπεριλαμβάνεται στην παραγγελία χωρίς την παρέμβαση του χρήστη">Ενεργό από προεπιλογή (?):</td>
                    <td>
                        <input type="checkbox" defaultChecked={this.state.defaultOn} onChange={e=>this.setState({defaultOn:e.target.checked})}/>
                    </td>
                </tr>
                }
                {(this.state.nonRemovable||this.state.defaultOn)?null:<tr key={1}>
                    <td title="Έξτρα χρέωση ανα μονάδα προϊόντος εάν προστεθεί το συγκεκριμένο υλικό">Τιμή (αν προστεθεί):</td>
                    <td>
                        <div className="input-container">
                            <PriceInput className="seamless" price={this.state.price} onValueChanged={price=>this.setState({price})}/>
                            <div>€</div>
                        </div>
                    </td>
                </tr>
                }
            </tbody>
            </table>
            </div>
            <hr/>
            <div style={{display:"flex"}}>
                <button className="green-wide-button" onClick={()=>this.trySaveAndClose()}>OK</button>
                <button className="ingredient-delete-button" onClick={()=>this.delete()}>Διαγραφή</button>
            </div>
        </div>
    }
}

function IngredientSpan({dish,title}){
    return <span className="ingredient-span" onClick={()=>OwnerApp.instance.popup(<IngredientChanger dish={dish} title={title}/>)}>{(title[0]||"").toUpperCase()+title.slice(1)}</span>
}

export class DishComponent extends React.Component{
    static instances={};
    constructor(props){
        super(props);
        this.dish = props.dish;

        DishComponent.instances[props.code]=this;
        //this.state=({code,title,price,ingredients,last});
    }
    export(){
        return {code:this.code,title:this.title,price:this.price};
    }
    render(){
        return <div className="scrolltable-row">
            <div style={{padding:"7px"}} onClick={()=>DashboardMenuDishesTab.instance.deleteDish(this.dish.code)}>
                <img src="/delete.svg"/>
            </div>
            <div>{this.dish.code}</div>
            <div>
                <TitleInput className="seamless" title={this.dish.title} 
                onChange={e=>{
                    if(!this.dish.changed)this.dish.changed = true;
                    e.target.parentElement.style.backgroundColor = (e.target.value.trim()!==e.target.defaultValue)?"#ffe":""
                }} 
                onBlur={e=>this.dish.title=e.target.value} placeholder="Όνομα"/>
            </div>
            <div className="input-container">
                    <PriceInput className="seamless" price={this.dish.price} 
                    onChange={e=>{
                        if(!this.dish.changed)this.dish.changed = true;
                        e.target.parentElement.style.backgroundColor = (e.target.value!==e.target.defaultValue)?"#ffe":""
                    }}
                    onBlur={e=>this.dish.price=parseInt(e.target.value.replaceAll(".",""))}
                    />
                <div>€</div>
            </div>
            <div style={{display:"flex",gap:"2px",flexWrap:"wrap"}}>
                {this.dish.ingredients.map((r,i)=><IngredientSpan dish={this.dish} title={r.title} key={i}/>)}
                <span className="ingredient-span add" onClick={()=>OwnerApp.instance.popup(<IngredientAdder dish={this.dish.code}/>)}>+</span>
            </div>
        </div>
    }
}

export default class DashboardMenuDishesTab extends DashboardTab{
    static instance;
    dishList;
    constructor(props){
        super(props);
        this.state = {};
        if(!Dashboard.dishesPromise){
            Dashboard.dishesPromise = 
            API(`/dashboard/${this.place.id}/dish-list`);
        }
        DashboardMenuDishesTab.instance=this;

        Dashboard.dishesPromise.then(r=>{
            //Copy the state and save it as initial
            this.initialState = r.data.map(dish=>{return{...dish}});

            //Set current state
            const dishes = {};
            for(let i of r.data)dishes[i.code]=i;
            this.setState({dishes})
        });
    }
    createDish(code,title,price){
        const dish = {code,title,price,ingredients:[]};
        return API(`/dashboard/${Dashboard.instance.place.id}/menu/add-dish`,"POST",dish).then(r=>{
            if(r.success)return this.state.dishes[code]=dish;
            this.forceUpdate();
        })
    }
    deleteDish(code){
        if(!this.state.dishes[code])return;
        API(`/dashboard/${Dashboard.instance.place.id}/menu/delete-dish`,"POST",{code})
        .then(r=>{
            if(r.success)delete this.state.dishes[code];
            this.forceUpdate();
        });
    }
    createIngredient(dishCode,ingredient){
        this.state.dishes[dishCode].ingredients.splice(0,0,ingredient);
        this.state.dishes[dishCode].changed = true;
        this.forceUpdate();
    }
    getDishAdderRow(){
        return <div className="scrolltable-row" onClick={()=>OwnerApp.instance.popup(<DishAdder/>)}>
            <div>+</div>
            <div className="dish-adder-row"> προσθήκη νέου πιάτου</div>
        </div>
    }
    getDishList(){
        if(!this.state.dishes)return "Loading...";

        const v = Object.values(this.state.dishes);
        if(v.length<1)return <div className="scrolltable-row">
            <div style={{gridColumn:"1/5",textAlign:"center"}}>Δεν υπάρχουν πιάτα</div>
        </div>
        return v.map(d=>
            <DishComponent key={d.code} dish={d}/>
        );
    }
    getDishTable(){
        return <div className="scrolltable dish-table" key="table">
            <div className="scrolltable-head">
                <div>Κωδικός</div>
                <div>Όνομα</div>
                <div>Τιμή</div>
                <div>Υλικά</div>
            </div>
            <div className="scrolltable-body">
                {this.getDishAdderRow()}
                {this.getDishList()}
            </div>
        </div>
    }
    submit(emulate=false){
        const changed = [];
        const list = Object.values(this.state.dishes);
        for(let i of list)
            if(i.changed){
                changed.push(i);
                delete i.changed;
            }
        
        if(emulate||changed.length<1) return console.log(changed);
        this.initialState = list.map(d=>{return {...d}});//Copy array of objects
        this.forceUpdate();

        return API(`/dashboard/${Dashboard.instance.place.id}/menu/change-dishes`,"POST",changed).then(r=>{
            if(r.success)location.reload();
        });
    }
    render(){
        return <div className="dish-list-tab">
            <div>
                <h1 style={{textAlign:"center"}}>Όλα τα πιάτα</h1>
                <hr/>
            </div>
            {this.state.dishes?this.getDishTable():<div>Φόρτωση...</div>}
            <div className="submit-footer">
                <button onClick={()=>this.submit()}>Αποθήκευση</button>
            </div>
        </div>;
    }
}
window.DashboardMenuDishesTab = DashboardMenuDishesTab;