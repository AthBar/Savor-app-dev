import React from "react";
import UserApp, { currency } from "./MainApp.jsx";
import IngredientSelector from "./IngredientSelector.jsx";

const cats = ["Σαλάτες","Ορεκτικά","Ζυμαρικά","Πίτσες","Ποτά"];
cats[-1] = "Καλτσόνε";

class MenuItem extends React.Component{
    constructor(props){
        super(props);

        const sub = props.self.ingredients.map(p=>p.title).join(", ");
        if(props.self.info)props.self.info = {...props.self.info}

        const subtitle = props.self.description.length>3?props.self.description:sub;
        this.state = {
            item:props.self,
            title:props.self.title,
            subtitle:(subtitle[0]||"").toUpperCase()+subtitle.slice(1),
            price:currency(props.self.price)
        }
    }
    #select(){
        IngredientSelector.instance.open({code:this.state.item.code});
    }
    render(){
        return (
            <div className="menu-item" onClick={()=>this.#select()}>
                <div className="item-title">
                    <div>{this.state.title}</div>
                    <div>
                        <button className="add">+</button>
                    </div>
                </div>
                <hr/>
                <div className="item-details">
                    <div className="item-ingredients">{this.state.subtitle}</div>
                    <div className="price-tag">{this.state.price}</div>
                </div>
            </div>
        );
    }
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

export default function MenuComponent({menu}){
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
            <IngredientSelector buttonText="Προσθήκη στο καλάθι" onSubmit={i=>UserApp.instance.addToCart(i)}/>
        </div>
    )
}