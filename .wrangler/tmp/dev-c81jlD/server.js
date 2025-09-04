var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-5vFp3m/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../../usr/local/lib/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../../usr/local/lib/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../../usr/local/lib/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/partyserver/dist/index.js
import { DurableObject } from "cloudflare:workers";

// node_modules/partyserver/node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/partyserver/node_modules/nanoid/index.browser.js
var nanoid = /* @__PURE__ */ __name((size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}, "nanoid");

// node_modules/partyserver/dist/index.js
if (!("OPEN" in WebSocket)) {
  const WebSocketStatus = {
    // @ts-expect-error
    CONNECTING: WebSocket.READY_STATE_CONNECTING,
    // @ts-expect-error
    OPEN: WebSocket.READY_STATE_OPEN,
    // @ts-expect-error
    CLOSING: WebSocket.READY_STATE_CLOSING,
    // @ts-expect-error
    CLOSED: WebSocket.READY_STATE_CLOSED
  };
  Object.assign(WebSocket, WebSocketStatus);
  Object.assign(WebSocket.prototype, WebSocketStatus);
}
var AttachmentCache = class {
  static {
    __name(this, "AttachmentCache");
  }
  #cache = /* @__PURE__ */ new WeakMap();
  get(ws) {
    let attachment = this.#cache.get(ws);
    if (!attachment) {
      attachment = WebSocket.prototype.deserializeAttachment.call(
        ws
      );
      if (attachment !== void 0) {
        this.#cache.set(ws, attachment);
      } else {
        throw new Error(
          "Missing websocket attachment. This is most likely an issue in PartyServer, please open an issue at https://github.com/threepointone/partyserver/issues"
        );
      }
    }
    return attachment;
  }
  set(ws, attachment) {
    this.#cache.set(ws, attachment);
    WebSocket.prototype.serializeAttachment.call(ws, attachment);
  }
};
var attachments = new AttachmentCache();
var connections = /* @__PURE__ */ new WeakSet();
var isWrapped = /* @__PURE__ */ __name((ws) => {
  return connections.has(ws);
}, "isWrapped");
var createLazyConnection = /* @__PURE__ */ __name((ws) => {
  if (isWrapped(ws)) {
    return ws;
  }
  let initialState = void 0;
  if ("state" in ws) {
    initialState = ws.state;
    delete ws.state;
  }
  const connection = Object.defineProperties(ws, {
    id: {
      get() {
        return attachments.get(ws).__pk.id;
      }
    },
    server: {
      get() {
        return attachments.get(ws).__pk.server;
      }
    },
    socket: {
      get() {
        return ws;
      }
    },
    state: {
      get() {
        return ws.deserializeAttachment();
      }
    },
    setState: {
      value: /* @__PURE__ */ __name(function setState(setState) {
        let state;
        if (setState instanceof Function) {
          state = setState(this.state);
        } else {
          state = setState;
        }
        ws.serializeAttachment(state);
        return state;
      }, "setState")
    },
    deserializeAttachment: {
      value: /* @__PURE__ */ __name(function deserializeAttachment() {
        const attachment = attachments.get(ws);
        return attachment.__user ?? null;
      }, "deserializeAttachment")
    },
    serializeAttachment: {
      value: /* @__PURE__ */ __name(function serializeAttachment(attachment) {
        const setting = {
          ...attachments.get(ws),
          __user: attachment ?? null
        };
        attachments.set(ws, setting);
      }, "serializeAttachment")
    }
  });
  if (initialState) {
    connection.setState(initialState);
  }
  connections.add(connection);
  return connection;
}, "createLazyConnection");
var HibernatingConnectionIterator = class {
  static {
    __name(this, "HibernatingConnectionIterator");
  }
  constructor(state, tag) {
    this.state = state;
    this.tag = tag;
  }
  index = 0;
  sockets;
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const sockets = (
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      this.sockets ?? (this.sockets = this.state.getWebSockets(this.tag))
    );
    let socket;
    while (socket = sockets[this.index++]) {
      if (socket.readyState === WebSocket.READY_STATE_OPEN) {
        const value = createLazyConnection(socket);
        return { done: false, value };
      }
    }
    return { done: true, value: void 0 };
  }
};
var InMemoryConnectionManager = class {
  static {
    __name(this, "InMemoryConnectionManager");
  }
  #connections = /* @__PURE__ */ new Map();
  tags = /* @__PURE__ */ new WeakMap();
  getCount() {
    return this.#connections.size;
  }
  getConnection(id) {
    return this.#connections.get(id);
  }
  *getConnections(tag) {
    if (!tag) {
      yield* this.#connections.values().filter(
        (c) => c.readyState === WebSocket.READY_STATE_OPEN
      );
      return;
    }
    for (const connection of this.#connections.values()) {
      const connectionTags = this.tags.get(connection) ?? [];
      if (connectionTags.includes(tag)) {
        yield connection;
      }
    }
  }
  accept(connection, options) {
    connection.accept();
    this.#connections.set(connection.id, connection);
    this.tags.set(connection, [
      // make sure we have id tag
      connection.id,
      ...options.tags.filter((t) => t !== connection.id)
    ]);
    const removeConnection = /* @__PURE__ */ __name(() => {
      this.#connections.delete(connection.id);
      connection.removeEventListener("close", removeConnection);
      connection.removeEventListener("error", removeConnection);
    }, "removeConnection");
    connection.addEventListener("close", removeConnection);
    connection.addEventListener("error", removeConnection);
    return connection;
  }
};
var HibernatingConnectionManager = class {
  static {
    __name(this, "HibernatingConnectionManager");
  }
  constructor(controller) {
    this.controller = controller;
  }
  getCount() {
    return Number(this.controller.getWebSockets().length);
  }
  getConnection(id) {
    const sockets = this.controller.getWebSockets(id);
    if (sockets.length === 0) return void 0;
    if (sockets.length === 1)
      return createLazyConnection(sockets[0]);
    throw new Error(
      `More than one connection found for id ${id}. Did you mean to use getConnections(tag) instead?`
    );
  }
  getConnections(tag) {
    return new HibernatingConnectionIterator(this.controller, tag);
  }
  accept(connection, options) {
    const tags = [
      connection.id,
      ...options.tags.filter((t) => t !== connection.id)
    ];
    if (tags.length > 10) {
      throw new Error(
        "A connection can only have 10 tags, including the default id tag."
      );
    }
    for (const tag of tags) {
      if (typeof tag !== "string") {
        throw new Error(`A connection tag must be a string. Received: ${tag}`);
      }
      if (tag === "") {
        throw new Error("A connection tag must not be an empty string.");
      }
      if (tag.length > 256) {
        throw new Error("A connection tag must not exceed 256 characters");
      }
    }
    this.controller.acceptWebSocket(connection, tags);
    connection.serializeAttachment({
      __pk: {
        id: connection.id,
        server: options.server
      },
      __user: null
    });
    return createLazyConnection(connection);
  }
};
var serverMapCache = /* @__PURE__ */ new WeakMap();
function camelCaseToKebabCase(str) {
  if (str === str.toUpperCase() && str !== str.toLowerCase()) {
    return str.toLowerCase().replace(/_/g, "-");
  }
  let kebabified = str.replace(
    /[A-Z]/g,
    (letter) => `-${letter.toLowerCase()}`
  );
  kebabified = kebabified.startsWith("-") ? kebabified.slice(1) : kebabified;
  return kebabified.replace(/_/g, "-").replace(/-$/, "");
}
__name(camelCaseToKebabCase, "camelCaseToKebabCase");
async function routePartykitRequest(req, env2, options) {
  if (!serverMapCache.has(env2)) {
    serverMapCache.set(
      env2,
      Object.entries(env2).reduce((acc, [k, v]) => {
        if (v && typeof v === "object" && "idFromName" in v && typeof v.idFromName === "function") {
          Object.assign(acc, { [camelCaseToKebabCase(k)]: v });
          return acc;
        }
        return acc;
      }, {})
    );
  }
  const map = serverMapCache.get(env2);
  const prefix = options?.prefix || "parties";
  const prefixParts = prefix.split("/");
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const prefixMatches = prefixParts.every(
    (part, index) => parts[index] === part
  );
  if (!prefixMatches || parts.length < prefixParts.length + 2) {
    return null;
  }
  const namespace = parts[prefixParts.length];
  const name = parts[prefixParts.length + 1];
  if (name && namespace) {
    if (!map[namespace]) {
      if (namespace === "main") {
        console.warn(
          "You appear to be migrating a PartyKit project to PartyServer."
        );
        console.warn(`PartyServer doesn't have a "main" party by default. Try adding this to your PartySocket client:
 
party: "${camelCaseToKebabCase(Object.keys(map)[0])}"`);
      } else {
        console.error(`The url ${req.url} does not match any server namespace. 
Did you forget to add a durable object binding to the class in your wrangler.toml?`);
      }
    }
    let doNamespace = map[namespace];
    if (options?.jurisdiction) {
      doNamespace = doNamespace.jurisdiction(options.jurisdiction);
    }
    const id = doNamespace.idFromName(name);
    const stub = doNamespace.get(id, options);
    req = new Request(req);
    req.headers.set("x-partykit-room", name);
    req.headers.set("x-partykit-namespace", namespace);
    if (options?.jurisdiction) {
      req.headers.set("x-partykit-jurisdiction", options.jurisdiction);
    }
    if (options?.props) {
      req.headers.set("x-partykit-props", JSON.stringify(options?.props));
    }
    if (req.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      if (options?.onBeforeConnect) {
        const reqOrRes = await options.onBeforeConnect(req, {
          party: namespace,
          name
        });
        if (reqOrRes instanceof Request) {
          req = reqOrRes;
        } else if (reqOrRes instanceof Response) {
          return reqOrRes;
        }
      }
    } else {
      if (options?.onBeforeRequest) {
        const reqOrRes = await options.onBeforeRequest(req, {
          party: namespace,
          name
        });
        if (reqOrRes instanceof Request) {
          req = reqOrRes;
        } else if (reqOrRes instanceof Response) {
          return reqOrRes;
        }
      }
    }
    return stub.fetch(req);
  } else {
    return null;
  }
}
__name(routePartykitRequest, "routePartykitRequest");
var Server = class extends DurableObject {
  static {
    __name(this, "Server");
  }
  static options = {
    hibernate: false
  };
  #status = "zero";
  #ParentClass = Object.getPrototypeOf(this).constructor;
  #connectionManager = this.#ParentClass.options.hibernate ? new HibernatingConnectionManager(this.ctx) : new InMemoryConnectionManager();
  /**
   * Execute SQL queries against the Server's database
   * @template T Type of the returned rows
   * @param strings SQL query template strings
   * @param values Values to be inserted into the query
   * @returns Array of query results
   */
  sql(strings, ...values) {
    let query = "";
    try {
      query = strings.reduce(
        (acc, str, i) => acc + str + (i < values.length ? "?" : ""),
        ""
      );
      return [...this.ctx.storage.sql.exec(query, ...values)];
    } catch (e) {
      console.error(`failed to execute sql query: ${query}`, e);
      throw this.onException(e);
    }
  }
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(ctx, env2) {
    super(ctx, env2);
  }
  /**
   * Handle incoming requests to the server.
   */
  async fetch(request) {
    const props = request.headers.get("x-partykit-props");
    if (props) {
      try {
        this.#_props = JSON.parse(props);
      } catch {
        console.error("Internal error parsing context props.");
      }
    }
    if (!this.#_name) {
      const room = request.headers.get("x-partykit-room");
      if (
        // !namespace ||
        !room
      ) {
        throw new Error(`Missing namespace or room headers when connecting to ${this.#ParentClass.name}.
Did you try connecting directly to this Durable Object? Try using getServerByName(namespace, id) instead.`);
      }
      await this.setName(room);
    }
    try {
      const url = new URL(request.url);
      if (url.pathname === "/cdn-cgi/partyserver/set-name/") {
        return Response.json({ ok: true });
      }
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return await this.onRequest(request);
      } else {
        const { 0: clientWebSocket, 1: serverWebSocket } = new WebSocketPair();
        let connectionId = url.searchParams.get("_pk");
        if (!connectionId) {
          connectionId = nanoid();
        }
        let connection = Object.assign(serverWebSocket, {
          id: connectionId,
          server: this.name,
          state: null,
          setState(setState) {
            let state;
            if (setState instanceof Function) {
              state = setState(this.state);
            } else {
              state = setState;
            }
            this.state = state;
            return this.state;
          }
        });
        const ctx = { request };
        const tags = await this.getConnectionTags(connection, ctx);
        connection = this.#connectionManager.accept(connection, {
          tags,
          server: this.name
        });
        if (!this.#ParentClass.options.hibernate) {
          this.#attachSocketEventHandlers(connection);
        }
        await this.onConnect(connection, ctx);
        return new Response(null, { status: 101, webSocket: clientWebSocket });
      }
    } catch (err) {
      console.error(
        `Error in ${this.#ParentClass.name}:${this.name} fetch:`,
        err
      );
      if (!(err instanceof Error)) throw err;
      if (request.headers.get("Upgrade") === "websocket") {
        const pair = new WebSocketPair();
        pair[1].accept();
        pair[1].send(JSON.stringify({ error: err.stack }));
        pair[1].close(1011, "Uncaught exception during session setup");
        return new Response(null, { status: 101, webSocket: pair[0] });
      } else {
        return new Response(err.stack, { status: 500 });
      }
    }
  }
  async webSocketMessage(ws, message) {
    const connection = createLazyConnection(ws);
    await this.setName(connection.server);
    if (this.#status !== "started") {
      await this.#initialize();
    }
    return this.onMessage(connection, message);
  }
  async webSocketClose(ws, code, reason, wasClean) {
    const connection = createLazyConnection(ws);
    await this.setName(connection.server);
    if (this.#status !== "started") {
      await this.#initialize();
    }
    return this.onClose(connection, code, reason, wasClean);
  }
  async webSocketError(ws, error3) {
    const connection = createLazyConnection(ws);
    await this.setName(connection.server);
    if (this.#status !== "started") {
      await this.#initialize();
    }
    return this.onError(connection, error3);
  }
  async #initialize() {
    await this.ctx.blockConcurrencyWhile(async () => {
      this.#status = "starting";
      await this.onStart(this.#_props);
      this.#status = "started";
    });
  }
  #attachSocketEventHandlers(connection) {
    const handleMessageFromClient = /* @__PURE__ */ __name((event) => {
      this.onMessage(connection, event.data)?.catch((e) => {
        console.error("onMessage error:", e);
      });
    }, "handleMessageFromClient");
    const handleCloseFromClient = /* @__PURE__ */ __name((event) => {
      connection.removeEventListener("message", handleMessageFromClient);
      connection.removeEventListener("close", handleCloseFromClient);
      this.onClose(connection, event.code, event.reason, event.wasClean)?.catch(
        (e) => {
          console.error("onClose error:", e);
        }
      );
    }, "handleCloseFromClient");
    const handleErrorFromClient = /* @__PURE__ */ __name((e) => {
      connection.removeEventListener("message", handleMessageFromClient);
      connection.removeEventListener("error", handleErrorFromClient);
      this.onError(connection, e.error)?.catch((e2) => {
        console.error("onError error:", e2);
      });
    }, "handleErrorFromClient");
    connection.addEventListener("close", handleCloseFromClient);
    connection.addEventListener("error", handleErrorFromClient);
    connection.addEventListener("message", handleMessageFromClient);
  }
  // Public API
  #_name;
  #_longErrorAboutNameThrown = false;
  /**
   * The name for this server. Write-once-only.
   */
  get name() {
    if (!this.#_name) {
      if (!this.#_longErrorAboutNameThrown) {
        this.#_longErrorAboutNameThrown = true;
        throw new Error(
          `Attempting to read .name on ${this.#ParentClass.name} before it was set. The name can be set by explicitly calling .setName(name) on the stub, or by using routePartyKitRequest(). This is a known issue and will be fixed soon. Follow https://github.com/cloudflare/workerd/issues/2240 for more updates.`
        );
      } else {
        throw new Error(
          `Attempting to read .name on ${this.#ParentClass.name} before it was set.`
        );
      }
    }
    return this.#_name;
  }
  // We won't have an await inside this function
  // but it will be called remotely,
  // so we need to mark it as async
  async setName(name) {
    if (!name) {
      throw new Error("A name is required.");
    }
    if (this.#_name && this.#_name !== name) {
      throw new Error("This server already has a name.");
    }
    this.#_name = name;
    if (this.#status !== "started") {
      await this.ctx.blockConcurrencyWhile(async () => {
        await this.#initialize();
      });
    }
  }
  #sendMessageToConnection(connection, message) {
    try {
      connection.send(message);
    } catch (_e) {
      connection.close(1011, "Unexpected error");
    }
  }
  /** Send a message to all connected clients, except connection ids listed in `without` */
  broadcast(msg, without) {
    for (const connection of this.#connectionManager.getConnections()) {
      if (!without || !without.includes(connection.id)) {
        this.#sendMessageToConnection(connection, msg);
      }
    }
  }
  /** Get a connection by connection id */
  getConnection(id) {
    return this.#connectionManager.getConnection(id);
  }
  /**
   * Get all connections. Optionally, you can provide a tag to filter returned connections.
   * Use `Server#getConnectionTags` to tag the connection on connect.
   */
  getConnections(tag) {
    return this.#connectionManager.getConnections(tag);
  }
  /**
   * You can tag a connection to filter them in Server#getConnections.
   * Each connection supports up to 9 tags, each tag max length is 256 characters.
   */
  getConnectionTags(connection, context2) {
    return [];
  }
  #_props;
  // Implemented by the user
  /**
   * Called when the server is started for the first time.
   */
  onStart(props) {
  }
  /**
   * Called when a new connection is made to the server.
   */
  onConnect(connection, ctx) {
    console.log(
      `Connection ${connection.id} connected to ${this.#ParentClass.name}:${this.name}`
    );
  }
  /**
   * Called when a message is received from a connection.
   */
  onMessage(connection, message) {
    console.log(
      `Received message on connection ${this.#ParentClass.name}:${connection.id}`
    );
    console.info(
      `Implement onMessage on ${this.#ParentClass.name} to handle this message.`
    );
  }
  /**
   * Called when a connection is closed.
   */
  onClose(connection, code, reason, wasClean) {
  }
  /**
   * Called when an error occurs on a connection.
   */
  onError(connection, error3) {
    console.error(
      `Error on connection ${connection.id} in ${this.#ParentClass.name}:${this.name}:`,
      error3
    );
    console.info(
      `Implement onError on ${this.#ParentClass.name} to handle this error.`
    );
  }
  /**
   * Called when a request is made to the server.
   */
  onRequest(request) {
    console.warn(
      `onRequest hasn't been implemented on ${this.#ParentClass.name}:${this.name} responding to ${request.url}`
    );
    return new Response("Not implemented", { status: 404 });
  }
  /**
   * Called when an exception occurs.
   * @param error - The error that occurred.
   */
  onException(error3) {
    console.error(
      `Exception in ${this.#ParentClass.name}:${this.name}:`,
      error3
    );
    console.info(
      `Implement onException on ${this.#ParentClass.name} to handle this error.`
    );
  }
  onAlarm() {
    console.log(
      `Implement onAlarm on ${this.#ParentClass.name} to handle alarms.`
    );
  }
  async alarm() {
    if (this.#status !== "started") {
      await this.#initialize();
    }
    await this.onAlarm();
  }
};

