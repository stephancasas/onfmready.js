# onfmready.js
 OnFMReady is a simple helper for accessing the FileMaker web viewer `FileMaker` JavaScript class.
 
## Introduction
 FileMaker 19 introduced new JavaScript interaction between the web viewer layout object and the FileMaker solution. Developers can call FileMaker scripts from their JavaScript code using `FileMaker.PerformScript()`, but must wait for the `FileMaker` class to be injected before doing so.
 
 onfmready.js streamlines the process of waiting for the `FileMaker` class by providing two functions:  
  * `OnFMReady.runScript()`
    * Run a FileMaker script after the `FileMaker` class is made available
  * `OnFMReady.runFunction()`
    * Run a JavaScript function after the `FileMaker` class is made available
    
## Install
 To install the module, simply include it in the `<head>` tag of your document like so:
 ```html
 <script src="onfmready.min.js" type="text/javascript"></script>
 ```
## Usage
 The module can be used to call either a FileMaker script or a JavaScript function once the `FileMaker` class is loaded:
 
 **FileMaker Script**
 ```javascript
 OnFMReady.runScript('my_script_name', 'my_script_parameter');
 ```
 **JavaScript Function**
 ```javascript
 var myFunction = function(message) {
 	console.log(message);
 };
 OnFMReady.runFunction(myFunction, 'Hello, world!');
 ```
## License
 [MIT](http://opensource.org/licenses/MIT)