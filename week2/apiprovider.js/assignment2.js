//async function using a callback function
function getDatacallback(callback){
    setTimeout(()=>{
        console.log("Data fetched successfully");
    },1000);
    callback();
}
getDatacallback((message)=>{
    console.log(message);
})

//creating a promise function
function getDataPromise(){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve("Data fetched successfully");
        },1000);
    });
}
getDataPromise().then((message)=>{
    console.log(message);
});

//changing upper que to async/await function
async function getDataAsync(){
    const message=await getDataPromise();
    console.log(message);
};

//Event loop que using console log, setTimeout, promise.then.resolve()
console.log("one");
setTimeout(()=>{
    console.log("third");
}, 3000);
Promise.resolve().then(()=>{
    console.log("promise kept(Promise)");
});
console.log("two");
//output will be : one,two,promise kept(Promise),third(after 3sec)

