import React from "react";
import UserApp, { currency, useApp } from "./MainApp.jsx";
import IngredientSelector from "./IngredientSelector.jsx";

const cats = ["Σαλάτες","Ορεκτικά","Ζυμαρικά","Πίτσες","Ποτά"];
cats[-1] = "Καλτσόνε";

function MenuItem({self}){
    const sub = self.ingredients.map(p=>p.title).join(", ");
    if(self.info)self.info = {...self.info}

    const description = self.description.length>3?self.description:sub;
    const subtitle = (description[0]||"").toUpperCase()+description.slice(1).toLowerCase();
    const price = currency(self.price);

    function select(){
        IngredientSelector.instance.open({code:self.code});
    }

    const canOrder = !useApp().isClosed();
    return (
        <div className="menu-item" onClick={()=>canOrder?select():null}>
            <div className="item-title">
                <div>{self.title}</div>
                <div>
                    {canOrder?
                        <button className="add">+</button>
                    :null}
                </div>
            </div>
            <hr/>
            <div className="item-details">
                <div className="item-ingredients">{subtitle}</div>
                <div className="price-tag">{price}</div>
            </div>
        </div>
    );
}

function MenuCategory({name, items}){
    return (
        <div className="menu-category">
            <h1>{name}</h1>
            <hr/>
            {(items||[]).map((i,n)=>(<MenuItem key={n} self={i}/>))}
        </div>
    )
}

export default function MenuComponent(){
    const {menu,addToCart} = useApp();
    if(!menu)return <div style={{textAlign:"center",fontSize:"20px"}}>Φόρτωση...</div>;

    const categorizedMenu = {};
    for(let i of Object.values(menu)){
        let cat = i.category;

        if(Array.isArray(categorizedMenu[cat]))categorizedMenu[cat].push(i);
        else categorizedMenu[cat] = [i];
    }

    return(
        <div className="menu-container">
            <h1 style={{textAlign:"center"}}>Κατάλογος:</h1>
            <hr/>
            {
                categorizedMenu?
                Object.keys(categorizedMenu).map(key=>(
                    <MenuCategory key={key} name={key} items={categorizedMenu[key]}/>
                ))
                :"Φόρτωση"
            }
            <p style={{textAlign:"center"}}>Τέλος :&#41;</p>
            <IngredientSelector buttonText="Προσθήκη στο καλάθι" onSubmit={i=>addToCart(i)}/>
        </div>
    )
}