(() => {
  type FileMaker = {
    PerformScript: Function;
    PerformScriptWithOption?: Function;
  };
  type WebViewer = Window & typeof globalThis & { FileMaker?: FileMaker };
  type OnFMReady = {
    respondTo: { [key: string]: Function | undefined };
    noLogging: boolean;
    unmount: boolean;
  };
  type WebViewerExt = WebViewer & { OnFMReady: OnFMReady };
  type ArgsOf<F> = F extends (...args: infer T) => unknown ? T : never;
  type FmScriptArgs = ArgsOf<typeof DEFAULT.PerformScriptWithOption>;
  type FmExpectedEvent = Event & { filemaker: boolean; FileMaker: boolean };

  /* #region Microsoft Internet Explorer 11 Support */
  if (typeof Object.assign != 'function') {
    /*--- Polyfill / Object.assign() ---*/
    Object.defineProperty(Object, 'assign', {
      // @ts-ignore -- read in `arguments` keyword
      value: function assign(target: any, varArgs: object) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });

    /*--- Polyfill / Event() and CustomEvent() ---*/
    function CustomEvent(event: string, params: any) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('Event');
      evt.initEvent(event, params.bubbles, params.cancelable);
      Object.defineProperty(evt, 'detail', { value: params.detail });
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    // @ts-ignore
    window.CustomEvent = CustomEvent;
    // @ts-ignore
    window.Event = CustomEvent;

  }
  /* #endregion */

  // deferred fm script requests
  let deferred: Array<any> = [];

  // final fm object disposition
  let unfulfilled: boolean;

  // extract for ts typing
  const $wnd = <WebViewerExt>window;

  // utility events
  const events = () => {
    if (!unfulfilled) {
      const ready = new Event('filemaker-ready');
      $wnd.dispatchEvent(ready);
      document.dispatchEvent(ready);
    }

    const expected: FmExpectedEvent = Object.assign(
      new Event('filemaker-expected'),
      {
        filemaker: !unfulfilled,
        FileMaker: !unfulfilled
      }
    );

    $wnd.dispatchEvent(expected);
    document.dispatchEvent(expected);
  };

  // edge on filemaker pro for microsoft windows injects immediately
  if (typeof $wnd.FileMaker === 'object') {
    // await next cycle -- dispatch utility events
    setTimeout(events);
    return;
  }

  // set default -- preserve existing
  $wnd.OnFMReady = Object.assign(
    { respondTo: {}, noLogging: false, unmount: false } as OnFMReady,
    $wnd.OnFMReady
  );

  const DEFAULT = {
    PerformScript: (script: string, param: string) =>
      DEFAULT.PerformScriptWithOption(script, param),
    PerformScriptWithOption: (
      script: string,
      param: string,
      option: string | number = 0
    ) => {
      if (unfulfilled) {
        utility(script, param, option);
      } else {
        deferred.push([script, param, option]);
      }
    }
  };

  // fallback utility
  const utility: (...args: FmScriptArgs) => any = (script, param, option) => {
    const responder = $wnd.OnFMReady.respondTo[script];
    return responder
      ? responder(param, option)
      : $wnd.OnFMReady.noLogging
      ? null
      : console.log(
          Object.assign({ script, param }, !!option ? { option } : {})
        );
  };

  // root store
  let STORE: FileMaker | null = DEFAULT;

  // fallback timeout
  let fallback: number;

  // waiting for fm injection
  let awaitingSet: boolean;

  // fm injection occurs at next tick after doc is loaded
  document.addEventListener('DOMContentLoaded', () => {
    STORE = null;
    awaitingSet = true;

    // force getter routine to evaluate fallback
    setTimeout(() => {
      // double defer to permit fm injection
      setTimeout(() => {
        $wnd.FileMaker;
      });
    });

    /*--- MS: FILEMAKER SHOULD INJECT ---*/
  });

  Object.defineProperty(window, 'FileMaker', {
    set(value: FileMaker | null) {
      STORE = value;
      awaitingSet = false;

      /*--- MS: FILEMAKER IS INJECTING ---*/

      // do not restore to default
      clearTimeout(fallback);

      // do not continue if unmounted
      if (value == undefined) return;

      // call scripts after fm injection is done
      setTimeout(() => {
        // perform and clear deferred script calls
        deferred.forEach((d) => {
          (STORE as FileMaker).PerformScriptWithOption(...(d as FmScriptArgs));
        });
        deferred = [];

        // dispatch event helpers
        events();
      });
    },
    get() {
      if (awaitingSet) {
        //TODO: that's cheating, but it's late, and i'm tired
        fallback = <any>setTimeout(() => {
          /*--- MS: FILEMAKER DID NOT INJECT ---*/
          unfulfilled = true;
          $wnd.FileMaker = $wnd.OnFMReady.unmount ? undefined : DEFAULT;
        });
      }
      return STORE;
    }
  });
})();
