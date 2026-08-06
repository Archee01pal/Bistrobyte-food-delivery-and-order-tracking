//any keyword(when we dont know what to use)
//avoid when possible
let Randomvalue:any=10;
Randomvalue="Archee";
Randomvalue=true;

//unknown keyword is safer than any
let value:unknown=10;
value="archee";
value=true

//arrays in typescript
const scores:number []=[20,30,40];
const userTuple:[number,String]=[1,"Archee"];

//Objects in typescript
//objects are typed using interface or type aliases
//interface can be extended(inherited) , type aliases cannot
interface user{
    id:number;
    name:string;
    age:number;
    email?:string; // ? ->indicates optional property
}
const newUser:user={
    id:10,
    name:"Archee",
    age:22
};

interface Product{
    id:number;
    name:string;
    getDiscount(percent:number):number;
}
let user :Product={
    id:101,
    name:"Archee",
    getDiscount(percent:number):number{
        return percent;
    }
};
console.log(user.getDiscount(10));

//type, dont need to define keywords
//takes either of the resonse, OR(|) , AND(&)
type direction="north"|"south"|"east"|"west";
let direction:direction="north";

//Classes in ts uses access modifiers like public,private,protected,read-only
class Person{
    private salary:number;
    protected age:number;
    public name:string;

    constructor(salary:number,age:number,name:string){
        this.salary=salary;
        this.age=age;
        this.name=name;
    }
    //getter
    public getName():string{
    return this.name;
    }
    //setter
    public setName():string{
        return this.name;
    }
}