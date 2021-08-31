# OnFMReady.js

OnFMReady is a developer utility for working with the `FileMaker` web viewer JavaScript object in FileMaker Pro/WebDirect. This is version 2.0 of the utility. If you're looking for version 1.0, it's [here](https://www.github.com/stephancasas/onfmready.js/archive).

> **What happened to version 1.0?**
>
> As stated above, you can still get version 1.0 of OnFMReady [here](https://www.github.com/stephancasas/onfmready.js/archive), but if you read its updated documentation or the documentation for version 2.0, I'm sure you'll agree that the newer version is much better. If you'd like to know more about what's changed, continue reading below.

## Introduction

FileMaker 19 introduced new JavaScript interaction between the web viewer layout object and the FileMaker environment. Developers can call FileMaker scripts from their JavaScript code using `FileMaker.PerformScript()` and `FileMaker.PerformScriptWithOption()`. However, neither method can be immediately called, as FileMaker Pro or FileMaker WebDirect must first inject the `FileMaker` object for use.

OnFMReady removes the need to introduce additional JavaScript or FileMaker script logic which "waits" for injection of the `FileMaker` object to occur. Most importantly, it does this without requiring the developer to "wrap" their script calls inside of helper functions. Simply calling either `FileMaker.PerformScript()` or `FileMaker.PerformScriptWithOption()` will queue script execution requests, and dispatch them immediately after the `FileMaker` object has been injected.

> :pencil: **NOTE:** FileMaker Pro for Microsoft Windows
>
> During development/publishing, I finished writing this README, and _then_ decided to test OnFMReady in FileMaker Pro for Microsoft Windows, which now uses Microsoft Edge (a Chromium-based browser) to provide the web viewer object. I haven't had a chance to pull-apart the injection logic Claris is using there, but what I do know is that the `FileMaker` object is available for use immediately. No helper is needed, but OnFMReady will still provide the utility events `filemaker-ready` and `filemaker-expected`.
>
> All this in-mind, details regarding the `FileMaker` object lifecycle, given below, apply to FileMaker Pro on macOS and FileMaker WebDirect (on all platforms, of course).

> :pencil: **NOTE:** Microsoft Internet Explorer
>
> No, thank you.

## Install

To install the helper, include it as the **first** linked `<script>` in the `<head>` tag of your document. You may link it via CDN, or provide it as inline code:

### CDN

```html
<script src="https://unpkg.com/onfmready.js@2.0.0/dist/onfmready.min.js"></script>
```
> :pencil: **NOTE:** Versioning
>
> It is recommended that you pin a version number (shown as `@2.0.1`) to prevent the introduction of potentially-breaking changes when updates are made to OnFMReady.

### Inline Code

```html
<script>
    !function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";(()=>{let e,t=[];const n=window,i=()=>{if(!e){const e=new Event("filemaker-ready");n.dispatchEvent(e),document.dispatchEvent(e)}const t=Object.assign(new Event("filemaker-expected"),{filemaker:!e,FileMaker:!e});n.dispatchEvent(t),document.dispatchEvent(t)};if("object"==typeof n.FileMaker)return void setTimeout(i);n.OnFMReady=Object.assign({respondWith:{},noLogging:!1,unmount:!1},n.OnFMReady);const o={PerformScript:(e,t)=>o.PerformScriptWithOption(e,t),PerformScriptWithOption:(n,i,o=0)=>{e?r(n,i,o):t.push([n,i,o])}},r=(e,t,i)=>{const o=n.OnFMReady.respondWith[e];return o?o(t,i):n.OnFMReady.noLogging?null:console.log(Object.assign({script:e,param:t},i?{option:i}:{}))};let c,d,s=o;document.addEventListener("DOMContentLoaded",(()=>{s=null,d=!0,setTimeout((()=>{setTimeout((()=>{}))}))})),Object.defineProperty(window,"FileMaker",{set(e){s=e,d=!1,clearTimeout(c),void 0!==e&&setTimeout((()=>{t.forEach((e=>{s.PerformScriptWithOption(...e)})),t=[],i()}))},get:()=>(d&&(c=setTimeout((()=>{e=!0,n.FileMaker=n.OnFMReady.unmount?void 0:o}))),s)})})()}));
</script>
```

## Usage

OnFMReady provides both interception of calls to the `FileMaker` object as well an event emitter that fires once `FileMaker` is injected. In your own code, can make use of both or either utilities where appropriate:

### Native Expression (Interception)

As stated before, OnFMReady _intercepts_ calls to the `FileMaker` object, so you don't need to do anything other than use `FileMaker.PerformScript()` or `FileMaker.PerformScriptWithOption()` as you normally would. You can call either method anywhere in your code, so long as it's _after_ the point in your document where you've installed OnFMReady.

In this way, you're able to use the web viewer as a kind of "script trigger" which calls a FileMaker script as soon as it's ready. There's no need to mess around with `Pause[<duration>]` script steps in your FileMaker scripts, or to introduce looping/checking logic in your JavaScript. As soon as FileMaker is injected, your script requests will automatically be fulfilled.

For example, to run a FileMaker script called `Get Invoices` you can simply call the following from _anywhere_ in your code:

```js
FileMaker.PerformScript('Get Invoices');
```

### Event Listeners

When the `FileMaker` object is injected by FileMaker Pro or FileMaker WebDirect, OnFMReady will dispatch an `Event`, `'filemaker-ready'`, to `window` and `document`. You can add an event listener as you would any other:

```js
window.addEventListener('filemaker-ready', () => {
  console.log('FileMaker is ready!');
});

/*--- or ---*/

document.addEventListener('filemaker-ready', () => {
  console.log('FileMaker is ready!');
});
```

In addition to dispatch of the `filemaker-ready` event, OnFMReady will also dispatch `filemaker-expected` with a `filemaker` boolean property at the point in the events cycle when `FileMaker` _should_ have become available. You may leverage this event in your code to provide context in circumstances where you may be permitting access to your document both inside _and_ outside of FileMaker, and thus wish to engage/disengage features which are exclusive to either context:

```js
document.addEventListener('filemaker-expected', (event) => {
  if (event.filemaker) {
    /*--- feature enable/disable logic here ---*/
  }
});
```

Note that if your document _is_ being accessed from dual contexts, you should not evaluate against `window.FileMaker` to determine context, as OnFMReady will still have provided its fallback instance of `FileMaker` to the browser. Instead, make use of the utility event as shown above. In the event that you wish to remove the `FileMaker` object entirely when outside of a FileMaker context, declare the following global variable:

```js
window.OnFMReady.unmount = true;
```

When `unmount` is truthy, `window.FileMaker` will be set to `undefined` if not fulfilled by FileMaker Pro/WebDirect, and OnFMReady will disable its logging utilities, as well as execution of any functions declared in `window.OnFMReady.respondTo` (documented below).

### Logging and Responding/Mocking (Outside FileMaker)

As it's very likely that a majority of the development on your web-based components will take place outside of FileMaker Pro/WebDirect, there may be many times when you wish to see what data your code will be sending to FileMaker once it's in production. Additionally, you may also wish to "mock" or "fake" responses from FileMaker for the purposes of testing.

#### Logging

By default, if OnFMReady is running outside of FileMaker (that is, `FileMaker` never injected), all requests to the `PerformScript()` or `PerformScriptWithOption()` methods are logged to the developer console. For example, if you call a script named `New Invoice Line Item` with some JSON, you'd see the following in the console:

```js
{script: "New Invoice Line Item", param: '{invoiceId: "0C79ACAD-1D17-4387-A35F-DD61CA6D0147", type: "expense"}'}
```

While this feature may prove useful during debugging, if you wish to disable it, you can declare the following global variable:

```js
window.OnFMReady.noLogging = true;
```

Regardless of whether or not the `noLogging` property is set, when operating in a FileMaker Pro/WebDirect context where the `FileMaker` object is injected, logging will **never** occur.

#### Responding

From a component-development context, calling of a FileMaker script is usually done in anticipation of a response from FileMaker. For example, if you invoke the `New Invoice Line Item` script from the example above, you might expect FileMaker to then call a JavaScript function, `window.acceptNewLineItem()`, passing JSON-defined properties of the newly-created line item into the function's argument:

```json
{
  "id": "9C37599C-E64A-434B-90CE-321E00EACF46",
  "invoiceId": "0C79ACAD-1D17-4387-A35F-DD61CA6D0147",
  "description": "Enter Expense Description...",
  "type": "expense",
  "created": "2021-08-30"
}
```

During development, OnFMReady can simulate FileMaker responses to script requests by piping such requests into developer-defined functions. To engage this behavior, declare the global variable `window.OnFMReady.respondTo` as an object whose keys correspond to FileMaker script names, and whose property values are functions whose arguments accept either the script parameter or both the parameter and the option:

```js
{
    'Name of FileMaker Script': (param, option = 0) => {
        // response logic here
    }
}
```

From within the response functions, you can then call those functions which would traditionally be invoked using `Perform JavaScript in Web Viewer` by FileMaker Pro/WebDirect. For example, to mock a FileMaker response to the example `New Invoice Line Item` script request, you might declare the following:

```js
window.OnFMReady.respondTo = {
  'New Invoice Line Item': (param) => {
    const { invoiceId, type } = JSON.parse(param);

    const description = {
      expense: 'Enter Expense Description...',
      product: 'Enter Product Name...'
    }[type];

    const date = new Date();

    const payload = {
      id: Math.random().toString(36).substring(2),
      invoiceId,
      description,
      type,
      created: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    };

    window.acceptNewLineItem(JSON.stringify(payload));
  }
};
```

Now, when a request is made for the `New Invoice Line Item` FileMaker script, a fake JSON payload will be sent to the `window.acceptNewLineItem()` function — effectively providing usable data with which to test a component in the browser — _without_ FileMaker. Of course, once operating inside of FileMaker Pro/WebDirect, none of this will occur, and script requests will be fulfilled as usual.

> :pencil: **NOTE:** Utility Order
>
> When using OnFMReady's utilities, you should declare `noLogging`, `respondTo`, and `unmount` _after_ the point in your code where you've installed OnFMReady. Declaring before is optional, but you will need to use object syntax:
>
> ```js
> window.OnFMReady = {
>   noLogging: true,
>   respondsTo: { 'New Invoice Line Item': (param) => {} },
>   unmount: true
> };
> ```
>
> Either method will work, and OnFMReady will _not_ overwrite declarations made prior to installation, but I think the latter is nicer than the former.

## How does this work?

I lost a weekend over this one. :frowning_face:

Version 2.0 of OnFMReady works on the principle of _deferral_, which leverages the synchronous nature of JavaScript code. To be synchronous is to operate _at the same time_, _in order_, or _all at once_. With the knowledge that JavaScript can only do one thing at a time (I'm not talking about `async`), we can deeply control that which is provided to our code at any given moment so long as we understand the order in which provisions are declared **and** that which is being anticipated by providers of such provisions. That was fun to read, wasn't it?

### What's Known vs. What's Needed

All of that is a roundabout way of saying "there's a lot of moving parts, but they always move in-order, and if we know where they are, we can do things with them." With respect to the `FileMaker` object, we know the following:

- We need it to exist before we use it, or a `ReferenceError` will be thrown by the browser, and our code will crash.
- It doesn't exist immediately, because injection occurs _after_ page load.
- It can't already exist as anything except for `null` or `undefined`, or FileMaker Pro/WebDirect will never inject it.
  - `null` and `undefined` are _not_ the same, but someone at Claris used loose type checking.

That last bullet point is the reason that I spent the last Saturday and Sunday of August 2021 sitting at my desk instead of going out on a date (there are other reasons too, but I'll sleep better if I blame Claris for this).

When FileMaker Pro or FileMaker WebDirect injects the `FileMaker` object for use into a web viewer layout object, it performs a simple one-line check:

```js
if (window.FileMaker != null) return; // see, i told you it was loose type-checking
```

This check presents a really big problem, because it effectively states that if we want FileMaker to inject, it can't exist. However, as we outlined in the first bullet point, we _need_ it to already exist if we want to use it immediately. Those are two realities which would seem to be impossibly at odds with each other.

### "Tricking" the System

If you're thinking about a `Proxy`, let me stop you right there — go outside and enjoy your weekend. There is absolutely no way to wrap the `window` object inside of a proxy. If you're thinking about `Function.caller`, it's deprecated. If you're thinking about tracing with `Error().stack`, it's non-standard. If you're thinking of overriding `Object.valueOf()`, it won't affect equality operators. If you're thinking of `Object.assign(null, {...})`, that isn't a thing you can do. The only way we can have an object which both exists and does not exist, is to leverage the synchronous behavior of JavaScript — "tricking" FileMaker into being unaware. The object must exist when we need it, and then cease to exist entirely.

Luckily, well-tested code behaves with consistency, and once we understand the lifecycle of the `FileMaker` object, we can manipulate the order of things quite nicely. It really just comes down to this: injection of `FileMaker` is the **last** thing to happen. With that in-mind, when our code runs, the task is simple:

1. We need an object that "pretends" to be `FileMaker` and which can collect any script execution requests made by either `PerformScript()` or `PerformScriptWithOption()`.
2. We need to destroy the object "pretending" to be `FileMaker` **before** the injection routine runs.
3. FileMaker Pro or FileMaker WebDirect must be allowed to inject the "real" `FileMaker` object
4. All of the collected script requests must be dispatched to FileMaker for handling via the injected/"real" `FileMaker` object.
5. If `FileMaker` never injects, we must dispatch our script requests to the logger or their response functions.

Were I simply interested in deferral of script requests, this might have been a very easy task. However, the additional logging/responding utilities require continuous fulfillment of the `FileMaker` object, and thus the order of execution is extremely important.

### Pursuing Predictability

JavaScript provides us with the ability to execute code every time a variable is accessed or written. This is done by defining the _getter_ and _setter_ of a target. Through this definition, we can return different values for an Object's properties depending on how the object is accessed. Notice, however, that I said _an Object's **properties**_, and not _an Object_. That's important.

Suppose we have an `Object` named `Foo` with the property `Bar`, and the method `PerformScript()` on `Bar`. If we wanted to make `Bar` appear as `undefined` all times except when accessing `PerformScript`, we could wrap `Foo` inside of a `Proxy` object, and check to see if `Bar` is being accessed with or without properties. Based on that condition, we could return `undefined` or the method `PerformScript()`, etc. This approach can be incredibly useful in many scenarios, but it unfortunately doesn't apply to manipulation of the `FileMaker` object because it's a property of the global scope, `window`, which `cannot` be re-asserted as a `Proxy`.

Another option in conditionally returning a value is attempting to _trace_ what asked for the value. If we can know what's accessing our target, we can return a different value based on such a condition. In this pursuit, there's potential with a pretty low possibility of predictability when pattern-matching `Error().stack` (yes, I know what I said). As this is a non-standard property, implemented differently in each browser, it's entirely possible that code which works today won't work at all tomorrow.

Despite my wishes and best efforts to base declaration/assignment of `FileMaker` on dynamic evaluation of conditions, the most-predictable/repeatable interception method is to rely on the event cycles of JavaScript itself — using `setTimeout()` to carefully curate the order of each assignment.

### Follow The Code

Thus far, I've reviewed the principles which were tested and applied to engage the behavior of OnFMReady, but to really get an idea of how things come together, it's best to follow the code itself. In the TypeScript source, I've left comment blocks prefixed with `MS` (standing for "milestone"), which indicate at what point in the code an anticipated event is expected to occur, relative to FileMaker. If you'd like to know more about the event cycles which occur prior to, during, and after `FileMaker` injection, take a look at the source, `onfmready.ts`. If you're unfamiliar with TypeScript, it's effectively the same as JavaScript — just with some added syntax thrown-in to help-out during development.

## License

MIT — "Hell, yeah! Free software!"