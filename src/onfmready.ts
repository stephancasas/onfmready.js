(() => {
  type FileMaker = typeof DEFAULT;
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
    set(value: any) {
      STORE = value;
      awaitingSet = false;

      /*--- MS: FILEMAKER IS INJECTING ---*/

      // do not restore to default
      clearTimeout(fallback);

      // do not continue if unmounted
      if (value === undefined) return;

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
