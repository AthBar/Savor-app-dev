import React from "react"
import { API, API_ORIGIN } from "../common/API"

function Button({children}){
  return <button className="button">{children}</button>
}

function ListItem({children}){
    return <li className="card__list_item">
      <span className="check">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="check_svg"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          ></path>
        </svg>
      </span>
      <span className="list_text">{children}</span>
    </li>
}

function TestPage({title,description,price,children}){
    return <div className="card">
  <div className="card__border"></div>
  <div className="card_title__container">
    <span className="card_title">{title}</span>
    <p className="card_paragraph">
      {description}
    </p>
  </div>
  <hr className="line" />
  <ul className="card__list">
    {children}

  </ul>
  <hr/>
  <p style={{color:"white"}}>Από <span style={{fontSize:"1.5em"}}>{price}</span></p>
  <Button>Αγοράστε το</Button>
</div>

}

function MyTestPage(){
  return [
    <TestPage key={0} title="Starter" price="10€/μήνα" description="Η ελάχιστη εμπειρία του Savor, ιδανική για μικρές επιχειρήσεις που θέλουν μια πρώτη επαφή με το μέλλον των παραγγελιών">
      <ListItem>Διαχείρηση παραγγελιών για έως 5 τραπεζια</ListItem>
      <ListItem>Δυνατότητα προβολής καταλόγου μέσω QR για απεριόριστα τραπέζια</ListItem>
      <ListItem>Παρακολούθηση έως 3 σερβιτόρων</ListItem>
      <ListItem>Έως ένας ακροατής (υπολογιστής/κινητό) ανά πάσα στιγμή</ListItem>
    </TestPage>,
    <TestPage key={1} title="Basic" price="50€/μήνα" description="Εξυπηρετεί μεσαίες επιχειρήσεις και οργανώνει τα βασικότερα συστήματά τους">
      <ListItem>Όλα τα προνόμια του Starter</ListItem>
      <ListItem>Διαχείρηση παραγγελιών για έως 25 τραπεζια</ListItem>
      <ListItem>Παρακολούθηση απεριόριστων σερβιτόρων</ListItem>
      <ListItem>Υπηρεσία σχεδιασμού κάτοψης</ListItem>
      <ListItem>Δυνατότητα online κρατήσεων</ListItem>
      <ListItem>Ικανότητα προσαρμογής της αρχικής σας σελίδας</ListItem>
      <ListItem>Το λογότυπο του Savor γίνεται πιο διακριτικό στις σελίδες σας</ListItem>
      <ListItem>Βασική λειτουργία τηλεφωνικού κέντρου</ListItem>
      <ListItem>Έως 3 διαφορετικοί τιμοκατάλογοι ανα εβδομάδα</ListItem>
    </TestPage>,
    <TestPage key={2} title="Pro" price="150€/μήνα" description="Για μεγάλες ή προηγέμενες επιχειρήσεις που αναζητούν τον μέγιστο αυτοματισμό">
      <ListItem>Όλα τα προνόμια του Basic</ListItem>
      <ListItem>Διαχείρηση παραγγελιών για απεριόριστα τραπέζια</ListItem>
      <ListItem>AI τηλεφωνητές για απεριόριστες παράλληλες γραμμές</ListItem>
      <ListItem>AI ομιλητές στα SMS και social media σας</ListItem>
      <ListItem>Πλήρης απόκρυψη του λογοτύπου του Savor</ListItem>
      <ListItem>Απεριόριστοι τιμοκατάλογοι / πλήρης έλεγχος του μενού</ListItem>
    </TestPage>,
    <TestPage key={3} title="Franchise" price="Επικονωνήστε" description="Για αλυσίδες ή πολυόροφες επιχειρήσεις. Μέγιστο επίπεδο υποστήριξης">
      <ListItem>Όλα τα προνόμια του Pro</ListItem>
      <ListItem>Δυνατότητα πολυόροφης λειτουργίας (πολλαπλές κατόψεις)</ListItem>
      <ListItem>Δυνατότητα πολλαπλών τοποθεσιών (πολλαπλές επιχειρήσεις υπό την ίδια επωνυμία)</ListItem>
    </TestPage>
  ]
}

function FileUploader(){
  return <form action="/upload/Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH/S001" method="post" encType="multipart/form-data">
    <input type="file" name="image" accept="image/png"></input>
    <button type="submit">Submit</button>
  </form>
}

export default class ImageUpload extends React.Component{
  place = "Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH";
  dish = "";
  image;
  constructor(props){
    super(props)
  }
  submit(file){
    const form = new FormData();
    form.append("image",this.image);
    fetch(API_ORIGIN+`/upload/dish-image?place=${this.place}&dish=${this.dish}`,{
      method:"POST",
      body:form,
      credentials: "include"
    })
  }
  render(){
    return <div>
      <input type="text" maxLength={36} onChange={e=>this.place=e.target.value} defaultValue={this.place}/>
      <input type="text" maxLength={4} onChange={e=>this.dish=e.target.value} defaultValue={this.dish}/>
      <input type="file" accept="image/*" onChange={e=>this.image = e.target.files[0]}/>
    <button onClick={()=>this.submit()}>Υποβολή</button>
  </div>
  }
}