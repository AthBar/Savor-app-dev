import { currency } from "../common/functions";


export default function InactiveMenuComponent({menu}){
    if(!menu)return <div>"Loading..."</div>;

    const categorizedMenu = {};
    for(let i of Object.values(menu)){
        let cat = i.category;

        if(Array.isArray(categorizedMenu[cat]))categorizedMenu[cat].push(i);
        else categorizedMenu[cat] = [i];
    }

    return <div className="menu-container">
                {
                    categorizedMenu?
                    Object.keys(categorizedMenu).map(key=>(
                        <MenuCategory key={key} name={key} items={categorizedMenu[key]}/>
                    ))
                    :"Φόρτωση"
                }
                <p style={{textAlign:"center"}}>Τέλος :&#41;</p>
            </div>
}
function MenuCategory({name, items}){
    return (
        <div className="menu-category">
            <h1>{name}</h1>
            <hr/>
            {(items||[]).map((i,n)=>(<MenuItem key={n} self={console.log(i)} {...i} subtitle={i.ingredients.map(i=>i.title).join(",")}/>))}
        </div>
    )
}

function MenuItem({title,price,subtitle}){
    return <div className="menu-item">
                <div className="item-title">
                    <div>{title}</div>
                </div>
                <hr/>
                <div className="item-details">
                    <div className="item-ingredients">{subtitle}</div>
                    <div className="price-tag">{currency(price)}</div>
                </div>
            </div>
}