import React, { useEffect, useState, useSyncExternalStore } from "react";
import { currency, useApp } from "./MainApp";
import UserApp from "./UserApp";

const CDN_ORIGIN = "https://d242shy6hd6hj5.cloudfront.net";

export default function IngredientSelector({buttonText}){
    const {app} = useApp();
    const entry = app.editingEntry;

    const [dish,setDish] = useState();
    const [title,setTitle] = useState();
    const [subtitle,setSubtitle] = useState();
    const [image,setImage] = useState("/default-dish/thumbnail.webp");
    const [selections,setSelections] = useState();
    const [hasRemovables,setHasRemovables] = useState();
    const [comments, setComments] = useState("");
    const [count, setCount] = useState(1);
    const [cb,setCallback] = useState(()=>console.log.bind(console,"Ingredient edited: "));

    useSyncExternalStore(app.subscription,()=>app.editingEntry);

    useEffect(()=>{
        if(!entry)return;
        const _dish = app.menu[entry.code];

        setDish(_dish);
        setTitle(_dish.title);

        setSubtitle(`Περιέχει ${_dish.ingredients.map(r=>r.title).join(", ")}`);

        //Array.some: Just like for(let i of array)if(condition(i))return true;return false;
        //Returns true and stops the iteration if the condition is met at least once
        setHasRemovables(_dish.ingredients.some(i=>!i.nonRemovable));

        //Of the form {[title]:defaultOn}
        setSelections(
            Object.fromEntries(
                _dish.ingredients.map(key=>[key.title,entry.ingredients?entry.ingredients.includes(key.title):!!key.defaultOn])
            )
        );

        setCount(entry.count||1);

        setComments(entry.info?.comments||"");

        setImage(
            _dish.has_image?`/${app.place.id}/${_dish.code}/thumbnail.webp`:
            "/default-dish/thumbnail.webp"
        );
        
        setCallback(()=>entry.cb);

        return;
    },[entry]);

    function toggle(title){
        //This can break but I assume it won't
        //Because I only call it properly
        setSelections({
            ...selections,
            [title]:!selections[title]
        })
    }

    function close(){
        app.editingEntry = null;
        setDish(null);
    }

    const changeCount = d=>setCount(Math.max(1,Math.min(count+d,99)));

    function capFirst(str){
        return str[0].toUpperCase()+str.slice(1);
    }

    function addAndClose(){
        cb({
            code:dish.code,
            count,
            info:{comments},
            ingredients:Object.entries(selections).reduce(
                (acc,[title,selected])=>{
                    if(selected)acc.push(title);
                    return acc;
                },[]
            )
        });
        close();
    }

    if(!entry||!dish)return null;
    return  <div className={"dish-editor-popup"+(entry?"":" hidden")}>
                <div className="dish-editor-closer" onClick={close}>
                    X
                </div>
                <div className="dish-editor-main">
                    <div className="dish-editor-image-wrapper" style={{
                        backgroundImage:`url("${CDN_ORIGIN+image}")`
                    }}/>
                    <div className="dish-editor-title">
                        <h3>
                            {title}
                            &nbsp;({currency(app.calculatePrice(entry))})
                        </h3>
                        <p>{subtitle}</p>
                    </div>
                    <div className="dish-editor-container">
                        {hasRemovables?<h3>Υλικά:</h3>:null}
                        <div className="ingredient-list">
                            {dish.ingredients.map(r=>r.nonRemovable?null:
                                <div className="ingredient" key={r.title} onClick={()=>toggle(r.title)}>
                                    <input type="checkbox" checked={selections[r.title]} onChange={()=>false}></input>
                                    <div>{capFirst(r.title)}</div>
                                    {r.price?
                                        <span className="extra-price">
                                            (+{currency(r.price)})
                                        </span>
                                    :null}
                                </div>
                            )}
                        </div>
                        <div className="comment">
                            <h3>Comments:</h3>
                            <textarea className="dish-editor-comment-area" 
                            placeholder="Σε περίπτωση που θέλετε ειδική τροποποίηση" 
                            onChange={e=>setComments(e.target.value)}
                            value={comments}/>
                        </div>
                    </div>
                </div>
                <div className="dish-editor-footer">
                    <button className="dish-editor-complete-button" onClick={()=>addAndClose()}>{buttonText}</button>
                    <div className="quantity-selector">
                        <button className="quantity-decrease" onClick={()=>changeCount(-1)}>-</button>
                        <div className="quantity-display">{count}</div>
                        <button className="quantity-increase" onClick={()=>changeCount(1)}>+</button>
                    </div>
                </div>
            </div>
}