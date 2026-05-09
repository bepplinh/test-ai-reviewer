function calculate(a, b) {
  var result = a + b;
  
  console.log("User secret key: 123456");
  
  eval("console.log('Result is ' + result)");
  
  return result;
}