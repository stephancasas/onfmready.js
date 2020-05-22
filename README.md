# onfmready.js
 OnFMReady is a simple helper for accessing the FileMaker web viewer `FileMaker` JavaScript class.
 
## Introduction
 FileMaker 19 introduced new JavaScript interaction between the web viewer layout object and the FileMaker solution. Developers can call FileMaker scripts from their JavaScript code using `FileMaker.PerformScript()`, but must wait for the `FileMaker` class to be injected before doing so.
 
 onfmready.js streamlines the process of waiting for the `FileMaker` class by providing three functions:  
  * `OnFMReady.run()`
    * Implicitly run either a FileMaker script or JavaScript function.
  * `OnFMReady.runScript()`
    * Explicitly run a FileMaker script after the `FileMaker` class is made available
  * `OnFMReady.runFunction()`
    * Explicitly run a JavaScript function after the `FileMaker` class is made available
 
 Both the `run()` and `runFunction()` methods accept an unlimited number of arguments after the callback, so you are free to use them with any existing methods.
    
## Install
 To install the module, simply include it in the `<head>` tag of your document like so:
 ```html
 <script src="onfmready.min.js" type="text/javascript"></script>
 ```
 >**Beginner Tip**
 >
 >If you copy/paste this line for installation, be sure that you've placed the `onfmready.min.js` file in the same directory as the `.html` file in which you intend to use it. Otherwise, edit the `src` attribute of the `<script>` tag to specify the correct file path.
 > * For futher reading on absolute and relative resource paths in HTML, consider [this article from W3Schools](https://www.w3schools.com/html/html_filepaths.asp).

## Implicit Usage
 The easiest way to use OnFMReady is to use the `OnFMReady.run()` method, which will call a FileMaker script or JavaScript function depending on what type of object is passed in the argument:

 **FileMaker Script**
 ```javascript
 OnFMReady.run('my_script_name', 'my_script_parameter');
 ```
  **JavaScript Function**
 ```javascript
 var myFunction = function(message) {
 	console.log(message);
 };
 OnFMReady.run(myFunction, 'Hello, world!');

 /* ---- OR ---- */

 OnFMReady.run((message) => {
     console.log(message);
 }, 'Hello, world!');
 ```

## Explicit Usage
 If, for some reason, you wish to explicitly define the type of execution taking place, you can use the following methods to execute your script or function:
 
 **FileMaker Script**
 ```javascript
 OnFMReady.runScript('my_script_name', 'my_script_parameter');
 ```
 **JavaScript Function**
 ```javascript
 OnFMReady.runFunction(myFunction, 'Hello, world!');
 ```
## License
 [MIT](http://opensource.org/licenses/MIT)