(() => {
  // node_modules/i18next/dist/esm/i18next.js
  var isString = (obj) => typeof obj === "string";
  var defer = () => {
    let res;
    let rej;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    promise.resolve = res;
    promise.reject = rej;
    return promise;
  };
  var makeString = (object) => {
    if (object == null) return "";
    return String(object);
  };
  var isSafeLanguageCode = (code) => isString(code) && /^[A-Za-z0-9_@.-]{1,128}$/.test(code) && !code.includes("..") && !["__proto__", "constructor", "prototype"].includes(code);
  var callbackApiOf = (plugin) => plugin?.callbackApi ?? plugin?.constructor?.callbackApi;
  var copy = (a, s, t3) => {
    a.forEach((m) => {
      if (s[m]) t3[m] = s[m];
    });
  };
  var lastOfPathSeparatorRegExp = /###/g;
  var cleanKey = (key) => key && key.includes("###") ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
  var canNotTraverseDeeper = (object) => !object || isString(object);
  var getLastOfPath = (object, path, Empty) => {
    const stack = !isString(path) ? path : path.split(".");
    let stackIndex = 0;
    while (stackIndex < stack.length - 1) {
      if (canNotTraverseDeeper(object)) return {};
      const key = cleanKey(stack[stackIndex]);
      if (!object[key] && Empty) object[key] = new Empty();
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        object = object[key];
      } else {
        object = {};
      }
      ++stackIndex;
    }
    if (canNotTraverseDeeper(object)) return {};
    return {
      obj: object,
      k: cleanKey(stack[stackIndex])
    };
  };
  var setPath = (object, path, newValue) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path, Object);
    if (obj !== void 0 || path.length === 1) {
      obj[k] = newValue;
      return;
    }
    let e = path[path.length - 1];
    let p = path.slice(0, path.length - 1);
    let last = getLastOfPath(object, p, Object);
    while (last.obj === void 0 && p.length) {
      e = `${p[p.length - 1]}.${e}`;
      p = p.slice(0, p.length - 1);
      last = getLastOfPath(object, p, Object);
      if (last?.obj && typeof last.obj[`${last.k}.${e}`] !== "undefined") {
        last.obj = void 0;
      }
    }
    last.obj[`${last.k}.${e}`] = newValue;
  };
  var pushPath = (object, path, newValue, concat) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path, Object);
    obj[k] = obj[k] || [];
    obj[k].push(newValue);
  };
  var getPath = (object, path) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path);
    if (!obj) return void 0;
    if (!Object.prototype.hasOwnProperty.call(obj, k)) return void 0;
    return obj[k];
  };
  var getPathWithDefaults = (data, defaultData, key) => {
    const value = getPath(data, key);
    if (value !== void 0) {
      return value;
    }
    return getPath(defaultData, key);
  };
  var deepExtend = (target, source, overwrite) => {
    for (const prop in source) {
      if (prop !== "__proto__" && prop !== "constructor") {
        if (Object.prototype.hasOwnProperty.call(target, prop)) {
          if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
            if (overwrite) target[prop] = source[prop];
          } else {
            deepExtend(target[prop], source[prop], overwrite);
          }
        } else {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  };
  var regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  var _entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  var escape = (data) => {
    if (isString(data)) {
      return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
    }
    return data;
  };
  var RegExpCache = class {
    constructor(capacity) {
      this.capacity = capacity;
      this.regExpMap = /* @__PURE__ */ new Map();
      this.regExpQueue = [];
    }
    getRegExp(pattern) {
      const regExpFromCache = this.regExpMap.get(pattern);
      if (regExpFromCache !== void 0) {
        return regExpFromCache;
      }
      const regExpNew = new RegExp(pattern);
      if (this.regExpQueue.length === this.capacity) {
        this.regExpMap.delete(this.regExpQueue.shift());
      }
      this.regExpMap.set(pattern, regExpNew);
      this.regExpQueue.push(pattern);
      return regExpNew;
    }
  };
  var chars = [" ", ",", "?", "!", ";"];
  var looksLikeObjectPathRegExpCache = new RegExpCache(20);
  var looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
    nsSeparator = nsSeparator || "";
    keySeparator = keySeparator || "";
    const possibleChars = chars.filter((c) => !nsSeparator.includes(c) && !keySeparator.includes(c));
    if (possibleChars.length === 0) return true;
    const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
    let matched = !r.test(key);
    if (!matched) {
      const ki = key.indexOf(keySeparator);
      if (ki > 0 && !r.test(key.substring(0, ki))) {
        matched = true;
      }
    }
    return matched;
  };
  var deepFind = (obj, path, keySeparator = ".") => {
    if (!obj) return void 0;
    if (obj[path]) {
      if (!Object.prototype.hasOwnProperty.call(obj, path)) return void 0;
      return obj[path];
    }
    const tokens = path.split(keySeparator);
    let current = obj;
    for (let i = 0; i < tokens.length; ) {
      if (!current || typeof current !== "object") {
        return void 0;
      }
      let next;
      let nextPath = "";
      for (let j = i; j < tokens.length; ++j) {
        if (j !== i) {
          nextPath += keySeparator;
        }
        nextPath += tokens[j];
        next = current[nextPath];
        if ((typeof next === "function" || nextPath === "__proto__") && !Object.prototype.hasOwnProperty.call(current, nextPath)) {
          next = void 0;
        }
        if (next !== void 0) {
          if (["string", "number", "boolean"].includes(typeof next) && j < tokens.length - 1) {
            continue;
          }
          i += j - i + 1;
          break;
        }
      }
      current = next;
    }
    return current;
  };
  var getCleanedCode = (code) => code?.replace(/_/g, "-");
  var consoleLogger = {
    type: "logger",
    log(args) {
      this.output("log", args);
    },
    warn(args) {
      this.output("warn", args);
    },
    error(args) {
      this.output("error", args);
    },
    output(type, args) {
      console?.[type]?.apply?.(console, args);
    }
  };
  var Logger = class _Logger {
    constructor(concreteLogger, options = {}) {
      this.init(concreteLogger, options);
    }
    init(concreteLogger, options = {}) {
      this.prefix = options.prefix || "i18next:";
      this.logger = concreteLogger || consoleLogger;
      this.options = options;
      this.debug = options.debug;
      this.seen = /* @__PURE__ */ new Set();
    }
    log(...args) {
      return this.forward(args, "log", "", true);
    }
    warn(...args) {
      return this.forward(args, "warn", "", true);
    }
    error(...args) {
      return this.forward(args, "error", "");
    }
    deprecate(...args) {
      return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
    }
    once(key, lvl, ...args) {
      if (!this.debug || this.seen.has(key) || this.seen.size >= 1e3) return null;
      this.seen.add(key);
      return this[lvl](...args);
    }
    forward(args, lvl, prefix, debugOnly) {
      if (debugOnly && !this.debug) return null;
      args = args.map((a) => isString(a) ? a.replace(/[\r\n\x00-\x1F\x7F]/g, " ") : a);
      if (isString(args[0])) args[0] = `${prefix}${this.prefix} ${args[0]}`;
      return this.logger[lvl](args);
    }
    create(moduleName) {
      return new _Logger(this.logger, {
        ...{
          prefix: `${this.prefix}:${moduleName}:`
        },
        ...this.options
      });
    }
    clone(options) {
      options = options || this.options;
      options.prefix = options.prefix || this.prefix;
      return new _Logger(this.logger, options);
    }
  };
  var baseLogger = new Logger();
  var EventEmitter = class {
    constructor() {
      this.observers = {};
    }
    on(events, listener) {
      events.split(" ").forEach((event) => {
        if (!this.observers[event]) this.observers[event] = /* @__PURE__ */ new Map();
        const numListeners = this.observers[event].get(listener) || 0;
        this.observers[event].set(listener, numListeners + 1);
      });
      return this;
    }
    off(events, listener) {
      (typeof events === "string" ? events.split(" ") : [events]).forEach((event) => {
        if (!this.observers[event]) return;
        if (!listener) {
          delete this.observers[event];
          return;
        }
        this.observers[event].delete(listener);
      });
    }
    once(event, listener) {
      const wrapper = (...args) => {
        listener(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
      return this;
    }
    emit(event, ...args) {
      if (this.observers[event]) {
        const cloned = Array.from(this.observers[event].entries());
        cloned.forEach(([observer, numTimesAdded]) => {
          for (let i = 0; i < numTimesAdded; i++) {
            observer(...args);
          }
        });
      }
      if (this.observers["*"]) {
        const cloned = Array.from(this.observers["*"].entries());
        cloned.forEach(([observer, numTimesAdded]) => {
          for (let i = 0; i < numTimesAdded; i++) {
            observer(event, ...args);
          }
        });
      }
    }
  };
  var nonEmptyBundles = /* @__PURE__ */ new WeakSet();
  var ResourceStore = class extends EventEmitter {
    constructor(data, options = {
      ns: ["translation"],
      defaultNS: "translation"
    }) {
      super();
      this.data = data || {};
      this.options = options;
      this.logger = baseLogger.create("resourceStore");
      if (this.options.keySeparator === void 0) {
        this.options.keySeparator = ".";
      }
      if (this.options.ignoreJSONStructure === void 0) {
        this.options.ignoreJSONStructure = true;
      }
    }
    addNamespaces(ns) {
      if (!this.options.ns.includes(ns)) {
        this.options.ns.push(ns);
      }
    }
    removeNamespaces(ns) {
      const index = this.options.ns.indexOf(ns);
      if (index > -1) {
        this.options.ns.splice(index, 1);
      }
    }
    deprecateDottedLng(method) {
      this.logger.once(method, "deprecate", `${method}: a dotted language ('en.translation.key') that carries the namespace and key is removed in v27; pass language, namespace and key as separate arguments`);
    }
    getResource(lng, ns, key, options = {}) {
      const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
      const ignoreJSONStructure = options.ignoreJSONStructure !== void 0 ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
      let path;
      if (lng.includes(".")) {
        this.deprecateDottedLng("getResource");
        path = lng.split(".");
      } else {
        path = [lng, ns];
        if (key) {
          if (Array.isArray(key)) {
            path.push(...key);
          } else if (isString(key) && keySeparator) {
            path.push(...key.split(keySeparator));
          } else {
            path.push(key);
          }
        }
      }
      const result = getPath(this.data, path);
      if (result == null && !ns && !key && lng.includes(".")) {
        lng = path[0];
        ns = path[1];
        key = path.slice(2).join(".");
      }
      if (result != null || !ignoreJSONStructure || !isString(key)) return result;
      return deepFind(this.data?.[lng]?.[ns], key, keySeparator);
    }
    addResource(lng, ns, key, value, options = {
      silent: false
    }) {
      const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
      let path = [lng, ns];
      if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
      if (lng.includes(".")) {
        this.deprecateDottedLng("addResource");
        path = lng.split(".");
        value = ns;
        ns = path[1];
      }
      this.addNamespaces(ns);
      setPath(this.data, path, value);
      if (!options.silent) this.emit("added", lng, ns, key, value);
    }
    addResources(lng, ns, resources, options = {
      silent: false
    }) {
      for (const m in resources) {
        if (isString(resources[m]) || Array.isArray(resources[m])) this.addResource(lng, ns, m, resources[m], {
          silent: true
        });
      }
      if (!options.silent) this.emit("added", lng, ns, resources);
    }
    addResourceBundle(lng, ns, resources, deep, overwrite, options = {
      silent: false,
      skipCopy: false
    }) {
      let path = [lng, ns];
      if (lng.includes(".")) {
        this.deprecateDottedLng("addResourceBundle");
        path = lng.split(".");
        deep = resources;
        resources = ns;
        ns = path[1];
      }
      this.addNamespaces(ns);
      let pack = getPath(this.data, path) || {};
      if (!options.skipCopy) resources = JSON.parse(JSON.stringify(resources));
      if (deep) {
        deepExtend(pack, resources, overwrite);
      } else {
        pack = {
          ...pack,
          ...resources
        };
      }
      setPath(this.data, path, pack);
      if (!options.silent) this.emit("added", lng, ns, resources);
    }
    removeResourceBundle(lng, ns) {
      if (this.hasResourceBundle(lng, ns)) {
        delete this.data[lng][ns];
      }
      this.removeNamespaces(ns);
      this.emit("removed", lng, ns);
    }
    hasResourceBundle(lng, ns) {
      return this.getResource(lng, ns) !== void 0;
    }
    getResourceBundle(lng, ns) {
      if (!ns) ns = this.options.defaultNS;
      return this.getResource(lng, ns);
    }
    getDataByLanguage(lng) {
      return this.data[lng];
    }
    hasLanguageSomeTranslations(lng) {
      const data = this.getDataByLanguage(lng);
      const n = data && Object.keys(data) || [];
      return !!n.find((v) => {
        const bundle = data[v];
        if (nonEmptyBundles.has(bundle)) return true;
        if (!bundle || Object.keys(bundle).length === 0) return false;
        if (typeof bundle === "object") nonEmptyBundles.add(bundle);
        return true;
      });
    }
    toJSON() {
      return this.data;
    }
  };
  var postProcessor = {
    processors: {},
    addPostProcessor(module) {
      this.processors[module.name] = module;
    },
    handle(processors, value, key, options, translator) {
      processors.forEach((processor) => {
        value = this.processors[processor]?.process(value, key, options, translator) ?? value;
      });
      return value;
    }
  };
  var PATH_KEY = Symbol("i18next/PATH_KEY");
  function createProxy() {
    const state = [];
    const handler = /* @__PURE__ */ Object.create(null);
    let proxy;
    handler.get = (target, key) => {
      proxy?.revoke?.();
      if (key === PATH_KEY) return state;
      state.push(key);
      proxy = Proxy.revocable(target, handler);
      return proxy.proxy;
    };
    return Proxy.revocable(/* @__PURE__ */ Object.create(null), handler).proxy;
  }
  function keysFromSelector(selector, opts) {
    const {
      [PATH_KEY]: path
    } = selector(createProxy());
    const keySeparator = opts?.keySeparator ?? ".";
    const nsSeparator = opts?.nsSeparator ?? ":";
    const strict = opts?.enableSelector === "strict";
    if (path.length > 1 && nsSeparator) {
      const ns = opts?.ns;
      const nsList = strict ? Array.isArray(ns) ? ns : ns ? [ns] : null : Array.isArray(ns) ? ns : null;
      if (nsList) {
        const candidates = strict ? nsList : nsList.length > 1 ? nsList.slice(1) : [];
        if (candidates.includes(path[0])) {
          return `${path[0]}${nsSeparator}${path.slice(1).join(keySeparator)}`;
        }
      }
    }
    return path.join(keySeparator);
  }
  var shouldHandleAsObject = (res) => !isString(res) && typeof res !== "boolean" && typeof res !== "number";
  var Translator = class _Translator extends EventEmitter {
    constructor(services, options = {}) {
      super();
      copy(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils", "ownPostProcessors"], services, this);
      this.options = options;
      if (this.options.keySeparator === void 0) {
        this.options.keySeparator = ".";
      }
      this.logger = baseLogger.create("translator");
      this.checkedLoadedFor = {};
    }
    changeLanguage(lng) {
      if (lng) this.language = lng;
    }
    exists(key, o = {
      interpolation: {}
    }) {
      const opt = {
        ...o
      };
      if (key == null) return false;
      const resolved = this.resolve(key, opt);
      if (resolved?.res === void 0) return false;
      const isObject = shouldHandleAsObject(resolved.res);
      if (opt.returnObjects === false && isObject) {
        return false;
      }
      return true;
    }
    extractFromKey(key, opt) {
      let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
      if (nsSeparator === void 0) nsSeparator = ":";
      const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
      let namespaces = opt.ns || this.options.defaultNS || [];
      const wouldCheckForNsInKey = nsSeparator && key.includes(nsSeparator);
      const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !opt.keySeparator && !this.options.userDefinedNsSeparator && !opt.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
      if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
        const m = key.match(this.interpolator.nestingRegexp);
        if (m && m.length > 0) {
          return {
            key,
            namespaces: isString(namespaces) ? [namespaces] : namespaces
          };
        }
        const parts = key.split(nsSeparator);
        if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.includes(parts[0])) namespaces = parts.shift();
        key = parts.join(keySeparator);
      }
      return {
        key,
        namespaces: isString(namespaces) ? [namespaces] : namespaces
      };
    }
    translate(keys, o, lastKey) {
      let opt = typeof o === "object" ? {
        ...o
      } : o;
      if (typeof opt !== "object" && this.options.overloadTranslationOptionHandler) {
        opt = this.options.overloadTranslationOptionHandler(arguments);
      }
      if (typeof opt === "object") opt = {
        ...opt
      };
      if (!opt) opt = {};
      if (keys == null) return "";
      if (typeof keys === "function") keys = keysFromSelector(keys, {
        ...this.options,
        ...opt
      });
      if (!Array.isArray(keys)) keys = [String(keys)];
      keys = keys.map((k) => typeof k === "function" ? keysFromSelector(k, {
        ...this.options,
        ...opt
      }) : String(k));
      const returnDetails = opt.returnDetails !== void 0 ? opt.returnDetails : this.options.returnDetails;
      const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
      const {
        key,
        namespaces
      } = this.extractFromKey(keys[keys.length - 1], opt);
      const namespace = namespaces[namespaces.length - 1];
      let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
      if (nsSeparator === void 0) nsSeparator = ":";
      const lng = opt.lng || this.language;
      const appendNamespaceToCIMode = opt.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
      if (lng?.toLowerCase() === "cimode") {
        if (appendNamespaceToCIMode) {
          if (returnDetails) {
            return {
              res: `${namespace}${nsSeparator}${key}`,
              usedKey: key,
              exactUsedKey: key,
              usedLng: lng,
              usedNS: namespace,
              usedParams: this.getUsedParamsDetails(opt)
            };
          }
          return `${namespace}${nsSeparator}${key}`;
        }
        if (returnDetails) {
          return {
            res: key,
            usedKey: key,
            exactUsedKey: key,
            usedLng: lng,
            usedNS: namespace,
            usedParams: this.getUsedParamsDetails(opt)
          };
        }
        return key;
      }
      const resolved = this.resolve(keys, opt);
      let res = resolved?.res;
      const resUsedKey = resolved?.usedKey || key;
      const resExactUsedKey = resolved?.exactUsedKey || key;
      const noObject = ["[object Number]", "[object Function]", "[object RegExp]"];
      const joinArrays = opt.joinArrays !== void 0 ? opt.joinArrays : this.options.joinArrays;
      const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
      const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
      const hasDefaultValue = _Translator.hasDefaultValue(opt);
      const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, opt) : "";
      const defaultValueSuffixOrdinalFallback = opt.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, {
        ordinal: false
      }) : "";
      const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
      const defaultValue = needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] || opt[`defaultValue${defaultValueSuffix}`] || opt[`defaultValue${defaultValueSuffixOrdinalFallback}`] || opt.defaultValue;
      let resForObjHndl = res;
      if (handleAsObjectInI18nFormat && !res && hasDefaultValue) {
        resForObjHndl = defaultValue;
      }
      const handleAsObject = shouldHandleAsObject(resForObjHndl);
      const resType = Object.prototype.toString.apply(resForObjHndl);
      if (handleAsObjectInI18nFormat && resForObjHndl && handleAsObject && !noObject.includes(resType) && !(isString(joinArrays) && Array.isArray(resForObjHndl))) {
        if (!opt.returnObjects && !this.options.returnObjects) {
          if (!this.options.returnedObjectHandler) {
            this.logger.warn("accessing an object - but returnObjects options is not enabled!");
            this.logger.once("returnedObject", "deprecate", "accessing an object without returnObjects returns a sentence about it today; from v27 t() returns the key, as for a missing key (returnedObjectHandler can keep today's text)");
          }
          const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, resForObjHndl, {
            ...opt,
            ns: namespaces
          }) : `key '${key} (${this.language})' returned an object instead of string.`;
          if (returnDetails) {
            resolved.res = r;
            resolved.usedParams = this.getUsedParamsDetails(opt);
            return resolved;
          }
          return r;
        }
        if (keySeparator) {
          const resTypeIsArray = Array.isArray(resForObjHndl);
          const copy2 = resTypeIsArray ? [] : {};
          const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
          for (const m in resForObjHndl) {
            if (Object.prototype.hasOwnProperty.call(resForObjHndl, m)) {
              const deepKey = `${newKeyToUse}${keySeparator}${m}`;
              if (hasDefaultValue && !res) {
                copy2[m] = this.translate(deepKey, {
                  ...opt,
                  defaultValue: shouldHandleAsObject(defaultValue) ? defaultValue[m] : void 0,
                  ...{
                    joinArrays: false,
                    ns: namespaces
                  }
                });
              } else {
                copy2[m] = this.translate(deepKey, {
                  ...opt,
                  ...{
                    joinArrays: false,
                    ns: namespaces
                  }
                });
              }
              if (copy2[m] === deepKey) copy2[m] = resForObjHndl[m];
            }
          }
          res = copy2;
        }
      } else if (handleAsObjectInI18nFormat && isString(joinArrays) && Array.isArray(res)) {
        res = res.join(joinArrays);
        if (res) res = this.extendTranslation(res, keys, opt, resolved, lastKey);
      } else {
        let usedDefault = false;
        let usedKey = false;
        if (!this.isValidLookup(res) && hasDefaultValue) {
          usedDefault = true;
          res = defaultValue;
        }
        if (!this.isValidLookup(res)) {
          usedKey = true;
          res = key;
        }
        const missingKeyNoValueFallbackToKey = opt.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey;
        const resForMissing = missingKeyNoValueFallbackToKey && usedKey ? void 0 : res;
        const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
        if (usedKey || usedDefault || updateMissing) {
          this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, needsPluralHandling && !updateMissing ? `${key}${this.pluralResolver.getSuffix(lng, opt.count, opt)}` : key, updateMissing ? defaultValue : res);
          if (keySeparator) {
            const fk = this.resolve(key, {
              ...opt,
              keySeparator: false
            });
            if (fk && fk.res) this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
          }
          let lngs = [];
          const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, opt.lng || this.language);
          if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) {
            for (let i = 0; i < fallbackLngs.length; i++) {
              lngs.push(fallbackLngs[i]);
            }
          } else if (this.options.saveMissingTo === "all") {
            lngs = this.languageUtils.toResolveHierarchy(opt.lng || this.language);
          } else {
            lngs.push(opt.lng || this.language);
          }
          const send = (l, k, specificDefaultValue) => {
            const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
            if (this.options.missingKeyHandler) {
              this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, opt);
            } else if (this.backendConnector?.saveMissing) {
              this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, opt, void 0, this.utils?.hasLoadedNamespace);
            }
            this.emit("missingKey", l, namespace, k, res);
          };
          if (this.options.saveMissing) {
            if (this.options.saveMissingPlurals && needsPluralHandling) {
              lngs.forEach((language) => {
                const suffixes = this.pluralResolver.getSuffixes(language, opt);
                if (needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] && !suffixes.includes(`${this.options.pluralSeparator}zero`)) {
                  suffixes.push(`${this.options.pluralSeparator}zero`);
                }
                suffixes.forEach((suffix) => {
                  send([language], key + suffix, opt[`defaultValue${suffix}`] || defaultValue);
                });
              });
            } else {
              send(lngs, key, defaultValue);
            }
          }
        }
        res = this.extendTranslation(res, keys, opt, resolved, lastKey);
        if (usedKey && res === key && this.options.appendNamespaceToMissingKey) {
          res = `${namespace}${nsSeparator}${key}`;
        }
        if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) {
          res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}${nsSeparator}${key}` : key, usedDefault ? res : void 0, opt);
        }
      }
      if (returnDetails) {
        resolved.res = res;
        resolved.usedParams = this.getUsedParamsDetails(opt);
        return resolved;
      }
      return res;
    }
    extendTranslation(res, key, opt, resolved, lastKey) {
      if (this.i18nFormat?.parse) {
        res = this.i18nFormat.parse(res, {
          ...this.options.interpolation.defaultVariables,
          ...opt
        }, opt.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, {
          resolved
        });
      } else if (!opt.skipInterpolation) {
        if (opt.interpolation) this.interpolator.init({
          ...opt,
          ...{
            interpolation: {
              ...this.options.interpolation,
              ...opt.interpolation
            }
          }
        });
        const skipOnVariables = isString(res) && (opt?.interpolation?.skipOnVariables !== void 0 ? opt.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
        let nestBef;
        if (skipOnVariables) {
          const nb = res.match(this.interpolator.nestingRegexp);
          nestBef = nb && nb.length;
        }
        let data = opt.replace && !isString(opt.replace) ? opt.replace : opt;
        if (this.options.interpolation.defaultVariables) data = {
          ...this.options.interpolation.defaultVariables,
          ...data
        };
        res = this.interpolator.interpolate(res, data, opt.lng || this.language || resolved.usedLng, opt);
        if (skipOnVariables) {
          const na = res.match(this.interpolator.nestingRegexp);
          const nestAft = na && na.length;
          if (nestBef < nestAft) opt.nest = false;
        }
        if (!opt.lng && resolved && resolved.res) opt.lng = this.language || resolved.usedLng;
        if (opt.nest !== false) res = this.interpolator.nest(res, (...args) => {
          if (lastKey?.[0] === args[0] && !opt.context) {
            this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
            return null;
          }
          return this.translate(...args, key);
        }, opt);
        if (opt.interpolation) this.interpolator.reset();
      }
      const postProcess = opt.postProcess || this.options.postProcess;
      const postProcessorNames = isString(postProcess) ? [postProcess] : postProcess;
      if (res != null && postProcessorNames?.length && opt.applyPostProcessor !== false) {
        postProcessorNames.forEach((name) => {
          if (this.logger.debug && postProcessor.processors[name] && this.ownPostProcessors && !this.ownPostProcessors.has(name)) {
            this.logger.once(name, "deprecate", `postProcess: '${name}' was registered with use() on another i18next instance; from v27 post-processors are per instance, so call use() with it on this instance too`);
          }
        });
        res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
          i18nResolved: {
            ...resolved,
            usedParams: this.getUsedParamsDetails(opt)
          },
          ...opt
        } : opt, this);
      }
      return res;
    }
    resolve(keys, opt = {}) {
      let found;
      let usedKey;
      let exactUsedKey;
      let usedLng;
      let usedNS;
      if (isString(keys)) keys = [keys];
      if (Array.isArray(keys)) keys = keys.map((k) => typeof k === "function" ? keysFromSelector(k, {
        ...this.options,
        ...opt
      }) : k);
      keys.forEach((k) => {
        if (this.isValidLookup(found)) return;
        const extracted = this.extractFromKey(k, opt);
        const key = extracted.key;
        usedKey = key;
        let namespaces = extracted.namespaces;
        if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
        const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
        const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
        const needsContextHandling = opt.context !== void 0 && (isString(opt.context) || typeof opt.context === "number") && opt.context !== "";
        const codes = opt.lngs ? opt.lngs : this.languageUtils.toResolveHierarchy(opt.lng || this.language, opt.fallbackLng);
        namespaces.forEach((ns) => {
          if (this.isValidLookup(found)) return;
          usedNS = ns;
          if (!this.checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(usedNS)) {
            this.checkedLoadedFor[`${codes[0]}-${ns}`] = true;
            this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
          }
          codes.forEach((code) => {
            if (this.isValidLookup(found)) return;
            usedLng = code;
            const finalKeys = [key];
            if (this.i18nFormat?.addLookupKeys) {
              this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, opt);
            } else {
              let pluralSuffix;
              if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, opt.count, opt);
              const zeroSuffix = `${this.options.pluralSeparator}zero`;
              const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
              if (needsPluralHandling) {
                if (opt.ordinal && pluralSuffix.startsWith(ordinalPrefix)) {
                  finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                }
                finalKeys.push(key + pluralSuffix);
                if (needsZeroSuffixLookup) {
                  finalKeys.push(key + zeroSuffix);
                }
              }
              if (needsContextHandling) {
                const contextKey = `${key}${this.options.contextSeparator || "_"}${opt.context}`;
                finalKeys.push(contextKey);
                if (needsPluralHandling) {
                  if (opt.ordinal && pluralSuffix.startsWith(ordinalPrefix)) {
                    finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                  }
                  finalKeys.push(contextKey + pluralSuffix);
                  if (needsZeroSuffixLookup) {
                    finalKeys.push(contextKey + zeroSuffix);
                  }
                }
              }
            }
            let possibleKey;
            while (possibleKey = finalKeys.pop()) {
              if (!this.isValidLookup(found)) {
                exactUsedKey = possibleKey;
                found = this.getResource(code, ns, possibleKey, opt);
              }
            }
          });
        });
      });
      return {
        res: found,
        usedKey,
        exactUsedKey,
        usedLng,
        usedNS
      };
    }
    isValidLookup(res) {
      return res !== void 0 && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
    }
    getResource(code, ns, key, options = {}) {
      if (this.i18nFormat?.getResource) return this.i18nFormat.getResource(code, ns, key, options);
      return this.resourceStore.getResource(code, ns, key, options);
    }
    getUsedParamsDetails(options = {}) {
      const optionsKeys = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"];
      const useOptionsReplaceForData = options.replace && !isString(options.replace);
      let data = useOptionsReplaceForData ? options.replace : options;
      if (useOptionsReplaceForData && typeof options.count !== "undefined") {
        data = {
          ...data,
          count: options.count
        };
      }
      if (this.options.interpolation.defaultVariables) {
        data = {
          ...this.options.interpolation.defaultVariables,
          ...data
        };
      }
      if (!useOptionsReplaceForData) {
        data = {
          ...data
        };
        for (const key of optionsKeys) {
          delete data[key];
        }
      }
      return data;
    }
    static hasDefaultValue(options) {
      const prefix = "defaultValue";
      for (const option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option) && option.startsWith(prefix) && void 0 !== options[option]) {
          return true;
        }
      }
      return false;
    }
  };
  var LanguageUtil = class {
    constructor(options) {
      this.options = options;
      this.supportedLngs = this.options.supportedLngs || false;
      this.logger = baseLogger.create("languageUtils");
      this.resolveHierarchyCache = {};
    }
    clearCache() {
      this.resolveHierarchyCache = {};
    }
    getScriptPartFromCode(code) {
      code = getCleanedCode(code);
      if (!code || !code.includes("-")) return null;
      const p = code.split("-");
      if (p.length === 2) return null;
      p.pop();
      if (p[p.length - 1].toLowerCase() === "x") return null;
      return this.formatLanguageCode(p.join("-"));
    }
    getLanguagePartFromCode(code) {
      code = getCleanedCode(code);
      if (!code || !code.includes("-")) return code;
      const p = code.split("-");
      return this.formatLanguageCode(p[0]);
    }
    formatLanguageCode(code) {
      if (isString(code) && code.includes("-")) {
        let formattedCode;
        try {
          formattedCode = Intl.getCanonicalLocales(code)[0];
        } catch (e) {
        }
        if (formattedCode && this.options.lowerCaseLng) {
          formattedCode = formattedCode.toLowerCase();
        }
        if (formattedCode) return formattedCode;
        if (this.options.lowerCaseLng) {
          return code.toLowerCase();
        }
        return code;
      }
      const formatted = this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
      if (this.logger.debug && isString(code)) this.deprecateBareCode(code, formatted);
      return formatted;
    }
    deprecateBareCode(code, formatted) {
      let canonical;
      try {
        canonical = Intl.getCanonicalLocales(code)[0];
      } catch (e) {
        return;
      }
      let v27 = canonical.toLowerCase() === code.toLowerCase() ? canonical : code.toLowerCase();
      if (this.options.lowerCaseLng) v27 = v27.toLowerCase();
      if (v27 === formatted) return;
      this.logger.once(code, "deprecate", `language code '${code}' is used as '${formatted}'; i18next v27 gives it the canonical casing '${v27}', use '${v27}' in lng, fallbackLng, supportedLngs and the resources`);
    }
    isSupportedCode(code) {
      if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) {
        code = this.getLanguagePartFromCode(code);
      }
      return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.includes(code);
    }
    getBestMatchFromCodes(codes) {
      if (!codes) return null;
      let found;
      codes.forEach((code) => {
        if (found) return;
        const cleanedLng = this.formatLanguageCode(code);
        if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
      });
      if (!found && this.options.supportedLngs) {
        codes.forEach((code) => {
          if (found) return;
          const lngScOnly = this.getScriptPartFromCode(code);
          if (this.isSupportedCode(lngScOnly)) return found = lngScOnly;
          const lngOnly = this.getLanguagePartFromCode(code);
          if (this.isSupportedCode(lngOnly)) return found = lngOnly;
          found = this.options.supportedLngs.find((supportedLng) => {
            if (supportedLng === lngOnly) return true;
            if (!supportedLng.includes("-") && !lngOnly.includes("-")) return false;
            if (supportedLng.includes("-") && !lngOnly.includes("-") && supportedLng.slice(0, supportedLng.indexOf("-")) === lngOnly) return true;
            return false;
          });
        });
      }
      if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
      return found;
    }
    getFallbackCodes(fallbacks, code) {
      if (!fallbacks) return [];
      if (typeof fallbacks === "function") fallbacks = fallbacks(code);
      if (isString(fallbacks)) fallbacks = [fallbacks];
      if (Array.isArray(fallbacks)) return fallbacks;
      if (!code) return fallbacks.default || [];
      let found = fallbacks[code];
      if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
      if (!found) found = fallbacks[this.formatLanguageCode(code)];
      if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
      if (!found) found = fallbacks.default;
      return found || [];
    }
    toResolveHierarchy(code, fallbackCode) {
      const fallbackLng = this.options.fallbackLng;
      const fallbackLngKey = Array.isArray(fallbackLng) ? fallbackLng.join("|") : fallbackLng;
      if (fallbackLngKey !== this._cachedFallbackLng) {
        this.resolveHierarchyCache = {};
        this._cachedFallbackLng = fallbackLngKey;
      }
      const hasCacheableFallback = fallbackCode === void 0 || fallbackCode === false || isString(fallbackCode);
      const usesUncacheableOptionsFallback = fallbackCode === void 0 && typeof this.options.fallbackLng === "function";
      const cacheable = isString(code) && hasCacheableFallback && !usesUncacheableOptionsFallback;
      let cacheKey = null;
      if (cacheable) {
        let fallbackCacheKey;
        if (fallbackCode === void 0) fallbackCacheKey = "undefined";
        else if (fallbackCode === false) fallbackCacheKey = "boolean:false";
        else fallbackCacheKey = `string:${fallbackCode}`;
        cacheKey = `${code.length}:${code}|${fallbackCacheKey}`;
      }
      if (cacheKey !== null) {
        const cached = this.resolveHierarchyCache[cacheKey];
        if (cached !== void 0) return cached.slice();
      }
      const fallbackCodes = this.getFallbackCodes((fallbackCode === false ? [] : fallbackCode) || this.options.fallbackLng || [], code);
      const codes = [];
      const addCode = (c) => {
        if (!c) return;
        if (this.isSupportedCode(c)) {
          codes.push(c);
        } else {
          this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
        }
      };
      if (isString(code) && (code.includes("-") || code.includes("_"))) {
        if (this.options.load !== "languageOnly") addCode(this.formatLanguageCode(code));
        if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly") addCode(this.getScriptPartFromCode(code));
        if (this.options.load !== "currentOnly") addCode(this.getLanguagePartFromCode(code));
      } else if (isString(code)) {
        addCode(this.formatLanguageCode(code));
      }
      fallbackCodes.forEach((fc) => {
        const formattedFc = this.formatLanguageCode(fc);
        if (!codes.includes(formattedFc)) addCode(formattedFc);
      });
      if (cacheKey !== null) {
        this.resolveHierarchyCache[cacheKey] = codes;
        return codes.slice();
      }
      return codes;
    }
  };
  var suffixesOrder = {
    zero: 0,
    one: 1,
    two: 2,
    few: 3,
    many: 4,
    other: 5
  };
  var dummyRule = {
    select: (count) => count === 1 ? "one" : "other",
    resolvedOptions: () => ({
      pluralCategories: ["one", "other"]
    })
  };
  var PluralResolver = class {
    constructor(languageUtils, options = {}) {
      this.languageUtils = languageUtils;
      this.options = options;
      this.logger = baseLogger.create("pluralResolver");
      this.pluralRulesCache = {};
    }
    clearCache() {
      this.pluralRulesCache = {};
    }
    getRule(code, options = {}) {
      const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
      const type = options.ordinal ? "ordinal" : "cardinal";
      const cacheKey = JSON.stringify({
        cleanedCode,
        type
      });
      if (cacheKey in this.pluralRulesCache) {
        return this.pluralRulesCache[cacheKey];
      }
      let rule;
      try {
        rule = new Intl.PluralRules(cleanedCode, {
          type
        });
      } catch (err) {
        if (typeof Intl === "undefined") {
          this.logger.error("No Intl support, please use an Intl polyfill!");
          return dummyRule;
        }
        if (!code.match(/-|_/)) return dummyRule;
        const lngPart = this.languageUtils.getLanguagePartFromCode(code);
        rule = this.getRule(lngPart, options);
      }
      this.pluralRulesCache[cacheKey] = rule;
      return rule;
    }
    needsPlural(code, options = {}) {
      let rule = this.getRule(code, options);
      if (!rule) rule = this.getRule("dev", options);
      return rule?.resolvedOptions().pluralCategories.length > 1;
    }
    getPluralFormsOfKey(code, key, options = {}) {
      return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
    }
    getSuffixes(code, options = {}) {
      let rule = this.getRule(code, options);
      if (!rule) rule = this.getRule("dev", options);
      if (!rule) return [];
      return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
    }
    getSuffix(code, count, options = {}) {
      const rule = this.getRule(code, options);
      if (rule) {
        return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
      }
      this.logger.warn(`no plural rule found for: ${code}`);
      return this.getSuffix("dev", count, options);
    }
  };
  var deepFindWithDefaults = (data, defaultData, key, keySeparator = ".", ignoreJSONStructure = true) => {
    let path = getPathWithDefaults(data, defaultData, key);
    if (path == null && ignoreJSONStructure && isString(key)) {
      path = deepFind(data, key, keySeparator);
      if (path === void 0) path = deepFind(defaultData, key, keySeparator);
    }
    return path;
  };
  var Interpolator = class {
    constructor(options = {}) {
      this.logger = baseLogger.create("interpolator");
      this.options = options;
      this.format = options?.interpolation?.format || ((value) => value);
      this.init(options);
    }
    init(options = {}) {
      if (!options.interpolation) options.interpolation = {
        escapeValue: true
      };
      const {
        escape: escape$1,
        escapeValue,
        useRawValueToEscape,
        prefix,
        prefixEscaped,
        suffix,
        suffixEscaped,
        formatSeparator,
        unescapeSuffix,
        unescapePrefix,
        nestingPrefix,
        nestingPrefixEscaped,
        nestingSuffix,
        nestingSuffixEscaped,
        nestingOptionsSeparator,
        maxReplaces,
        alwaysFormat
      } = options.interpolation;
      if (prefixEscaped || suffixEscaped || nestingPrefixEscaped || nestingSuffixEscaped) {
        const names = Object.entries({
          prefixEscaped,
          suffixEscaped,
          nestingPrefixEscaped,
          nestingSuffixEscaped
        }).filter(([, v]) => v).map(([k]) => k);
        this.logger.once(names.join(), "deprecate", `interpolation.${names.join(", interpolation.")}: the regex-escaped delimiter options are removed in v27; pass the literal delimiters as prefix, suffix, nestingPrefix and nestingSuffix`);
      }
      this.escape = escape$1 !== void 0 ? escape$1 : escape;
      this.escapeValue = escapeValue !== void 0 ? escapeValue : true;
      this.useRawValueToEscape = useRawValueToEscape !== void 0 ? useRawValueToEscape : false;
      this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
      this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
      this.formatSeparator = formatSeparator || ",";
      this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix ? regexEscape(unescapePrefix) : "-";
      this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix ? regexEscape(unescapeSuffix) : "";
      this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
      this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
      this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
      this.maxReplaces = maxReplaces || 1e3;
      this.alwaysFormat = alwaysFormat !== void 0 ? alwaysFormat : false;
      this.resetRegExp();
    }
    reset() {
      if (this.options) this.init(this.options);
    }
    resetRegExp() {
      const getOrResetRegExp = (existingRegExp, pattern) => {
        if (existingRegExp?.source === pattern) {
          existingRegExp.lastIndex = 0;
          return existingRegExp;
        }
        return new RegExp(pattern, "g");
      };
      this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
      this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
      this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']|"[^"]*"|'[^']*'|\\((?:[^()"']|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`);
    }
    interpolate(str, data, lng, options) {
      let match;
      let value;
      let replaces;
      const original = str;
      const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
      const handleFormat = (key) => {
        if (!key.includes(this.formatSeparator)) {
          const path = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
          return this.alwaysFormat ? this.format(path, void 0, lng, {
            ...options,
            ...data,
            interpolationkey: key
          }) : path;
        }
        const p = key.split(this.formatSeparator);
        const k = p.shift().trim();
        const f = p.join(this.formatSeparator).trim();
        return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
          ...options,
          ...data,
          interpolationkey: k
        });
      };
      this.resetRegExp();
      if (!this.escapeValue && typeof str === "string" && /\$t\([^)]*\{[^}]*\{\{/.test(str)) {
        this.logger.warn("nesting options string contains interpolated variables with escapeValue: false — if any of those values are attacker-controlled they can inject additional nesting options (e.g. redirect lng/ns). Sanitise untrusted input before passing it to t(), or keep escapeValue: true.");
      }
      const missingInterpolationHandler = options?.missingInterpolationHandler || this.options.missingInterpolationHandler;
      const skipOnVariables = options?.interpolation?.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
      const todos = [{
        regex: this.regexpUnescape,
        safeValue: (val) => val
      }, {
        regex: this.regexp,
        safeValue: (val) => {
          if (!this.escapeValue) return val;
          if (this.escape === escape && this.options?.interpolation?.escapeValue !== false && isString(val) && val.includes("/")) {
            this.logger.once("/", "deprecate", "escapeValue renders '/' in a value as '&#x2F;' today; from v27 the default escape leaves '/' as it is");
          }
          return this.escape(val);
        }
      }];
      const unescapedValues = [];
      let shift = 0;
      todos.forEach((todo) => {
        replaces = 0;
        while (match = todo.regex.exec(str)) {
          const at = match.index - shift;
          const written = unescapedValues.find(([start, end]) => at >= start && at < end);
          if (written) {
            todo.regex.lastIndex = written[1] + shift;
            continue;
          }
          const matchedVar = match[1].trim();
          value = handleFormat(matchedVar);
          if (value === void 0) {
            if (typeof missingInterpolationHandler === "function") {
              const temp = missingInterpolationHandler(str, match, options);
              value = isString(temp) ? temp : "";
            } else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) {
              value = "";
            } else if (skipOnVariables) {
              if (this.logger.debug) {
                this.logger.once(`${original}\0${match[0]}`, "warn", `missed to pass in variable ${matchedVar} for interpolating ${original}`);
              }
              value = match[0];
              continue;
            } else {
              this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
              value = "";
            }
          } else if (!isString(value) && !this.useRawValueToEscape) {
            value = makeString(value);
          }
          const safeValue = makeString(todo.safeValue(value));
          str = str.slice(0, match.index) + safeValue + str.slice(match.index + match[0].length);
          if (skipOnVariables) {
            if (todo.regex === this.regexpUnescape) {
              unescapedValues.push([match.index, match.index + safeValue.length]);
            } else {
              shift += safeValue.length - match[0].length;
            }
            todo.regex.lastIndex += safeValue.length;
            todo.regex.lastIndex -= match[0].length;
          } else {
            todo.regex.lastIndex = 0;
          }
          replaces++;
          if (replaces >= this.maxReplaces) {
            break;
          }
        }
      });
      return str;
    }
    nest(str, fc, options = {}) {
      let match;
      let value;
      let clonedOptions;
      const handleHasOptions = (key, inheritedOptions) => {
        const sep = this.nestingOptionsSeparator;
        if (!key.includes(sep)) return key;
        const c = key.split(new RegExp(`${regexEscape(sep)}[ ]*{`));
        let optionsString = `{${c[1]}`;
        key = c[0];
        optionsString = this.interpolate(optionsString, clonedOptions);
        const matchedSingleQuotes = optionsString.match(/'/g);
        const matchedDoubleQuotes = optionsString.match(/"/g);
        if ((matchedSingleQuotes?.length ?? 0) % 2 === 0 && !matchedDoubleQuotes || (matchedDoubleQuotes?.length ?? 0) % 2 !== 0) {
          optionsString = optionsString.replace(/'/g, '"');
        }
        try {
          clonedOptions = JSON.parse(optionsString);
          if (inheritedOptions) clonedOptions = {
            ...inheritedOptions,
            ...clonedOptions
          };
        } catch (e) {
          this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
          return `${key}${sep}${optionsString}`;
        }
        if (clonedOptions.defaultValue && clonedOptions.defaultValue.includes(this.prefix)) delete clonedOptions.defaultValue;
        return key;
      };
      const nestingRegexp = new RegExp(this.nestingRegexp);
      let out = "";
      let lastEnd = 0;
      while (match = nestingRegexp.exec(str)) {
        let formatters = [];
        clonedOptions = {
          ...options
        };
        clonedOptions = clonedOptions.replace && !isString(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
        clonedOptions.applyPostProcessor = false;
        delete clonedOptions.defaultValue;
        const keyEndIndex = /{.*}/s.test(match[1]) ? match[1].lastIndexOf("}") + 1 : match[1].indexOf(this.formatSeparator);
        if (keyEndIndex !== -1) {
          formatters = match[1].slice(keyEndIndex).split(this.formatSeparator).map((elem) => elem.trim()).filter(Boolean);
          match[1] = match[1].slice(0, keyEndIndex);
        }
        value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
        if (value && match[0] === str && !isString(value)) return value;
        if (!isString(value)) value = makeString(value);
        if (!value) {
          this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
          value = "";
        }
        if (formatters.length) {
          value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
            ...options,
            interpolationkey: match[1].trim()
          }), value.trim());
        }
        out += str.slice(lastEnd, match.index) + makeString(value);
        lastEnd = nestingRegexp.lastIndex;
        this.regexp.lastIndex = 0;
      }
      return lastEnd ? out + str.slice(lastEnd) : str;
    }
  };
  var parseFormatStr = (formatStr) => {
    let formatName = formatStr.toLowerCase().trim();
    const formatOptions = {};
    if (formatStr.includes("(")) {
      const p = formatStr.split("(");
      formatName = p[0].toLowerCase().trim();
      const optStr = p[1].slice(0, -1);
      if (formatName === "currency" && !optStr.includes(":")) {
        if (!formatOptions.currency) formatOptions.currency = optStr.trim();
      } else if (formatName === "relativetime" && !optStr.includes(":")) {
        if (!formatOptions.range) formatOptions.range = optStr.trim();
      } else {
        const opts = optStr.split(";");
        opts.forEach((opt) => {
          if (opt) {
            const [key, ...rest] = opt.split(":");
            const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
            const trimmedKey = key.trim();
            if (!formatOptions[trimmedKey]) formatOptions[trimmedKey] = val;
            if (val === "false") formatOptions[trimmedKey] = false;
            if (val === "true") formatOptions[trimmedKey] = true;
            if (!isNaN(val)) formatOptions[trimmedKey] = parseInt(val, 10);
          }
        });
      }
    }
    return {
      formatName,
      formatOptions
    };
  };
  var createCachedFormatter = (fn) => {
    const cache = {};
    return (v, l, o) => {
      let optForCache = o;
      if (o && o.interpolationkey && o.formatParams && o.formatParams[o.interpolationkey] && o[o.interpolationkey]) {
        optForCache = {
          ...optForCache,
          [o.interpolationkey]: void 0
        };
      }
      let key;
      try {
        key = l + JSON.stringify(optForCache);
      } catch (e) {
        return fn(getCleanedCode(l), o)(v);
      }
      let frm = cache[key];
      if (!frm) {
        frm = fn(getCleanedCode(l), o);
        cache[key] = frm;
      }
      return frm(v);
    };
  };
  var createNonCachedFormatter = (fn) => (v, l, o) => fn(getCleanedCode(l), o)(v);
  var Formatter = class {
    constructor(options = {}) {
      this.logger = baseLogger.create("formatter");
      this.options = options;
      this.init(options);
    }
    init(services, options = {
      interpolation: {}
    }) {
      this.formatSeparator = options.interpolation.formatSeparator || ",";
      const cf = options.cacheInBuiltFormats ? createCachedFormatter : createNonCachedFormatter;
      this.formats = {
        number: cf((lng, opt) => {
          const formatter = new Intl.NumberFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        }),
        currency: cf((lng, opt) => {
          const formatter = new Intl.NumberFormat(lng, {
            ...opt,
            style: "currency"
          });
          return (val) => formatter.format(val);
        }),
        datetime: cf((lng, opt) => {
          const formatter = new Intl.DateTimeFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        }),
        relativetime: cf((lng, opt) => {
          const formatter = new Intl.RelativeTimeFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val, opt.range || "day");
        }),
        list: cf((lng, opt) => {
          const formatter = new Intl.ListFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        })
      };
    }
    add(name, fc) {
      this.formats[name.toLowerCase().trim()] = fc;
    }
    addCached(name, fc) {
      this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
    }
    format(value, format, lng, options = {}) {
      if (!format) return value;
      if (value == null) return value;
      const rawFormats = format.split(this.formatSeparator);
      const formats = [];
      for (let i = 0; i < rawFormats.length; i++) {
        let f = rawFormats[i];
        while (f.indexOf("(") > -1 && !f.includes(")") && i + 1 < rawFormats.length) {
          f = `${f}${this.formatSeparator}${rawFormats[++i]}`;
        }
        formats.push(f);
      }
      const result = formats.reduce((mem, f) => {
        const {
          formatName,
          formatOptions
        } = parseFormatStr(f);
        if (this.formats[formatName]) {
          let formatted = mem;
          try {
            const valOptions = options?.formatParams?.[options.interpolationkey] || {};
            const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
            formatted = this.formats[formatName](mem, l, {
              ...formatOptions,
              ...options,
              ...valOptions
            });
          } catch (error) {
            this.logger.warn(error);
          }
          return formatted;
        } else {
          this.logger.warn(`there was no format function for ${formatName}`);
        }
        return mem;
      }, value);
      return result;
    }
  };
  var removePending = (q, name) => {
    if (q.pending[name] !== void 0) {
      delete q.pending[name];
      q.pendingCount--;
    }
  };
  var Connector = class extends EventEmitter {
    constructor(backend, store, services, options = {}) {
      super();
      this.backend = backend;
      this.store = store;
      this.services = services;
      this.languageUtils = services.languageUtils;
      this.options = options;
      this.logger = baseLogger.create("backendConnector");
      this.waitingReads = [];
      this.maxParallelReads = options.maxParallelReads || 10;
      this.readingCalls = 0;
      this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
      this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
      this.state = {};
      this.queue = [];
      this.backend?.init?.(services, options.backend, options);
      this.callbackApi = callbackApiOf(this.backend);
      if (this.backend && this.callbackApi === void 0 && (this.backend.read || this.backend.create)) {
        this.logger.deprecate("backend: set callbackApi to declare the calling convention (true: read(language, namespace, callback) and create(languages, namespace, key, fallbackValue, callback, options); false: both return a promise or a value); guessing it from the number of parameters is deprecated");
      }
    }
    queueLoad(languages, namespaces, options, callback) {
      const toLoad = {};
      const pending = {};
      const toLoadLanguages = {};
      const toLoadNamespaces = {};
      languages.forEach((lng) => {
        let hasAllNamespaces = true;
        namespaces.forEach((ns) => {
          const name = `${lng}|${ns}`;
          if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
            this.state[name] = 2;
          } else if (!options.reload && this.state[name] < 0) ;
          else if (this.state[name] === 1) {
            if (pending[name] === void 0) pending[name] = true;
          } else {
            this.state[name] = 1;
            hasAllNamespaces = false;
            if (pending[name] === void 0) pending[name] = true;
            if (toLoad[name] === void 0) toLoad[name] = true;
            if (toLoadNamespaces[ns] === void 0) toLoadNamespaces[ns] = true;
          }
        });
        if (!hasAllNamespaces) toLoadLanguages[lng] = true;
      });
      if (Object.keys(toLoad).length || Object.keys(pending).length) {
        this.queue.push({
          pending,
          pendingCount: Object.keys(pending).length,
          loaded: {},
          errors: [],
          callback
        });
      }
      return {
        toLoad: Object.keys(toLoad),
        pending: Object.keys(pending),
        toLoadLanguages: Object.keys(toLoadLanguages),
        toLoadNamespaces: Object.keys(toLoadNamespaces)
      };
    }
    loaded(name, err, data) {
      const s = name.split("|");
      const lng = s[0];
      const ns = s[1];
      if (err) this.emit("failedLoading", lng, ns, err);
      if (!err && data) {
        this.store.addResourceBundle(lng, ns, data, void 0, void 0, {
          skipCopy: true
        });
      }
      this.state[name] = err ? -1 : 2;
      if (err && data) this.state[name] = 0;
      const loaded = {};
      this.queue.forEach((q) => {
        pushPath(q.loaded, [lng], ns);
        removePending(q, name);
        if (err) q.errors.push(err);
        if (q.pendingCount === 0 && !q.done) {
          Object.keys(q.loaded).forEach((l) => {
            if (!loaded[l]) loaded[l] = {};
            const loadedKeys = q.loaded[l];
            if (loadedKeys.length) {
              loadedKeys.forEach((n) => {
                if (loaded[l][n] === void 0) loaded[l][n] = true;
              });
            }
          });
          q.done = true;
          if (q.errors.length) {
            q.callback(q.errors);
          } else {
            q.callback();
          }
        }
      });
      this.emit("loaded", loaded);
      this.queue = this.queue.filter((q) => !q.done);
    }
    read(lng, ns, fcName, tried = 0, wait = this.retryTimeout, callback) {
      if (!lng.length) return callback(null, {});
      if (this.readingCalls >= this.maxParallelReads) {
        this.waitingReads.push({
          lng,
          ns,
          fcName,
          tried,
          wait,
          callback
        });
        return;
      }
      this.readingCalls++;
      const resolver = (err, data) => {
        this.readingCalls--;
        if (this.waitingReads.length > 0) {
          const next = this.waitingReads.shift();
          this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
        }
        if (err && data && tried < this.maxRetries) {
          setTimeout(() => {
            this.read(lng, ns, fcName, tried + 1, wait * 2, callback);
          }, wait);
          return;
        }
        callback(err, data);
      };
      const fc = this.backend[fcName].bind(this.backend);
      if (this.callbackApi === false || this.callbackApi === void 0 && fc.length === 2) {
        try {
          const r = fc(lng, ns);
          if (r && typeof r.then === "function") {
            r.then((data) => resolver(null, data)).catch(resolver);
          } else {
            resolver(null, r);
          }
        } catch (err) {
          resolver(err);
        }
        return;
      }
      return fc(lng, ns, resolver);
    }
    prepareLoading(languages, namespaces, options = {}, callback) {
      if (!this.backend) {
        this.logger.warn("No backend was added via i18next.use. Will not load resources.");
        return callback && callback();
      }
      if (isString(languages)) languages = this.languageUtils.toResolveHierarchy(languages);
      if (isString(namespaces)) namespaces = [namespaces];
      const toLoad = this.queueLoad(languages, namespaces, options, callback);
      if (!toLoad.toLoad.length) {
        if (!toLoad.pending.length) callback();
        return null;
      }
      toLoad.toLoad.forEach((name) => {
        this.loadOne(name);
      });
    }
    load(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, {}, callback);
    }
    reload(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, {
        reload: true
      }, callback);
    }
    noticeDevFallback(lng) {
      if (lng !== "dev" || !this.devIsDefaultFallback) return;
      this.logger.once("dev", "warn", "language 'dev' is requested because fallbackLng is not set (its default is ['dev']); i18next v27 defaults to fallbackLng: false and loads and saves missing keys in the requested language instead. Set fallbackLng to your source language, or to 'dev' to keep this behavior");
    }
    loadOne(name, prefix = "") {
      const s = name.split("|");
      const lng = s[0];
      const ns = s[1];
      this.noticeDevFallback(lng);
      this.read(lng, ns, "read", void 0, void 0, (err, data) => {
        if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
        if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
        this.loaded(name, err, data);
      });
    }
    saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}, clb = () => {
    }, hasLoadedNamespace2 = this.newestCloneHasLoadedNamespace || this.services?.utils?.hasLoadedNamespace) {
      if (hasLoadedNamespace2 && !hasLoadedNamespace2(namespace)) {
        this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
        return;
      }
      if (key === void 0 || key === null || key === "") return;
      if (this.backend?.create) {
        languages?.forEach?.((l) => this.noticeDevFallback(l));
        const opts = {
          ...options,
          isUpdate
        };
        const fc = this.backend.create.bind(this.backend);
        if (this.callbackApi === false || this.callbackApi === void 0 && fc.length < 6) {
          try {
            let r;
            if (this.callbackApi === false || fc.length === 5) {
              r = fc(languages, namespace, key, fallbackValue, opts);
            } else {
              r = fc(languages, namespace, key, fallbackValue);
            }
            if (r && typeof r.then === "function") {
              r.then((data) => clb(null, data)).catch(clb);
            } else {
              clb(null, r);
            }
          } catch (err) {
            clb(err);
          }
        } else {
          fc(languages, namespace, key, fallbackValue, clb, opts);
        }
      }
      if (!languages || !languages[0]) return;
      this.store.addResource(languages[0], namespace, key, fallbackValue);
    }
  };
  var get = () => ({
    debug: false,
    initAsync: true,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: false,
    supportedLngs: false,
    nonExplicitSupportedLngs: false,
    load: "all",
    preload: false,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    enableSelector: false,
    partialBundledLanguages: false,
    saveMissing: false,
    updateMissing: false,
    saveMissingTo: "fallback",
    saveMissingPlurals: true,
    missingKeyHandler: false,
    missingInterpolationHandler: false,
    postProcess: false,
    postProcessPassResolved: false,
    returnNull: false,
    returnEmptyString: true,
    returnObjects: false,
    joinArrays: false,
    returnedObjectHandler: false,
    parseMissingKeyHandler: false,
    appendNamespaceToMissingKey: false,
    appendNamespaceToCIMode: false,
    overloadTranslationOptionHandler: (args) => {
      let ret = {};
      if (typeof args[1] === "object") ret = args[1];
      if (isString(args[1])) ret.defaultValue = args[1];
      if (isString(args[2])) ret.tDescription = args[2];
      if (typeof args[2] === "object" || typeof args[3] === "object") {
        const options = args[3] || args[2];
        Object.keys(options).forEach((key) => {
          ret[key] = options[key];
        });
      }
      return ret;
    },
    interpolation: {
      escapeValue: true,
      prefix: "{{",
      suffix: "}}",
      formatSeparator: ",",
      unescapePrefix: "-",
      nestingPrefix: "$t(",
      nestingSuffix: ")",
      nestingOptionsSeparator: ",",
      maxReplaces: 1e3,
      skipOnVariables: true
    },
    cacheInBuiltFormats: true
  });
  var transformOptions = (options) => {
    if (isString(options.ns)) options.ns = [options.ns];
    if (isString(options.fallbackLng)) options.fallbackLng = [options.fallbackLng];
    if (isString(options.fallbackNS)) options.fallbackNS = [options.fallbackNS];
    if (options.supportedLngs && !options.supportedLngs.includes("cimode")) {
      options.supportedLngs = options.supportedLngs.concat(["cimode"]);
    }
    return options;
  };
  var noop = () => {
  };
  var loggerOwner;
  var bindMemberFunctions = (inst) => {
    const mems = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
    mems.forEach((mem) => {
      if (typeof inst[mem] === "function") {
        inst[mem] = inst[mem].bind(inst);
      }
    });
  };
  var I18n = class _I18n extends EventEmitter {
    constructor(options = {}, callback) {
      super();
      this.options = transformOptions(options);
      this.services = {
        ownPostProcessors: /* @__PURE__ */ new Set()
      };
      this.logger = baseLogger;
      this.modules = {
        external: []
      };
      bindMemberFunctions(this);
      if (callback && !this.isInitialized && !options.isClone) {
        if (!this.options.initAsync) {
          this.init(options, callback);
          return this;
        }
        setTimeout(() => {
          this.init(options, callback);
        }, 0);
      }
    }
    init(options = {}, callback) {
      this.isInitializing = true;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (options.defaultNS == null && options.ns) {
        if (isString(options.ns)) {
          options.defaultNS = options.ns;
        } else if (!options.ns.includes("translation")) {
          options.defaultNS = options.ns[0];
        }
      }
      const fallbackLngIsDefault = options.fallbackLng === void 0 && this.options.fallbackLng === void 0;
      const defOpts = get();
      this.options = {
        ...defOpts,
        ...this.options,
        ...transformOptions(options)
      };
      this.options.interpolation = {
        ...defOpts.interpolation,
        ...this.options.interpolation
      };
      if (options.keySeparator !== void 0) {
        this.options.userDefinedKeySeparator = options.keySeparator;
      }
      if (options.nsSeparator !== void 0) {
        this.options.userDefinedNsSeparator = options.nsSeparator;
      }
      if (typeof this.options.overloadTranslationOptionHandler !== "function") {
        this.options.overloadTranslationOptionHandler = defOpts.overloadTranslationOptionHandler;
      }
      const createClassOnDemand = (ClassOrObject) => {
        if (!ClassOrObject) return null;
        if (typeof ClassOrObject === "function") return new ClassOrObject();
        return ClassOrObject;
      };
      if (!this.options.isClone) {
        if (loggerOwner && loggerOwner !== this && loggerOwner.modules.logger !== this.modules.logger) {
          baseLogger.deprecate("init: this init() replaces the logger another i18next instance set with use(), as the logger is shared in v26; from v27 each instance keeps its own logger");
        }
        loggerOwner = this.modules.logger ? this : void 0;
        if (this.modules.logger) {
          baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
        } else {
          baseLogger.init(null, this.options);
        }
        this.pendingWarnings?.forEach((msg) => this.logger.warn(msg));
        this.pendingWarnings = void 0;
        let formatter;
        if (this.modules.formatter) {
          formatter = this.modules.formatter;
        } else {
          formatter = Formatter;
        }
        const lu = new LanguageUtil(this.options);
        this.store = new ResourceStore(this.options.resources, this.options);
        const s = this.services;
        s.logger = baseLogger;
        s.resourceStore = this.store;
        s.languageUtils = lu;
        s.pluralResolver = new PluralResolver(lu, {
          prepend: this.options.pluralSeparator
        });
        if (formatter) {
          s.formatter = createClassOnDemand(formatter);
          if (s.formatter.init) s.formatter.init(s, this.options);
          this.options.interpolation.format = s.formatter.format.bind(s.formatter);
        }
        s.interpolator = new Interpolator(this.options);
        s.utils = {
          hasLoadedNamespace: this.hasLoadedNamespace.bind(this),
          reloadResources: this.reloadResources.bind(this)
        };
        s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
        s.backendConnector.devIsDefaultFallback = fallbackLngIsDefault;
        s.backendConnector.on("*", (event, ...args) => {
          this.emit(event, ...args);
        });
        if (this.modules.languageDetector) {
          s.languageDetector = createClassOnDemand(this.modules.languageDetector);
          if (s.languageDetector.init) s.languageDetector.init(s, this.options.detection, this.options);
          if (s.languageDetector.async && callbackApiOf(s.languageDetector) === void 0) {
            this.logger.deprecate("languageDetector: set callbackApi to declare how the async detect() answers (true: detect(callback); false: detect() returns a promise); guessing it from the number of parameters is deprecated");
          }
        }
        if (this.modules.i18nFormat) {
          s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
          if (s.i18nFormat.init) s.i18nFormat.init(this);
        }
        this.translator = new Translator(this.services, this.options);
        this.translator.on("*", (event, ...args) => {
          this.emit(event, ...args);
        });
        this.modules.external.forEach((m) => {
          if (m.init) m.init(this);
        });
      }
      this.format = this.options.interpolation.format;
      if (!callback) callback = noop;
      if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
        const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        if (codes.length > 0 && codes[0] !== "dev") this.options.lng = codes[0];
      }
      if (!this.services.languageDetector && !this.options.lng) {
        this.logger.warn("init: no languageDetector is used and no lng is defined");
      }
      const storeApi = ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"];
      storeApi.forEach((fcName) => {
        this[fcName] = (...args) => this.store[fcName](...args);
      });
      const storeApiChained = ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"];
      storeApiChained.forEach((fcName) => {
        this[fcName] = (...args) => {
          this.store[fcName](...args);
          return this;
        };
      });
      const deferred = defer();
      const load = () => {
        const finish = (err, t3) => {
          this.isInitializing = false;
          if (this.isInitialized && !this.initializedStoreOnce) this.logger.warn("init: i18next is already initialized. You should call init just once!");
          this.isInitialized = true;
          if (!this.options.isClone) this.logger.log("initialized", this.options);
          this.emit("initialized", this.options);
          deferred.resolve(t3);
          callback(err, t3);
        };
        if ((this.languages || this.isLanguageChangingTo) && !this.isInitialized) return finish(null, this.t.bind(this));
        this.changeLanguage(this.options.lng, finish);
      };
      if (this.options.resources || !this.options.initAsync) {
        load();
      } else {
        setTimeout(load, 0);
      }
      return deferred;
    }
    loadResources(language, callback = noop) {
      let usedCallback = callback;
      const usedLng = isString(language) ? language : this.language;
      if (typeof language === "function") usedCallback = language;
      if (!this.options.resources || this.options.partialBundledLanguages) {
        if (usedLng?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return usedCallback();
        const toLoad = [];
        const append = (lng) => {
          if (!lng) return;
          if (lng === "cimode") return;
          const lngs = this.services.languageUtils.toResolveHierarchy(lng);
          lngs.forEach((l) => {
            if (l === "cimode") return;
            if (!toLoad.includes(l)) toLoad.push(l);
          });
        };
        if (!usedLng) {
          const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
          fallbacks.forEach((l) => append(l));
        } else {
          append(usedLng);
        }
        this.options.preload?.forEach?.((l) => append(l));
        this.services.backendConnector.load(toLoad, this.options.ns, (e) => {
          if (!e && !this.resolvedLanguage && this.language) this.setResolvedLanguage(this.language);
          usedCallback(e);
        });
      } else {
        usedCallback(null);
      }
    }
    reloadResources(lngs, ns, callback) {
      const deferred = defer();
      if (typeof lngs === "function") {
        callback = lngs;
        lngs = void 0;
      }
      if (typeof ns === "function") {
        callback = ns;
        ns = void 0;
      }
      if (!lngs) {
        const requested = Object.keys(this.services.backendConnector.state).map((name) => name.split("|")[0]);
        lngs = [.../* @__PURE__ */ new Set([...this.languages || [], ...requested])].filter((l) => l !== "cimode");
      }
      if (!ns) ns = this.options.ns;
      if (!callback) callback = noop;
      this.services.backendConnector.reload(lngs, ns, (err) => {
        deferred.resolve();
        callback(err);
      });
      return deferred;
    }
    use(module) {
      if (!module) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
      if (!module.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
      const setModule = (type) => {
        if (this.modules[type] && this.modules[type] !== module) {
          const msg = `use: this ${type} replaces the ${type} passed to an earlier use() call; only one ${type} is used per instance`;
          if (this.isInitializing || this.isInitialized) this.logger.warn(msg);
          else (this.pendingWarnings = this.pendingWarnings || []).push(msg);
        }
        this.modules[type] = module;
      };
      if (module.type === "backend") {
        setModule("backend");
      }
      if (module.type === "logger" || module.log && module.warn && module.error) {
        this.modules.logger = module;
      }
      if (module.type === "languageDetector") {
        setModule("languageDetector");
      }
      if (module.type === "i18nFormat") {
        setModule("i18nFormat");
      }
      if (module.type === "postProcessor") {
        postProcessor.addPostProcessor(module);
        this.services.ownPostProcessors?.add(module.name);
      }
      if (module.type === "formatter") {
        setModule("formatter");
      }
      if (module.type === "3rdParty") {
        this.modules.external.push(module);
      }
      return this;
    }
    hydrate(resources, lng) {
      if (this.options.isClone) return this;
      if (!this.services.resourceStore) {
        this.logger.warn("hydrate: call init() first, the instance has no resource store yet");
        return this;
      }
      if (resources && !this.initializedStoreOnce) {
        this.services.resourceStore.data = resources;
        Object.values(resources).forEach((lngResources) => {
          Object.keys(lngResources).forEach((ns) => {
            if (!this.options.ns.includes(ns)) this.options.ns.push(ns);
          });
        });
        this.initializedStoreOnce = true;
        this.isInitialized = true;
      }
      if (lng && !this.initializedLanguageOnce) {
        this.changeLanguage(lng);
        this.initializedLanguageOnce = true;
      }
      return this;
    }
    setResolvedLanguage(l) {
      if (!l || !this.languages) return;
      if (["cimode", "dev"].includes(l)) return;
      for (let li = 0; li < this.languages.length; li++) {
        const lngInLngs = this.languages[li];
        if (["cimode", "dev"].includes(lngInLngs)) continue;
        if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
          this.resolvedLanguage = lngInLngs;
          break;
        }
      }
      if (!this.resolvedLanguage && !this.languages.includes(l) && this.store.hasLanguageSomeTranslations(l)) {
        this.resolvedLanguage = l;
        this.languages.unshift(l);
      }
    }
    changeLanguage(lng, callback) {
      this.isLanguageChangingTo = lng;
      const deferred = defer();
      this.emit("languageChanging", lng);
      const setLngProps = (l) => {
        this.language = l;
        this.languages = this.services.languageUtils.toResolveHierarchy(l);
        this.resolvedLanguage = void 0;
        this.setResolvedLanguage(l);
      };
      const done = (err, l) => {
        if (l) {
          if (this.isLanguageChangingTo === lng) {
            setLngProps(l);
            this.translator.changeLanguage(l);
            this.isLanguageChangingTo = void 0;
            this.emit("languageChanged", l);
            this.logger.log("languageChanged", l);
          }
        } else {
          this.isLanguageChangingTo = void 0;
        }
        deferred.resolve((...args) => this.t(...args));
        if (callback) callback(err, (...args) => this.t(...args));
      };
      const setLng = (lngs) => {
        if (!lng && !lngs && this.services.languageDetector) lngs = [];
        const fl = isString(lngs) ? lngs : lngs && lngs[0];
        const l = this.store.hasLanguageSomeTranslations(fl) ? fl : this.services.languageUtils.getBestMatchFromCodes(isString(lngs) ? [lngs] : lngs);
        if (l && this.logger.debug && !isSafeLanguageCode(l)) {
          const configured = [].concat(this.options.supportedLngs || [], this.services.languageUtils.getFallbackCodes(this.options.fallbackLng, l), this.options.preload || []);
          if (!configured.includes(l) && !Object.prototype.hasOwnProperty.call(this.store.data, l)) {
            this.logger.once(`lng:${l}`, "deprecate", `changeLanguage: the language code '${l.slice(0, 64)}' comes from lng, changeLanguage() or the language detector and is not configured; from v27 such a code is refused unless it has only letters, digits, '-', '_', '@' and '.' (no '..'), at most 128 characters. Set supportedLngs, or check the code before passing it on`);
          }
        }
        if (l) {
          if (!this.language) {
            setLngProps(l);
          }
          if (!this.translator.language) this.translator.changeLanguage(l);
          this.services.languageDetector?.cacheUserLanguage?.(l);
        }
        this.loadResources(l, (err) => {
          done(err, l);
        });
      };
      if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
        setLng(this.services.languageDetector.detect());
      } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
        const callbackApi = callbackApiOf(this.services.languageDetector);
        if (callbackApi === false || callbackApi === void 0 && this.services.languageDetector.detect.length === 0) {
          this.services.languageDetector.detect().then(setLng);
        } else {
          this.services.languageDetector.detect(setLng);
        }
      } else {
        setLng(lng);
      }
      return deferred;
    }
    getFixedT(lng, ns, keyPrefix, fixedOpts) {
      const scopeNs = fixedOpts?.scopeNs;
      const fixedT = (key, opts, ...rest) => {
        let o;
        if (typeof opts !== "object") {
          o = this.options.overloadTranslationOptionHandler([key, opts].concat(rest));
        } else {
          o = {
            ...opts
          };
        }
        o.lng = o.lng || fixedT.lng;
        o.lngs = o.lngs || fixedT.lngs;
        const explicitCallNs = o.ns !== void 0 && o.ns !== null;
        o.ns = o.ns || fixedT.ns;
        if (o.keyPrefix !== "") o.keyPrefix = o.keyPrefix || keyPrefix || fixedT.keyPrefix;
        const selectorOpts = {
          ...this.options,
          ...o
        };
        if (Array.isArray(scopeNs) && !explicitCallNs) selectorOpts.ns = scopeNs;
        if (typeof o.keyPrefix === "function") o.keyPrefix = keysFromSelector(o.keyPrefix, selectorOpts);
        const keySeparator = this.options.keySeparator || ".";
        let resultKey;
        if (o.keyPrefix && Array.isArray(key)) {
          resultKey = key.map((k) => {
            if (typeof k === "function") k = keysFromSelector(k, selectorOpts);
            return `${o.keyPrefix}${keySeparator}${k}`;
          });
        } else {
          if (typeof key === "function") key = keysFromSelector(key, selectorOpts);
          resultKey = o.keyPrefix ? `${o.keyPrefix}${keySeparator}${key}` : key;
        }
        return this.t(resultKey, o);
      };
      if (isString(lng)) {
        fixedT.lng = lng;
      } else {
        fixedT.lngs = lng;
      }
      fixedT.ns = ns;
      fixedT.keyPrefix = keyPrefix;
      return fixedT;
    }
    t(...args) {
      if (!this.translator) {
        this.logger.warn("t: called before init(); returning an empty string");
        return "";
      }
      return this.translator.translate(...args);
    }
    exists(...args) {
      return this.translator?.exists(...args);
    }
    setDefaultNamespace(ns) {
      this.options.defaultNS = ns;
    }
    hasLoadedNamespace(ns, options = {}) {
      if (!this.isInitialized) {
        this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
        return false;
      }
      if (!this.languages || !this.languages.length) {
        this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
        return false;
      }
      const lng = options.lng || this.resolvedLanguage || this.languages[0];
      const fallbackLng = this.options ? this.options.fallbackLng : false;
      const lastLng = this.languages[this.languages.length - 1];
      if (lng.toLowerCase() === "cimode") return true;
      const loadNotPending = (l, n) => {
        const loadState = this.services.backendConnector.state[`${l}|${n}`];
        return loadState === -1 || loadState === 0 || loadState === 2;
      };
      if (options.precheck) {
        const preResult = options.precheck(this, loadNotPending);
        if (preResult !== void 0) return preResult;
      }
      if (this.hasResourceBundle(lng, ns)) return true;
      if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages) return true;
      const {
        languageUtils
      } = this.services;
      const loadLng = !options.lng ? lng : languageUtils.isSupportedCode(lng) && languageUtils.toResolveHierarchy(lng, false)[0];
      if ((!loadLng || loadNotPending(loadLng, ns)) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;
      return false;
    }
    loadNamespaces(ns, callback) {
      const deferred = defer();
      if (!this.options.ns) {
        if (callback) callback();
        return Promise.resolve();
      }
      if (isString(ns)) ns = [ns];
      ns.forEach((n) => {
        if (!this.options.ns.includes(n)) this.options.ns.push(n);
      });
      this.loadResources((err) => {
        deferred.resolve();
        if (callback) callback(err);
      });
      return deferred;
    }
    loadLanguages(lngs, callback) {
      const deferred = defer();
      if (isString(lngs)) lngs = [lngs];
      const preloaded = this.options.preload || [];
      const newLngs = lngs.filter((lng) => !preloaded.includes(lng) && this.services.languageUtils.isSupportedCode(lng));
      if (!newLngs.length) {
        if (callback) callback();
        return Promise.resolve();
      }
      this.options.preload = preloaded.concat(newLngs);
      this.loadResources((err) => {
        deferred.resolve();
        if (callback) callback(err);
      });
      return deferred;
    }
    dir(lng) {
      if (!lng) lng = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language);
      if (!lng) return "ltr";
      try {
        const l = new Intl.Locale(lng);
        if (l && l.getTextInfo) {
          const ti = l.getTextInfo();
          if (ti && ti.direction) return ti.direction;
        }
      } catch (e) {
      }
      const rtlLngs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"];
      const languageUtils = this.services?.languageUtils || new LanguageUtil(get());
      if (lng.toLowerCase().indexOf("-latn") > 1) return "ltr";
      return rtlLngs.includes(languageUtils.getLanguagePartFromCode(lng)) || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
    }
    static createInstance(options = {}, callback) {
      const instance2 = new _I18n(options, callback);
      instance2.createInstance = _I18n.createInstance;
      return instance2;
    }
    cloneInstance(options = {}, callback = noop) {
      const forkResourceStore = options.forkResourceStore;
      if (forkResourceStore) {
        options = {
          ...options
        };
        delete options.forkResourceStore;
      }
      const mergedOptions = {
        ...this.options,
        preload: false,
        ...options,
        ...{
          isClone: true
        }
      };
      const clone = new _I18n(mergedOptions);
      if (options.debug !== void 0 || options.prefix !== void 0) {
        clone.logger = clone.logger.clone(options);
      }
      const membersToCopy = ["store", "services", "language"];
      membersToCopy.forEach((m) => {
        clone[m] = this[m];
      });
      clone.services = {
        ...this.services
      };
      clone.services.utils = {
        ...clone.services.utils,
        hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone),
        reloadResources: clone.reloadResources.bind(clone)
      };
      if (forkResourceStore) {
        const copyData = (obj) => {
          const copied = Array.isArray(obj) ? [...obj] : {
            ...obj
          };
          Object.keys(copied).forEach((k) => {
            if (copied[k] && typeof copied[k] === "object") copied[k] = copyData(copied[k]);
          });
          return copied;
        };
        const clonedData = copyData(this.store.data);
        clone.store = new ResourceStore(clonedData, mergedOptions);
        clone.services.resourceStore = clone.store;
      }
      if (options.interpolation) {
        const defOpts = get();
        const mergedInterpolation = {
          ...defOpts.interpolation,
          ...this.options.interpolation,
          ...options.interpolation
        };
        const mergedForInterpolator = {
          ...mergedOptions,
          interpolation: mergedInterpolation
        };
        clone.services.interpolator = new Interpolator(mergedForInterpolator);
      }
      clone.translator = new Translator(clone.services, mergedOptions);
      clone.translator.on("*", (event, ...args) => {
        clone.emit(event, ...args);
      });
      clone.init(mergedOptions, callback);
      clone.translator.options = mergedOptions;
      clone.translator.backendConnector.newestCloneHasLoadedNamespace = clone.hasLoadedNamespace.bind(clone);
      return clone;
    }
    toJSON() {
      return {
        options: this.options,
        store: this.store,
        language: this.language,
        languages: this.languages,
        resolvedLanguage: this.resolvedLanguage
      };
    }
  };
  var instance = I18n.createInstance();
  var createInstance = instance.createInstance;
  var dir = instance.dir;
  var init = instance.init;
  var loadResources = instance.loadResources;
  var reloadResources = instance.reloadResources;
  var use = instance.use;
  var changeLanguage = instance.changeLanguage;
  var getFixedT = instance.getFixedT;
  var t = instance.t;
  var exists = instance.exists;
  var setDefaultNamespace = instance.setDefaultNamespace;
  var hasLoadedNamespace = instance.hasLoadedNamespace;
  var loadNamespaces = instance.loadNamespaces;
  var loadLanguages = instance.loadLanguages;

  // locales:@locales
  var locales_default = { "de": { "translation": { "meta": { "name": "Deutsch", "dir": "ltr" }, "ui": { "skipToControls": "Zu den Einstellungen springen", "brand": "Wortsuchrätsel <em>Ersteller</em>", "pageTitle": "Wortsuchrätsel-Ersteller — zum Ausdrucken", "languageLabel": "Sprache", "controlsTitle": "Wortsuchrätsel erstellen", "puzzleTitleLabel": "Titel des Wortsuchrätsels", "presetLegend": "Vorgefertigte Wortliste", "wordsLabel": "Wörter — ein Wort oder eine Phrase pro Zeile", "wordsPlaceholder": "PUTEN\nFÜLLUNG\nPILGER", "difficultyLegend": "Schwierigkeit", "allowVertical": "Vertikale Wörter erlauben", "allowDiagonals": "Diagonale Wörter erlauben", "allowBackwards": "Rückwärts lesende Wörter erlauben", "allowOverlaps": "Wörter dürfen Buchstaben teilen", "fillerLetters": "Füllbuchstaben", "fillRandom": "Zufällige Buchstaben", "fillWordly": "Buchstaben aus der Wortliste (schwieriger)", "gridSize": "Rastergröße", "gridAuto": "Automatisch", "generate": "Wortsuchrätsel erstellen", "print": "Drucken", "hint": "Tipp: Drucken Sie über das Dialogfenster Ihres Browsers — das Layout ist bereits für US Letter mit der Wortliste unter dem Raster angepasst. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> erstellt von überall.", "puzzleTitleDefault": "Wortsuchrätsel", "findLabel": 'Finde diese <span id="word-count">{{count}}</span> Wörter', "reveal": "Lösung anzeigen", "hide": "Lösung ausblenden", "regenerate": "Neues Wortsuchrätsel erstellen", "answersTitle": "Lösung", "answerNote": "Hervorgehobene und unterstrichene Felder zeigen, wo jedes Wort versteckt ist.", "gridAria": "Wortsuchraster", "answerGridAria": "Lösungsraster", "gridSizeAria": "{{label}}, {{rows}} Zeilen und {{columns}} Spalten", "wordLocations": "Positionen der Wörter: ", "partOfWord": "Teil eines versteckten Wortes", "row": "Zeile", "column": "Spalte", "reading": "lesen", "alongGrid": "entlang des Rasters", "dirRight": "nach rechts", "dirLeft": "nach links", "dirDown": "nach unten", "dirUp": "nach oben", "dirDownRight": "unten rechts", "dirDownLeft": "unten links", "dirUpRight": "oben rechts", "dirUpLeft": "oben links", "errorNoWords": "Füge mindestens ein Wort (mit 2 oder mehr Buchstaben) zur Liste hinzu.", "errorNoFit": "Alle Wörter passen nicht in dieses Raster — versuchen Sie eine größere Rastergröße oder weniger/kürzere Wörter.", "announceReady": "Wortsuchrätsel bereit. {{count}} Wörter in einem {{size}} × {{size}} Raster zu finden.", "announceAnswersShown": "Lösung angezeigt. Die Wortpositionen sind nach dem Hinweis über dem Raster aufgeführt.", "announceAnswersHidden": "Lösung ausgeblendet." }, "presets": { "thanksgiving": { "label": "Erntedankfest", "emoji": "🦃", "title": "🦃 Frohes Erntedankfest! 🥧", "words": ["PUTEN", "FÜLLUNG", "PREISELBEEREN", "KÜRBISTORTE", "SAUCE", "MAYFLOWER", "FAMILIE", "FESTMAHL", "ERNTE", "KEULE", "MAIS", "SÜSSKARTOFFEL", "TORTE", "BRÖTCHEN", "BROT", "AUFLAUF", "GEFÜLLT", "GEBRATEN", "RESTE", "ZERLEGEN", "PARADE", "FUSSBALL", "KORN", "KÜRBIS", "SALZLAKE", "BEGIESSEN", "INNEREIEN", "AUFTAUEN", "TISCHDECKE", "TISCHSCHMUCK", "FÜLLHORN", "GUT GUT"] }, "christmas": { "label": "Weihnachten", "emoji": "🎄", "title": "🎄 Frohe Weihnachten! 🎅", "words": ["SCHLITTEN", "RENTIER", "SCHNEEMANN", "MISTEL", "KAMIN", "BONBONSTANGEN", "EIERLIKÖR", "LEBKUCHEN", "KRANZ", "STRUMPF", "LICHTER", "GLOCKEN", "WEIHNACHTSMANN", "ELF", "WEIHNACHTSBAUM", "FROSTIG", "NUSSKNACKER", "SCHNEEFLOCKE", "WEIHNACHTSLIEDER", "FRUCHTKUCHEN"] }, "st-patricks": { "label": "St. Patrick", "emoji": "☘️", "title": "☘️ St. Patrick's Day 🍀", "words": ["KLEEBLATT", "BLATT", "PARADE", "GRÜN", "DUBLIN", "HARFE", "SACKPFEIFE", "FESTIVAL", "MÄRZ", "IRLÄNDISCH", "STECKNADELN", "KAPELLE", "FLUSS", "GLÜCK", "GOLDEN", "PFEIFFE", "TANZ", "STADT", "FRÜHLING", "WAGEN", "TASCHE", "HUT", "MUSIK", "FEIER"] }, "easter": { "label": "Ostern", "emoji": "🐣", "title": "🐣 Ostereiersuche 🐇", "words": ["SCHOKOLADE", "KORB", "HASE", "EI", "SUCHE", "FRÜHLING", "NARZISSE", "HUT", "PARADE", "KÜKEN", "MARZIPAN", "NEST", "MALEN", "BRUNCH", "FEIERTAG", "APRIL", "SONNENSCHEIN", "BLÜTE", "WIESE", "PICKNICK", "KROKUS", "LANGOHR", "SÜSSIGKEIT", "FAMILIE"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Halloween-Nacht 👻", "words": ["KÜRBIS", "KOSTÜM", "SÜSSIGKEIT", "GEIST", "HEXE", "VERHEXT", "MASKE", "SÜSSES ODER SAURES", "LATERNE", "SKELETT", "FLEDERMAUS", "GRUSELIG", "SCHOKOLADE", "PARTY", "OKTOBER", "NACHT", "UNHEIMLICH", "SCHNITZEN", "ZUCKERMAIS", "DEKORATION", "MONSTER", "GESPENST", "KOBOLD", "SCHATTEN"] }, "fourth-of-july": { "label": "4. Juli", "emoji": "🎆", "title": "🎆 4. Juli 🎇", "words": ["FEUERWERK", "GRILLEN", "PARADE", "FAHNE", "PICKNICK", "WUNDERKERZEN", "GRILLPARTY", "FEIER", "JULI", "VIERTE", "KNALLFROSCH", "BALLON", "KAPELLE", "LIMONADE", "WASSERMELONE", "FREIHEIT", "ADLER", "NATION", "FESTIVAL", "FUNKEN", "NACHT", "FAMILIE", "FREUNDE", "FEIERTAG"] }, "bastille-day": { "label": "Bastillentag", "emoji": "🇫🇷", "title": "🇫🇷 Bastillentag 🎆", "words": ["PARIS", "BASTILLE", "FEUERWERK", "PARADE", "FAHNE", "JULI", "VIERZEHNTE", "FEIER", "KONZERT", "STRASSE", "TANZ", "NATION", "GESCHICHTE", "REVOLUTION", "KAPELLE", "TURM", "EIFFEL", "STADT", "LICHT", "SOMMER", "FESTIVAL", "FRANKREICH", "PLATZ", "FACKEL"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAYERN", "BRATWURST", "BREZEL", "OKTOBER", "FESTIVAL", "LEDERHOSEN", "MÜNCHEN", "MUSIK", "KAPELLE", "ZELT", "WURST", "BROT", "FEIER", "ERNTE", "TANZ", "KRUG", "MENGE", "DEUTSCHLAND", "HERBST", "BIER", "ALPIN", "PARADE", "BLASMUSIK", "GARTEN"] }, "fall": { "label": "Herbst", "emoji": "🍂", "title": "🍂 Herbsttage 🍁", "words": ["EICHEL", "HERBST", "APFELCIDRE", "LAUB", "GARTEN", "ERNTE", "VOGELSCHEUCHE", "NOVEMBER", "HARKE", "OKTOBER", "AHORN", "KÜRBIS", "STRICKJACKE", "WINDIG", "ZIERKÜRBIS", "HEUFAHRT", "FALKE", "MAISLABYRINTH", "LAUBHAUFEN", "APFELGARTEN"] }, "soccer-worldcup": { "label": "Weltmeisterschaft", "emoji": "⚽", "title": "⚽ WM 2026 — Alle 48 Teams 🏆", "words": ["MEXIKO", "SÜDAFRIKA", "SÜDKOREA", "TSCHECHIEN", "KANADA", "BOSNIEN-HERZEGOWINA", "KATAR", "SCHWEIZ", "BRASILIEN", "MAROKKO", "HAITI", "SCHOTTLAND", "VEREINIGTE STAATEN", "PARAGUAY", "AUSTRALIEN", "TÜRKEI", "DEUTSCHLAND", "CURAÇAO", "ELFENBEINKÜSTE", "ECUADOR", "NIEDERLANDE", "JAPAN", "SCHWEDEN", "TUNESIEN", "BELGIEN", "ÄGYPTEN", "IRAN", "NEUSEELAND", "SPANIEN", "KAP VERDE", "SAUDI-ARABIEN", "URUGUAY", "FRANKREICH", "SENEGAL", "IRAK", "NORWEGEN", "ARGENTINIEN", "ALGERIEN", "ÖSTERREICH", "JORDANIEN", "PORTUGAL", "RD KONGO", "USBEKISTAN", "KOLUMBIEN", "ENGLAND", "KROATIEN", "GHANA", "PANAMA"] }, "soccer-europe": { "label": "Europa", "emoji": "⚽", "title": "⚽ Europäischer Fußball 🏟️", "words": ["PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGUE 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MÜNCHEN", "INTER MAILAND", "AC MAILAND", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO MADRID", "NEAPEL", "AJAX"] }, "soccer-mls": { "label": "MLS", "emoji": "⚽", "title": "⚽ Major League Soccer 🥅", "words": ["INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS", "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW", "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI", "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC", "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC"] }, "tag-der-deutschen-einheit": { "label": "Tag der Deutschen Einheit", "emoji": "🇩🇪", "title": "🇩🇪 Tag der Deutschen Einheit 🎉", "words": ["DEUTSCHLAND", "EINHEIT", "OKTOBER", "BERLIN", "BRANDENBURGER TOR", "FANFARE", "FEUERWERK", "REDE", "FEST", "PARADE", "OST", "WEST", "MAUER", "FRIEDEN", "FREIHEIT", "NATION", "BUNDESLAND", "FAHNE", "SCHWARZ", "ROT", "GOLD", "ADLER", "WIR SIND EIN VOLK", "JUBEL"] }, "karneval": { "label": "Karneval", "emoji": "🎭", "title": "🎭 Karneval in Köln 🎉", "words": ["KÖLN", "KARNEVAL", "FASTNACHT", "UMZUG", "MASKEN", "KOSTÜM", "NARREN", "JECK", "WAGEN", "MUSIK", "TAMM TAMM", "SCHLAGER", "BÜHNE", "KONFETTI", "LACHE", "TANZ", "FEST", "KNEIPE", "KÖLSCH", "SAMSTAG", "SONNTAG", "ROSENMONTAG", "ASCHERMITTWOCH", "PRINZ", "JUNGFER"] }, "custom": { "label": "Benutzerdefiniert", "emoji": "✏️", "title": "", "words": [] } } } }, "en": { "translation": { "meta": { "name": "English", "dir": "ltr" }, "ui": { "skipToControls": "Skip to controls", "brand": "Word Search <em>Maker</em>", "pageTitle": "Word Search Maker — printable puzzles", "languageLabel": "Language", "controlsTitle": "Build your puzzle", "puzzleTitleLabel": "Puzzle title", "presetLegend": "Word list preset", "wordsLabel": "Words — one word or phrase per line", "wordsPlaceholder": "TURKEY\nSTUFFING\nPILGRIM", "difficultyLegend": "Difficulty", "allowVertical": "Allow vertical words", "allowDiagonals": "Allow diagonal words", "allowBackwards": "Allow backwards words", "allowOverlaps": "Allow words to share letters", "fillerLetters": "Filler letters", "fillRandom": "Random letters", "fillWordly": "Letters from the word list (harder)", "gridSize": "Grid size", "gridAuto": "Auto", "generate": "Generate puzzle", "print": "Print", "hint": "Tip: print from your browser's dialog — the layout is already fitted to US Letter with the word list below the grid. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> generates from anywhere.", "puzzleTitleDefault": "Word Search", "findLabel": 'Find these <span id="word-count">{{count}}</span> words', "reveal": "Show answer key", "hide": "Hide answer key", "regenerate": "Shuffle new puzzle", "answersTitle": "Answer Key", "answerNote": "Highlighted, underlined cells show where each word is hidden.", "gridAria": "Word search grid", "answerGridAria": "Answer key grid", "gridSizeAria": "{{label}}, {{rows}} rows by {{columns}} columns", "wordLocations": "Word locations: ", "partOfWord": "part of a hidden word", "row": "row", "column": "column", "reading": "reading", "alongGrid": "along the grid", "dirRight": "right", "dirLeft": "left", "dirDown": "down", "dirUp": "up", "dirDownRight": "down-right", "dirDownLeft": "down-left", "dirUpRight": "up-right", "dirUpLeft": "up-left", "errorNoWords": "Add at least one word (2+ letters) to the list.", "errorNoFit": "Couldn't fit all words in this grid — try a larger grid size or fewer/shorter words.", "announceReady": "Puzzle ready. {{count}} words to find in a {{size}} by {{size}} grid.", "announceAnswersShown": "Answer key shown. Word locations are listed after the note above the grid.", "announceAnswersHidden": "Answer key hidden." }, "presets": { "thanksgiving": { "label": "Thanksgiving", "emoji": "🦃", "title": "🦃 Happy Thanksgiving! 🥧", "words": ["TURKEY", "STUFFING", "CRANBERRY", "PUMPKIN PIE", "GRAVY", "MAYFLOWER", "FAMILY", "FEAST", "HARVEST", "DRUMSTICK", "CORN", "YAM", "PIE", "ROLLS", "BREAD", "CASSEROLE", "STUFFED", "BASTING", "LEFTOVERS", "CARVING", "PARADE", "FOOTBALL", "MAIZE", "SQUASH", "BRINE", "BASTED", "GIBLETS", "THAW", "TABLECLOTH", "CENTERPIECE", "CORNUCOPIA", "GOBBLE GOBBLE"] }, "christmas": { "label": "Christmas", "emoji": "🎄", "title": "🎄 Merry Christmas! 🎅", "words": ["SLEIGH", "REINDEER", "SNOWMAN", "MISTLETOE", "FIREPLACE", "CANDY CANE", "EGGNOG", "GINGERBREAD", "WREATH", "STOCKING", "TINSEL", "JINGLE BELLS", "SANTA CLAUS", "ELF", "CHRISTMAS TREE", "FROSTY", "NUTCRACKER", "SNOWFLAKE", "CAROLS", "FRUITCAKE"] }, "st-patricks": { "label": "St. Patrick's", "emoji": "☘️", "title": "☘️ St. Patrick's Day 🍀", "words": ["SHAMROCK", "CLOVER", "PARADE", "GREEN", "DUBLIN", "HARP", "BAGPIPE", "FESTIVAL", "MARCH", "IRISH", "PINS", "BAND", "RIVER", "LUCK", "GOLDEN", "WHISTLE", "DANCE", "CITY", "SPRING", "FLOAT", "POCKET", "HAT", "MUSIC", "CELEBRATION"] }, "easter": { "label": "Easter", "emoji": "🐣", "title": "🐣 Easter Egg Hunt 🐇", "words": ["CHOCOLATE", "BASKET", "RABBIT", "EGG", "HUNT", "SPRING", "DAFFODIL", "BONNET", "PARADE", "CHICK", "MARZIPAN", "NEST", "PAINT", "BRUNCH", "HOLIDAY", "APRIL", "SUNSHINE", "BLOSSOM", "MEADOW", "PICNIC", "CROCUS", "HARE", "CANDY", "FAMILY"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Halloween Night 👻", "words": ["PUMPKIN", "COSTUME", "CANDY", "GHOST", "WITCH", "HAUNTED", "MASK", "TRICK OR TREAT", "LANTERN", "SKELETON", "BAT", "SPOOKY", "CHOCOLATE", "PARTY", "OCTOBER", "NIGHT", "CREEPY", "CARVE", "CANDY CORN", "DECORATION", "MONSTER", "PHANTOM", "GOBLIN", "SHADOWS"] }, "fourth-of-july": { "label": "Fourth of July", "emoji": "🎆", "title": "🎆 Fourth of July 🎇", "words": ["FIREWORKS", "BARBECUE", "PARADE", "FLAG", "PICNIC", "SPARKLER", "COOKOUT", "CELEBRATION", "JULY", "FOURTH", "FIRECRACKER", "BALLOON", "BAND", "LEMONADE", "WATERMELON", "LIBERTY", "EAGLE", "NATION", "FESTIVAL", "SPARKS", "NIGHT", "FAMILY", "FRIENDS", "HOLIDAY"] }, "bastille-day": { "label": "Bastille Day", "emoji": "🇫🇷", "title": "🇫🇷 Bastille Day 🎆", "words": ["PARIS", "BASTILLE", "FIREWORKS", "PARADE", "FLAG", "JULY", "FOURTEENTH", "CELEBRATION", "CONCERT", "STREET", "DANCE", "NATION", "HISTORY", "REVOLUTION", "BAND", "TOWER", "EIFFEL", "CITY", "LUMIERE", "SUMMER", "FESTIVAL", "FRANCE", "SQUARE", "TORCH"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVARIA", "BRATWURST", "PRETZEL", "OCTOBER", "FESTIVAL", "LEDERHOSEN", "MUNICH", "MUSIC", "BAND", "TENT", "SAUSAGE", "BREAD", "CELEBRATION", "HARVEST", "DANCE", "STEIN", "CROWD", "GERMANY", "AUTUMN", "BEER", "ALPINE", "PARADE", "OOMPAH", "GARDEN"] }, "fall": { "label": "Fall", "emoji": "🍂", "title": "🍂 Fall Days 🍁", "words": ["ACORN", "AUTUMN", "CIDER", "FOLIAGE", "GARDEN", "HARVEST", "SCARECROW", "NOVEMBER", "RAKE", "OCTOBER", "MAPLE", "PUMPKIN", "SWEATER", "WINDSWEPT", "GOURD", "HAYRIDE", "FALCON", "CORN MAZE", "LEAF PILE", "APPLE ORCHARD"] }, "soccer-worldcup": { "label": "World Cup", "emoji": "⚽", "title": "⚽ World Cup 2026 — All 48 Teams 🏆", "words": ["MEXICO", "SOUTH AFRICA", "SOUTH KOREA", "CZECHIA", "CANADA", "BOSNIA & HERZEGOVINA", "QATAR", "SWITZERLAND", "BRAZIL", "MOROCCO", "HAITI", "SCOTLAND", "UNITED STATES", "PARAGUAY", "AUSTRALIA", "TURKIYE", "GERMANY", "CURACAO", "IVORY COAST", "ECUADOR", "NETHERLANDS", "JAPAN", "SWEDEN", "TUNISIA", "BELGIUM", "EGYPT", "IRAN", "NEW ZEALAND", "SPAIN", "CABO VERDE", "SAUDI ARABIA", "URUGUAY", "FRANCE", "SENEGAL", "IRAQ", "NORWAY", "ARGENTINA", "ALGERIA", "AUSTRIA", "JORDAN", "PORTUGAL", "DR CONGO", "UZBEKISTAN", "COLOMBIA", "ENGLAND", "CROATIA", "GHANA", "PANAMA"] }, "soccer-europe": { "label": "Europe", "emoji": "⚽", "title": "⚽ European Soccer 🏟️", "words": ["PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGUE 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MUNICH", "INTER MILAN", "AC MILAN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLETICO MADRID", "NAPOLI", "AJAX"] }, "soccer-mls": { "label": "MLS", "emoji": "⚽", "title": "⚽ Major League Soccer 🥅", "words": ["INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS", "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW", "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI", "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC", "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC"] }, "custom": { "label": "Custom", "emoji": "✏️", "title": "", "words": [] } } } }, "es-419": { "translation": { "meta": { "name": "Español (Latinoamérica)", "dir": "ltr" }, "ui": { "skipToControls": "Saltar a los controles", "brand": "Buscapalabras <em>Creador</em>", "pageTitle": "Creador de Buscapalabras — para imprimir", "languageLabel": "Idioma", "controlsTitle": "Crea tu buscapalabras", "puzzleTitleLabel": "Título del buscapalabras", "presetLegend": "Lista de palabras predefinida", "wordsLabel": "Palabras — una palabra o frase por línea", "wordsPlaceholder": "PAVO\nRELLENO\nPEREGRINO", "difficultyLegend": "Dificultad", "allowVertical": "Permitir palabras verticales", "allowDiagonals": "Permitir palabras diagonales", "allowBackwards": "Permitir palabras al revés", "allowOverlaps": "Permitir que las palabras compartan letras", "fillerLetters": "Letras de relleno", "fillRandom": "Letras al azar", "fillWordly": "Letras de la lista de palabras (más difícil)", "gridSize": "Tamaño de la cuadrícula", "gridAuto": "Automático", "generate": "Generar buscapalabras", "print": "Imprimir", "hint": "Consejo: imprime desde el cuadro de diálogo de tu navegador; el diseño ya está ajustado a carta estadounidense con la lista de palabras debajo de la cuadrícula. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> genera desde cualquier lugar.", "puzzleTitleDefault": "Buscapalabras", "findLabel": 'Encuentra estas <span id="word-count">{{count}}</span> palabras', "reveal": "Mostrar solución", "hide": "Ocultar solución", "regenerate": "Generar otro buscapalabras", "answersTitle": "Solución", "answerNote": "Las celdas resaltadas y subrayadas muestran dónde se esconde cada palabra.", "gridAria": "Cuadrícula del buscapalabras", "answerGridAria": "Cuadrícula de la solución", "gridSizeAria": "{{label}}, {{rows}} filas por {{columns}} columnas", "wordLocations": "Ubicación de las palabras: ", "partOfWord": "parte de una palabra oculta", "row": "fila", "column": "columna", "reading": "leyendo", "alongGrid": "a lo largo de la cuadrícula", "dirRight": "hacia la derecha", "dirLeft": "hacia la izquierda", "dirDown": "hacia abajo", "dirUp": "hacia arriba", "dirDownRight": "hacia abajo a la derecha", "dirDownLeft": "hacia abajo a la izquierda", "dirUpRight": "hacia arriba a la derecha", "dirUpLeft": "hacia arriba a la izquierda", "errorNoWords": "Agrega al menos una palabra (de 2 o más letras) a la lista.", "errorNoFit": "No caben todas las palabras en esta cuadrícula: prueba un tamaño mayor o usa menos palabras (o más cortas).", "announceReady": "Buscapalabras listo. {{count}} palabras para encontrar en una cuadrícula de {{size}} por {{size}}.", "announceAnswersShown": "Solución mostrada. La ubicación de las palabras aparece después de la nota sobre la cuadrícula.", "announceAnswersHidden": "Solución oculta." }, "presets": { "thanksgiving": { "label": "Día de Acción de Gracias", "emoji": "🦃", "title": "🦃 ¡Feliz Día de Acción de Gracias! 🥧", "words": ["PAVO", "RELLENO", "ARÁNDANO", "TARTA DE CALABAZA", "SALSA", "MAYFLOWER", "FAMILIA", "BANQUETE", "COSECHA", "MUSLO", "MAÍZ", "BATATA", "PASTEL", "PANECILLOS", "PAN", "CAZUELA", "RELLENAR", "HORNEADO", "SOBRAS", "TRINCHAR", "DESFILE", "FÚTBOL", "MAIZAL", "CALABAZA", "SALMUERA", "ROCIAR", "MENUDENCIAS", "DESCONGELAR", "MANTEL", "CENTRO DE MESA", "CUERNO DE ABUNDANCIA", "CLU CLU"] }, "christmas": { "label": "Navidad", "emoji": "🎄", "title": "🎄 ¡Feliz Navidad! 🎅", "words": ["TRINEO", "RENO", "MUÑECO DE NIEVE", "MUÉRDAGO", "CHIMENEA", "BASTÓN DE CARAMELO", "PONCHE DE HUEVO", "PAN DE JENGIBRE", "CORONA", "MEDIA", "LUCES", "CAMPANITAS", "SANTA CLAUS", "ELFO", "ÁRBOL DE NAVIDAD", "CONGELADO", "CASCANUECES", "COPO DE NIEVE", "VILLANCICOS", "FRUTA CONFITADA"] }, "st-patricks": { "label": "San Patricio", "emoji": "☘️", "title": "☘️ Día de San Patricio 🍀", "words": ["TRÉBOL", "HOJA", "DESFILE", "VERDE", "DUBLÍN", "ARPA", "GAITA", "FESTIVAL", "MARZO", "IRLANDÉS", "ALFILERES", "BANDA", "RÍO", "SUERTE", "DORADO", "SILBATO", "BAILE", "CIUDAD", "PRIMAVERA", "CARROZA", "BOLSILLO", "SOMBRERO", "MÚSICA", "CELEBRACIÓN"] }, "easter": { "label": "Pascua", "emoji": "🐣", "title": "🐣 Búsqueda de huevos de Pascua 🐇", "words": ["CHOCOLATE", "CESTA", "CONEJO", "HUEVO", "BÚSQUEDA", "PRIMAVERA", "NARCISSO", "SOMBRERO", "DESFILE", "POLLO", "MAZAPÁN", "NIDO", "PINTAR", "BRUNCH", "FESTIVIDAD", "ABRIL", "SOL", "FLOR", "PRADO", "PICNIC", "CROCO", "LIEBRE", "DULCE", "FAMILIA"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Noche de Halloween 👻", "words": ["CALABAZA", "DISFRAZ", "DULCE", "FANTASMA", "BRUJA", "EMBRUJADO", "MÁSCARA", "TRUCO O TRATO", "LINTERNA", "ESQUELETO", "MURCIÉLAGO", "TENEBROSO", "CHOCOLATE", "FIESTA", "OCTUBRE", "NOCHE", "ESPANTOSO", "TALLAR", "MAÍZ CONFITADO", "DECORACIÓN", "MONSTRUO", "ESPECTRO", "DUENDE", "SOMBRAS"] }, "fourth-of-july": { "label": "4 de julio", "emoji": "🎆", "title": "🎆 4 de julio 🎇", "words": ["FUEGOS ARTIFICIALES", "BARBACOA", "DESFILE", "BANDERA", "PICNIC", "BENGALA", "ASADO", "CELEBRACIÓN", "JULIO", "CUATRO", "PETARDO", "GLOBO", "BANDA", "LIMONADA", "SANDÍA", "LIBERTAD", "ÁGUILA", "NACIÓN", "FESTIVAL", "CHISPAS", "NOCHE", "FAMILIA", "AMIGOS", "FESTIVIDAD"] }, "bastille-day": { "label": "Día de la Bastilla", "emoji": "🇫🇷", "title": "🇫🇷 Día de la Bastilla 🎆", "words": ["PARÍS", "BASTILLA", "FUEGOS ARTIFICIALES", "DESFILE", "BANDERA", "JULIO", "CATORCE", "CELEBRACIÓN", "CONCIERTO", "CALLE", "BAILE", "NACIÓN", "HISTORIA", "REVOLUCIÓN", "BANDA", "TORRE", "EIFFEL", "CIUDAD", "LUCES", "VERANO", "FESTIVAL", "FRANCIA", "PLAZA", "ANTORCHA"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVARIA", "SALCHICHA", "BRETZEL", "OCTUBRE", "FESTIVAL", "LEDERHOSEN", "MÚNICH", "MÚSICA", "BANDA", "CARPA", "EMBUTIDO", "PAN", "CELEBRACIÓN", "COSECHA", "BAILE", "JARRA", "MULTITUD", "ALEMANIA", "OTOÑO", "CERVEZA", "ALPINO", "DESFILE", "FESTEJO", "JARDÍN"] }, "fall": { "label": "Otoño", "emoji": "🍂", "title": "🍂 Días de otoño 🍁", "words": ["BELLOTA", "OTOÑO", "SIDRA", "HOJAS", "JARDÍN", "COSECHA", "ESPANTAPÁJAROS", "NOVIEMBRE", "RASTRILLO", "OCTUBRE", "ARCE", "CALABAZA", "SUÉTER", "VENTOSO", "CALABACÍN", "PASEO EN HENO", "HALCÓN", "LABERINTO DE MAÍZ", "MONTÓN DE HOJAS", "HUERTO DE MANZANAS"] }, "soccer-worldcup": { "label": "Mundial", "emoji": "⚽", "title": "⚽ Mundial 2026 — Los 48 equipos 🏆", "words": ["MÉXICO", "SUDÁFRICA", "COREA DEL SUR", "CHEQUIA", "CANADÁ", "BOSNIA Y HERZEGOVINA", "CATAR", "SUIZA", "BRASIL", "MARRUECOS", "HAITÍ", "ESCOCIA", "ESTADOS UNIDOS", "PARAGUAY", "AUSTRALIA", "TURQUÍA", "ALEMANIA", "CURAZAO", "COSTA DE MARFIL", "ECUADOR", "PAÍSES BAJOS", "JAPÓN", "SUECIA", "TÚNEZ", "BÉLGICA", "EGIPTO", "IRÁN", "NUEVA ZELANDA", "ESPAÑA", "CABO VERDE", "ARABIA SAUDITA", "URUGUAY", "FRANCIA", "SENEGAL", "IRAQ", "NORUEGA", "ARGENTINA", "ARGELIA", "AUSTRIA", "JORDANIA", "PORTUGAL", "RD CONGO", "UZBEKISTÁN", "COLOMBIA", "INGLATERRA", "CROACIA", "GHANA", "PANAMÁ"] }, "soccer-europe": { "label": "Europa", "emoji": "⚽", "title": "⚽ Fútbol europeo 🏟️", "words": ["LIGA PREMIER", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGA 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MÚNICH", "INTER DE MILÁN", "AC MILÁN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO DE MADRID", "NÁPOLES", "AJAX"] }, "soccer-mls": { "label": "MLS", "emoji": "⚽", "title": "⚽ Major League Soccer 🥅", "words": ["INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS", "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW", "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI", "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC", "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC"] }, "cinco-de-mayo": { "label": "Cinco de Mayo", "emoji": "🇲🇽", "title": "🇲🇽 ¡Cinco de Mayo! 🎉", "words": ["MÉXICO", "PUEBLA", "BATALLA", "ZARAPE", "MARIACHI", "TELMEX", "SOMBRERO", "CACTUS", "TEQUILA", "GUACAMOLE", "TACOS", "SALSA", "FIESTA", "DESFILE", "BAILE", "MÚSICA", "BANDERA", "VERDE", "BLANCO", "ROJO", "AGUILA", "SERAPE", "FESTEJO", "AMIGO"] }, "day-of-the-dead": { "label": "Día de Muertos", "emoji": "💀", "title": "💀 Día de Muertos 🕯️", "words": ["CALAVERA", "OFERENDA", "CEMPASÚCHIL", "PAN DE MUERTO", "ALTAR", "VELA", "FAMILIA", "RECUERDO", "MÚSICA", "FOTO", "FLOR", "PAPEL PICADO", "CATRINA", "ESQUELETO", "MAÍZ", "CHOCOLATE", "AGUA", "SAL", "INCIENSO", "ORACIÓN", "NOVEMBRE", "MÉXICO", "MUERTE", "LUZ"] }, "valentines": { "label": "San Valentín", "emoji": "💘", "title": "💘 ¡Feliz San Valentín! 🌹", "words": ["AMOR", "CORAZÓN", "ROSAS", "BESO", "PAREJA", "CUPIDO", "FLECHA", "MAGNOLIA", "CENIZA", "CHICLE", "GALÁN", "CLAVEL", "MARGARITA", "ORQUÍDEA", "TULIPÁN", "LIRIO", "PIRUFLA", "CARTA", "REGALO", "CITA", "ENAMORADO", "CARICIA", "TERNURA", "FLORERO"] }, "custom": { "label": "Personalizado", "emoji": "✏️", "title": "", "words": [] } } } }, "es-ES": { "translation": { "meta": { "name": "Español (España)", "dir": "ltr" }, "ui": { "skipToControls": "Saltar a los controles", "brand": "Buscapalabras <em>Creador</em>", "pageTitle": "Creador de Buscapalabras — para imprimir", "languageLabel": "Idioma", "controlsTitle": "Crea tu buscapalabras", "puzzleTitleLabel": "Título del buscapalabras", "presetLegend": "Lista de palabras predefinida", "wordsLabel": "Palabras — una palabra o frase por línea", "wordsPlaceholder": "PAVO\nRELLENO\nTURCO", "difficultyLegend": "Dificultad", "allowVertical": "Permitir palabras verticales", "allowDiagonals": "Permitir palabras diagonales", "allowBackwards": "Permitir palabras al revés", "allowOverlaps": "Permitir que las palabras compartan letras", "fillerLetters": "Letras de relleno", "fillRandom": "Letras aleatorias", "fillWordly": "Letras de la lista de palabras (más difícil)", "gridSize": "Tamaño de la cuadrícula", "gridAuto": "Automático", "generate": "Generar buscapalabras", "print": "Imprimir", "hint": "Consejo: imprime desde el cuadro de diálogo de tu navegador; la maquetación ya está ajustada a tamaño A4 con la lista de palabras debajo de la cuadrícula. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> genera desde cualquier lugar.", "puzzleTitleDefault": "Buscapalabras", "findLabel": 'Encuentra estas <span id="word-count">{{count}}</span> palabras', "reveal": "Mostrar solución", "hide": "Ocultar solución", "regenerate": "Generar otro buscapalabras", "answersTitle": "Solución", "answerNote": "Las celdas resaltadas y subrayadas muestran dónde se esconde cada palabra.", "gridAria": "Cuadrícula del buscapalabras", "answerGridAria": "Cuadrícula de la solución", "gridSizeAria": "{{label}}, {{rows}} filas por {{columns}} columnas", "wordLocations": "Ubicación de las palabras: ", "partOfWord": "parte de una palabra oculta", "row": "fila", "column": "columna", "reading": "leyendo", "alongGrid": "a lo largo de la cuadrícula", "dirRight": "hacia la derecha", "dirLeft": "hacia la izquierda", "dirDown": "hacia abajo", "dirUp": "hacia arriba", "dirDownRight": "hacia abajo a la derecha", "dirDownLeft": "hacia abajo a la izquierda", "dirUpRight": "hacia arriba a la derecha", "dirUpLeft": "hacia arriba a la izquierda", "errorNoWords": "Agrega al menos una palabra (de 2 o más letras) a la lista.", "errorNoFit": "No caben todas las palabras en esta cuadrícula: prueba un tamaño mayor o usa menos palabras (o más cortas).", "announceReady": "Buscapalabras listo. {{count}} palabras para encontrar en una cuadrícula de {{size}} por {{size}}.", "announceAnswersShown": "Solución mostrada. La ubicación de las palabras aparece después de la nota sobre la cuadrícula.", "announceAnswersHidden": "Solución oculta." }, "presets": { "thanksgiving": { "label": "Día de Acción de Gracias", "emoji": "🦃", "title": "🦃 ¡Feliz Día de Acción de Gracias! 🥧", "words": ["PAVO", "RELLENO", "ARÁNDANO", "TARTA DE CALABAZA", "SALSA", "MAYFLOWER", "FAMILIA", "BANQUETE", "COSECHA", "MUSLO", "MAÍZ", "BATATA", "PASTEL", "PANECILLOS", "PAN", "CAZUELA", "RELLENAR", "HORNEADO", "SOBRAS", "TRINCHAR", "DESFILE", "FÚTBOL", "MAIZAL", "CALABAZA", "SALMUERA", "ROCIAR", "MENUDENCIAS", "DESCONGELAR", "MANTEL", "CENTRO DE MESA", "CUERNO DE ABUNDANCIA", "CLU CLU"] }, "christmas": { "label": "Navidad", "emoji": "🎄", "title": "🎄 ¡Feliz Navidad! 🎅", "words": ["TRINEO", "RENO", "MUÑECO DE NIEVE", "MUÉRDAGO", "CHIMENEA", "BASTÓN DE CARAMELO", "PONCHE DE HUEVO", "PAN DE JENGIBRE", "CORONA", "MEDIA", "LUCES", "CAMPANITAS", "SANTA CLAUS", "ELFO", "ÁRBOL DE NAVIDAD", "CONGELADO", "CASCANUECES", "COPO DE NIEVE", "VILLANCICOS", "FRUTA CONFITADA"] }, "st-patricks": { "label": "San Patricio", "emoji": "☘️", "title": "☘️ Día de San Patricio 🍀", "words": ["TRÉBOL", "HOJA", "DESFILE", "VERDE", "DUBLÍN", "ARPA", "GAITA", "FESTIVAL", "MARZO", "IRLANDÉS", "ALFILERES", "BANDA", "RÍO", "SUERTE", "DORADO", "SILBATO", "BAILE", "CIUDAD", "PRIMAVERA", "CARROZA", "BOLSILLO", "SOMBRERO", "MÚSICA", "CELEBRACIÓN"] }, "easter": { "label": "Pascua", "emoji": "🐣", "title": "🐣 Búsqueda de huevos de Pascua 🐇", "words": ["CHOCOLATE", "CESTA", "CONEJO", "HUEVO", "BÚSQUEDA", "PRIMAVERA", "NARCISSO", "SOMBRERO", "DESFILE", "POLLO", "MAZAPÁN", "NIDO", "PINTAR", "BRUNCH", "FESTIVIDAD", "ABRIL", "SOL", "FLOR", "PRADO", "PICNIC", "CROCO", "LIEBRE", "DULCE", "FAMILIA"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Noche de Halloween 👻", "words": ["CALABAZA", "DISFRAZ", "DULCE", "FANTASMA", "BRUJA", "EMBRUJADO", "MÁSCARA", "TRUCO O TRATO", "LINTERNA", "ESQUELETO", "MURCIÉLAGO", "TENEBROSO", "CHOCOLATE", "FIESTA", "OCTUBRE", "NOCHE", "ESPANTOSO", "TALLAR", "MAÍZ CONFITADO", "DECORACIÓN", "MONSTRUO", "ESPECTRO", "DUENDE", "SOMBRAS"] }, "fourth-of-july": { "label": "4 de julio", "emoji": "🎆", "title": "🎆 4 de julio 🎇", "words": ["FUEGOS ARTIFICIALES", "BARBACOA", "DESFILE", "BANDERA", "PICNIC", "BENGALA", "ASADO", "CELEBRACIÓN", "JULIO", "CUATRO", "PETARDO", "GLOBO", "BANDA", "LIMONADA", "SANDÍA", "LIBERTAD", "ÁGUILA", "NACIÓN", "FESTIVAL", "CHISPAS", "NOCHE", "FAMILIA", "AMIGOS", "FESTIVIDAD"] }, "bastille-day": { "label": "Día de la Bastilla", "emoji": "🇫🇷", "title": "🇫🇷 Día de la Bastilla 🎆", "words": ["PARÍS", "BASTILLA", "FUEGOS ARTIFICIALES", "DESFILE", "BANDERA", "JULIO", "CATORCE", "CELEBRACIÓN", "CONCIERTO", "CALLE", "BAILE", "NACIÓN", "HISTORIA", "REVOLUCIÓN", "BANDA", "TORRE", "EIFFEL", "CIUDAD", "LUCES", "VERANO", "FESTIVAL", "FRANCIA", "PLAZA", "ANTORCHA"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVARIA", "SALCHICHA", "BRETZEL", "OCTUBRE", "FESTIVAL", "LEDERHOSEN", "MÚNICH", "MÚSICA", "BANDA", "CARPA", "EMBUTIDO", "PAN", "CELEBRACIÓN", "COSECHA", "BAILE", "JARRA", "MULTITUD", "ALEMANIA", "OTOÑO", "CERVEZA", "ALPINO", "DESFILE", "FESTEJO", "JARDÍN"] }, "fall": { "label": "Otoño", "emoji": "🍂", "title": "🍂 Días de otoño 🍁", "words": ["BELLOTA", "OTOÑO", "SIDRA", "HOJAS", "JARDÍN", "COSECHA", "ESPANTAPÁJAROS", "NOVIEMBRE", "RASTRILLO", "OCTUBRE", "ARCE", "CALABAZA", "SUÉTER", "VENTOSO", "CALABACÍN", "PASEO EN HENO", "HALCÓN", "LABERINTO DE MAÍZ", "MONTÓN DE HOJAS", "HUERTO DE MANZANAS"] }, "soccer-worldcup": { "label": "Mundial", "emoji": "⚽", "title": "⚽ Mundial 2026 — Los 48 equipos 🏆", "words": ["MÉXICO", "SUDÁFRICA", "COREA DEL SUR", "CHEQUIA", "CANADÁ", "BOSNIA Y HERZEGOVINA", "CATAR", "SUIZA", "BRASIL", "MARRUECOS", "HAITÍ", "ESCOCIA", "ESTADOS UNIDOS", "PARAGUAY", "AUSTRALIA", "TURQUÍA", "ALEMANIA", "CURAZAO", "COSTA DE MARFIL", "ECUADOR", "PAÍSES BAJOS", "JAPÓN", "SUECIA", "TÚNEZ", "BÉLGICA", "EGIPTO", "IRÁN", "NUEVA ZELANDA", "ESPAÑA", "CABO VERDE", "ARABIA SAUDITA", "URUGUAY", "FRANCIA", "SENEGAL", "IRAQ", "NORUEGA", "ARGENTINA", "ARGELIA", "AUSTRIA", "JORDANIA", "PORTUGAL", "RD CONGO", "UZBEKISTÁN", "COLOMBIA", "INGLATERRA", "CROACIA", "GHANA", "PANAMÁ"] }, "soccer-europe": { "label": "Europa", "emoji": "⚽", "title": "⚽ Fútbol europeo 🏟️", "words": ["LIGA PREMIER", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGA 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MÚNICH", "INTER DE MILÁN", "AC MILÁN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO DE MADRID", "NÁPOLES", "AJAX"] }, "soccer-mls": { "label": "NBA", "emoji": "🏀", "title": "🏀 La NBA 🏀", "words": ["LOS ÁNGELES LAKERS", "BOSTON CELTICS", "GOLDEN STATE WARRIORS", "CHICAGO BULLS", "NEW YORK KNICKS", "MIAMI HEAT", "DALLAS MAVERICKS", "DENVER NUGGETS", "MILWAUKEE BUCKS", "PHILADELPHIA 76ERS", "PHOENIX SUNS", "SAN ANTONIO SPURS", "OKLAHOMA CITY THUNDER", "PORTLAND TRAIL BLAZERS", "UTAH JAZZ", "ATLANTA HAWKS", "ORLANDO MAGIC", "SACRAMENTO KINGS", "MINNESOTA TIMBERWOLVES", "CLEVELAND CAVALIERS"] }, "valentines": { "label": "San Valentín", "emoji": "💘", "title": "💘 ¡Feliz San Valentín! 🌹", "words": ["AMOR", "CORAZÓN", "ROSAS", "BESO", "PAREJA", "CUPIDO", "FLECHA", "MAGNOLIA", "CENIZA", "CHICLE", "GALÁN", "CLAVEL", "MARGARITA", "ORQUÍDEA", "TULIPÁN", "LIRIO", "PIRUFLA", "CARTA", "REGALO", "CITA", "ENAMORADO", "CARICIA", "TERNURA", "FLORERO"] }, "three-kings": { "label": "Reyes Magos", "emoji": "👑", "title": "👑 Día de los Reyes Magos ✨", "words": ["MELCHOR", "GASPAR", "BALTHASAR", "CORONA", "CAMELLO", "ESTRELLA", "BELÉN", "REGALOS", "ROSCÓN", "NEGRONA", "CABALGATA", "PÁGINA", "INFANTE", "MAGO", "ORIENTE", "INCIENSO", "MIRRA", "ORO", "JESÚS", "MARÍA", "JOSÉ", "NACIMIENTO", "CANTABELLA", "DULCE"] }, "carnaval": { "label": "Carnaval", "emoji": "🎭", "title": "🎭 Carnaval 🎉", "words": ["COMPARSA", "DISFRAZ", "MÁSCARA", "DESFILE", "CHIRINGUITO", "CONFETI", "MÚSICA", "BAILE", "FESTEJO", "CARROZA", "REINA", "REY", "SARDA", "TRAVESURA", "FANTASÍA", "PLUMAS", "LENTEJUELA", "TAMBOR", "GRITOS", "ALEGRÍA", "CADIZ", "TENERIFE", "VENECIA", "RIO"] }, "semana-santa": { "label": "Semana Santa", "emoji": "🐣", "title": "🐣 Semana Santa 🌿", "words": ["PROCESIÓN", "PASO", "COFRADÍA", "NAZARENO", "CAPA", "CIRIO", "CRUZ", "SAETA", "MANTILLA", "TRONO", "INCENSO", "CLAVOS", "SUDARIO", "RESURRECCIÓN", "DOMINGO", "JUEVES", "VIERNES", "SÁBADO", "PALMA", "OLIVO", "CÁLIZ", "HOSANNA", "LÁGRIMAS", "LUZ"] }, "san-fermin": { "label": "San Fermín", "emoji": "🐂", "title": "🐂 San Fermín — Pamplona 🏃", "words": ["TORO", "ENCERRAMIENTO", "PAMPLONA", "SAN FERMÍN", "PAÑUELO", "ROJO", "BLANCO", "CARRERA", "TORERO", "CAPEOTE", "PICADOR", "BANDERILLA", "GANADERÍA", "PLAZA", "ARENA", "MUGETA", "CORAL", "VÍA", "RIAU RIAU", "FESTEJO", "MÚSICA", "DANZA", "ALEGRÍA", "NAVARRA"] }, "tomatina": { "label": "La Tomatina", "emoji": "🍅", "title": "🍅 La Tomatina — Buñol 💦", "words": ["TOMATE", "BUÑOL", "GUERRA", "ALMUERZO", "CAMIÓN", "ROCIAR", "CUBO", "CAMISETA", "GAFAS", "MANGUERA", "PLAZA", "MÚSICA", "FESTA", "COLOR", "RISA", "BARRO", "CANTIDAD", "GRITO", "EMPUJÓN", "BOTELLA", "C ESTÁ", "TERRAZA", "VALENCIA", "AGUA"] }, "custom": { "label": "Personalizado", "emoji": "✏️", "title": "", "words": [] } } } }, "fr": { "translation": { "meta": { "name": "Français", "dir": "ltr" }, "ui": { "skipToControls": "Aller aux contrôles", "brand": "Mots Cachés <em>Créateur</em>", "pageTitle": "Créateur de Mots Cachés — grilles à imprimer", "languageLabel": "Langue", "controlsTitle": "Créez votre grille", "puzzleTitleLabel": "Titre de la grille", "presetLegend": "Liste de mots prédéfinie", "wordsLabel": "Mots — un mot ou une expression par ligne", "wordsPlaceholder": "DINDON\nFARCE\nPELERIN", "difficultyLegend": "Difficulté", "allowVertical": "Autoriser les mots verticaux", "allowDiagonals": "Autoriser les mots en diagonale", "allowBackwards": "Autoriser les mots à l'envers", "allowOverlaps": "Autoriser les mots à partager des lettres", "fillerLetters": "Lettres de remplissage", "fillRandom": "Lettres aléatoires", "fillWordly": "Lettres de la liste de mots (plus difficile)", "gridSize": "Taille de la grille", "gridAuto": "Auto", "generate": "Générer la grille", "print": "Imprimer", "hint": "Astuce : imprimez depuis la boîte de dialogue de votre navigateur — la mise en page est déjà adaptée au format Lettre US avec la liste de mots sous la grille. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> génère depuis n'importe où.", "puzzleTitleDefault": "Mots Cachés", "findLabel": 'Trouvez ces <span id="word-count">{{count}}</span> mots', "reveal": "Afficher la solution", "hide": "Masquer la solution", "regenerate": "Générer une autre grille", "answersTitle": "Solution", "answerNote": "Les cases surlignées et soulignées montrent où chaque mot est caché.", "gridAria": "Grille de mots cachés", "answerGridAria": "Grille de la solution", "gridSizeAria": "{{label}}, {{rows}} lignes sur {{columns}} colonnes", "wordLocations": "Emplacement des mots : ", "partOfWord": "partie d'un mot caché", "row": "ligne", "column": "colonne", "reading": "lecture", "alongGrid": "le long de la grille", "dirRight": "vers la droite", "dirLeft": "vers la gauche", "dirDown": "vers le bas", "dirUp": "vers le haut", "dirDownRight": "en bas à droite", "dirDownLeft": "en bas à gauche", "dirUpRight": "en haut à droite", "dirUpLeft": "en haut à gauche", "errorNoWords": "Ajoutez au moins un mot (de 2 lettres ou plus) à la liste.", "errorNoFit": "Impossible de placer tous les mots dans cette grille — essayez une taille plus grande ou moins de mots (ou des mots plus courts).", "announceReady": "Grille prête. {{count}} mots à trouver dans une grille de {{size}} sur {{size}}.", "announceAnswersShown": "Solution affichée. Les emplacements des mots sont indiqués après la note au-dessus de la grille.", "announceAnswersHidden": "Solution masquée." }, "presets": { "thanksgiving": { "label": "Thanksgiving", "emoji": "🦃", "title": "🦃 Joyeux Thanksgiving ! 🥧", "words": ["DINDE", "FARCE", "CANNEBERGE", "TARTE À LA CITROUILLE", "SAUCE", "MAYFLOWER", "FAMILLE", "FESTIN", "RÉCOLTE", "CUISSE", "MAÏS", "PATATE DOUCE", "TARTE", "PETITS PAINS", "PAIN", "GRATIN", "FARCI", "RÔTI", "RESTES", "DÉCOUPE", "DÉFILÉ", "FOOTBALL", "ÉPI DE MAÏS", "COURGE", "SAUMURE", "AROSER", "ABATS", "DÉGELER", "NAPPE", "CENTRE DE TABLE", "CORNE D'ABONDANCE", "GLOUGLOU"] }, "christmas": { "label": "Noël", "emoji": "🎄", "title": "🎄 Joyeux Noël ! 🎅", "words": ["TRAINEAU", "RENNE", "BONHOMME DE NEIGE", "GUI", "CHEMINÉE", "BÂTON DE BONBON", "LAIT DE POULE", "PAIN D'ÉPICES", "COURONNE", "BAS", "GUIRLANDE", "CLOCHETTES", "PÈRE NOËL", "ELFE", "SAPIN DE NOËL", "GELÉ", "CASSE-NOISETTE", "FLOCON", "CHANTS DE NOËL", "FRUIT CONFIT"] }, "st-patricks": { "label": "Saint-Patrick", "emoji": "☘️", "title": "☘️ Saint-Patrick 🍀", "words": ["TRÈFLE", "FEUILLE", "DÉFILÉ", "VERT", "DUBLIN", "HARPE", "CORNEMUSE", "FESTIVAL", "MARS", "IRLANDAIS", "ÉPINGLES", "FANFARE", "RIVIÈRE", "CHANCE", "DORÉ", "SIFFLET", "DANSE", "VILLE", "PRINTEMPS", "CHAR", "POCHE", "CHAPEAU", "MUSIQUE", "CÉLÉBRATION"] }, "easter": { "label": "Pâques", "emoji": "🐣", "title": "🐣 Chasse aux œufs de Pâques 🐇", "words": ["CHOCOLAT", "PANIER", "LAPIN", "ŒUF", "CHASSE", "PRINTEMPS", "JONQUILLE", "CHAPEAU", "DÉFILÉ", "POUSSIN", "MASSEPAIN", "NID", "PEINTURE", "BRUNCH", "FÊTE", "AVRIL", "SOLEIL", "FLEUR", "PRAIRIE", "PIQUE-NIQUE", "CROCUS", "LIÈVRE", "BONBON", "FAMILLE"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Nuit d'Halloween 👻", "words": ["CITROUILLE", "DÉGUISEMENT", "BONBON", "FANTÔME", "SORCIÈRE", "HANTÉ", "MASQUE", "TRUC OU TRAIT", "LANTERNE", "SQUELETTE", "CHAUVE-SOURIS", "EFFRAYANT", "CHOCOLAT", "FÊTE", "OCTOBRE", "NUIT", "MACABRE", "SCULPTER", "MAÏS SUCRÉ", "DÉCORATION", "MONSTRE", "SPECTRE", "LUTIN", "OMBRES"] }, "fourth-of-july": { "label": "4 juillet", "emoji": "🎆", "title": "🎆 4 juillet 🎇", "words": ["FEUX D'ARTIFICE", "BARBECUE", "DÉFILÉ", "DRAPEAU", "PIQUE-NIQUE", "FUSÉE", "GRILLADE", "CÉLÉBRATION", "JUILLET", "QUATRE", "PÉTARD", "BALLON", "FANFARE", "LIMONADE", "PASTÈQUE", "LIBERTÉ", "AIGLE", "NATION", "FESTIVAL", "ÉTINCELLES", "NUIT", "FAMILLE", "AMIS", "FÊTE"] }, "bastille-day": { "label": "Fête de la Bastille", "emoji": "🇫🇷", "title": "🇫🇷 Fête de la Bastille 🎆", "words": ["PARIS", "BASTILLE", "FEUX D'ARTIFICE", "DÉFILÉ", "DRAPEAU", "JUILLET", "QUATORZE", "CÉLÉBRATION", "CONCERT", "RUE", "DANSE", "NATION", "HISTOIRE", "RÉVOLUTION", "FANFARE", "TOUR", "EIFFEL", "VILLE", "LUMIÈRE", "ÉTÉ", "FESTIVAL", "FRANCE", "PLACE", "TORCHE"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVIÈRE", "SAUCISSE", "BRETZEL", "OCTOBRE", "FESTIVAL", "LEDERHOSEN", "MUNICH", "MUSIQUE", "FANFARE", "TENTE", "CHARCUTERIE", "PAIN", "CÉLÉBRATION", "RÉCOLTE", "DANSE", "CHOPPE", "FOULE", "ALLEMAGNE", "AUTOMNE", "BIÈRE", "ALPIN", "DÉFILÉ", "JARDIN", "FÊTE"] }, "fall": { "label": "Automne", "emoji": "🍂", "title": "🍂 Jours d'automne 🍁", "words": ["GLAND", "AUTOMNE", "CIDRE", "FEUILLES", "JARDIN", "RÉCOLTE", "ÉPOUVANTAIL", "NOVEMBRE", "RÂTEAU", "OCTOBRE", "ÉRABLE", "CITROUILLE", "PULL", "VENTEUX", "COURGE", "BALADE EN FOIN", "FAUCON", "LABYRINTHE DE MAÏS", "TAS DE FEUILLES", "VERGER DE POMMES"] }, "soccer-worldcup": { "label": "Coupe du monde", "emoji": "⚽", "title": "⚽ Coupe du monde 2026 — Les 48 équipes 🏆", "words": ["MEXIQUE", "AFRIQUE DU SUD", "CORÉE DU SUD", "TCHÉQUIE", "CANADA", "BOSNIE-HERZÉGOVINE", "QATAR", "SUISSE", "BRÉSIL", "MAROC", "HAÏTI", "ÉCOSSE", "ÉTATS-UNIS", "PARAGUAY", "AUSTRALIE", "TURQUIE", "ALLEMAGNE", "CURAÇAO", "CÔTE D'IVOIRE", "ÉQUATEUR", "PAYS-BAS", "JAPON", "SUÈDE", "TUNISIE", "BELGIQUE", "ÉGYPTE", "IRAN", "NOUVELLE-ZÉLANDE", "ESPAGNE", "CAP-VERT", "ARABIE SAOUDITE", "URUGUAY", "FRANCE", "SÉNÉGAL", "IRAQ", "NORVÈGE", "ARGENTINE", "ALGÉRIE", "AUTRICHE", "JORDANIE", "PORTUGAL", "RD CONGO", "OUZBÉKISTAN", "COLOMBIE", "ANGLETERRE", "CROATIE", "GHANA", "PANAMA"] }, "soccer-europe": { "label": "Europe", "emoji": "⚽", "title": "⚽ Football européen 🏟️", "words": ["PREMIER LEAGUE", "LIGA", "SERIE A", "BUNDESLIGA", "LIGUE 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN MUNICH", "INTER MILAN", "AC MILAN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO MADRID", "NAPLES", "AJAX"] }, "soccer-mls": { "label": "MLS", "emoji": "⚽", "title": "⚽ Major League Soccer 🥅", "words": ["INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS", "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW", "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI", "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC", "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC"] }, "fete-des-lumieres": { "label": "Fête des Lumières", "emoji": "🕯️", "title": "🕯️ Fête des Lumières — Lyon ✨", "words": ["LYON", "LUMIÈRE", "BOUGIE", "DÉCEMBRE", "FÊTE", "VILLE", "FENÊTRE", "ILLUMINATION", "SPECTACLE", "CONCERT", "RUE", "PONT", "RHÔNE", "SAÔNE", "CROIX ROUSSE", "FOURVIÈRE", "BASILIQUE", "NOTRE DAME", "MARCHÉ", "BONBON", "VIN", "CIEL", "ÉTOILE", "MAGIE"] }, "fete-de-la-musique": { "label": "Fête de la Musique", "emoji": "🎵", "title": "🎵 Fête de la Musique 🎶", "words": ["MUSIQUE", "JUIN", "CONCERT", "SCÈNE", "GUITARE", "PIANO", "VIOLON", "TAMBOUR", "TROMPETTE", "CHANSON", "CHANTEUR", "ORCHESTRE", "PARIS", "RUE", "PLACE", "FESTIVAL", "DANSE", "FÊTE", "AMPLIFICATEUR", "MICRO", "PUBLIC", "SOIRÉE", "ÉTÉ", "RYTHME"] }, "custom": { "label": "Personnalisé", "emoji": "✏️", "title": "", "words": [] } } } }, "pt-BR": { "translation": { "meta": { "name": "Português (Brasil)", "dir": "ltr" }, "ui": { "skipToControls": "Pular para os controles", "brand": "Caça-Palavras <em>Criador</em>", "pageTitle": "Criador de Caça-Palavras — para imprimir", "languageLabel": "Idioma", "controlsTitle": "Monte seu caça-palavras", "puzzleTitleLabel": "Título do caça-palavras", "presetLegend": "Lista de palavras predefinida", "wordsLabel": "Palavras — uma palavra ou frase por linha", "wordsPlaceholder": "PERU\nRECHEIO\nPEREGRINO", "difficultyLegend": "Dificuldade", "allowVertical": "Permitir palavras verticais", "allowDiagonals": "Permitir palavras diagonais", "allowBackwards": "Permitir palavras ao contrário", "allowOverlaps": "Permitir que as palavras compartilhem letras", "fillerLetters": "Letras de preenchimento", "fillRandom": "Letras aleatórias", "fillWordly": "Letras da lista de palavras (mais difícil)", "gridSize": "Tamanho da grade", "gridAuto": "Automático", "generate": "Gerar caça-palavras", "print": "Imprimir", "hint": "Dica: imprima pela caixa de diálogo do navegador — o layout já está ajustado para Carta dos EUA com a lista de palavras abaixo da grade. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> gera de qualquer lugar.", "puzzleTitleDefault": "Caça-Palavras", "findLabel": 'Encontre estas <span id="word-count">{{count}}</span> palavras', "reveal": "Mostrar solução", "hide": "Ocultar solução", "regenerate": "Gerar outro caça-palavras", "answersTitle": "Solução", "answerNote": "As células destacadas e sublinhadas mostram onde cada palavra está escondida.", "gridAria": "Grade do caça-palavras", "answerGridAria": "Grade da solução", "gridSizeAria": "{{label}}, {{rows}} linhas por {{columns}} colunas", "wordLocations": "Localização das palavras: ", "partOfWord": "parte de uma palavra oculta", "row": "linha", "column": "coluna", "reading": "lendo", "alongGrid": "ao longo da grade", "dirRight": "para a direita", "dirLeft": "para a esquerda", "dirDown": "para baixo", "dirUp": "para cima", "dirDownRight": "para baixo à direita", "dirDownLeft": "para baixo à esquerda", "dirUpRight": "para cima à direita", "dirUpLeft": "para cima à esquerda", "errorNoWords": "Adicione pelo menos uma palavra (com 2 ou mais letras) à lista.", "errorNoFit": "Não foi possível caber todas as palavras nesta grade — tente um tamanho maior ou use menos palavras (ou mais curtas).", "announceReady": "Caça-palavras pronto. {{count}} palavras para encontrar em uma grade de {{size}} por {{size}}.", "announceAnswersShown": "Solução exibida. As localizações das palavras estão listadas após a nota acima da grade.", "announceAnswersHidden": "Solução oculta." }, "presets": { "thanksgiving": { "label": "Dia de Ação de Graças", "emoji": "🦃", "title": "🦃 Feliz Dia de Ação de Graças! 🥧", "words": ["PERU", "RECHEIO", "OXICOCCO", "TORTA DE ABÓBORA", "MOLHO", "MAYFLOWER", "FAMÍLIA", "FESTIM", "COLHEITA", "COXA", "MILHO", "BATATA-DOCE", "BOLO", "PÃES", "PÃO", "CASSEROLA", "RECHEADO", "ASSADO", "SOBRAS", "FATIAMENTO", "DESFILE", "FUTEBOL", "MILHO VERDE", "ABÓBORA", "SALMOURA", "REGAR", "MIÚDOS", "DESCONGELAR", "TOALHA DE MESA", "CENTRO DE MESA", "CORNO DA ABUNDÂNCIA", "GLU GLU"] }, "christmas": { "label": "Natal", "emoji": "🎄", "title": "🎄 Feliz Natal! 🎅", "words": ["TRENÓ", "RENA", "BONECO DE NEVE", "VISGO", "LAREIRA", "BENGALA DE DOCE", "PONCHE DE OVO", "PÃO DE GENGIBRE", "GUIRLANDA", "MEIA", "LUZES", "SINOS", "PAPAI NOEL", "ELFO", "ÁRVORE DE NATAL", "CONGELADO", "QUEBRA-NOZES", "FLOCO DE NEVE", "VILANCETES", "FRUTA CRISTALIZADA"] }, "st-patricks": { "label": "São Patrício", "emoji": "☘️", "title": "☘️ Dia de São Patrício 🍀", "words": ["TREVO", "FOLHA", "DESFILE", "VERDE", "DUBLIN", "HARPA", "GAITA", "FESTIVAL", "MARÇO", "IRLANDÊS", "ALFINETES", "BANDA", "RIO", "SORTE", "DOURADO", "APITO", "DANÇA", "CIDADE", "PRIMAVERA", "CARRO ALEGÓRICO", "BOLSO", "CHAPÉU", "MÚSICA", "CELEBRAÇÃO"] }, "easter": { "label": "Páscoa", "emoji": "🐣", "title": "🐣 Caça aos ovos de Páscoa 🐇", "words": ["CHOCOLATE", "CESTA", "COELHO", "OVO", "CAÇADA", "PRIMAVERA", "NARCISO", "CHAPÉU", "DESFILE", "PINTINHO", "MARZIPÃ", "NINHO", "PINTAR", "BRUNCH", "FESTA", "ABRIL", "SOL", "FLOR", "PRADO", "PICNIC", "CROCUS", "LEBRE", "DOCE", "FAMÍLIA"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Noite de Halloween 👻", "words": ["ABÓBORA", "FANTASIA", "DOCE", "FANTASMA", "BRUXA", "ASSOMBRADO", "MÁSCARA", "DOCES OU TRAVESSURAS", "LANTERNA", "ESQUELETO", "MORCEGO", "ARREPIANTE", "CHOCOLATE", "FESTA", "OUTUBRO", "NOITE", "ESCREPIDO", "ESCAVAR", "MILHO DOCE", "DECORAÇÃO", "MONSTRO", "ESPECTRO", "DUENDE", "SOMBRAS"] }, "fourth-of-july": { "label": "4 de julho", "emoji": "🎆", "title": "🎆 4 de julho 🎇", "words": ["FOGOS DE ARTIFÍCIO", "CHURRASCO", "DESFILE", "BANDEIRA", "PICNIC", "BENGALA", "GRELHADO", "CELEBRAÇÃO", "JULHO", "QUATRO", "FOGUETE", "BALÃO", "BANDA", "LIMONADA", "MELANCIA", "LIBERDADE", "ÁGUIA", "NAÇÃO", "FESTIVAL", "FAÍSCAS", "NOITE", "FAMÍLIA", "AMIGOS", "FESTA"] }, "bastille-day": { "label": "Dia da Bastilha", "emoji": "🇫🇷", "title": "🇫🇷 Dia da Bastilha 🎆", "words": ["PARIS", "BASTILHA", "FOGOS DE ARTIFÍCIO", "DESFILE", "BANDEIRA", "JULHO", "QUATORZE", "CELEBRAÇÃO", "CONCERTO", "RUA", "DANÇA", "NAÇÃO", "HISTÓRIA", "REVOLUÇÃO", "BANDA", "TORRE", "EIFFEL", "CIDADE", "LUZES", "VERÃO", "FESTIVAL", "FRANÇA", "PRAÇA", "TOCHA"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVÁRIA", "SALSICHA", "BRETZEL", "OUTUBRO", "FESTIVAL", "LEDERHOSEN", "MUNIQUE", "MÚSICA", "BANDA", "BARRACA", "EMBUTIDO", "PÃO", "CELEBRAÇÃO", "COLHEITA", "DANÇA", "CANECA", "MULTIDÃO", "ALEMANHA", "OUTONO", "CERVEJA", "ALPINO", "DESFILE", "FESTEJO", "JARDIM"] }, "fall": { "label": "Outono", "emoji": "🍂", "title": "🍂 Dias de outono 🍁", "words": ["BOLOTA", "OUTONO", "SIDRA", "FOLHAS", "JARDIM", "COLHEITA", "ESPANTAPÁJAROS", "NOVEMBRO", "ANCINHO", "OUTUBRO", "BORDO", "ABÓBORA", "SUÉTER", "VENTOSO", "ABOBRINHA", "PASSEIO DE CARROÇÃO", "FALCÃO", "LABIRINTO DE MILHO", "MONTANHA DE FOLHAS", "POMAR DE MAÇÃS"] }, "soccer-worldcup": { "label": "Copa do Mundo", "emoji": "⚽", "title": "⚽ Copa do Mundo 2026 — Todos os 48 times 🏆", "words": ["MÉXICO", "ÁFRICA DO SUL", "COREIA DO SUL", "TCHEQUIA", "CANADÁ", "BÓSNIA E HERZEGOVINA", "CATAR", "SUÍÇA", "BRASIL", "MARROCOS", "HAITI", "ESCOCIA", "ESTADOS UNIDOS", "PARAGUAI", "AUSTRÁLIA", "TURQUIA", "ALEMANHA", "CURAÇÃO", "COSTA DO MARFIM", "EQUADOR", "PAÍSES BAIXOS", "JAPÃO", "SUÉCIA", "TUNÍSIA", "BÉLGICA", "EGITO", "IRÃ", "NOVA ZELÂNDIA", "ESPANHA", "CABO VERDE", "ARÁBIA SAUDITA", "URUGUAI", "FRANÇA", "SENEGAL", "IRAQUE", "NORUEGA", "ARGENTINA", "ARGÉLIA", "ÁUSTRIA", "JORDÂNIA", "PORTUGAL", "RD CONGO", "UZBEQUISTÃO", "COLÔMBIA", "INGLATERRA", "CROÁCIA", "GANA", "PANAMÁ"] }, "soccer-europe": { "label": "Europa", "emoji": "⚽", "title": "⚽ Futebol europeu 🏟️", "words": ["PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGA 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN DE MUNIQUE", "INTER DE MILÃO", "AC MILAN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO DE MADRID", "NÁPOLES", "AJAX"] }, "soccer-mls": { "label": "MLS", "emoji": "⚽", "title": "⚽ Major League Soccer 🥅", "words": ["INTER MIAMI", "LAFC", "LA GALAXY", "ATLANTA UNITED", "SEATTLE SOUNDERS", "PORTLAND TIMBERS", "AUSTIN FC", "NASHVILLE SC", "COLUMBUS CREW", "PHILADELPHIA UNION", "NEW YORK RED BULLS", "ORLANDO CITY", "FC CINCINNATI", "SPORTING KC", "MINNESOTA UNITED", "ST LOUIS CITY", "TORONTO FC", "VANCOUVER WHITECAPS", "CHARLOTTE FC", "SAN DIEGO FC"] }, "carnaval": { "label": "Carnaval", "emoji": "🎭", "title": "🎭 Carnaval no Brasil 🎉", "words": ["SAMBA", "ESCOLINHA", "DESFILE", "FANTASIA", "MÁSCARA", "CONFETES", "MÚSICA", "BATERIA", "SURDO", "CAXIAS", "MANGUEIRA", "VILA ISABEL", "SALVADOR", "RECIFE", "PERNAMBUCO", "RIO", "ALEGRIA", "FESTA", "CARRO ALEGÓRICO", "GLITTER", "DANÇA", "REI MOMO", "BLOCO", "TRAVESSURA"] }, "dia-da-independencia": { "label": "Dia da Independência", "emoji": "🇧🇷", "title": "🇧🇷 Dia da Independência 🎆", "words": ["INDEPENDÊNCIA", "BRASIL", "SETEMBRO", "BANDEIRA", "HINO", "PIRIRIM", "SAUDADE", "FESTA", "DESFILE", "FOGOS", "PAI TRAVESSO", "MATE", "CHURRASCO", "SAMBA", "FAVELA", "CRISTO REDENTOR", "PÃO DE AÇÚCAR", "IPANEMA", "COPACABANA", "MARACANÃ", "CAFÉ", "FUTEBOL", "HERÓIS"] }, "valentines": { "label": "Dia dos Namorados", "emoji": "💘", "title": "💘 Feliz Dia dos Namorados! 🌹", "words": ["AMOR", "CORAÇÃO", "ROSA", "BEIJO", "NAMORADO", "CUPIDO", "FLECHA", "MAGNÓLIA", "CINZA", "CHICLE", "GALÃ", "CRAVO", "MARGARIDA", "ORQUÍDEA", "TULIPA", "LÍRIO", "PIRULITO", "CARTA", "PRESENTE", "ENCONTRO", "APAIXONADO", "CARÍCIA", "TERNURA", "VASO"] }, "custom": { "label": "Personalizado", "emoji": "✏️", "title": "", "words": [] } } } }, "pt-PT": { "translation": { "meta": { "name": "Português (Portugal)", "dir": "ltr" }, "ui": { "skipToControls": "Pular para os controles", "brand": "Caça-Palavras <em>Criador</em>", "pageTitle": "Criador de Caça-Palavras — para imprimir", "languageLabel": "Idioma", "controlsTitle": "Monte seu caça-palavras", "puzzleTitleLabel": "Título do caça-palavras", "presetLegend": "Lista de palavras predefinida", "wordsLabel": "Palavras — uma palavra ou frase por linha", "wordsPlaceholder": "PERU\nRECHEIO\nPEREGRINO", "difficultyLegend": "Dificuldade", "allowVertical": "Permitir palavras verticais", "allowDiagonals": "Permitir palavras diagonais", "allowBackwards": "Permitir palavras ao contrário", "allowOverlaps": "Permitir que as palavras compartilhem letras", "fillerLetters": "Letras de preenchimento", "fillRandom": "Letras aleatórias", "fillWordly": "Letras da lista de palavras (mais difícil)", "gridSize": "Tamanho da grelha", "gridAuto": "Automático", "generate": "Gerar caça-palavras", "print": "Imprimir", "hint": "Dica: imprima pela caixa de diálogo do navegador — a paginação já está ajustada para A4 com a lista de palavras abaixo da grelha. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> gera a partir de qualquer lugar.", "puzzleTitleDefault": "Caça-Palavras", "findLabel": 'Encontre estas <span id="word-count">{{count}}</span> palavras', "reveal": "Mostrar solução", "hide": "Ocultar solução", "regenerate": "Gerar outro caça-palavras", "answersTitle": "Solução", "answerNote": "As células destacadas e sublinhadas mostram onde cada palavra está escondida.", "gridAria": "Grade do caça-palavras", "answerGridAria": "Grade da solução", "gridSizeAria": "{{label}}, {{rows}} linhas por {{columns}} colunas", "wordLocations": "Localização das palavras: ", "partOfWord": "parte de uma palavra oculta", "row": "linha", "column": "coluna", "reading": "lendo", "alongGrid": "ao longo da grelha", "dirRight": "para a direita", "dirLeft": "para a esquerda", "dirDown": "para baixo", "dirUp": "para cima", "dirDownRight": "para baixo à direita", "dirDownLeft": "para baixo à esquerda", "dirUpRight": "para cima à direita", "dirUpLeft": "para cima à esquerda", "errorNoWords": "Adicione pelo menos uma palavra (com 2 ou mais letras) à lista.", "errorNoFit": "Não foi possível caber todas as palavras nesta grelha — tente um tamanho maior ou use menos palavras (ou mais curtas).", "announceReady": "Caça-palavras pronto. {{count}} palavras para encontrar em uma grelha de {{size}} por {{size}}.", "announceAnswersShown": "Solução exibida. As localizações das palavras estão listadas após a nota acima da grelha.", "announceAnswersHidden": "Solução oculta." }, "presets": { "thanksgiving": { "label": "Dia de Ação de Graças", "emoji": "🦃", "title": "🦃 Feliz Dia de Ação de Graças! 🥧", "words": ["PERU", "RECHEIO", "OXICOCCO", "TORTA DE ABÓBORA", "MOLHO", "MAYFLOWER", "FAMÍLIA", "FESTIM", "COLHEITA", "COXA", "MILHO", "BATATA-DOCE", "BOLO", "PÃES", "PÃO", "CASSEROLA", "RECHEADO", "ASSADO", "SOBRAS", "FATIAMENTO", "DESFILE", "FUTEBOL", "MILHO VERDE", "ABÓBORA", "SALMOURA", "REGAR", "MIÚDOS", "DESCONGELAR", "TOALHA DE MESA", "CENTRO DE MESA", "CORNO DA ABUNDÂNCIA", "GLU GLU"] }, "christmas": { "label": "Natal", "emoji": "🎄", "title": "🎄 Feliz Natal! 🎅", "words": ["TRENÓ", "RENA", "BONECO DE NEVE", "VISGO", "LAREIRA", "BENGALA DE DOCE", "PONCHE DE OVO", "PÃO DE GENGIBRE", "GUIRLANDA", "MEIA", "LUZES", "SINOS", "PAPAI NOEL", "ELFO", "ÁRVORE DE NATAL", "CONGELADO", "QUEBRA-NOZES", "FLOCO DE NEVE", "VILANCETES", "FRUTA CRISTALIZADA"] }, "st-patricks": { "label": "São Patrício", "emoji": "☘️", "title": "☘️ Dia de São Patrício 🍀", "words": ["TREVO", "FOLHA", "DESFILE", "VERDE", "DUBLIN", "HARPA", "GAITA", "FESTIVAL", "MARÇO", "IRLANDÊS", "ALFINETES", "BANDA", "RIO", "SORTE", "DOURADO", "APITO", "DANÇA", "CIDADE", "PRIMAVERA", "CARRO ALEGÓRICO", "BOLSO", "CHAPÉU", "MÚSICA", "CELEBRAÇÃO"] }, "easter": { "label": "Páscoa", "emoji": "🐣", "title": "🐣 Caça aos ovos de Páscoa 🐇", "words": ["CHOCOLATE", "CESTA", "COELHO", "OVO", "CAÇADA", "PRIMAVERA", "NARCISO", "CHAPÉU", "DESFILE", "PINTINHO", "MARZIPÃ", "NINHO", "PINTAR", "BRUNCH", "FESTA", "ABRIL", "SOL", "FLOR", "PRADO", "PICNIC", "CROCUS", "LEBRE", "DOCE", "FAMÍLIA"] }, "halloween": { "label": "Halloween", "emoji": "🎃", "title": "🎃 Noite de Halloween 👻", "words": ["ABÓBORA", "FANTASIA", "DOCE", "FANTASMA", "BRUXA", "ASSOMBRADO", "MÁSCARA", "DOCES OU TRAVESSURAS", "LANTERNA", "ESQUELETO", "MORCEGO", "ARREPIANTE", "CHOCOLATE", "FESTA", "OUTUBRO", "NOITE", "ESCREPIDO", "ESCAVAR", "MILHO DOCE", "DECORAÇÃO", "MONSTRO", "ESPECTRO", "DUENDE", "SOMBRAS"] }, "fourth-of-july": { "label": "4 de julho", "emoji": "🎆", "title": "🎆 4 de julho 🎇", "words": ["FOGOS DE ARTIFÍCIO", "CHURRASCO", "DESFILE", "BANDEIRA", "PICNIC", "BENGALA", "GRELHADO", "CELEBRAÇÃO", "JULHO", "QUATRO", "FOGUETE", "BALÃO", "BANDA", "LIMONADA", "MELANCIA", "LIBERDADE", "ÁGUIA", "NAÇÃO", "FESTIVAL", "FAÍSCAS", "NOITE", "FAMÍLIA", "AMIGOS", "FESTA"] }, "bastille-day": { "label": "Dia da Bastilha", "emoji": "🇫🇷", "title": "🇫🇷 Dia da Bastilha 🎆", "words": ["PARIS", "BASTILHA", "FOGOS DE ARTIFÍCIO", "DESFILE", "BANDEIRA", "JULHO", "QUATORZE", "CELEBRAÇÃO", "CONCERTO", "RUA", "DANÇA", "NAÇÃO", "HISTÓRIA", "REVOLUÇÃO", "BANDA", "TORRE", "EIFFEL", "CIDADE", "LUZES", "VERÃO", "FESTIVAL", "FRANÇA", "PRAÇA", "TOCHA"] }, "oktoberfest": { "label": "Oktoberfest", "emoji": "🥨", "title": "🥨 Oktoberfest 🍺", "words": ["BAVÁRIA", "SALSICHA", "BRETZEL", "OUTUBRO", "FESTIVAL", "LEDERHOSEN", "MUNIQUE", "MÚSICA", "BANDA", "BARRACA", "EMBUTIDO", "PÃO", "CELEBRAÇÃO", "COLHEITA", "DANÇA", "CANECA", "MULTIDÃO", "ALEMANHA", "OUTONO", "CERVEJA", "ALPINO", "DESFILE", "FESTEJO", "JARDIM"] }, "fall": { "label": "Outono", "emoji": "🍂", "title": "🍂 Dias de outono 🍁", "words": ["BOLOTA", "OUTONO", "SIDRA", "FOLHAS", "JARDIM", "COLHEITA", "ESPANTAPÁJAROS", "NOVEMBRO", "ANCINHO", "OUTUBRO", "BORDO", "ABÓBORA", "SUÉTER", "VENTOSO", "ABOBRINHA", "PASSEIO DE CARROÇÃO", "FALCÃO", "LABIRINTO DE MILHO", "MONTANHA DE FOLHAS", "POMAR DE MAÇÃS"] }, "soccer-worldcup": { "label": "Copa do Mundo", "emoji": "⚽", "title": "⚽ Copa do Mundo 2026 — Todos os 48 times 🏆", "words": ["MÉXICO", "ÁFRICA DO SUL", "COREIA DO SUL", "TCHEQUIA", "CANADÁ", "BÓSNIA E HERZEGOVINA", "CATAR", "SUÍÇA", "BRASIL", "MARROCOS", "HAITI", "ESCOCIA", "ESTADOS UNIDOS", "PARAGUAI", "AUSTRÁLIA", "TURQUIA", "ALEMANHA", "CURAÇÃO", "COSTA DO MARFIM", "EQUADOR", "PAÍSES BAIXOS", "JAPÃO", "SUÉCIA", "TUNÍSIA", "BÉLGICA", "EGITO", "IRÃ", "NOVA ZELÂNDIA", "ESPANHA", "CABO VERDE", "ARÁBIA SAUDITA", "URUGUAI", "FRANÇA", "SENEGAL", "IRAQUE", "NORUEGA", "ARGENTINA", "ARGÉLIA", "ÁUSTRIA", "JORDÂNIA", "PORTUGAL", "RD CONGO", "UZBEQUISTÃO", "COLÔMBIA", "INGLATERRA", "CROÁCIA", "GANA", "PANAMÁ"] }, "soccer-europe": { "label": "Europa", "emoji": "⚽", "title": "⚽ Futebol europeu 🏟️", "words": ["PREMIER LEAGUE", "LA LIGA", "SERIE A", "BUNDESLIGA", "LIGA 1", "ARSENAL", "LIVERPOOL", "REAL MADRID", "BARCELONA", "BAYERN DE MUNIQUE", "INTER DE MILÃO", "AC MILAN", "PSG", "JUVENTUS", "MANCHESTER CITY", "TOTTENHAM", "CHELSEA", "ATLÉTICO DE MADRID", "NÁPOLES", "AJAX"] }, "soccer-mls": { "label": "Liga Portugal", "emoji": "⚽", "title": "⚽ Liga Portugal Betclic 🏟️", "words": ["BENFICA", "PORTO", "SPORTING", "BRAGA", "VITORIA GUIMARAES", "BOAVISTA", "BELENENSES", "RIO AVE", "AVES", "MARITIMO", "PORTIMONENSE", "FEIRENSE", "FAMALICAO", "GIL VICENTE", "TONDACO", "SANTA CLARA", "MOREIRENSE", "CHAVES", "VIZELA", "ESTORIL"] }, "carnaval": { "label": "Carnaval", "emoji": "🎭", "title": "🎭 Carnaval de Viana do Castelo 🎉", "words": ["CARNAVAL", "FANTASIA", "MASCARA", "DESFILE", "CORSO", "CONFETES", "MUSICA", "DANCA", "FESTA", "CARROCA", "REI", "RAINHA", "VIA LANA", "IRMANDINHO", "BRANCO", "AZUL", "CABRAL", "GAITO", "CHIRIMIA", "BOMBO", "VIANA", "RIBEIRA", "ALEGRIA", "TRAVESSURA"] }, "dia-da-independencia": { "label": "Dia da Independência", "emoji": "🇧🇷", "title": "🇧🇷 Dia da Independência 🎆", "words": ["INDEPENDENCIA", "BRASIL", "SETEMBRO", "BANDEIRA", "HINO", "PIRIRIM", "SAUDADE", "FESTA", "DESFILE", "FOGOS", "PAI TRAVESSO", "MATE", "CHURRASCO", "SAMBA", "FAVELA", "CRISTO REDENTOR", "PÃO DE AÇÚCAR", "IPANEMA", "COPACABANA", "MARACANÃ", "CAFE", "FUTEBOL", "HEROIS"] }, "dia-de-portugal": { "label": "Dia de Portugal", "emoji": "🇵🇹", "title": "🇵🇹 Dia de Portugal, de Camões e das Comunidades 🍇", "words": ["PORTUGAL", "CAMOES", "DEZEMBRO", "BANDEIRA", "HINO", "LUSIADAS", "SAUDADE", "TAVARES", "FESTA", "DESFILE", "CONCERTO", "FOGOS", "LISBOA", "PORTO", "BRAGA", "COIMBRA", "FADO", "SAUDADE", "VINHO", "AZULEJO", "CALDEIRADA", "BOLHO", "GALO", "COMUNIDADES"] }, "santo-antonio": { "label": "Santo António", "emoji": "🎶", "title": "🎶 Santo António — Lisboa 🍻", "words": ["SANTO ANTONIO", "LISBOA", "JUNHO", "SARDINHAS", "MANJERICÃO", "AMARÉ", "BANDA", "MARCHA", "FESTA", "BARBEARIA", "NOIVO", "NOIVA", "CASAMENTO", "VINHO", "BEIJOS", "FOGOS", "ARRAIAL", "CONFETES", "ALFAMA", "GRAÇA", "TRAVESSURA", "DANÇA", "MÚSICA", "ALEGRIA"] }, "sao-joao": { "label": "São João", "emoji": "🔥", "title": "🔥 São João — Porto 🎆", "words": ["SAO JOAO", "PORTO", "JUNHO", "FOGUEIRA", "FOGOS", "SARDINHAS", "MANJERICÃO", "MARTELOS", "BANDA", "RIBEIRA", "DOURO", "PONTE", "D. LUIS", "ALEGRIA", "DANÇA", "MÚSICA", "VINHO", "CALDEIRADA", "BARCOS", "NOITE", "FESTA", "CONFETES", "FOGUEIRA", "VERÃO"] }, "custom": { "label": "Personalizado", "emoji": "✏️", "title": "", "words": [] } } } } };

  // src/app.js
  var $ = (id) => document.getElementById(id);
  var els = {
    language: $("language"),
    title: $("title"),
    presetChips: $("preset-chips"),
    words: $("words"),
    error: $("error"),
    vertical: $("vertical"),
    diagonals: $("diagonals"),
    backwards: $("backwards"),
    overlaps: $("overlaps"),
    fillStyle: $("fill-style"),
    gridSize: $("grid-size"),
    generate: $("generate"),
    print: $("print"),
    reveal: $("reveal"),
    regenerate: $("regenerate"),
    puzzle: $("puzzle"),
    answers: $("answers"),
    puzzleTitle: $("puzzle-title"),
    grid: $("grid"),
    answerGrid: $("answer-grid"),
    wordbox: $("wordbox"),
    wordList: $("word-list"),
    findLabel: $("find-label"),
    status: $("status"),
    answerSummary: $("answer-summary")
  };
  var t2 = (key, options) => instance.t(key, options);
  var SHARED_PRESET_KEYS = [
    "thanksgiving",
    "christmas",
    "st-patricks",
    "easter",
    "halloween",
    "fourth-of-july",
    "bastille-day",
    "oktoberfest",
    "fall",
    "soccer-worldcup",
    "soccer-europe",
    "soccer-mls"
  ];
  function presetKeysFor(lng = instance.language) {
    const own = Object.keys((locales_default[lng] || locales_default.en).translation.presets || {}).filter((key) => key !== "custom" && !SHARED_PRESET_KEYS.includes(key));
    return [...SHARED_PRESET_KEYS, ...own, "custom"];
  }
  function localizedPresets() {
    const fallback = locales_default.en.translation.presets || {};
    const active = (locales_default[instance.language] || locales_default.en).translation.presets || {};
    const merged = {};
    for (const key of presetKeysFor()) {
      merged[key] = { ...fallback[key] || {}, ...active[key] || {} };
    }
    return merged;
  }
  var currentPreset = "custom";
  function renderPresetChips() {
    const presets = localizedPresets();
    els.presetChips.textContent = "";
    for (const key of presetKeysFor()) {
      const preset = presets[key];
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "preset-chip";
      chip.dataset.chipTheme = key;
      chip.dataset.preset = key;
      chip.textContent = [preset.emoji, preset.label].filter(Boolean).join(" ");
      chip.setAttribute("aria-pressed", String(key === currentPreset));
      chip.addEventListener("click", () => {
        if (key === currentPreset) {
          generate();
        } else {
          setPreset(key, { applyWords: true, regenerate: true });
        }
      });
      els.presetChips.appendChild(chip);
    }
  }
  function setPreset(name, { applyWords = false, regenerate = false } = {}) {
    const preset = localizedPresets()[name];
    if (!preset) return;
    currentPreset = name;
    document.documentElement.dataset.theme = name;
    for (const chip of els.presetChips.children) {
      chip.setAttribute("aria-pressed", String(chip.dataset.preset === name));
    }
    if (applyWords && preset.words && preset.words.length) {
      els.title.value = preset.title || "";
      els.words.value = preset.words.join("\n");
      clearError();
      resizeWords();
    }
    if (regenerate) generate();
  }
  function nthWeekday(year, month, weekday, n) {
    const first = new Date(year, month, 1);
    return new Date(year, month, 1 + (weekday - first.getDay() + 7) % 7 + (n - 1) * 7);
  }
  function easterSunday(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    return new Date(year, month - 1, (h + l - 7 * m + 114) % 31 + 1);
  }
  function shiftDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }
  function lastWeekday(year, month, weekday) {
    const last = new Date(year, month + 1, 0);
    return new Date(year, month, last.getDate() - (last.getDay() - weekday + 7) % 7);
  }
  var HOLIDAY_DATES = {
    thanksgiving: (y) => nthWeekday(y, 10, 4, 4),
    // 4th Thursday of November
    christmas: (y) => new Date(y, 11, 25),
    "st-patricks": (y) => new Date(y, 2, 17),
    easter: easterSunday,
    halloween: (y) => new Date(y, 9, 31),
    "fourth-of-july": (y) => new Date(y, 6, 4),
    "bastille-day": (y) => new Date(y, 6, 14),
    oktoberfest: (y) => new Date(y, 8, 20),
    // late-September opening
    // Locale-specific holidays; only considered when that language is active.
    valentines: (y) => new Date(y, 1, 14),
    "cinco-de-mayo": (y) => new Date(y, 4, 5),
    "day-of-the-dead": (y) => new Date(y, 10, 2),
    carnaval: (y) => shiftDays(easterSunday(y), -49),
    "three-kings": (y) => new Date(y, 0, 6),
    "semana-santa": (y) => shiftDays(easterSunday(y), -7),
    "san-fermin": (y) => new Date(y, 6, 7),
    tomatina: (y) => lastWeekday(y, 7, 3),
    // last Wednesday of August
    "dia-da-independencia": (y) => new Date(y, 8, 7),
    "dia-de-portugal": (y) => new Date(y, 5, 10),
    "santo-antonio": (y) => new Date(y, 5, 13),
    "sao-joao": (y) => new Date(y, 5, 24),
    "fete-des-lumieres": (y) => new Date(y, 11, 8),
    "fete-de-la-musique": (y) => new Date(y, 5, 21),
    "tag-der-deutschen-einheit": (y) => new Date(y, 9, 3),
    karneval: (y) => shiftDays(easterSunday(y), -49)
  };
  function closestHolidayPreset(today = /* @__PURE__ */ new Date()) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const active = new Set(presetKeysFor().filter((key) => key !== "custom"));
    let best = null, bestDiff = Infinity;
    for (const [key, dateFor] of Object.entries(HOLIDAY_DATES)) {
      if (!active.has(key)) continue;
      for (const year of [start.getFullYear(), start.getFullYear() + 1]) {
        const days = Math.round((dateFor(year) - start) / 864e5);
        if (days >= -3 && days < bestDiff) {
          bestDiff = days;
          best = key;
        }
      }
    }
    return best;
  }
  function seedFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("theme") || params.get("preset");
    if (requested && presetKeysFor().includes(requested)) {
      setPreset(requested, { applyWords: true });
      return;
    }
    setPreset(closestHolidayPreset() || "thanksgiving", { applyWords: true });
  }
  var STORAGE_KEY = "wordSearchLanguage";
  function storedLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
  function rememberLanguage(lng) {
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch {
    }
  }
  function syncLanguageToUrl(lng) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lng);
      window.history.replaceState(null, "", url.href);
    } catch {
    }
  }
  function availableLanguages() {
    return Object.keys(locales_default).sort((a, b) => {
      if (a === "en") return -1;
      if (b === "en") return 1;
      return a.localeCompare(b);
    });
  }
  function resolveLanguageCode(code) {
    if (!code) return null;
    if (locales_default[code]) return code;
    const base = code.split("-")[0];
    return availableLanguages().find((candidate) => candidate.split("-")[0] === base) || null;
  }
  function detectInitialLanguage() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const fromUrlResolved = resolveLanguageCode(fromUrl);
    if (fromUrlResolved) return fromUrlResolved;
    const saved = resolveLanguageCode(storedLanguage());
    if (saved) return saved;
    for (const candidate of navigator.languages || [navigator.language]) {
      const resolved = resolveLanguageCode(candidate);
      if (resolved) return resolved;
    }
    return "en";
  }
  function renderLanguageOptions() {
    els.language.textContent = "";
    for (const code of availableLanguages()) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = (locales_default[code].translation.meta || {}).name || code;
      els.language.appendChild(option);
    }
  }
  var lastWordCount = 0;
  function applyTranslations() {
    document.documentElement.lang = instance.language;
    document.documentElement.dir = t2("meta.dir") === "rtl" ? "rtl" : "ltr";
    document.title = t2("ui.pageTitle");
    for (const node of document.querySelectorAll("[data-i18n]")) {
      node.textContent = t2(node.dataset.i18n);
    }
    for (const node of document.querySelectorAll("[data-i18n-html]")) {
      const key = node.dataset.i18nHtml;
      node.innerHTML = key === "ui.findLabel" ? t2(key, { count: lastWordCount }) : t2(key);
    }
    for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
      node.placeholder = t2(node.dataset.i18nPlaceholder);
    }
    for (const node of document.querySelectorAll("[data-i18n-aria]")) {
      node.setAttribute("aria-label", t2(node.dataset.i18nAria));
    }
    els.language.value = instance.language;
    renderPresetChips();
  }
  async function changeLanguage2(lng) {
    if (!locales_default[lng] || lng === instance.language) return;
    await instance.changeLanguage(lng);
    rememberLanguage(lng);
    syncLanguageToUrl(lng);
    applyTranslations();
    if (currentPreset !== "custom") {
      if (!presetKeysFor().includes(currentPreset)) {
        currentPreset = closestHolidayPreset() || "thanksgiving";
      }
      setPreset(currentPreset, { applyWords: true });
    }
    generate();
  }
  var grid = [];
  var placements = [];
  var normalized = [];
  var answerShown = false;
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var DIRECTION_KEYS = {
    "0,1": "ui.dirRight",
    "0,-1": "ui.dirLeft",
    "1,0": "ui.dirDown",
    "-1,0": "ui.dirUp",
    "1,1": "ui.dirDownRight",
    "1,-1": "ui.dirDownLeft",
    "-1,1": "ui.dirUpRight",
    "-1,-1": "ui.dirUpLeft"
  };
  function announce(message) {
    els.status.textContent = "";
    window.setTimeout(() => {
      els.status.textContent = message;
    }, 30);
  }
  function showError(message) {
    els.error.textContent = message;
    els.error.hidden = false;
  }
  function clearError() {
    els.error.hidden = true;
    els.error.textContent = "";
  }
  function resizeWords() {
    els.words.style.height = "auto";
    els.words.style.height = Math.min(els.words.scrollHeight, 420) + "px";
  }
  function cleanWords(raw) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const line of raw.split("\n")) {
      const word = line.toUpperCase().replace(/[^\p{L} .'\-]/gu, "").trim().replace(/\s+/g, " ");
      const key = word.replace(/[^\p{L}]/gu, "");
      if ([...key].length >= 2 && !seen.has(key)) {
        seen.add(key);
        out.push({ display: word, letters: key });
      }
    }
    return out;
  }
  function buildDirections(opts) {
    const dirs = [];
    dirs.push([0, 1]);
    if (opts.vertical) dirs.push([1, 0]);
    if (opts.diagonals) dirs.push([1, 1]);
    if (opts.backwards) {
      dirs.push([0, -1]);
      if (opts.vertical) dirs.push([-1, 0]);
      if (opts.diagonals) {
        dirs.push([1, -1]);
        dirs.push([-1, 1]);
        dirs.push([-1, -1]);
      }
    }
    return dirs;
  }
  function fits(word, row, col, dr, dc, size, allowOverlap) {
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size) return null;
      const existing = grid[r][c];
      if (existing && (!allowOverlap || existing !== word[i])) return null;
      cells.push([r, c]);
    }
    return cells;
  }
  function attemptPlace(words, size, opts) {
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placements = [];
    const dirs = buildDirections(opts);
    const sorted = [...words].sort((a, b) => b.letters.length - a.letters.length);
    for (const w of sorted) {
      let placed = false;
      for (let attempt = 0; attempt < 400 && !placed; attempt++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const cells = fits(w.letters, row, col, dr, dc, size, opts.overlaps);
        if (cells) {
          for (let i = 0; i < w.letters.length; i++) grid[cells[i][0]][cells[i][1]] = w.letters[i];
          placements.push({ word: w, row, col, dr, dc });
          placed = true;
        }
      }
      if (!placed) return null;
    }
    return true;
  }
  function fillerPool(words) {
    const pool = new Set(LETTERS);
    for (const w of words) for (const ch of w.letters) pool.add(ch);
    return [...pool];
  }
  function fillBlanks(size, words) {
    const pool = fillerPool(words);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) continue;
        if (els.fillStyle.value === "wordly" && words.length) {
          const w = words[Math.floor(Math.random() * words.length)].letters;
          grid[r][c] = w[Math.floor(Math.random() * w.length)];
        } else {
          grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }
  }
  function pickSize(words, opts) {
    const chosen = els.gridSize.value;
    if (chosen !== "auto") return parseInt(chosen, 10);
    const longest = Math.max(...words.map((w) => w.letters.length));
    const totalLetters = words.reduce((n, w) => n + w.letters.length, 0);
    let size = Math.ceil(Math.sqrt(totalLetters * 2.2));
    size = Math.max(size, longest + 1, 8);
    size = Math.min(size, 24);
    return Math.max(size, Math.min(24, Math.ceil((size + longest) / 2)));
  }
  function fitWordList(count) {
    const cols = count >= 56 ? 6 : count >= 36 ? 5 : 4;
    const rows = Math.ceil(count / cols);
    document.documentElement.style.setProperty("--print-grid", count >= 28 ? "6.9in" : "7.5in");
    const printPt = Math.max(6, Math.min(9.5, 108 / (rows * 1.2)));
    const screenRem = Math.max(0.78, Math.min(1, 1 - Math.max(0, count - 20) * 0.012));
    els.wordbox.style.setProperty("--word-cols", cols);
    els.wordbox.style.setProperty("--word-font-print", printPt.toFixed(2) + "pt");
    els.wordbox.style.setProperty("--word-font-screen", screenRem.toFixed(3) + "rem");
  }
  function renderGrid(container, letters, size, label) {
    container.style.setProperty("--cols", size);
    container.setAttribute("aria-label", t2("ui.gridSizeAria", { label, rows: size, columns: size }));
    container.textContent = "";
    const body = document.createElement("tbody");
    for (let r = 0; r < size; r++) {
      const row = document.createElement("tr");
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("td");
        cell.className = "cell";
        cell.textContent = letters[r][c];
        cell.dataset.r = r;
        cell.dataset.c = c;
        row.appendChild(cell);
      }
      body.appendChild(row);
    }
    container.appendChild(body);
  }
  function renderAnswerKey(size) {
    renderGrid(els.answerGrid, grid, size, t2("ui.answerGridAria"));
    const marked = /* @__PURE__ */ new Set();
    for (const p of placements) {
      for (let i = 0; i < p.word.letters.length; i++) {
        marked.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
      }
    }
    for (const cell of els.answerGrid.querySelectorAll("td.cell")) {
      if (!marked.has(`${cell.dataset.r},${cell.dataset.c}`)) continue;
      cell.classList.add("marked");
      cell.setAttribute("aria-label", [
        cell.textContent,
        `${t2("ui.row")} ${Number(cell.dataset.r) + 1}`,
        `${t2("ui.column")} ${Number(cell.dataset.c) + 1}`,
        t2("ui.partOfWord")
      ].join(", "));
    }
    els.answerSummary.textContent = t2("ui.wordLocations") + placements.map((p) => `${p.word.display}: ${t2("ui.row")} ${p.row + 1}, ${t2("ui.column")} ${p.col + 1}, ${t2("ui.reading")} ${t2(DIRECTION_KEYS[`${p.dr},${p.dc}`] || "ui.alongGrid")}`).join(". ") + ".";
  }
  function renderWordList() {
    els.wordList.textContent = "";
    for (const w of normalized) {
      const li = document.createElement("li");
      li.textContent = w.display;
      els.wordList.appendChild(li);
    }
    lastWordCount = normalized.length;
    const counter = $("word-count");
    if (counter) counter.textContent = lastWordCount;
    fitWordList(lastWordCount);
  }
  function generate(options = {}) {
    const doAnnounce = options.announce !== false;
    const words = cleanWords(els.words.value);
    if (!words.length) {
      showError(t2("ui.errorNoWords"));
      return;
    }
    const opts = {
      vertical: els.vertical.checked,
      diagonals: els.diagonals.checked,
      backwards: els.backwards.checked,
      overlaps: els.overlaps.checked
    };
    const size = pickSize(words, opts);
    let ok = null;
    for (let attempt = 0; attempt < 30 && !ok; attempt++) ok = attemptPlace(words, size, opts);
    if (!ok) {
      showError(t2("ui.errorNoFit"));
      return;
    }
    fillBlanks(size, words);
    normalized = words;
    clearError();
    els.puzzleTitle.textContent = els.title.value.trim() || t2("ui.puzzleTitleDefault");
    renderGrid(els.grid, grid, size, t2("ui.gridAria"));
    renderWordList();
    els.puzzle.classList.remove("hidden");
    answerShown = false;
    els.answers.classList.add("hidden");
    els.reveal.textContent = t2("ui.reveal");
    if (doAnnounce) announce(t2("ui.announceReady", { count: normalized.length, size }));
  }
  function toggleAnswerKey() {
    answerShown = !answerShown;
    if (answerShown) renderAnswerKey(grid.length);
    els.answers.classList.toggle("hidden", !answerShown);
    els.reveal.textContent = answerShown ? t2("ui.hide") : t2("ui.reveal");
    announce(answerShown ? t2("ui.announceAnswersShown") : t2("ui.announceAnswersHidden"));
  }
  els.generate.addEventListener("click", generate);
  els.regenerate.addEventListener("click", generate);
  els.reveal.addEventListener("click", toggleAnswerKey);
  els.language.addEventListener("change", (event) => {
    changeLanguage2(event.target.value);
  });
  els.print.addEventListener("click", () => {
    if (els.puzzle.classList.contains("hidden")) generate();
    window.print();
  });
  els.words.addEventListener("input", () => {
    if (currentPreset !== "custom") setPreset("custom");
    resizeWords();
    clearError();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generate();
  });
  instance.init({
    resources: locales_default,
    lng: detectInitialLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    // translations are local, trusted markup
    returnEmptyString: false
  });
  syncLanguageToUrl(instance.language);
  renderLanguageOptions();
  applyTranslations();
  seedFromUrl();
  resizeWords();
  generate({ announce: false });
})();
