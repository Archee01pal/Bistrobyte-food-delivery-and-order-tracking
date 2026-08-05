//let,var,const
console.log(fruits);
let fruits = ["apple", "banana", "orange"];//block accessible
console.log(fruits);         //gives undefined error in the code

console.log(fruits);
var fruits = ["apple", "banana", "orange"];//globally accessible
console.log(fruits);          //gives js bin output then the original output

console.log(fruits);
const fruits = ["apple", "banana", "orange"];//globally accessible
console.log(fruits);          //gives undefined error in the code

//arrow functions =>
const greet=(name)=>{
    return "Hello "+name;
}
console.log(greet("Archee"));

const sqr=num=>{
    return num*num;
}
console.log(sqr(6)); //output will be 36

//template literal(should be used with backticks only)
//not single or doubleinverted commas
var name="Archee Paliwal";
console.log(`hello ${name} ! Have a nice day`);    //output will be hello archee paliwal ! have a nice day

//arrays and objects destructing
const details={
    name:"Archee Paliwal",
    age:22,
    email:"paliwalarchee@gmail.com"
};
let {name,age,email}=details;
console.log(name,age,email); 

//promises(pending,resolved,restricted)
const myPromise=new Promise((resolve, reject)=>{
  const a=4,b=5;
  const c=a+b;
  if(c==4){
    resolve(`yes! ${a} + ${b}=4`);
  }else{
    reject(`no! ${a}+ ${b} !=4`);
  }
});
myPromise.then((m)=>{
  console.log(m);
}).catch((err)=>{
  console.log(err);    //output will be no! 4+5 !=4
});                   

//rest and spread(...) operators
//rest is used to merge whereas spread is used to split arrays or objects
const oldArray=[1,2,3];      //spread
const newArray=["A","B",...oldArray,4,5,6];
console.log(newArray);               //output will be ["A","B",1,2,3,4,5,6]

const colors = ["red", "green", "blue", "yellow"];    //rest
const [primary, secondary, ...restColors] = colors;

console.log(primary);   // Output: red
console.log(secondary); // Output: green
console.log(restColors);// Output: ["blue", "yellow"]

//array includes
const num=[10,20,30,40];
console.log(num.includes(20));  //output:true
console.log(num.includes(88));  //output:false

//arrays of/for
const fruits=["apple","banana","orange"];
for(const fruit of fruits){
    console.log(fruit);   //output will be apple banana orange
}


//javascript date objects
const now=new Date();
console.log(now);

const date=new Date("2023-06-01");
console.log(date.toISOString());              //ISO,Locale
console.log(date.toLocaleDateString());
console.log(date.toLocaleTimeString());

const date=new Date();                         //timezones
const timezoneoffsetminutes=date.getTimezoneOffset();
console.log(timezoneoffsetminutes); 

//formatting a date (ISOString,DateString)
const date=new Date(2026,5,6,10.30,0);
console.log(date.toTimeString());
console.log(date.toDateString());
console.log(date.toUTCString());
console.log(date.toISOString());

//Retrieving the Date: getFullYear(), getMonth(0-11), getDate(0 for sunday, 6 for saturday), getHours()
//get use hota h to retrieve the date and set use hota h to modify the date
const LocalDate=new Date(2026,9,15,14,30,45);
console.log("Full year"+ localDate.getFullYear());
console.log("Full month(0-11)"+ localDate.getMonth());
console.log("Date of Month: " + localDate.getDate());
console.log("Day of Week (0-6): " + localDate.getDay());
console.log("Hours (0-23): " + localDate.getHours());
console.log("Minutes: " + localDate.getMinutes());
console.log("Seconds: " + localDate.getSeconds());

//modified year,month & date hours, set use hota h
const modDate=new Date(2026,0,3);   // 3 january,2026
console.log("Initia;l Date is:"+ modDate.toDateString());

modDate.setFullYear(2028);
modDate.setMonth(4);
modDate.setDate(8);
console.log("Modified Date is:"+modDate.toDateString());  //output will be modified date is:8 May,2028

//Date methods with UTC
const utc=new Date();
utcDate.setFullYear(2026);
utcDate.setMonth(3);
utcDate.setDate(15);

console.log("Retrieving Date");
console.log("utc year:"+ utcDate.getFullYear());
console.log("utc month:"+ utcDate.getMonth());
console.log("utc date:"+ utcDate.getDate());
//output will be utc year:2026,utc month:3,utc date:15