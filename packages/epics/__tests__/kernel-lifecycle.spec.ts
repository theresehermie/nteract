import { actions as actionsModule, state as stateModule } from "@nteract/core";
import { createMessage, JupyterMessage, MessageType } from "@nteract/messaging";
import * as Immutable from "immutable";
import { ActionsObservable, StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

import {
  acquireKernelInfo,
  restartKernelEpic,
  watchExecutionStateEpic
} from "../src/kernel-lifecycle";

const buildScheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe("acquireKernelInfo", () => {
  test("sends a kernel_info_request and processes kernel_info_reply", async done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe((msg: JupyterMessage) => {
      expect(msg.header.msg_type).toEqual("kernel_info_request");

      const response = createMessage("kernel_info_reply" as MessageType);
      response.parent_header = msg.header;
      response.content = {
        status: "ok",
        protocol_version: "5.1",
        implementation: "ipython",
        implementation_version: "6.2.1",
        language_info: {
          name: "python",
          version: "3.6.5",
          mimetype: "text/x-python",
          codemirror_mode: { name: "ipython", version: 3 },
          pygments_lexer: "ipython3",
          nbconvert_exporter: "python",
          file_extension: ".py"
        },
        banner:
          "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
        help_links: [
          { text: "Python Reference", url: "https://docs.python.org/3.6" },
          {
            text: "IPython Reference",
            url: "https://ipython.org/documentation.html"
          },
          {
            text: "NumPy Reference",
            url: "https://docs.scipy.org/doc/numpy/reference/"
          },
          {
            text: "SciPy Reference",
            url: "https://docs.scipy.org/doc/scipy/reference/"
          },
          {
            text: "Matplotlib Reference",
            url: "https://matplotlib.org/contents.html"
          },
          {
            text: "SymPy Reference",
            url: "http://docs.sympy.org/latest/index.html"
          },
          {
            text: "pandas Reference",
            url: "https://pandas.pydata.org/pandas-docs/stable/"
          }
        ]
      };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "kernelRef",
        currentKernelspecsRef: "currentKernelspecsRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              kernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          }),
          kernelspecs: stateModule.makeKernelspecsRecord({
            byRef: Immutable.Map({
              currentKernelspecsRef: stateModule.makeKernelspecsByRefRecord({
                byName: Immutable.Map({ python: stateModule.makeKernelspec() })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        notificationSystem: { addNotification: () => {} }
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    };

    const obs = acquireKernelInfo(
      mockSocket,
      "fakeKernelRef",
      "fakeContentRef",
      state
    );

    const actions = await obs.pipe(toArray()).toPromise();

    expect(actions).toEqual([
      {
        payload: {
          contentRef: "fakeContentRef",
          kernelRef: "fakeKernelRef",
          langInfo: {
            name: "python",
            version: "3.6.5",
            mimetype: "text/x-python",
            codemirror_mode: { name: "ipython", version: 3 },
            pygments_lexer: "ipython3",
            nbconvert_exporter: "python",
            file_extension: ".py"
          }
        },
        type: "SET_LANGUAGE_INFO"
      },
      {
        type: "CORE/SET_KERNEL_INFO",
        payload: {
          info: {
            protocolVersion: "5.1",
            implementation: "ipython",
            implementationVersion: "6.2.1",
            banner:
              "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
            helpLinks: [
              { text: "Python Reference", url: "https://docs.python.org/3.6" },
              {
                text: "IPython Reference",
                url: "https://ipython.org/documentation.html"
              },
              {
                text: "NumPy Reference",
                url: "https://docs.scipy.org/doc/numpy/reference/"
              },
              {
                text: "SciPy Reference",
                url: "https://docs.scipy.org/doc/scipy/reference/"
              },
              {
                text: "Matplotlib Reference",
                url: "https://matplotlib.org/contents.html"
              },
              {
                text: "SymPy Reference",
                url: "http://docs.sympy.org/latest/index.html"
              },
              {
                text: "pandas Reference",
                url: "https://pandas.pydata.org/pandas-docs/stable/"
              }
            ],
            languageName: "python",
            languageVersion: "3.6.5",
            mimetype: "text/x-python",
            fileExtension: ".py",
            pygmentsLexer: "ipython3",
            codemirrorMode: { name: "ipython", version: 3 },
            nbconvertExporter: "python"
          },
          kernelRef: "fakeKernelRef"
        }
      },
      {
        payload: {
          contentRef: "fakeContentRef",
          kernelInfo: stateModule.makeKernelspec()
        },
        type: "SET_KERNEL_METADATA"
      }
    ]);

    done();
  });
});

describe("watchExecutionStateEpic", () => {
  test("returns an Observable with an initial state of idle", done => {
    const action$ = ActionsObservable.of({
      type: actionsModule.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels: of({
            header: { msg_type: "status" },
            content: { execution_state: "idle" }
          }) as Subject<any>,
          cwd: "/home/tester",
          type: "websocket"
        },
        kernelRef: "fakeKernelRef",
        contentRef: "fakeContentRef",
        selectNextKernel: false
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.pipe(toArray()).subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionsModule.SET_EXECUTION_STATE]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("restartKernelEpic", () => {
  test("work for outputHandling None", () => {
    const contentRef = "contentRef";
    const newKernelRef = "newKernelRef";

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        notificationSystem: { addNotification: () => {} }
      })
    };

    const testScheduler = buildScheduler();

    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;
      const inputActions = {
        a: actionsModule.restartKernel({
          outputHandling: "None",
          kernelRef: "oldKernelRef",
          contentRef
        }),
        b: actionsModule.launchKernelSuccessful({
          kernel: "",
          kernelRef: newKernelRef,
          contentRef,
          selectNextKernel: true
        })
      };

      const outputActions = {
        c: actionsModule.killKernel({
          restarting: true,
          kernelRef: "oldKernelRef"
        }),
        d: actionsModule.launchKernelByName({
          kernelSpecName: null,
          cwd: ".",
          kernelRef: newKernelRef,
          selectNextKernel: true,
          contentRef
        }),
        e: actionsModule.restartKernelSuccessful({
          kernelRef: newKernelRef,
          contentRef
        })
      };

      const inputMarbles = "a---b|";
      const outputMarbles = "(cd)e|";

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = restartKernelEpic(
        inputAction$,
        { value: state },
        () => newKernelRef
      );

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);
    });
  });
  test("work for outputHandling Restart and Run All", () => {
    const newKernelRef = "newKernelRef";

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        notificationSystem: { addNotification: () => {} }
      })
    };

    const testScheduler = buildScheduler();

    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;

      const inputActions = {
        a: actionsModule.restartKernel({
          outputHandling: "Run All",
          kernelRef: "oldKernelRef",
          contentRef: "contentRef"
        }),
        b: actionsModule.launchKernelSuccessful({
          kernel: "",
          kernelRef: newKernelRef,
          selectNextKernel: true
        })
      };

      const outputActions = {
        c: actionsModule.killKernel({
          restarting: true,
          kernelRef: "oldKernelRef"
        }),
        d: actionsModule.launchKernelByName({
          kernelSpecName: null,
          cwd: ".",
          kernelRef: newKernelRef,
          selectNextKernel: true,
          contentRef: "contentRef"
        }),
        e: actionsModule.restartKernelSuccessful({
          kernelRef: newKernelRef,
          contentRef: "contentRef"
        }),
        f: actionsModule.executeAllCells({ contentRef: "contentRef" })
      };

      const inputMarbles = "a---b---|";
      const outputMarbles = "(cd)(ef)|";

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = restartKernelEpic(
        inputAction$,
        { value: state },
        () => newKernelRef
      );

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);
    });
  });
  test("emits no action for remote kernel", async () => {
    const contentRef = "contentRef";
    const newKernelRef = "newKernelRef";

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeRemoteKernelRecord({
                status: "idle",
                type: "websocket"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        notificationSystem: { addNotification: () => {} }
      })
    };

    const responses = await restartKernelEpic(
      ActionsObservable.of(
        actionsModule.restartKernel({
          outputHandling: "Run All",
          kernelRef: "oldKernelRef",
          contentRef: "contentRef"
        })
      ),
      new StateObservable(new Subject(), state)
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([]);
  });
});
