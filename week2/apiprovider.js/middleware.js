//middleware function like request,response,next
//logging and validation middleware
app.use(express.json()); 

const validateUser = (req, res, next) => {
  const { username, email, age } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Valid username is required' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (age && typeof age !== 'number') {
    return res.status(400).json({ error: 'Age must be a number' });
  }
  next();
};

app.post('/register', validateUser, (req, res) => {
  res.status(201).json({ message: 'User registered successfully!', user: req.body });
});

//async function with a setTimeout function
console.log("one");
console.log("Two");
setTiemout(()=>{
  console.log("hello");
},3000);//hello will be printed after 3 sec
console.log("three");
console.log("four");   //one,two,three,four will be printed first and then hello will be printed after 3 sec

//callback function
function greet(name,callback){
    console.log(`Hello ${name}!`);
    callback();
}
function logDone(){
    console.log("Greetings Completed!");
}
greet("Archee",logDone);

//callback hell=>pyramid of doom, multiple asynchronous operations depends on one another
//callbacks inside callbacks(nested)
//callback hells are resolved using promises or async/await
async function Orderdeliveryoperation(userID){
    try{
const order=await getOrderDetails(userID);
const payment=await processPayment(order);
const delivery=await scheduleDelivery(payment);
console.log("Delivery status completed successfully!");
return delivery;
}catch(err){
    console.error("Error in order delivery operation:", err);
}
}

//event looping(microtasks and macrotasks)
console.log("1.Starting the process");
SetTimeout(()=>{
    console.log("2.Macrotask:SetTimeout executed");
},0);
Promise.resolve().then(()=>{
    console.log("3.Microtask:Promise resolved");
});
console.log("4.Process completed");

