import React, { createContext, useContext, useEffect, useState } from "react";
import OwnerApp from "../owner/OwnerApp";
import Dashboard, { useDashboard } from "./Dashboard";
import DashboardTab from "./DashboardTab";
import { API } from "../common/API";
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

function IngredientAdder({dish,createIngredient}){
    const [title,setName] = useState("");
    function save(){
        createIngredient({title});
        OwnerApp.instance.popup(false);
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

function DishAdder({submit}){
    const [codeValue,setCode]=useState("");
    const [titleValue,setTitle]=useState("");
    const [priceValue,setPrice]=useState(0);
    const [error,setError]=useState(false);
    
    function _close(){
        OwnerApp.instance.popup(false);
    }
    function _error(r){
        setError(r);
        console.log("POPUP: There was an error")
    }
    const {createDish} = useDishTab();
    function _save(){
        createDish(this.codeValue,this.titleValue,this.priceValue).then(r=>{
            if(r) _close();
            else _error(JSON.stringify(r))
        });
    }
    function onchange(e){
        const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
        if(!allowedChars.includes(e.data)){
            e.preventDefault();
            this.setState({error:`Ο κωδικός πιάτου πρέπει να περιέχει μόνο λατινικούς χαρακτήρες, αριθμούς και παύλες (-). Προσπαθήσατε να γράψετε: "${e.data}"`})
        }
        else this.setState({error:false});
    }

    return <div className="dish-adder-popup">
        <div className="title">Νέο Πιάτο</div>
        <div>
            <br/>
            <input placeholder="Κωδικός" maxLength="4" onBeforeInput={e=>this.onchange(e)} onChange={e=>this.codeValue=e.target.value}/><br/>
            <TitleInput onBlur={e=>setTitle(e.target.value)} placeholder="Όνομα"/><br/>
            <PriceInput onChange={e=>setPrice(parseInt(e.target.value.replaceAll(".","")))}/><br/>
            {error?
                <span style={{color:"red",fontSize:"0.75em"}}>{error}</span>
            :null}
        </div>
        <div>
            <button onClick={_save}>Προσθήκη</button>
            <button onClick={_close}>Close</button>
        </div>
    </div>
}
function formatIngredientTitle(raw){
    const v = raw.trim().replaceAll(/ +/g," ").toLowerCase();
    return (v[0]||"").toUpperCase()+v.slice(1);
};
function IngredientChanger({title:_title,dish,deleteSelf}){
    let _ingredient = null;
    for(let v of dish.ingredients){
        if(v.title==_title){
            _ingredient = v;
        }
    }

    const [ingredient,setIngredient] = useState(_ingredient);
    const [title,setTitle] = useState(_ingredient?.title);
    const [defaultOn,setDefaultOn] = useState(_ingredient?.defaultOn);
    const [category,setCategory] = useState(_ingredient?.category);
    const [price,setPrice] = useState(_ingredient?.price);
    const [nonRemovable,setNonRemovable] = useState(_ingredient?.nonRemovable);

    function simplifyTitle(raw){
        const replacementTable = {
            "ά":"α",
            "έ":"ε",
            "ί":"ι",
            "ό":"ο",
            "ύ":"υ",
            "ώ":"ω"
        };
        let f = formatIngredientTitle(raw);
        for(let i of Object.keys(replacementTable))
            f = f.replaceAll(i,replacementTable[i]);

        return f;
    }
    function compareTitles(a,b){
        return simplifyTitle(a)==simplifyTitle(b);
    }
    function exportSelf(){
        const i = ingredient;

        if(i.title.length<3)return 1;
        //for(let t of dish.ingredients)
            //if(t!==i&&compareTitles(t.title,v.title))return 2;

        i.title = title;
        i.category = category;
        if(nonRemovable)i.nonRemovable = true;
        else{
            i.price = price;
            i.defaultOn = !!defaultOn;
        }
        delete i.removable;
        if(!i.category)delete i.category;
        if(!i.price)delete i.price;
        if(!i.defaultOn)delete i.defaultOn;
        if(!dish.changed)dish.changed=true;
        return false;
    }
    function trySaveAndClose(){
        const s = exportSelf();
        if(s)return console.log("Issue: ",s);
        OwnerApp.instance.popup(false);
    }
    function _save(){
        trySaveAndClose();
    }
    function _delete(){
        deleteSelf();
        OwnerApp.instance.popup(false);
    }
    return <div className="dish-adder-popup">
        <h2 style={{textAlign:"center"}}>Επεξεργασία υλικού</h2>
        <div>
        <table>
        <tbody>
            <tr>
                <td style={{width:"300px"}} title="Το όνομα με το οποίο θα εμφανίζεται το συγκεκριμένο υλικό. Αυτόματη εναλλαγή πεζών/κεφαλαίων">Όνομα:</td>
                <td style={{width:"200px"}}>
                    <input 
                        value={title}
                        onChange={e=>setTitle(formatIngredientTitle(e.target.value))}
                    />
                </td>
            </tr>
            <tr>
                <td title="Εάν ο χρήστης έχει την επιλογή να αφαιρέσει/προσθέσει το συγκεκριμένο υλικό">Αφαιρέσιμο</td>
                <td>
                    <input type="checkbox" checked={!nonRemovable} onChange={e=>setNonRemovable(!e.target.checked)}/>
                </td>
            </tr>
            {nonRemovable?null:
            <tr key={0}>
                <td title="Εάν το συκγεκριμένο υλικό συμπεριλαμβάνεται στην παραγγελία χωρίς την παρέμβαση του χρήστη">Ενεργό από προεπιλογή (?):</td>
                <td>
                    <input type="checkbox" checked={defaultOn} onChange={e=>setDefaultOn(e.target.checked)}/>
                </td>
            </tr>
            }
            {(nonRemovable||defaultOn)?null:<tr key={1}>
                <td title="Έξτρα χρέωση ανα μονάδα προϊόντος εάν προστεθεί το συγκεκριμένο υλικό">Τιμή (αν προστεθεί):</td>
                <td>
                    <div className="input-container">
                        <PriceInput className="seamless" price={price} onValueChanged={setPrice}/>
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
            <button className="green-wide-button" onClick={_save}>OK</button>
            <button className="delete-button" onClick={_delete}>Διαγραφή</button>
        </div>
    </div>
}

function createIngredient(dishCode,ingredient){
    dishes[dishCode].ingredients.splice(0,0,ingredient);
    dishes[dishCode].changed = true;
    redraw();
}

export function DishComponent({dish,deleteSelf}){
    const [ingredients,setIngredients] = useState(dish.ingredients);
    
    useEffect(()=>{
        
        dish.changed = true;
    },[ingredients]);

    function createIngredient(ingredient){
        const newIngredientList = [ingredient,...ingredients];
        setIngredients(newIngredientList);
        dish.ingredients = newIngredientList;
    }
    function deleteIngredient(title){
        for(let i of ingredients)
            if(i.title==title)
                ingredients.splice(i,1);
        

        setIngredients([...ingredients]);
    }
    function IngredientSpan({title}){
        return <span 
        className="ingredient-span" 
        onClick={()=>
            OwnerApp.instance.popup(
                <IngredientChanger dish={dish} title={title} deleteSelf={()=>deleteIngredient(title)}/>
            )
        }>{
            (title[0]||"").toUpperCase()+title.slice(1)
        }</span>
    }
    return <div className="scrolltable-row">
        <div style={{padding:"7px"}} onClick={()=>deleteSelf()}>
            <img src="/delete.svg"/>
        </div>
        <div>{dish.code}</div>
        <div>
            <TitleInput className="seamless" title={dish.title} 
            onChange={e=>{
                if(!dish.changed)dish.changed = true;
                e.target.parentElement.style.backgroundColor = (e.target.value.trim()!==e.target.defaultValue)?"#ffe":""
            }} 
            onBlur={e=>dish.title=e.target.value} placeholder="Όνομα"/>
        </div>
        <div className="input-container">
                <PriceInput className="seamless" price={dish.price} 
                onChange={e=>{
                    if(!dish.changed)dish.changed = true;
                    e.target.parentElement.style.backgroundColor = (e.target.value!==e.target.defaultValue)?"#ffe":""
                }}
                onBlur={e=>dish.price=parseInt(e.target.value.replaceAll(".",""))}
                />
            <div>€</div>
        </div>
        <div style={{display:"flex",gap:"2px",flexWrap:"wrap"}}>
            {ingredients.map((r,i)=><IngredientSpan dish={dish} title={r.title} key={i}/>)}
            <span className="ingredient-span add" onClick={()=>OwnerApp.instance.popup(<IngredientAdder dish={dish.code} createIngredient={createIngredient}/>)}>+</span>
        </div>
    </div>
}

function DishTable({dishes}){
    function DishList(){
        if(!dishes)return "Loading...";

        const v = Object.values(dishes);
        if(v.length<=0)return <div className="scrolltable-row">
            <div style={{gridColumn:"1/5",textAlign:"center"}}>Δεν υπάρχουν πιάτα</div>
        </div>
        return v.map(d=>
            <DishComponent key={d.code} dish={d}/>
        );
    }
    return <div className="scrolltable dish-table" key="table">
        <div className="scrolltable-head">
            <div>Κωδικός</div>
            <div>Όνομα</div>
            <div>Τιμή</div>
            <div>Υλικά</div>
        </div>
        <div className="scrolltable-body">
            <div className="scrolltable-row" onClick={()=>OwnerApp.instance.popup(<DishAdder/>)}>
                <div>+</div>
                <div className="dish-adder-row"> προσθήκη νέου πιάτου</div>
            </div>
            <DishList/>
        </div>
    </div>
}

const DishTabContext = createContext()
const useDishTab = ()=>useContext(DishTabContext);

export default function DashboardMenuDishesTab(){
    const {place} = useDashboard();
    const [_,_redraw] = useState(0);
    const [dishes,setDishes] = useState(null);
    const redraw = ()=>_redraw(_+1);

    useEffect(()=>{
        API(`/dashboard/${place.id}/dish-list`)
        .then(r=>{
            //Set current state
            const dishes = {};
            for(let i of r.data)dishes[i.code]=i;
            setDishes(dishes);
        });
    },[]);
    
    function createDish(code,title,price){
        const dish = {code,title,price,ingredients:[]};
        return API(`/dashboard/${place.id}/menu/add-dish`,"POST",dish).then(r=>{
            if(!r.success)return;
            setDishes({[code]:dish,...dishes});
        })
    }

    function deleteDish(code){
        if(!this.state.dishes[code])return;
        return API(`/dashboard/${place.id}/menu/delete-dish`,"POST",{code})
        .then(r=>{
            if(!r.success)return;
            delete this.state.dishes[code];
            redraw();
        });
    }

    function submit(emulate=false){
        const changed = [];
        const list = Object.values(dishes);
        for(let i of list)
            if(i.changed){
                changed.push(i);
                delete i.changed;
            }
        
        if(emulate||changed.length<1) return console.log(changed);
        redraw();

        return API(`/dashboard/${place.id}/menu/change-dishes`,"POST",changed).then(r=>{
            //if(r.success)location.reload();
        });
    }

    return  <DishTabContext.Provider value={{createDish,deleteDish}}>
            <div className="dish-list-tab">
                <div>
                    <h1 style={{textAlign:"center"}}>Όλα τα πιάτα</h1>
                    <hr/>
                </div>
                {dishes?<DishTable dishes={dishes}/>:<div>Φόρτωση...</div>}
                <div className="submit-footer">
                    <button onClick={()=>submit()}>Αποθήκευση</button>
                </div>
            </div>
            </DishTabContext.Provider>;
}
window.DashboardMenuDishesTab = DashboardMenuDishesTab;