//insert,update and delete items in an array
let arrays=["apple","banana","mango"];
arrays.push("grapes");
console.log(arrays);

arrays.pop();
console.log(arrays);

arrays[2]="kiwi";
console.log(arrays);

//printing vallues using for loops in array
let fruits = ["apple", "banana", "cherry", "mango"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}

//reverse an array w/o using reverse.array
function reverseArray(arr) {
  const reversed = [];
 
  for (let i = arr.length - 1; i >= 0; i--) {
    reversed.push(arr[i]);
  }
  return reversed;
}

const original = [1, 2, 3, 4, 5];
console.log(reverseArray(original)); // Output: [5, 4, 3, 2, 1]

// nested object representing a student’s profile
const StudentProfile = {
    name: "Archee Paliwal",
    age: 22,
    email: "paliwalarchee@gmail.com",
    courses: ["Math", "Science", "English"],
    marks: {
       Math:93,
       Science:88,
       English:95 
    }
};
console.log(StudentProfile.name); //output:archee paliwal

//iterate through objects keys uising for in loop
const StudentProfile = {
    name: "Archee Paliwal",
    age: 22,
    email: "paliwalarchee@gmail.com",
    courses: ["Math", "Science", "English"]
};

for (let key in StudentProfile) {
  console.log(key + ": " + StudentProfile[key]);
}

//object.keys
const vehicle={
    brand:"toyota";
    year:2022
};
const keys=Object.keys(vehicle);
console.log(keys);

//Object.assign() to merge two objects
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const mergeObjects=Object.assign({},obj1,obj2);
console.log(mergeObjects);     // Output: { a: 1, b: 3, c: 4 }

// object with a method that logs “this.name”
const person={
    name="Archee",
    Age=22
};
console.log("Hello my name is ${this.name}");

//call function in global scope to observe
function checkGlobalThis() {
  console.log("Value of 'this':", this);
}
checkGlobalThis();