// party/server.ts
var ColorPickerServer = class extends Server {
  static {
    __name(this, "ColorPickerServer");
  }
  // constructor(readonly room: Party.Room) {}
  onConnect(conn) {
    console.log(`User ${conn.id} connected`);
    this.broadcastUserCount();
  }
  async onMessage(sender, message) {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "cursor-move":
          this.broadcast(JSON.stringify({
            type: "cursor-move",
            sessionId: sender.id,
            position: data.position,
            normal: data.normal,
            color: data.color,
            rgb: data.rgb
          }), [sender.id]);
          break;
        case "cursor-leave":
          this.broadcast(JSON.stringify({
            type: "cursor-leave",
            sessionId: sender.id
          }), [sender.id]);
          break;
        case "camera-sync":
          this.broadcast(JSON.stringify({
            type: "camera-sync",
            camera: data.camera
          }), [sender.id]);
          break;
      }
    } catch (error3) {
      console.error("Invalid message format:", error3);
    }
  }
  onClose(connection) {
    console.log(`User ${connection.id} disconnected`);
    this.broadcast(JSON.stringify({
      type: "user-disconnect",
      sessionId: connection.id
    }));
    this.broadcastUserCount();
  }
  broadcastUserCount() {
    const connections2 = Array.from(this.getConnections());
    const userCount = connections2.length;
    this.broadcast(JSON.stringify({
      type: "user-count",
      count: userCount
    }));
  }
};
var server_default = {
  // Set up your fetch handler to use configured Servers
  async fetch(request, env2) {
    const response = await routePartykitRequest(request, env2, {
      // prefix: 'party/parties'
    });
    return response || new Response("Not Found", { status: 404 });
  }
};

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-5vFp3m/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = server_default;

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-5vFp3m/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ColorPickerServer,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=server.js.map
