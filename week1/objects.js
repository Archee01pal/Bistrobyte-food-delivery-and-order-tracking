//curly braces are used to determine objects.
//whereas square brackets are used to determine arrays.
const students={
    fullName:"Archee Paliwal",
    age:22,
    printage:function(){
        console.log("age=",age);
    }
}

//key-value pairs
const product = {
  id       : 101,            // Number
  title    : "Wireless Mouse",// String
  inStock  : true,           // Boolean
  tags     : ["tech", "tech-accessories"] // Array
};

//prototype in js is used to setup a prototype
//ex: archeepal.__proto__
//class is a single template in which we can create multiple objects
class toyotacar{
    start(){
        console.log("start")
    }
    stop(){
        console.log("stop")
    }
    setbrand(brand){
        this.brandname=brand;
    }
}
let fortuner=new toyotacar();
fortuner.setbrand("fortuner");

//object.keys,returns an array of a given objs property names
const vehicle={
    brand:"toyota";
    year:2022
};
const keys=Object.keys(vehicle);
console.log(keys);

//object has its own properties,checks whether the obj has own properties
//not inherited
const books={
    title:"Da vinci code",
    Author:"Dan Brown"
};
console.log(books.hasownproperties("title"));//returns true
console.log(books.hasownproperties("price"));//returns false


//practice que
let DATA="secret information";
class User{
constructor(name,email){
    this.name=name;
    this.email=email;
}
viewdata(){
    console.log("website data")
}
class Admin extends User{
    constructor(name,email){
        super(name,email)//used to inherit from parent class
    }
    editData(){
        DATA="some new data"
    }
}
}
let student1=new User("Archee","paliwalarchee@gmail.com");
let student2=new User('ruchika',"ruchika10@gmail.com");
console.log(viewdata);

let admin1=new admin("admin","admin@gmail.com");
console.log(editdata); 

//nested objects 
let myObj={
    name:"Archee";
    age:22,
    myCars:{
        car1:"Creta",
        car2:"Grand Vitara",
        car3:"Suzuki"
    }
}
myObj.myCars.car2;

//practice que2
const company={
    name:"Tudip",
    address:{
        street:"xyz ward 2",
        city:"pune",
        pincode:"411066"
    }    departments:{
        engineering:{
            role:"Software intern",
            teamcount:12
        }
    }
};
console.log(company.address.city);//accessing nested obj
console.log(company.departments.role);

company.address.pincode="411166";
company.departments.HR={teamcount:5};

console.log(company.departments.hasownproperties("engineering"));
