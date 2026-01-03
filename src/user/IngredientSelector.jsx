import React from "react";
import UserApp, { currency } from "./MainApp";

const CDN_ORIGIN = "https://d242shy6hd6hj5.cloudfront.net";
export default class IngredientSelector extends React.Component{
    /**
     * @type {IngredientSelector}
     */
    static instance;
    #onsubmit;
    constructor(props){
        super(props);
        const dish = {
            title:"",
            ingredients:[]
        }
        const selections = {};
        for(let i of dish.ingredients)selections[i.title] = i.defaultOn;
        this.#onsubmit = props.onSubmit;

        this.state = {
            dish:dish,
            visible:false,
            count:1,
            comments:undefined,
            selections,
            image:"/default-dish/thumbnail.webp"
        }
        IngredientSelector.instance = this;
    }
    toggle(ingredient){
        this.state.selections[ingredient] = !this.state.selections[ingredient];
        this.forceUpdate();
    }
    open(entry){
        const dishToEdit = UserApp.instance.menu[entry.code];
        const selections = {};
        
        for(let i of dishToEdit.ingredients)selections[i.title] = entry.ingredients?entry.ingredients.includes(i.title):!!i.defaultOn;

        const d = {
            dish:dishToEdit,
            selections,
            visible:true,
            count:entry.count||1,
            image:dishToEdit.has_image?`/${(UserApp.instance?.place||window.place).id}/${dishToEdit.code}/thumbnail.webp`
            :`/default-dish/thumbnail.webp`
        };
        if(entry.info)d.comments=entry.info.comments;
        
        this.setState(d);
    }
    hide(){
        this.setState({visible:false})
    }
    q(d){
        return this.setState({
            count:Math.min(99,Math.max(1,this.state.count+d))
        })
    }
    export(reset){
        const ingredients = [];
        for(let i of Object.keys(this.state.selections))if(this.state.selections[i])ingredients.push(i);
        const o = {
            code:this.state.dish.code,
            count:this.state.count,
            info:{comments:this.state.comments},
            ingredients
        };
        if(reset)this.setState({comments:""});
        return o;
    }
    hasRemovables(){
        for(let i of this.state.dish.ingredients)if(!i.nonRemovable)return true;
        return false;
    }
    addAndClose(){
        if(this.#onsubmit instanceof Function)this.#onsubmit(this.export(true));
        this.setState({visible:false});
    }
    capFirst(str){
        return str[0].toUpperCase()+str.slice(1);
    }
    render(){
        return <div className={"dish-editor-popup"+(this.state.visible?"":" hidden")}>
            <div className="dish-editor-closer" onClick={()=>this.hide()}>
                X
            </div>
            <div className="dish-editor-main">
                <div className="dish-editor-image-wrapper" style={{
                    backgroundImage:`url("${CDN_ORIGIN+this.state.image}")`
                }}/>
                <div className="dish-editor-title">
                    <h3>
                        {this.state.dish.title}
                        &nbsp;({currency(UserApp.instance.calculatePrice(this.export()))})
                    </h3>
                    <p>Περιέχει {this.state.dish.ingredients.map(r=>r.title).join(", ")}</p>
                </div>
                <div className="dish-editor-container">
                    {this.hasRemovables()?<h3>Υλικά:</h3>:null}
                    <div className="ingredient-list">
                        {this.state.dish.ingredients.map(r=>r.nonRemovable?null:
                            <div className="ingredient" key={r.title} onClick={()=>this.toggle(r.title)}>
                                <input type="checkbox" checked={!!this.state.selections[r.title]}></input>
                                <div>{this.capFirst(r.title)}</div>
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
                        onChange={e=>this.setState({comments:e.target.value})}
                        value={this.state.comments}/>
                    </div>
                </div>
            </div>
            <div className="dish-editor-footer">
                <button className="dish-editor-complete-button" onClick={()=>this.addAndClose()}>{this.props.buttonText}</button>
                <div className="quantity-selector">
                    <button className="quantity-decrease" onClick={()=>this.q(-1)}>-</button>
                    <div className="quantity-display">{this.state.count}</div>
                    <button className="quantity-increase" onClick={()=>this.q(+1)}>+</button>
                </div>
            </div>
        </div>
    }
}