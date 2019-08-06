/**
 * @license
 * Video.js 7.5.5 <http://videojs.com/>
 * Copyright Brightcove, Inc. <https://www.brightcove.com/>
 * Available under Apache License Version 2.0
 * <https://github.com/videojs/video.js/blob/master/LICENSE>
 *
 * Includes vtt.js <https://github.com/mozilla/vtt.js>
 * Available under Apache License Version 2.0
 * <https://github.com/mozilla/vtt.js/blob/master/LICENSE>
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('global/window'), require('global/document')) :
  typeof define === 'function' && define.amd ? define(['global/window', 'global/document'], factory) :
  (global = global || self, global.videojs = factory(global.window, global.document));
}(this, function (window$1, document) {
  window$1 = window$1 && window$1.hasOwnProperty('default') ? window$1['default'] : window$1;
  document = document && document.hasOwnProperty('default') ? document['default'] : document;

  var version = "7.5.5";

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _taggedTemplateLiteralLoose(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    strings.raw = raw;
    return strings;
  }

  /**
   * @file create-logger.js
   * @module create-logger
   */

  var history = [];
  /**
   * Log messages to the console and history based on the type of message
   *
   * @private
   * @param  {string} type
   *         The name of the console method to use.
   *
   * @param  {Array} args
   *         The arguments to be passed to the matching console method.
   */

  var LogByTypeFactory = function LogByTypeFactory(name, log) {
    return function (type, level, args) {
      var lvl = log.levels[level];
      var lvlRegExp = new RegExp("^(" + lvl + ")$");

      if (type !== 'log') {
        // Add the type to the front of the message when it's not "log".
        args.unshift(type.toUpperCase() + ':');
      } // Add console prefix after adding to history.


      args.unshift(name + ':'); // Add a clone of the args at this point to history.

      if (history) {
        history.push([].concat(args));
      } // If there's no console then don't try to output messages, but they will
      // still be stored in history.


      if (!window$1.console) {
        return;
      } // Was setting these once outside of this function, but containing them
      // in the function makes it easier to test cases where console doesn't exist
      // when the module is executed.


      var fn = window$1.console[type];

      if (!fn && type === 'debug') {
        // Certain browsers don't have support for console.debug. For those, we
        // should default to the closest comparable log.
        fn = window$1.console.info || window$1.console.log;
      } // Bail out if there's no console or if this type is not allowed by the
      // current logging level.


      if (!fn || !lvl || !lvlRegExp.test(type)) {
        return;
      }

      fn[Array.isArray(args) ? 'apply' : 'call'](window$1.console, args);
    };
  };

  function createLogger(name) {
    // This is the private tracking variable for logging level.
    var level = 'info'; // the curried logByType bound to the specific log and history

    var logByType;
    /**
     * Logs plain debug messages. Similar to `console.log`.
     *
     * Due to [limitations](https://github.com/jsdoc3/jsdoc/issues/955#issuecomment-313829149)
     * of our JSDoc template, we cannot properly document this as both a function
     * and a namespace, so its function signature is documented here.
     *
     * #### Arguments
     * ##### *args
     * Mixed[]
     *
     * Any combination of values that could be passed to `console.log()`.
     *
     * #### Return Value
     *
     * `undefined`
     *
     * @namespace
     * @param    {Mixed[]} args
     *           One or more messages or objects that should be logged.
     */

    var log = function log() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logByType('log', level, args);
    }; // This is the logByType helper that the logging methods below use


    logByType = LogByTypeFactory(name, log);
    /**
     * Create a new sublogger which chains the old name to the new name.
     *
     * For example, doing `videojs.log.createLogger('player')` and then using that logger will log the following:
     * ```js
     *  mylogger('foo');
     *  // > VIDEOJS: player: foo
     * ```
     *
     * @param {string} name
     *        The name to add call the new logger
     * @return {Object}
     */

    log.createLogger = function (subname) {
      return createLogger(name + ': ' + subname);
    };
    /**
     * Enumeration of available logging levels, where the keys are the level names
     * and the values are `|`-separated strings containing logging methods allowed
     * in that logging level. These strings are used to create a regular expression
     * matching the function name being called.
     *
     * Levels provided by Video.js are:
     *
     * - `off`: Matches no calls. Any value that can be cast to `false` will have
     *   this effect. The most restrictive.
     * - `all`: Matches only Video.js-provided functions (`debug`, `log`,
     *   `log.warn`, and `log.error`).
     * - `debug`: Matches `log.debug`, `log`, `log.warn`, and `log.error` calls.
     * - `info` (default): Matches `log`, `log.warn`, and `log.error` calls.
     * - `warn`: Matches `log.warn` and `log.error` calls.
     * - `error`: Matches only `log.error` calls.
     *
     * @type {Object}
     */


    log.levels = {
      all: 'debug|log|warn|error',
      off: '',
      debug: 'debug|log|warn|error',
      info: 'log|warn|error',
      warn: 'warn|error',
      error: 'error',
      DEFAULT: level
    };
    /**
     * Get or set the current logging level.
     *
     * If a string matching a key from {@link module:log.levels} is provided, acts
     * as a setter.
     *
     * @param  {string} [lvl]
     *         Pass a valid level to set a new logging level.
     *
     * @return {string}
     *         The current logging level.
     */

    log.level = function (lvl) {
      if (typeof lvl === 'string') {
        if (!log.levels.hasOwnProperty(lvl)) {
          throw new Error("\"" + lvl + "\" in not a valid log level");
        }

        level = lvl;
      }

      return level;
    };
    /**
     * Returns an array containing everything that has been logged to the history.
     *
     * This array is a shallow clone of the internal history record. However, its
     * contents are _not_ cloned; so, mutating objects inside this array will
     * mutate them in history.
     *
     * @return {Array}
     */


    log.history = function () {
      return history ? [].concat(history) : [];
    };
    /**
     * Allows you to filter the history by the given logger name
     *
     * @param {string} fname
     *        The name to filter by
     *
     * @return {Array}
     *         The filtered list to return
     */


    log.history.filter = function (fname) {
      return (history || []).filter(function (historyItem) {
        // if the first item in each historyItem includes `fname`, then it's a match
        return new RegExp(".*" + fname + ".*").test(historyItem[0]);
      });
    };
    /**
     * Clears the internal history tracking, but does not prevent further history
     * tracking.
     */


    log.history.clear = function () {
      if (history) {
        history.length = 0;
      }
    };
    /**
     * Disable history tracking if it is currently enabled.
     */


    log.history.disable = function () {
      if (history !== null) {
        history.length = 0;
        history = null;
      }
    };
    /**
     * Enable history tracking if it is currently disabled.
     */


    log.history.enable = function () {
      if (history === null) {
        history = [];
      }
    };
    /**
     * Logs error messages. Similar to `console.error`.
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as an error
     */


    log.error = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return logByType('error', level, args);
    };
    /**
     * Logs warning messages. Similar to `console.warn`.
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as a warning.
     */


    log.warn = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return logByType('warn', level, args);
    };
    /**
     * Logs debug messages. Similar to `console.debug`, but may also act as a comparable
     * log if `console.debug` is not available
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as debug.
     */


    log.debug = function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return logByType('debug', level, args);
    };

    return log;
  }

  /**
   * @file log.js
   * @module log
   */
  var log = createLogger('VIDEOJS');
  var createLogger$1 = log.createLogger;

  function clean(s) {
    return s.replace(/\n\r?\s*/g, '');
  }

  var tsml = function tsml(sa) {
    var s = '',
        i = 0;

    for (; i < arguments.length; i++) {
      s += clean(sa[i]) + (arguments[i + 1] || '');
    }

    return s;
  };

  /**
   * @file obj.js
   * @module obj
   */

  /**
   * @callback obj:EachCallback
   *
   * @param {Mixed} value
   *        The current key for the object that is being iterated over.
   *
   * @param {string} key
   *        The current key-value for object that is being iterated over
   */

  /**
   * @callback obj:ReduceCallback
   *
   * @param {Mixed} accum
   *        The value that is accumulating over the reduce loop.
   *
   * @param {Mixed} value
   *        The current key for the object that is being iterated over.
   *
   * @param {string} key
   *        The current key-value for object that is being iterated over
   *
   * @return {Mixed}
   *         The new accumulated value.
   */
  var toString = Object.prototype.toString;
  /**
   * Get the keys of an Object
   *
   * @param {Object}
   *        The Object to get the keys from
   *
   * @return {string[]}
   *         An array of the keys from the object. Returns an empty array if the
   *         object passed in was invalid or had no keys.
   *
   * @private
   */

  var keys = function keys(object) {
    return isObject(object) ? Object.keys(object) : [];
  };
  /**
   * Array-like iteration for objects.
   *
   * @param {Object} object
   *        The object to iterate over
   *
   * @param {obj:EachCallback} fn
   *        The callback function which is called for each key in the object.
   */


  function each(object, fn) {
    keys(object).forEach(function (key) {
      return fn(object[key], key);
    });
  }
  /**
   * Array-like reduce for objects.
   *
   * @param {Object} object
   *        The Object that you want to reduce.
   *
   * @param {Function} fn
   *         A callback function which is called for each key in the object. It
   *         receives the accumulated value and the per-iteration value and key
   *         as arguments.
   *
   * @param {Mixed} [initial = 0]
   *        Starting value
   *
   * @return {Mixed}
   *         The final accumulated value.
   */

  function reduce(object, fn, initial) {
    if (initial === void 0) {
      initial = 0;
    }

    return keys(object).reduce(function (accum, key) {
      return fn(accum, object[key], key);
    }, initial);
  }
  /**
   * Object.assign-style object shallow merge/extend.
   *
   * @param  {Object} target
   * @param  {Object} ...sources
   * @return {Object}
   */

  function assign(target) {
    for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    if (Object.assign) {
      return Object.assign.apply(Object, [target].concat(sources));
    }

    sources.forEach(function (source) {
      if (!source) {
        return;
      }

      each(source, function (value, key) {
        target[key] = value;
      });
    });
    return target;
  }
  /**
   * Returns whether a value is an object of any kind - including DOM nodes,
   * arrays, regular expressions, etc. Not functions, though.
   *
   * This avoids the gotcha where using `typeof` on a `null` value
   * results in `'object'`.
   *
   * @param  {Object} value
   * @return {boolean}
   */

  function isObject(value) {
    return !!value && typeof value === 'object';
  }
  /**
   * Returns whether an object appears to be a "plain" object - that is, a
   * direct instance of `Object`.
   *
   * @param  {Object} value
   * @return {boolean}
   */

  function isPlain(value) {
    return isObject(value) && toString.call(value) === '[object Object]' && value.constructor === Object;
  }

  /**
   * @file computed-style.js
   * @module computed-style
   */
  /**
   * A safe getComputedStyle.
   *
   * This is needed because in Firefox, if the player is loaded in an iframe with
   * `display:none`, then `getComputedStyle` returns `null`, so, we do a
   * null-check to make sure that the player doesn't break in these cases.
   *
   * @function
   * @param    {Element} el
   *           The element you want the computed style of
   *
   * @param    {string} prop
   *           The property name you want
   *
   * @see      https://bugzilla.mozilla.org/show_bug.cgi?id=548397
   */

  function computedStyle(el, prop) {
    if (!el || !prop) {
      return '';
    }

    if (typeof window$1.getComputedStyle === 'function') {
      var cs = window$1.getComputedStyle(el);
      return cs ? cs[prop] : '';
    }

    return '';
  }

  function _templateObject() {
    var data = _taggedTemplateLiteralLoose(["Setting attributes in the second argument of createEl()\n                has been deprecated. Use the third argument instead.\n                createEl(type, properties, attributes). Attempting to set ", " to ", "."]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }
  /**
   * Detect if a value is a string with any non-whitespace characters.
   *
   * @private
   * @param  {string} str
   *         The string to check
   *
   * @return {boolean}
   *         Will be `true` if the string is non-blank, `false` otherwise.
   *
   */

  function isNonBlankString(str) {
    return typeof str === 'string' && /\S/.test(str);
  }
  /**
   * Throws an error if the passed string has whitespace. This is used by
   * class methods to be relatively consistent with the classList API.
   *
   * @private
   * @param  {string} str
   *         The string to check for whitespace.
   *
   * @throws {Error}
   *         Throws an error if there is whitespace in the string.
   */


  function throwIfWhitespace(str) {
    if (/\s/.test(str)) {
      throw new Error('class has illegal whitespace characters');
    }
  }
  /**
   * Produce a regular expression for matching a className within an elements className.
   *
   * @private
   * @param  {string} className
   *         The className to generate the RegExp for.
   *
   * @return {RegExp}
   *         The RegExp that will check for a specific `className` in an elements
   *         className.
   */


  function classRegExp(className) {
    return new RegExp('(^|\\s)' + className + '($|\\s)');
  }
  /**
   * Whether the current DOM interface appears to be real (i.e. not simulated).
   *
   * @return {boolean}
   *         Will be `true` if the DOM appears to be real, `false` otherwise.
   */


  function isReal() {
    // Both document and window will never be undefined thanks to `global`.
    return document === window$1.document;
  }
  /**
   * Determines, via duck typing, whether or not a value is a DOM element.
   *
   * @param  {Mixed} value
   *         The value to check.
   *
   * @return {boolean}
   *         Will be `true` if the value is a DOM element, `false` otherwise.
   */

  function isEl(value) {
    return isObject(value) && value.nodeType === 1;
  }
  /**
   * Determines if the current DOM is embedded in an iframe.
   *
   * @return {boolean}
   *         Will be `true` if the DOM is embedded in an iframe, `false`
   *         otherwise.
   */

  function isInFrame() {
    // We need a try/catch here because Safari will throw errors when attempting
    // to get either `parent` or `self`
    try {
      return window$1.parent !== window$1.self;
    } catch (x) {
      return true;
    }
  }
  /**
   * Creates functions to query the DOM using a given method.
   *
   * @private
   * @param   {string} method
   *          The method to create the query with.
   *
   * @return  {Function}
   *          The query method
   */

  function createQuerier(method) {
    return function (selector, context) {
      if (!isNonBlankString(selector)) {
        return document[method](null);
      }

      if (isNonBlankString(context)) {
        context = document.querySelector(context);
      }

      var ctx = isEl(context) ? context : document;
      return ctx[method] && ctx[method](selector);
    };
  }
  /**
   * Creates an element and applies properties, attributes, and inserts content.
   *
   * @param  {string} [tagName='div']
   *         Name of tag to be created.
   *
   * @param  {Object} [properties={}]
   *         Element properties to be applied.
   *
   * @param  {Object} [attributes={}]
   *         Element attributes to be applied.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor object.
   *
   * @return {Element}
   *         The element that was created.
   */


  function createEl(tagName, properties, attributes, content) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    if (properties === void 0) {
      properties = {};
    }

    if (attributes === void 0) {
      attributes = {};
    }

    var el = document.createElement(tagName);
    Object.getOwnPropertyNames(properties).forEach(function (propName) {
      var val = properties[propName]; // See #2176
      // We originally were accepting both properties and attributes in the
      // same object, but that doesn't work so well.

      if (propName.indexOf('aria-') !== -1 || propName === 'role' || propName === 'type') {
        log.warn(tsml(_templateObject(), propName, val));
        el.setAttribute(propName, val); // Handle textContent since it's not supported everywhere and we have a
        // method for it.
      } else if (propName === 'textContent') {
        textContent(el, val);
      } else {
        el[propName] = val;
      }
    });
    Object.getOwnPropertyNames(attributes).forEach(function (attrName) {
      el.setAttribute(attrName, attributes[attrName]);
    });

    if (content) {
      appendContent(el, content);
    }

    return el;
  }
  /**
   * Injects text into an element, replacing any existing contents entirely.
   *
   * @param  {Element} el
   *         The element to add text content into
   *
   * @param  {string} text
   *         The text content to add.
   *
   * @return {Element}
   *         The element with added text content.
   */

  function textContent(el, text) {
    if (typeof el.textContent === 'undefined') {
      el.innerText = text;
    } else {
      el.textContent = text;
    }

    return el;
  }
  /**
   * Insert an element as the first child node of another
   *
   * @param {Element} child
   *        Element to insert
   *
   * @param {Element} parent
   *        Element to insert child into
   */

  function prependTo(child, parent) {
    if (parent.firstChild) {
      parent.insertBefore(child, parent.firstChild);
    } else {
      parent.appendChild(child);
    }
  }
  /**
   * Check if an element has a class name.
   *
   * @param  {Element} element
   *         Element to check
   *
   * @param  {string} classToCheck
   *         Class name to check for
   *
   * @return {boolean}
   *         Will be `true` if the element has a class, `false` otherwise.
   *
   * @throws {Error}
   *         Throws an error if `classToCheck` has white space.
   */

  function hasClass(element, classToCheck) {
    throwIfWhitespace(classToCheck);

    if (element.classList) {
      return element.classList.contains(classToCheck);
    }

    return classRegExp(classToCheck).test(element.className);
  }
  /**
   * Add a class name to an element.
   *
   * @param  {Element} element
   *         Element to add class name to.
   *
   * @param  {string} classToAdd
   *         Class name to add.
   *
   * @return {Element}
   *         The DOM element with the added class name.
   */

  function addClass(element, classToAdd) {
    if (element.classList) {
      element.classList.add(classToAdd); // Don't need to `throwIfWhitespace` here because `hasElClass` will do it
      // in the case of classList not being supported.
    } else if (!hasClass(element, classToAdd)) {
      element.className = (element.className + ' ' + classToAdd).trim();
    }

    return element;
  }
  /**
   * Remove a class name from an element.
   *
   * @param  {Element} element
   *         Element to remove a class name from.
   *
   * @param  {string} classToRemove
   *         Class name to remove
   *
   * @return {Element}
   *         The DOM element with class name removed.
   */

  function removeClass(element, classToRemove) {
    if (element.classList) {
      element.classList.remove(classToRemove);
    } else {
      throwIfWhitespace(classToRemove);
      element.className = element.className.split(/\s+/).filter(function (c) {
        return c !== classToRemove;
      }).join(' ');
    }

    return element;
  }
  /**
   * The callback definition for toggleClass.
   *
   * @callback module:dom~PredicateCallback
   * @param    {Element} element
   *           The DOM element of the Component.
   *
   * @param    {string} classToToggle
   *           The `className` that wants to be toggled
   *
   * @return   {boolean|undefined}
   *           If `true` is returned, the `classToToggle` will be added to the
   *           `element`. If `false`, the `classToToggle` will be removed from
   *           the `element`. If `undefined`, the callback will be ignored.
   */

  /**
   * Adds or removes a class name to/from an element depending on an optional
   * condition or the presence/absence of the class name.
   *
   * @param  {Element} element
   *         The element to toggle a class name on.
   *
   * @param  {string} classToToggle
   *         The class that should be toggled.
   *
   * @param  {boolean|module:dom~PredicateCallback} [predicate]
   *         See the return value for {@link module:dom~PredicateCallback}
   *
   * @return {Element}
   *         The element with a class that has been toggled.
   */

  function toggleClass(element, classToToggle, predicate) {
    // This CANNOT use `classList` internally because IE11 does not support the
    // second parameter to the `classList.toggle()` method! Which is fine because
    // `classList` will be used by the add/remove functions.
    var has = hasClass(element, classToToggle);

    if (typeof predicate === 'function') {
      predicate = predicate(element, classToToggle);
    }

    if (typeof predicate !== 'boolean') {
      predicate = !has;
    } // If the necessary class operation matches the current state of the
    // element, no action is required.


    if (predicate === has) {
      return;
    }

    if (predicate) {
      addClass(element, classToToggle);
    } else {
      removeClass(element, classToToggle);
    }

    return element;
  }
  /**
   * Apply attributes to an HTML element.
   *
   * @param {Element} el
   *        Element to add attributes to.
   *
   * @param {Object} [attributes]
   *        Attributes to be applied.
   */

  function setAttributes(el, attributes) {
    Object.getOwnPropertyNames(attributes).forEach(function (attrName) {
      var attrValue = attributes[attrName];

      if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
        el.removeAttribute(attrName);
      } else {
        el.setAttribute(attrName, attrValue === true ? '' : attrValue);
      }
    });
  }
  /**
   * Get an element's attribute values, as defined on the HTML tag.
   *
   * Attributes are not the same as properties. They're defined on the tag
   * or with setAttribute.
   *
   * @param  {Element} tag
   *         Element from which to get tag attributes.
   *
   * @return {Object}
   *         All attributes of the element. Boolean attributes will be `true` or
   *         `false`, others will be strings.
   */

  function getAttributes(tag) {
    var obj = {}; // known boolean attributes
    // we can check for matching boolean properties, but not all browsers
    // and not all tags know about these attributes, so, we still want to check them manually

    var knownBooleans = ',' + 'autoplay,controls,playsinline,loop,muted,default,defaultMuted' + ',';

    if (tag && tag.attributes && tag.attributes.length > 0) {
      var attrs = tag.attributes;

      for (var i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name;
        var attrVal = attrs[i].value; // check for known booleans
        // the matching element property will return a value for typeof

        if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(',' + attrName + ',') !== -1) {
          // the value of an included boolean attribute is typically an empty
          // string ('') which would equal false if we just check for a false value.
          // we also don't want support bad code like autoplay='false'
          attrVal = attrVal !== null ? true : false;
        }

        obj[attrName] = attrVal;
      }
    }

    return obj;
  }
  /**
   * Get the value of an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to get the value of.
   *
   * @return {string}
   *         The value of the attribute.
   */

  function getAttribute(el, attribute) {
    return el.getAttribute(attribute);
  }
  /**
   * Set the value of an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to set.
   *
   * @param {string} value
   *        Value to set the attribute to.
   */

  function setAttribute(el, attribute, value) {
    el.setAttribute(attribute, value);
  }
  /**
   * Remove an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to remove.
   */

  function removeAttribute(el, attribute) {
    el.removeAttribute(attribute);
  }
  /**
   * Attempt to block the ability to select text.
   */

  function blockTextSelection() {
    document.body.focus();

    document.onselectstart = function () {
      return false;
    };
  }
  /**
   * Turn off text selection blocking.
   */

  function unblockTextSelection() {
    document.onselectstart = function () {
      return true;
    };
  }
  /**
   * Identical to the native `getBoundingClientRect` function, but ensures that
   * the method is supported at all (it is in all browsers we claim to support)
   * and that the element is in the DOM before continuing.
   *
   * This wrapper function also shims properties which are not provided by some
   * older browsers (namely, IE8).
   *
   * Additionally, some browsers do not support adding properties to a
   * `ClientRect`/`DOMRect` object; so, we shallow-copy it with the standard
   * properties (except `x` and `y` which are not widely supported). This helps
   * avoid implementations where keys are non-enumerable.
   *
   * @param  {Element} el
   *         Element whose `ClientRect` we want to calculate.
   *
   * @return {Object|undefined}
   *         Always returns a plain object - or `undefined` if it cannot.
   */

  function getBoundingClientRect(el) {
    if (el && el.getBoundingClientRect && el.parentNode) {
      var rect = el.getBoundingClientRect();
      var result = {};
      ['bottom', 'height', 'left', 'right', 'top', 'width'].forEach(function (k) {
        if (rect[k] !== undefined) {
          result[k] = rect[k];
        }
      });

      if (!result.height) {
        result.height = parseFloat(computedStyle(el, 'height'));
      }

      if (!result.width) {
        result.width = parseFloat(computedStyle(el, 'width'));
      }

      return result;
    }
  }
  /**
   * Represents the position of a DOM element on the page.
   *
   * @typedef  {Object} module:dom~Position
   *
   * @property {number} left
   *           Pixels to the left.
   *
   * @property {number} top
   *           Pixels from the top.
   */

  /**
   * Get the position of an element in the DOM.
   *
   * Uses `getBoundingClientRect` technique from John Resig.
   *
   * @see http://ejohn.org/blog/getboundingclientrect-is-awesome/
   *
   * @param  {Element} el
   *         Element from which to get offset.
   *
   * @return {module:dom~Position}
   *         The position of the element that was passed in.
   */

  function findPosition(el) {
    var box;

    if (el.getBoundingClientRect && el.parentNode) {
      box = el.getBoundingClientRect();
    }

    if (!box) {
      return {
        left: 0,
        top: 0
      };
    }

    var docEl = document.documentElement;
    var body = document.body;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    var scrollLeft = window$1.pageXOffset || body.scrollLeft;
    var left = box.left + scrollLeft - clientLeft;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var scrollTop = window$1.pageYOffset || body.scrollTop;
    var top = box.top + scrollTop - clientTop; // Android sometimes returns slightly off decimal values, so need to round

    return {
      left: Math.round(left),
      top: Math.round(top)
    };
  }
  /**
   * Represents x and y coordinates for a DOM element or mouse pointer.
   *
   * @typedef  {Object} module:dom~Coordinates
   *
   * @property {number} x
   *           x coordinate in pixels
   *
   * @property {number} y
   *           y coordinate in pixels
   */

  /**
   * Get the pointer position within an element.
   *
   * The base on the coordinates are the bottom left of the element.
   *
   * @param  {Element} el
   *         Element on which to get the pointer position on.
   *
   * @param  {EventTarget~Event} event
   *         Event object.
   *
   * @return {module:dom~Coordinates}
   *         A coordinates object corresponding to the mouse position.
   *
   */

  function getPointerPosition(el, event) {
    var position = {};
    var box = findPosition(el);
    var boxW = el.offsetWidth;
    var boxH = el.offsetHeight;
    var boxY = box.top;
    var boxX = box.left;
    var pageY = event.pageY;
    var pageX = event.pageX;

    if (event.changedTouches) {
      pageX = event.changedTouches[0].pageX;
      pageY = event.changedTouches[0].pageY;
    }

    position.y = Math.max(0, Math.min(1, (boxY - pageY + boxH) / boxH));
    position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW));
    return position;
  }
  /**
   * Determines, via duck typing, whether or not a value is a text node.
   *
   * @param  {Mixed} value
   *         Check if this value is a text node.
   *
   * @return {boolean}
   *         Will be `true` if the value is a text node, `false` otherwise.
   */

  function isTextNode(value) {
    return isObject(value) && value.nodeType === 3;
  }
  /**
   * Empties the contents of an element.
   *
   * @param  {Element} el
   *         The element to empty children from
   *
   * @return {Element}
   *         The element with no children
   */

  function emptyEl(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    return el;
  }
  /**
   * This is a mixed value that describes content to be injected into the DOM
   * via some method. It can be of the following types:
   *
   * Type       | Description
   * -----------|-------------
   * `string`   | The value will be normalized into a text node.
   * `Element`  | The value will be accepted as-is.
   * `TextNode` | The value will be accepted as-is.
   * `Array`    | A one-dimensional array of strings, elements, text nodes, or functions. These functions should return a string, element, or text node (any other return value, like an array, will be ignored).
   * `Function` | A function, which is expected to return a string, element, text node, or array - any of the other possible values described above. This means that a content descriptor could be a function that returns an array of functions, but those second-level functions must return strings, elements, or text nodes.
   *
   * @typedef {string|Element|TextNode|Array|Function} module:dom~ContentDescriptor
   */

  /**
   * Normalizes content for eventual insertion into the DOM.
   *
   * This allows a wide range of content definition methods, but helps protect
   * from falling into the trap of simply writing to `innerHTML`, which could
   * be an XSS concern.
   *
   * The content for an element can be passed in multiple types and
   * combinations, whose behavior is as follows:
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Array}
   *         All of the content that was passed in, normalized to an array of
   *         elements or text nodes.
   */

  function normalizeContent(content) {
    // First, invoke content if it is a function. If it produces an array,
    // that needs to happen before normalization.
    if (typeof content === 'function') {
      content = content();
    } // Next up, normalize to an array, so one or many items can be normalized,
    // filtered, and returned.


    return (Array.isArray(content) ? content : [content]).map(function (value) {
      // First, invoke value if it is a function to produce a new value,
      // which will be subsequently normalized to a Node of some kind.
      if (typeof value === 'function') {
        value = value();
      }

      if (isEl(value) || isTextNode(value)) {
        return value;
      }

      if (typeof value === 'string' && /\S/.test(value)) {
        return document.createTextNode(value);
      }
    }).filter(function (value) {
      return value;
    });
  }
  /**
   * Normalizes and appends content to an element.
   *
   * @param  {Element} el
   *         Element to append normalized content to.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Element}
   *         The element with appended normalized content.
   */

  function appendContent(el, content) {
    normalizeContent(content).forEach(function (node) {
      return el.appendChild(node);
    });
    return el;
  }
  /**
   * Normalizes and inserts content into an element; this is identical to
   * `appendContent()`, except it empties the element first.
   *
   * @param {Element} el
   *        Element to insert normalized content into.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Element}
   *         The element with inserted normalized content.
   */

  function insertContent(el, content) {
    return appendContent(emptyEl(el), content);
  }
  /**
   * Check if an event was a single left click.
   *
   * @param  {EventTarget~Event} event
   *         Event object.
   *
   * @return {boolean}
   *         Will be `true` if a single left click, `false` otherwise.
   */

  function isSingleLeftClick(event) {
    // Note: if you create something draggable, be sure to
    // call it on both `mousedown` and `mousemove` event,
    // otherwise `mousedown` should be enough for a button
    if (event.button === undefined && event.buttons === undefined) {
      // Why do we need `buttons` ?
      // Because, middle mouse sometimes have this:
      // e.button === 0 and e.buttons === 4
      // Furthermore, we want to prevent combination click, something like
      // HOLD middlemouse then left click, that would be
      // e.button === 0, e.buttons === 5
      // just `button` is not gonna work
      // Alright, then what this block does ?
      // this is for chrome `simulate mobile devices`
      // I want to support this as well
      return true;
    }

    if (event.button === 0 && event.buttons === undefined) {
      // Touch screen, sometimes on some specific device, `buttons`
      // doesn't have anything (safari on ios, blackberry...)
      return true;
    }

    if (event.button !== 0 || event.buttons !== 1) {
      // This is the reason we have those if else block above
      // if any special case we can catch and let it slide
      // we do it above, when get to here, this definitely
      // is-not-left-click
      return false;
    }

    return true;
  }
  /**
   * Finds a single DOM element matching `selector` within the optional
   * `context` of another DOM element (defaulting to `document`).
   *
   * @param  {string} selector
   *         A valid CSS selector, which will be passed to `querySelector`.
   *
   * @param  {Element|String} [context=document]
   *         A DOM element within which to query. Can also be a selector
   *         string in which case the first matching element will be used
   *         as context. If missing (or no element matches selector), falls
   *         back to `document`.
   *
   * @return {Element|null}
   *         The element that was found or null.
   */

  var $ = createQuerier('querySelector');
  /**
   * Finds a all DOM elements matching `selector` within the optional
   * `context` of another DOM element (defaulting to `document`).
   *
   * @param  {string} selector
   *         A valid CSS selector, which will be passed to `querySelectorAll`.
   *
   * @param  {Element|String} [context=document]
   *         A DOM element within which to query. Can also be a selector
   *         string in which case the first matching element will be used
   *         as context. If missing (or no element matches selector), falls
   *         back to `document`.
   *
   * @return {NodeList}
   *         A element list of elements that were found. Will be empty if none
   *         were found.
   *
   */

  var $$ = createQuerier('querySelectorAll');

  var Dom = /*#__PURE__*/Object.freeze({
    isReal: isReal,
    isEl: isEl,
    isInFrame: isInFrame,
    createEl: createEl,
    textContent: textContent,
    prependTo: prependTo,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    setAttributes: setAttributes,
    getAttributes: getAttributes,
    getAttribute: getAttribute,
    setAttribute: setAttribute,
    removeAttribute: removeAttribute,
    blockTextSelection: blockTextSelection,
    unblockTextSelection: unblockTextSelection,
    getBoundingClientRect: getBoundingClientRect,
    findPosition: findPosition,
    getPointerPosition: getPointerPosition,
    isTextNode: isTextNode,
    emptyEl: emptyEl,
    normalizeContent: normalizeContent,
    appendContent: appendContent,
    insertContent: insertContent,
    isSingleLeftClick: isSingleLeftClick,
    $: $,
    $$: $$
  });

  /**
   * @file guid.js
   * @module guid
   */

  /**
   * Unique ID for an element or function
   * @type {Number}
   */
  var _guid = 1;
  /**
   * Get a unique auto-incrementing ID by number that has not been returned before.
   *
   * @return {number}
   *         A new unique ID.
   */

  function newGUID() {
    return _guid++;
  }

  /**
   * @file dom-data.js
   * @module dom-data
   */
  /**
   * Element Data Store.
   *
   * Allows for binding data to an element without putting it directly on the
   * element. Ex. Event listeners are stored here.
   * (also from jsninja.com, slightly modified and updated for closure compiler)
   *
   * @type {Object}
   * @private
   */

  var elData = {};
  /*
   * Unique attribute name to store an element's guid in
   *
   * @type {String}
   * @constant
   * @private
   */

  var elIdAttr = 'vdata' + new Date().getTime();
  /**
   * Returns the cache object where data for an element is stored
   *
   * @param {Element} el
   *        Element to store data for.
   *
   * @return {Object}
   *         The cache object for that el that was passed in.
   */

  function getData(el) {
    var id = el[elIdAttr];

    if (!id) {
      id = el[elIdAttr] = newGUID();
    }

    if (!elData[id]) {
      elData[id] = {};
    }

    return elData[id];
  }
  /**
   * Returns whether or not an element has cached data
   *
   * @param {Element} el
   *        Check if this element has cached data.
   *
   * @return {boolean}
   *         - True if the DOM element has cached data.
   *         - False otherwise.
   */

  function hasData(el) {
    var id = el[elIdAttr];

    if (!id) {
      return false;
    }

    return !!Object.getOwnPropertyNames(elData[id]).length;
  }
  /**
   * Delete data for the element from the cache and the guid attr from getElementById
   *
   * @param {Element} el
   *        Remove cached data for this element.
   */

  function removeData(el) {
    var id = el[elIdAttr];

    if (!id) {
      return;
    } // Remove all stored data


    delete elData[id]; // Remove the elIdAttr property from the DOM node

    try {
      delete el[elIdAttr];
    } catch (e) {
      if (el.removeAttribute) {
        el.removeAttribute(elIdAttr);
      } else {
        // IE doesn't appear to support removeAttribute on the document element
        el[elIdAttr] = null;
      }
    }
  }

  /**
   * @file events.js. An Event System (John Resig - Secrets of a JS Ninja http://jsninja.com/)
   * (Original book version wasn't completely usable, so fixed some things and made Closure Compiler compatible)
   * This should work very similarly to jQuery's events, however it's based off the book version which isn't as
   * robust as jquery's, so there's probably some differences.
   *
   * @file events.js
   * @module events
   */
  /**
   * Clean up the listener cache and dispatchers
   *
   * @param {Element|Object} elem
   *        Element to clean up
   *
   * @param {string} type
   *        Type of event to clean up
   */

  function _cleanUpEvents(elem, type) {
    var data = getData(elem); // Remove the events of a particular type if there are none left

    if (data.handlers[type].length === 0) {
      delete data.handlers[type]; // data.handlers[type] = null;
      // Setting to null was causing an error with data.handlers
      // Remove the meta-handler from the element

      if (elem.removeEventListener) {
        elem.removeEventListener(type, data.dispatcher, false);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + type, data.dispatcher);
      }
    } // Remove the events object if there are no types left


    if (Object.getOwnPropertyNames(data.handlers).length <= 0) {
      delete data.handlers;
      delete data.dispatcher;
      delete data.disabled;
    } // Finally remove the element data if there is no data left


    if (Object.getOwnPropertyNames(data).length === 0) {
      removeData(elem);
    }
  }
  /**
   * Loops through an array of event types and calls the requested method for each type.
   *
   * @param {Function} fn
   *        The event method we want to use.
   *
   * @param {Element|Object} elem
   *        Element or object to bind listeners to
   *
   * @param {string} type
   *        Type of event to bind to.
   *
   * @param {EventTarget~EventListener} callback
   *        Event listener.
   */


  function _handleMultipleEvents(fn, elem, types, callback) {
    types.forEach(function (type) {
      // Call the event method for each one of the types
      fn(elem, type, callback);
    });
  }
  /**
   * Fix a native event to have standard property values
   *
   * @param {Object} event
   *        Event object to fix.
   *
   * @return {Object}
   *         Fixed event object.
   */


  function fixEvent(event) {
    function returnTrue() {
      return true;
    }

    function returnFalse() {
      return false;
    } // Test if fixing up is needed
    // Used to check if !event.stopPropagation instead of isPropagationStopped
    // But native events return true for stopPropagation, but don't have
    // other expected methods like isPropagationStopped. Seems to be a problem
    // with the Javascript Ninja code. So we're just overriding all events now.


    if (!event || !event.isPropagationStopped) {
      var old = event || window$1.event;
      event = {}; // Clone the old object so that we can modify the values event = {};
      // IE8 Doesn't like when you mess with native event properties
      // Firefox returns false for event.hasOwnProperty('type') and other props
      //  which makes copying more difficult.
      // TODO: Probably best to create a whitelist of event props

      for (var key in old) {
        // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
        // Chrome warns you if you try to copy deprecated keyboardEvent.keyLocation
        // and webkitMovementX/Y
        if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation' && key !== 'webkitMovementX' && key !== 'webkitMovementY') {
          // Chrome 32+ warns if you try to copy deprecated returnValue, but
          // we still want to if preventDefault isn't supported (IE8).
          if (!(key === 'returnValue' && old.preventDefault)) {
            event[key] = old[key];
          }
        }
      } // The event occurred on this element


      if (!event.target) {
        event.target = event.srcElement || document;
      } // Handle which other element the event is related to


      if (!event.relatedTarget) {
        event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
      } // Stop the default browser action


      event.preventDefault = function () {
        if (old.preventDefault) {
          old.preventDefault();
        }

        event.returnValue = false;
        old.returnValue = false;
        event.defaultPrevented = true;
      };

      event.defaultPrevented = false; // Stop the event from bubbling

      event.stopPropagation = function () {
        if (old.stopPropagation) {
          old.stopPropagation();
        }

        event.cancelBubble = true;
        old.cancelBubble = true;
        event.isPropagationStopped = returnTrue;
      };

      event.isPropagationStopped = returnFalse; // Stop the event from bubbling and executing other handlers

      event.stopImmediatePropagation = function () {
        if (old.stopImmediatePropagation) {
          old.stopImmediatePropagation();
        }

        event.isImmediatePropagationStopped = returnTrue;
        event.stopPropagation();
      };

      event.isImmediatePropagationStopped = returnFalse; // Handle mouse position

      if (event.clientX !== null && event.clientX !== undefined) {
        var doc = document.documentElement;
        var body = document.body;
        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
      } // Handle key presses


      event.which = event.charCode || event.keyCode; // Fix button for mouse clicks:
      // 0 == left; 1 == middle; 2 == right

      if (event.button !== null && event.button !== undefined) {
        // The following is disabled because it does not pass videojs-standard
        // and... yikes.

        /* eslint-disable */
        event.button = event.button & 1 ? 0 : event.button & 4 ? 1 : event.button & 2 ? 2 : 0;
        /* eslint-enable */
      }
    } // Returns fixed-up instance


    return event;
  }
  /**
   * Whether passive event listeners are supported
   */

  var _supportsPassive = false;

  (function () {
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function get() {
          _supportsPassive = true;
        }
      });
      window$1.addEventListener('test', null, opts);
      window$1.removeEventListener('test', null, opts);
    } catch (e) {// disregard
    }
  })();
  /**
   * Touch events Chrome expects to be passive
   */


  var passiveEvents = ['touchstart', 'touchmove'];
  /**
   * Add an event listener to element
   * It stores the handler function in a separate cache object
   * and adds a generic handler to the element's event,
   * along with a unique id (guid) to the element.
   *
   * @param {Element|Object} elem
   *        Element or object to bind listeners to
   *
   * @param {string|string[]} type
   *        Type of event to bind to.
   *
   * @param {EventTarget~EventListener} fn
   *        Event listener.
   */

  function on(elem, type, fn) {
    if (Array.isArray(type)) {
      return _handleMultipleEvents(on, elem, type, fn);
    }

    var data = getData(elem); // We need a place to store all our handler data

    if (!data.handlers) {
      data.handlers = {};
    }

    if (!data.handlers[type]) {
      data.handlers[type] = [];
    }

    if (!fn.guid) {
      fn.guid = newGUID();
    }

    data.handlers[type].push(fn);

    if (!data.dispatcher) {
      data.disabled = false;

      data.dispatcher = function (event, hash) {
        if (data.disabled) {
          return;
        }

        event = fixEvent(event);
        var handlers = data.handlers[event.type];

        if (handlers) {
          // Copy handlers so if handlers are added/removed during the process it doesn't throw everything off.
          var handlersCopy = handlers.slice(0);

          for (var m = 0, n = handlersCopy.length; m < n; m++) {
            if (event.isImmediatePropagationStopped()) {
              break;
            } else {
              try {
                handlersCopy[m].call(elem, event, hash);
              } catch (e) {
                log.error(e);
              }
            }
          }
        }
      };
    }

    if (data.handlers[type].length === 1) {
      if (elem.addEventListener) {
        var options = false;

        if (_supportsPassive && passiveEvents.indexOf(type) > -1) {
          options = {
            passive: true
          };
        }

        elem.addEventListener(type, data.dispatcher, options);
      } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, data.dispatcher);
      }
    }
  }
  /**
   * Removes event listeners from an element
   *
   * @param {Element|Object} elem
   *        Object to remove listeners from.
   *
   * @param {string|string[]} [type]
   *        Type of listener to remove. Don't include to remove all events from element.
   *
   * @param {EventTarget~EventListener} [fn]
   *        Specific listener to remove. Don't include to remove listeners for an event
   *        type.
   */

  function off(elem, type, fn) {
    // Don't want to add a cache object through getElData if not needed
    if (!hasData(elem)) {
      return;
    }

    var data = getData(elem); // If no events exist, nothing to unbind

    if (!data.handlers) {
      return;
    }

    if (Array.isArray(type)) {
      return _handleMultipleEvents(off, elem, type, fn);
    } // Utility function


    var removeType = function removeType(el, t) {
      data.handlers[t] = [];

      _cleanUpEvents(el, t);
    }; // Are we removing all bound events?


    if (type === undefined) {
      for (var t in data.handlers) {
        if (Object.prototype.hasOwnProperty.call(data.handlers || {}, t)) {
          removeType(elem, t);
        }
      }

      return;
    }

    var handlers = data.handlers[type]; // If no handlers exist, nothing to unbind

    if (!handlers) {
      return;
    } // If no listener was provided, remove all listeners for type


    if (!fn) {
      removeType(elem, type);
      return;
    } // We're only removing a single handler


    if (fn.guid) {
      for (var n = 0; n < handlers.length; n++) {
        if (handlers[n].guid === fn.guid) {
          handlers.splice(n--, 1);
        }
      }
    }

    _cleanUpEvents(elem, type);
  }
  /**
   * Trigger an event for an element
   *
   * @param {Element|Object} elem
   *        Element to trigger an event on
   *
   * @param {EventTarget~Event|string} event
   *        A string (the type) or an event object with a type attribute
   *
   * @param {Object} [hash]
   *        data hash to pass along with the event
   *
   * @return {boolean|undefined}
   *         Returns the opposite of `defaultPrevented` if default was
   *         prevented. Otherwise, returns `undefined`
   */

  function trigger(elem, event, hash) {
    // Fetches element data and a reference to the parent (for bubbling).
    // Don't want to add a data object to cache for every parent,
    // so checking hasElData first.
    var elemData = hasData(elem) ? getData(elem) : {};
    var parent = elem.parentNode || elem.ownerDocument; // type = event.type || event,
    // handler;
    // If an event name was passed as a string, creates an event out of it

    if (typeof event === 'string') {
      event = {
        type: event,
        target: elem
      };
    } else if (!event.target) {
      event.target = elem;
    } // Normalizes the event properties.


    event = fixEvent(event); // If the passed element has a dispatcher, executes the established handlers.

    if (elemData.dispatcher) {
      elemData.dispatcher.call(elem, event, hash);
    } // Unless explicitly stopped or the event does not bubble (e.g. media events)
    // recursively calls this function to bubble the event up the DOM.


    if (parent && !event.isPropagationStopped() && event.bubbles === true) {
      trigger.call(null, parent, event, hash); // If at the top of the DOM, triggers the default action unless disabled.
    } else if (!parent && !event.defaultPrevented && event.target && event.target[event.type]) {
      var targetData = getData(event.target); // Checks if the target has a default action for this event.

      if (event.target[event.type]) {
        // Temporarily disables event dispatching on the target as we have already executed the handler.
        targetData.disabled = true; // Executes the default action.

        if (typeof event.target[event.type] === 'function') {
          event.target[event.type]();
        } // Re-enables event dispatching.


        targetData.disabled = false;
      }
    } // Inform the triggerer if the default was prevented by returning false


    return !event.defaultPrevented;
  }
  /**
   * Trigger a listener only once for an event.
   *
   * @param {Element|Object} elem
   *        Element or object to bind to.
   *
   * @param {string|string[]} type
   *        Name/type of event
   *
   * @param {Event~EventListener} fn
   *        Event listener function
   */

  function one(elem, type, fn) {
    if (Array.isArray(type)) {
      return _handleMultipleEvents(one, elem, type, fn);
    }

    var func = function func() {
      off(elem, type, func);
      fn.apply(this, arguments);
    }; // copy the guid to the new function so it can removed using the original function's ID


    func.guid = fn.guid = fn.guid || newGUID();
    on(elem, type, func);
  }

  var Events = /*#__PURE__*/Object.freeze({
    fixEvent: fixEvent,
    on: on,
    off: off,
    trigger: trigger,
    one: one
  });

  /**
   * @file setup.js - Functions for setting up a player without
   * user interaction based on the data-setup `attribute` of the video tag.
   *
   * @module setup
   */
  var _windowLoaded = false;
  var videojs;
  /**
   * Set up any tags that have a data-setup `attribute` when the player is started.
   */

  var autoSetup = function autoSetup() {
    // Protect against breakage in non-browser environments and check global autoSetup option.
    if (!isReal() || videojs.options.autoSetup === false) {
      return;
    }

    var vids = Array.prototype.slice.call(document.getElementsByTagName('video'));
    var audios = Array.prototype.slice.call(document.getElementsByTagName('audio'));
    var divs = Array.prototype.slice.call(document.getElementsByTagName('video-js'));
    var mediaEls = vids.concat(audios, divs); // Check if any media elements exist

    if (mediaEls && mediaEls.length > 0) {
      for (var i = 0, e = mediaEls.length; i < e; i++) {
        var mediaEl = mediaEls[i]; // Check if element exists, has getAttribute func.

        if (mediaEl && mediaEl.getAttribute) {
          // Make sure this player hasn't already been set up.
          if (mediaEl.player === undefined) {
            var options = mediaEl.getAttribute('data-setup'); // Check if data-setup attr exists.
            // We only auto-setup if they've added the data-setup attr.

            if (options !== null) {
              // Create new video.js instance.
              videojs(mediaEl);
            }
          } // If getAttribute isn't defined, we need to wait for the DOM.

        } else {
          autoSetupTimeout(1);
          break;
        }
      } // No videos were found, so keep looping unless page is finished loading.

    } else if (!_windowLoaded) {
      autoSetupTimeout(1);
    }
  };
  /**
   * Wait until the page is loaded before running autoSetup. This will be called in
   * autoSetup if `hasLoaded` returns false.
   *
   * @param {number} wait
   *        How long to wait in ms
   *
   * @param {module:videojs} [vjs]
   *        The videojs library function
   */


  function autoSetupTimeout(wait, vjs) {
    if (vjs) {
      videojs = vjs;
    }

    window$1.setTimeout(autoSetup, wait);
  }

  if (isReal() && document.readyState === 'complete') {
    _windowLoaded = true;
  } else {
    /**
     * Listen for the load event on window, and set _windowLoaded to true.
     *
     * @listens load
     */
    one(window$1, 'load', function () {
      _windowLoaded = true;
    });
  }

  /**
   * @file stylesheet.js
   * @module stylesheet
   */
  /**
   * Create a DOM syle element given a className for it.
   *
   * @param {string} className
   *        The className to add to the created style element.
   *
   * @return {Element}
   *         The element that was created.
   */

  var createStyleElement = function createStyleElement(className) {
    var style = document.createElement('style');
    style.className = className;
    return style;
  };
  /**
   * Add text to a DOM element.
   *
   * @param {Element} el
   *        The Element to add text content to.
   *
   * @param {string} content
   *        The text to add to the element.
   */

  var setTextContent = function setTextContent(el, content) {
    if (el.styleSheet) {
      el.styleSheet.cssText = content;
    } else {
      el.textContent = content;
    }
  };

  /**
   * @file fn.js
   * @module fn
   */
  /**
   * Bind (a.k.a proxy or context). A simple method for changing the context of
   * a function.
   *
   * It also stores a unique id on the function so it can be easily removed from
   * events.
   *
   * @function
   * @param    {Mixed} context
   *           The object to bind as scope.
   *
   * @param    {Function} fn
   *           The function to be bound to a scope.
   *
   * @param    {number} [uid]
   *           An optional unique ID for the function to be set
   *
   * @return   {Function}
   *           The new function that will be bound into the context given
   */

  var bind = function bind(context, fn, uid) {
    // Make sure the function has a unique ID
    if (!fn.guid) {
      fn.guid = newGUID();
    } // Create the new function that changes the context


    var bound = function bound() {
      return fn.apply(context, arguments);
    }; // Allow for the ability to individualize this function
    // Needed in the case where multiple objects might share the same prototype
    // IF both items add an event listener with the same function, then you try to remove just one
    // it will remove both because they both have the same guid.
    // when using this, you need to use the bind method when you remove the listener as well.
    // currently used in text tracks


    bound.guid = uid ? uid + '_' + fn.guid : fn.guid;
    return bound;
  };
  /**
   * Wraps the given function, `fn`, with a new function that only invokes `fn`
   * at most once per every `wait` milliseconds.
   *
   * @function
   * @param    {Function} fn
   *           The function to be throttled.
   *
   * @param    {number}   wait
   *           The number of milliseconds by which to throttle.
   *
   * @return   {Function}
   */

  var throttle = function throttle(fn, wait) {
    var last = Date.now();

    var throttled = function throttled() {
      var now = Date.now();

      if (now - last >= wait) {
        fn.apply(void 0, arguments);
        last = now;
      }
    };

    return throttled;
  };
  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked.
   *
   * Inspired by lodash and underscore implementations.
   *
   * @function
   * @param    {Function} func
   *           The function to wrap with debounce behavior.
   *
   * @param    {number} wait
   *           The number of milliseconds to wait after the last invocation.
   *
   * @param    {boolean} [immediate]
   *           Whether or not to invoke the function immediately upon creation.
   *
   * @param    {Object} [context=window]
   *           The "context" in which the debounced function should debounce. For
   *           example, if this function should be tied to a Video.js player,
   *           the player can be passed here. Alternatively, defaults to the
   *           global `window` object.
   *
   * @return   {Function}
   *           A debounced function.
   */

  var debounce = function debounce(func, wait, immediate, context) {
    if (context === void 0) {
      context = window$1;
    }

    var timeout;

    var cancel = function cancel() {
      context.clearTimeout(timeout);
      timeout = null;
    };
    /* eslint-disable consistent-this */


    var debounced = function debounced() {
      var self = this;
      var args = arguments;

      var _later = function later() {
        timeout = null;
        _later = null;

        if (!immediate) {
          func.apply(self, args);
        }
      };

      if (!timeout && immediate) {
        func.apply(self, args);
      }

      context.clearTimeout(timeout);
      timeout = context.setTimeout(_later, wait);
    };
    /* eslint-enable consistent-this */


    debounced.cancel = cancel;
    return debounced;
  };

  /**
   * @file src/js/event-target.js
   */
  /**
   * `EventTarget` is a class that can have the same API as the DOM `EventTarget`. It
   * adds shorthand functions that wrap around lengthy functions. For example:
   * the `on` function is a wrapper around `addEventListener`.
   *
   * @see [EventTarget Spec]{@link https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget}
   * @class EventTarget
   */

  var EventTarget = function EventTarget() {};
  /**
   * A Custom DOM event.
   *
   * @typedef {Object} EventTarget~Event
   * @see [Properties]{@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent}
   */

  /**
   * All event listeners should follow the following format.
   *
   * @callback EventTarget~EventListener
   * @this {EventTarget}
   *
   * @param {EventTarget~Event} event
   *        the event that triggered this function
   *
   * @param {Object} [hash]
   *        hash of data sent during the event
   */

  /**
   * An object containing event names as keys and booleans as values.
   *
   * > NOTE: If an event name is set to a true value here {@link EventTarget#trigger}
   *         will have extra functionality. See that function for more information.
   *
   * @property EventTarget.prototype.allowedEvents_
   * @private
   */


  EventTarget.prototype.allowedEvents_ = {};
  /**
   * Adds an `event listener` to an instance of an `EventTarget`. An `event listener` is a
   * function that will get called when an event with a certain name gets triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to call with `EventTarget`s
   */

  EventTarget.prototype.on = function (type, fn) {
    // Remove the addEventListener alias before calling Events.on
    // so we don't get into an infinite type loop
    var ael = this.addEventListener;

    this.addEventListener = function () {};

    on(this, type, fn);
    this.addEventListener = ael;
  };
  /**
   * An alias of {@link EventTarget#on}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#on}
   */


  EventTarget.prototype.addEventListener = EventTarget.prototype.on;
  /**
   * Removes an `event listener` for a specific event from an instance of `EventTarget`.
   * This makes it so that the `event listener` will no longer get called when the
   * named event happens.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to remove.
   */

  EventTarget.prototype.off = function (type, fn) {
    off(this, type, fn);
  };
  /**
   * An alias of {@link EventTarget#off}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#off}
   */


  EventTarget.prototype.removeEventListener = EventTarget.prototype.off;
  /**
   * This function will add an `event listener` that gets triggered only once. After the
   * first trigger it will get removed. This is like adding an `event listener`
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on itself.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to be called once for each event name.
   */

  EventTarget.prototype.one = function (type, fn) {
    // Remove the addEventListener alialing Events.on
    // so we don't get into an infinite type loop
    var ael = this.addEventListener;

    this.addEventListener = function () {};

    one(this, type, fn);
    this.addEventListener = ael;
  };
  /**
   * This function causes an event to happen. This will then cause any `event listeners`
   * that are waiting for that event, to get called. If there are no `event listeners`
   * for an event then nothing will happen.
   *
   * If the name of the `Event` that is being triggered is in `EventTarget.allowedEvents_`.
   * Trigger will also call the `on` + `uppercaseEventName` function.
   *
   * Example:
   * 'click' is in `EventTarget.allowedEvents_`, so, trigger will attempt to call
   * `onClick` if it exists.
   *
   * @param {string|EventTarget~Event|Object} event
   *        The name of the event, an `Event`, or an object with a key of type set to
   *        an event name.
   */


  EventTarget.prototype.trigger = function (event) {
    var type = event.type || event; // deprecation
    // In a future version we should default target to `this`
    // similar to how we default the target to `elem` in
    // `Events.trigger`. Right now the default `target` will be
    // `document` due to the `Event.fixEvent` call.

    if (typeof event === 'string') {
      event = {
        type: type
      };
    }

    event = fixEvent(event);

    if (this.allowedEvents_[type] && this['on' + type]) {
      this['on' + type](event);
    }

    trigger(this, event);
  };
  /**
   * An alias of {@link EventTarget#trigger}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#trigger}
   */


  EventTarget.prototype.dispatchEvent = EventTarget.prototype.trigger;
  var EVENT_MAP;

  EventTarget.prototype.queueTrigger = function (event) {
    var _this = this;

    // only set up EVENT_MAP if it'll be used
    if (!EVENT_MAP) {
      EVENT_MAP = new Map();
    }

    var type = event.type || event;
    var map = EVENT_MAP.get(this);

    if (!map) {
      map = new Map();
      EVENT_MAP.set(this, map);
    }

    var oldTimeout = map.get(type);
    map.delete(type);
    window$1.clearTimeout(oldTimeout);
    var timeout = window$1.setTimeout(function () {
      // if we cleared out all timeouts for the current target, delete its map
      if (map.size === 0) {
        map = null;
        EVENT_MAP.delete(_this);
      }

      _this.trigger(event);
    }, 0);
    map.set(type, timeout);
  };

  /**
   * @file mixins/evented.js
   * @module evented
   */
  /**
   * Returns whether or not an object has had the evented mixin applied.
   *
   * @param  {Object} object
   *         An object to test.
   *
   * @return {boolean}
   *         Whether or not the object appears to be evented.
   */

  var isEvented = function isEvented(object) {
    return object instanceof EventTarget || !!object.eventBusEl_ && ['on', 'one', 'off', 'trigger'].every(function (k) {
      return typeof object[k] === 'function';
    });
  };
  /**
   * Adds a callback to run after the evented mixin applied.
   *
   * @param  {Object} object
   *         An object to Add
   * @param  {Function} callback
   *         The callback to run.
   */


  var addEventedCallback = function addEventedCallback(target, callback) {
    if (isEvented(target)) {
      callback();
    } else {
      if (!target.eventedCallbacks) {
        target.eventedCallbacks = [];
      }

      target.eventedCallbacks.push(callback);
    }
  };
  /**
   * Whether a value is a valid event type - non-empty string or array.
   *
   * @private
   * @param  {string|Array} type
   *         The type value to test.
   *
   * @return {boolean}
   *         Whether or not the type is a valid event type.
   */


  var isValidEventType = function isValidEventType(type) {
    return (// The regex here verifies that the `type` contains at least one non-
      // whitespace character.
      typeof type === 'string' && /\S/.test(type) || Array.isArray(type) && !!type.length
    );
  };
  /**
   * Validates a value to determine if it is a valid event target. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the target does not appear to be a valid event target.
   *
   * @param  {Object} target
   *         The object to test.
   */


  var validateTarget = function validateTarget(target) {
    if (!target.nodeName && !isEvented(target)) {
      throw new Error('Invalid target; must be a DOM node or evented object.');
    }
  };
  /**
   * Validates a value to determine if it is a valid event target. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the type does not appear to be a valid event type.
   *
   * @param  {string|Array} type
   *         The type to test.
   */


  var validateEventType = function validateEventType(type) {
    if (!isValidEventType(type)) {
      throw new Error('Invalid event type; must be a non-empty string or array.');
    }
  };
  /**
   * Validates a value to determine if it is a valid listener. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the listener is not a function.
   *
   * @param  {Function} listener
   *         The listener to test.
   */


  var validateListener = function validateListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Invalid listener; must be a function.');
    }
  };
  /**
   * Takes an array of arguments given to `on()` or `one()`, validates them, and
   * normalizes them into an object.
   *
   * @private
   * @param  {Object} self
   *         The evented object on which `on()` or `one()` was called. This
   *         object will be bound as the `this` value for the listener.
   *
   * @param  {Array} args
   *         An array of arguments passed to `on()` or `one()`.
   *
   * @return {Object}
   *         An object containing useful values for `on()` or `one()` calls.
   */


  var normalizeListenArgs = function normalizeListenArgs(self, args) {
    // If the number of arguments is less than 3, the target is always the
    // evented object itself.
    var isTargetingSelf = args.length < 3 || args[0] === self || args[0] === self.eventBusEl_;
    var target;
    var type;
    var listener;

    if (isTargetingSelf) {
      target = self.eventBusEl_; // Deal with cases where we got 3 arguments, but we are still listening to
      // the evented object itself.

      if (args.length >= 3) {
        args.shift();
      }

      type = args[0];
      listener = args[1];
    } else {
      target = args[0];
      type = args[1];
      listener = args[2];
    }

    validateTarget(target);
    validateEventType(type);
    validateListener(listener);
    listener = bind(self, listener);
    return {
      isTargetingSelf: isTargetingSelf,
      target: target,
      type: type,
      listener: listener
    };
  };
  /**
   * Adds the listener to the event type(s) on the target, normalizing for
   * the type of target.
   *
   * @private
   * @param  {Element|Object} target
   *         A DOM node or evented object.
   *
   * @param  {string} method
   *         The event binding method to use ("on" or "one").
   *
   * @param  {string|Array} type
   *         One or more event type(s).
   *
   * @param  {Function} listener
   *         A listener function.
   */


  var listen = function listen(target, method, type, listener) {
    validateTarget(target);

    if (target.nodeName) {
      Events[method](target, type, listener);
    } else {
      target[method](type, listener);
    }
  };
  /**
   * Contains methods that provide event capabilities to an object which is passed
   * to {@link module:evented|evented}.
   *
   * @mixin EventedMixin
   */


  var EventedMixin = {
    /**
     * Add a listener to an event (or events) on this object or another evented
     * object.
     *
     * @param  {string|Array|Element|Object} targetOrType
     *         If this is a string or array, it represents the event type(s)
     *         that will trigger the listener.
     *
     *         Another evented object can be passed here instead, which will
     *         cause the listener to listen for events on _that_ object.
     *
     *         In either case, the listener's `this` value will be bound to
     *         this object.
     *
     * @param  {string|Array|Function} typeOrListener
     *         If the first argument was a string or array, this should be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function.
     */
    on: function on$$1() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _normalizeListenArgs = normalizeListenArgs(this, args),
          isTargetingSelf = _normalizeListenArgs.isTargetingSelf,
          target = _normalizeListenArgs.target,
          type = _normalizeListenArgs.type,
          listener = _normalizeListenArgs.listener;

      listen(target, 'on', type, listener); // If this object is listening to another evented object.

      if (!isTargetingSelf) {
        // If this object is disposed, remove the listener.
        var removeListenerOnDispose = function removeListenerOnDispose() {
          return _this.off(target, type, listener);
        }; // Use the same function ID as the listener so we can remove it later it
        // using the ID of the original listener.


        removeListenerOnDispose.guid = listener.guid; // Add a listener to the target's dispose event as well. This ensures
        // that if the target is disposed BEFORE this object, we remove the
        // removal listener that was just added. Otherwise, we create a memory leak.

        var removeRemoverOnTargetDispose = function removeRemoverOnTargetDispose() {
          return _this.off('dispose', removeListenerOnDispose);
        }; // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.


        removeRemoverOnTargetDispose.guid = listener.guid;
        listen(this, 'on', 'dispose', removeListenerOnDispose);
        listen(target, 'on', 'dispose', removeRemoverOnTargetDispose);
      }
    },

    /**
     * Add a listener to an event (or events) on this object or another evented
     * object. The listener will only be called once and then removed.
     *
     * @param  {string|Array|Element|Object} targetOrType
     *         If this is a string or array, it represents the event type(s)
     *         that will trigger the listener.
     *
     *         Another evented object can be passed here instead, which will
     *         cause the listener to listen for events on _that_ object.
     *
     *         In either case, the listener's `this` value will be bound to
     *         this object.
     *
     * @param  {string|Array|Function} typeOrListener
     *         If the first argument was a string or array, this should be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function.
     */
    one: function one$$1() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _normalizeListenArgs2 = normalizeListenArgs(this, args),
          isTargetingSelf = _normalizeListenArgs2.isTargetingSelf,
          target = _normalizeListenArgs2.target,
          type = _normalizeListenArgs2.type,
          listener = _normalizeListenArgs2.listener; // Targeting this evented object.


      if (isTargetingSelf) {
        listen(target, 'one', type, listener); // Targeting another evented object.
      } else {
        var wrapper = function wrapper() {
          _this2.off(target, type, wrapper);

          for (var _len3 = arguments.length, largs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            largs[_key3] = arguments[_key3];
          }

          listener.apply(null, largs);
        }; // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.


        wrapper.guid = listener.guid;
        listen(target, 'one', type, wrapper);
      }
    },

    /**
     * Removes listener(s) from event(s) on an evented object.
     *
     * @param  {string|Array|Element|Object} [targetOrType]
     *         If this is a string or array, it represents the event type(s).
     *
     *         Another evented object can be passed here instead, in which case
     *         ALL 3 arguments are _required_.
     *
     * @param  {string|Array|Function} [typeOrListener]
     *         If the first argument was a string or array, this may be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function; otherwise, _all_ listeners bound to the
     *         event type(s) will be removed.
     */
    off: function off$$1(targetOrType, typeOrListener, listener) {
      // Targeting this evented object.
      if (!targetOrType || isValidEventType(targetOrType)) {
        off(this.eventBusEl_, targetOrType, typeOrListener); // Targeting another evented object.
      } else {
        var target = targetOrType;
        var type = typeOrListener; // Fail fast and in a meaningful way!

        validateTarget(target);
        validateEventType(type);
        validateListener(listener); // Ensure there's at least a guid, even if the function hasn't been used

        listener = bind(this, listener); // Remove the dispose listener on this evented object, which was given
        // the same guid as the event listener in on().

        this.off('dispose', listener);

        if (target.nodeName) {
          off(target, type, listener);
          off(target, 'dispose', listener);
        } else if (isEvented(target)) {
          target.off(type, listener);
          target.off('dispose', listener);
        }
      }
    },

    /**
     * Fire an event on this evented object, causing its listeners to be called.
     *
     * @param   {string|Object} event
     *          An event type or an object with a type property.
     *
     * @param   {Object} [hash]
     *          An additional object to pass along to listeners.
     *
     * @return {boolean}
     *          Whether or not the default behavior was prevented.
     */
    trigger: function trigger$$1(event, hash) {
      return trigger(this.eventBusEl_, event, hash);
    }
  };
  /**
   * Applies {@link module:evented~EventedMixin|EventedMixin} to a target object.
   *
   * @param  {Object} target
   *         The object to which to add event methods.
   *
   * @param  {Object} [options={}]
   *         Options for customizing the mixin behavior.
   *
   * @param  {string} [options.eventBusKey]
   *         By default, adds a `eventBusEl_` DOM element to the target object,
   *         which is used as an event bus. If the target object already has a
   *         DOM element that should be used, pass its key here.
   *
   * @return {Object}
   *         The target object.
   */

  function evented(target, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        eventBusKey = _options.eventBusKey; // Set or create the eventBusEl_.

    if (eventBusKey) {
      if (!target[eventBusKey].nodeName) {
        throw new Error("The eventBusKey \"" + eventBusKey + "\" does not refer to an element.");
      }

      target.eventBusEl_ = target[eventBusKey];
    } else {
      target.eventBusEl_ = createEl('span', {
        className: 'vjs-event-bus'
      });
    }

    assign(target, EventedMixin);

    if (target.eventedCallbacks) {
      target.eventedCallbacks.forEach(function (callback) {
        callback();
      });
    } // When any evented object is disposed, it removes all its listeners.


    target.on('dispose', function () {
      target.off();
      window$1.setTimeout(function () {
        target.eventBusEl_ = null;
      }, 0);
    });
    return target;
  }

  /**
   * @file mixins/stateful.js
   * @module stateful
   */
  /**
   * Contains methods that provide statefulness to an object which is passed
   * to {@link module:stateful}.
   *
   * @mixin StatefulMixin
   */

  var StatefulMixin = {
    /**
     * A hash containing arbitrary keys and values representing the state of
     * the object.
     *
     * @type {Object}
     */
    state: {},

    /**
     * Set the state of an object by mutating its
     * {@link module:stateful~StatefulMixin.state|state} object in place.
     *
     * @fires   module:stateful~StatefulMixin#statechanged
     * @param   {Object|Function} stateUpdates
     *          A new set of properties to shallow-merge into the plugin state.
     *          Can be a plain object or a function returning a plain object.
     *
     * @return {Object|undefined}
     *          An object containing changes that occurred. If no changes
     *          occurred, returns `undefined`.
     */
    setState: function setState(stateUpdates) {
      var _this = this;

      // Support providing the `stateUpdates` state as a function.
      if (typeof stateUpdates === 'function') {
        stateUpdates = stateUpdates();
      }

      var changes;
      each(stateUpdates, function (value, key) {
        // Record the change if the value is different from what's in the
        // current state.
        if (_this.state[key] !== value) {
          changes = changes || {};
          changes[key] = {
            from: _this.state[key],
            to: value
          };
        }

        _this.state[key] = value;
      }); // Only trigger "statechange" if there were changes AND we have a trigger
      // function. This allows us to not require that the target object be an
      // evented object.

      if (changes && isEvented(this)) {
        /**
         * An event triggered on an object that is both
         * {@link module:stateful|stateful} and {@link module:evented|evented}
         * indicating that its state has changed.
         *
         * @event    module:stateful~StatefulMixin#statechanged
         * @type     {Object}
         * @property {Object} changes
         *           A hash containing the properties that were changed and
         *           the values they were changed `from` and `to`.
         */
        this.trigger({
          changes: changes,
          type: 'statechanged'
        });
      }

      return changes;
    }
  };
  /**
   * Applies {@link module:stateful~StatefulMixin|StatefulMixin} to a target
   * object.
   *
   * If the target object is {@link module:evented|evented} and has a
   * `handleStateChanged` method, that method will be automatically bound to the
   * `statechanged` event on itself.
   *
   * @param   {Object} target
   *          The object to be made stateful.
   *
   * @param   {Object} [defaultState]
   *          A default set of properties to populate the newly-stateful object's
   *          `state` property.
   *
   * @return {Object}
   *          Returns the `target`.
   */

  function stateful(target, defaultState) {
    assign(target, StatefulMixin); // This happens after the mixing-in because we need to replace the `state`
    // added in that step.

    target.state = assign({}, target.state, defaultState); // Auto-bind the `handleStateChanged` method of the target object if it exists.

    if (typeof target.handleStateChanged === 'function' && isEvented(target)) {
      target.on('statechanged', target.handleStateChanged);
    }

    return target;
  }

  /**
   * @file to-title-case.js
   * @module to-title-case
   */

  /**
   * Uppercase the first letter of a string.
   *
   * @param {string} string
   *        String to be uppercased
   *
   * @return {string}
   *         The string with an uppercased first letter
   */
  function toTitleCase(string) {
    if (typeof string !== 'string') {
      return string;
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  /**
   * Compares the TitleCase versions of the two strings for equality.
   *
   * @param {string} str1
   *        The first string to compare
   *
   * @param {string} str2
   *        The second string to compare
   *
   * @return {boolean}
   *         Whether the TitleCase versions of the strings are equal
   */

  function titleCaseEquals(str1, str2) {
    return toTitleCase(str1) === toTitleCase(str2);
  }

  /**
   * @file merge-options.js
   * @module merge-options
   */
  /**
   * Merge two objects recursively.
   *
   * Performs a deep merge like
   * {@link https://lodash.com/docs/4.17.10#merge|lodash.merge}, but only merges
   * plain objects (not arrays, elements, or anything else).
   *
   * Non-plain object values will be copied directly from the right-most
   * argument.
   *
   * @static
   * @param   {Object[]} sources
   *          One or more objects to merge into a new object.
   *
   * @return {Object}
   *          A new object that is the merged result of all sources.
   */

  function mergeOptions() {
    var result = {};

    for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
      sources[_key] = arguments[_key];
    }

    sources.forEach(function (source) {
      if (!source) {
        return;
      }

      each(source, function (value, key) {
        if (!isPlain(value)) {
          result[key] = value;
          return;
        }

        if (!isPlain(result[key])) {
          result[key] = {};
        }

        result[key] = mergeOptions(result[key], value);
      });
    });
    return result;
  }

  /**
   * Player Component - Base class for all UI objects
   *
   * @file component.js
   */
  /**
   * Base class for all UI Components.
   * Components are UI objects which represent both a javascript object and an element
   * in the DOM. They can be children of other components, and can have
   * children themselves.
   *
   * Components can also use methods from {@link EventTarget}
   */

  var Component =
  /*#__PURE__*/
  function () {
    /**
     * A callback that is called when a component is ready. Does not have any
     * paramters and any callback value will be ignored.
     *
     * @callback Component~ReadyCallback
     * @this Component
     */

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Object[]} [options.children]
     *        An array of children objects to intialize this component with. Children objects have
     *        a name property that will be used if more than one component of the same type needs to be
     *        added.
     *
     * @param {Component~ReadyCallback} [ready]
     *        Function that gets called when the `Component` is ready.
     */
    function Component(player, options, ready) {
      // The component might be the player itself and we can't pass `this` to super
      if (!player && this.play) {
        this.player_ = player = this; // eslint-disable-line
      } else {
        this.player_ = player;
      } // Hold the reference to the parent component via `addChild` method


      this.parentComponent_ = null; // Make a copy of prototype.options_ to protect against overriding defaults

      this.options_ = mergeOptions({}, this.options_); // Updated options with supplied options

      options = this.options_ = mergeOptions(this.options_, options); // Get ID from options or options element if one is supplied

      this.id_ = options.id || options.el && options.el.id; // If there was no ID from the options, generate one

      if (!this.id_) {
        // Don't require the player ID function in the case of mock players
        var id = player && player.id && player.id() || 'no_player';
        this.id_ = id + "_component_" + newGUID();
      }

      this.name_ = options.name || null; // Create element if one wasn't provided in options

      if (options.el) {
        this.el_ = options.el;
      } else if (options.createEl !== false) {
        this.el_ = this.createEl();
      } // if evented is anything except false, we want to mixin in evented


      if (options.evented !== false) {
        // Make this an evented object and use `el_`, if available, as its event bus
        evented(this, {
          eventBusKey: this.el_ ? 'el_' : null
        });
      }

      stateful(this, this.constructor.defaultState);
      this.children_ = [];
      this.childIndex_ = {};
      this.childNameIndex_ = {}; // Add any child components in options

      if (options.initChildren !== false) {
        this.initChildren();
      }

      this.ready(ready); // Don't want to trigger ready here or it will before init is actually
      // finished for all children that run this constructor

      if (options.reportTouchActivity !== false) {
        this.enableTouchActivity();
      }
    }
    /**
     * Dispose of the `Component` and all child components.
     *
     * @fires Component#dispose
     */


    var _proto = Component.prototype;

    _proto.dispose = function dispose() {
      /**
       * Triggered when a `Component` is disposed.
       *
       * @event Component#dispose
       * @type {EventTarget~Event}
       *
       * @property {boolean} [bubbles=false]
       *           set to false so that the close event does not
       *           bubble up
       */
      this.trigger({
        type: 'dispose',
        bubbles: false
      }); // Dispose all children.

      if (this.children_) {
        for (var i = this.children_.length - 1; i >= 0; i--) {
          if (this.children_[i].dispose) {
            this.children_[i].dispose();
          }
        }
      } // Delete child references


      this.children_ = null;
      this.childIndex_ = null;
      this.childNameIndex_ = null;
      this.parentComponent_ = null;

      if (this.el_) {
        // Remove element from DOM
        if (this.el_.parentNode) {
          this.el_.parentNode.removeChild(this.el_);
        }

        removeData(this.el_);
        this.el_ = null;
      } // remove reference to the player after disposing of the element


      this.player_ = null;
    }
    /**
     * Return the {@link Player} that the `Component` has attached to.
     *
     * @return {Player}
     *         The player that this `Component` has attached to.
     */
    ;

    _proto.player = function player() {
      return this.player_;
    }
    /**
     * Deep merge of options objects with new options.
     * > Note: When both `obj` and `options` contain properties whose values are objects.
     *         The two properties get merged using {@link module:mergeOptions}
     *
     * @param {Object} obj
     *        The object that contains new options.
     *
     * @return {Object}
     *         A new object of `this.options_` and `obj` merged together.
     *
     * @deprecated since version 5
     */
    ;

    _proto.options = function options(obj) {
      log.warn('this.options() has been deprecated and will be moved to the constructor in 6.0');

      if (!obj) {
        return this.options_;
      }

      this.options_ = mergeOptions(this.options_, obj);
      return this.options_;
    }
    /**
     * Get the `Component`s DOM element
     *
     * @return {Element}
     *         The DOM element for this `Component`.
     */
    ;

    _proto.el = function el() {
      return this.el_;
    }
    /**
     * Create the `Component`s DOM element.
     *
     * @param {string} [tagName]
     *        Element's DOM node type. e.g. 'div'
     *
     * @param {Object} [properties]
     *        An object of properties that should be set.
     *
     * @param {Object} [attributes]
     *        An object of attributes that should be set.
     *
     * @return {Element}
     *         The element that gets created.
     */
    ;

    _proto.createEl = function createEl$$1(tagName, properties, attributes) {
      return createEl(tagName, properties, attributes);
    }
    /**
     * Localize a string given the string in english.
     *
     * If tokens are provided, it'll try and run a simple token replacement on the provided string.
     * The tokens it looks for look like `{1}` with the index being 1-indexed into the tokens array.
     *
     * If a `defaultValue` is provided, it'll use that over `string`,
     * if a value isn't found in provided language files.
     * This is useful if you want to have a descriptive key for token replacement
     * but have a succinct localized string and not require `en.json` to be included.
     *
     * Currently, it is used for the progress bar timing.
     * ```js
     * {
     *   "progress bar timing: currentTime={1} duration={2}": "{1} of {2}"
     * }
     * ```
     * It is then used like so:
     * ```js
     * this.localize('progress bar timing: currentTime={1} duration{2}',
     *               [this.player_.currentTime(), this.player_.duration()],
     *               '{1} of {2}');
     * ```
     *
     * Which outputs something like: `01:23 of 24:56`.
     *
     *
     * @param {string} string
     *        The string to localize and the key to lookup in the language files.
     * @param {string[]} [tokens]
     *        If the current item has token replacements, provide the tokens here.
     * @param {string} [defaultValue]
     *        Defaults to `string`. Can be a default value to use for token replacement
     *        if the lookup key is needed to be separate.
     *
     * @return {string}
     *         The localized string or if no localization exists the english string.
     */
    ;

    _proto.localize = function localize(string, tokens, defaultValue) {
      if (defaultValue === void 0) {
        defaultValue = string;
      }

      var code = this.player_.language && this.player_.language();
      var languages = this.player_.languages && this.player_.languages();
      var language = languages && languages[code];
      var primaryCode = code && code.split('-')[0];
      var primaryLang = languages && languages[primaryCode];
      var localizedString = defaultValue;

      if (language && language[string]) {
        localizedString = language[string];
      } else if (primaryLang && primaryLang[string]) {
        localizedString = primaryLang[string];
      }

      if (tokens) {
        localizedString = localizedString.replace(/\{(\d+)\}/g, function (match, index) {
          var value = tokens[index - 1];
          var ret = value;

          if (typeof value === 'undefined') {
            ret = match;
          }

          return ret;
        });
      }

      return localizedString;
    }
    /**
     * Return the `Component`s DOM element. This is where children get inserted.
     * This will usually be the the same as the element returned in {@link Component#el}.
     *
     * @return {Element}
     *         The content element for this `Component`.
     */
    ;

    _proto.contentEl = function contentEl() {
      return this.contentEl_ || this.el_;
    }
    /**
     * Get this `Component`s ID
     *
     * @return {string}
     *         The id of this `Component`
     */
    ;

    _proto.id = function id() {
      return this.id_;
    }
    /**
     * Get the `Component`s name. The name gets used to reference the `Component`
     * and is set during registration.
     *
     * @return {string}
     *         The name of this `Component`.
     */
    ;

    _proto.name = function name() {
      return this.name_;
    }
    /**
     * Get an array of all child components
     *
     * @return {Array}
     *         The children
     */
    ;

    _proto.children = function children() {
      return this.children_;
    }
    /**
     * Returns the child `Component` with the given `id`.
     *
     * @param {string} id
     *        The id of the child `Component` to get.
     *
     * @return {Component|undefined}
     *         The child `Component` with the given `id` or undefined.
     */
    ;

    _proto.getChildById = function getChildById(id) {
      return this.childIndex_[id];
    }
    /**
     * Returns the child `Component` with the given `name`.
     *
     * @param {string} name
     *        The name of the child `Component` to get.
     *
     * @return {Component|undefined}
     *         The child `Component` with the given `name` or undefined.
     */
    ;

    _proto.getChild = function getChild(name) {
      if (!name) {
        return;
      }

      name = toTitleCase(name);
      return this.childNameIndex_[name];
    }
    /**
     * Add a child `Component` inside the current `Component`.
     *
     *
     * @param {string|Component} child
     *        The name or instance of a child to add.
     *
     * @param {Object} [options={}]
     *        The key/value store of options that will get passed to children of
     *        the child.
     *
     * @param {number} [index=this.children_.length]
     *        The index to attempt to add a child into.
     *
     * @return {Component}
     *         The `Component` that gets added as a child. When using a string the
     *         `Component` will get created by this process.
     */
    ;

    _proto.addChild = function addChild(child, options, index) {
      if (options === void 0) {
        options = {};
      }

      if (index === void 0) {
        index = this.children_.length;
      }

      var component;
      var componentName; // If child is a string, create component with options

      if (typeof child === 'string') {
        componentName = toTitleCase(child);
        var componentClassName = options.componentClass || componentName; // Set name through options

        options.name = componentName; // Create a new object & element for this controls set
        // If there's no .player_, this is a player

        var ComponentClass = Component.getComponent(componentClassName);

        if (!ComponentClass) {
          throw new Error("Component " + componentClassName + " does not exist");
        } // data stored directly on the videojs object may be
        // misidentified as a component to retain
        // backwards-compatibility with 4.x. check to make sure the
        // component class can be instantiated.


        if (typeof ComponentClass !== 'function') {
          return null;
        }

        component = new ComponentClass(this.player_ || this, options); // child is a component instance
      } else {
        component = child;
      }

      if (component.parentComponent_) {
        component.parentComponent_.removeChild(component);
      }

      this.children_.splice(index, 0, component);
      component.parentComponent_ = this;

      if (typeof component.id === 'function') {
        this.childIndex_[component.id()] = component;
      } // If a name wasn't used to create the component, check if we can use the
      // name function of the component


      componentName = componentName || component.name && toTitleCase(component.name());

      if (componentName) {
        this.childNameIndex_[componentName] = component;
      } // Add the UI object's element to the container div (box)
      // Having an element is not required


      if (typeof component.el === 'function' && component.el()) {
        var childNodes = this.contentEl().children;
        var refNode = childNodes[index] || null;
        this.contentEl().insertBefore(component.el(), refNode);
      } // Return so it can stored on parent object if desired.


      return component;
    }
    /**
     * Remove a child `Component` from this `Component`s list of children. Also removes
     * the child `Component`s element from this `Component`s element.
     *
     * @param {Component} component
     *        The child `Component` to remove.
     */
    ;

    _proto.removeChild = function removeChild(component) {
      if (typeof component === 'string') {
        component = this.getChild(component);
      }

      if (!component || !this.children_) {
        return;
      }

      var childFound = false;

      for (var i = this.children_.length - 1; i >= 0; i--) {
        if (this.children_[i] === component) {
          childFound = true;
          this.children_.splice(i, 1);
          break;
        }
      }

      if (!childFound) {
        return;
      }

      component.parentComponent_ = null;
      this.childIndex_[component.id()] = null;
      this.childNameIndex_[component.name()] = null;
      var compEl = component.el();

      if (compEl && compEl.parentNode === this.contentEl()) {
        this.contentEl().removeChild(component.el());
      }
    }
    /**
     * Add and initialize default child `Component`s based upon options.
     */
    ;

    _proto.initChildren = function initChildren() {
      var _this = this;

      var children = this.options_.children;

      if (children) {
        // `this` is `parent`
        var parentOptions = this.options_;

        var handleAdd = function handleAdd(child) {
          var name = child.name;
          var opts = child.opts; // Allow options for children to be set at the parent options
          // e.g. videojs(id, { controlBar: false });
          // instead of videojs(id, { children: { controlBar: false });

          if (parentOptions[name] !== undefined) {
            opts = parentOptions[name];
          } // Allow for disabling default components
          // e.g. options['children']['posterImage'] = false


          if (opts === false) {
            return;
          } // Allow options to be passed as a simple boolean if no configuration
          // is necessary.


          if (opts === true) {
            opts = {};
          } // We also want to pass the original player options
          // to each component as well so they don't need to
          // reach back into the player for options later.


          opts.playerOptions = _this.options_.playerOptions; // Create and add the child component.
          // Add a direct reference to the child by name on the parent instance.
          // If two of the same component are used, different names should be supplied
          // for each

          var newChild = _this.addChild(name, opts);

          if (newChild) {
            _this[name] = newChild;
          }
        }; // Allow for an array of children details to passed in the options


        var workingChildren;
        var Tech = Component.getComponent('Tech');

        if (Array.isArray(children)) {
          workingChildren = children;
        } else {
          workingChildren = Object.keys(children);
        }

        workingChildren // children that are in this.options_ but also in workingChildren  would
        // give us extra children we do not want. So, we want to filter them out.
        .concat(Object.keys(this.options_).filter(function (child) {
          return !workingChildren.some(function (wchild) {
            if (typeof wchild === 'string') {
              return child === wchild;
            }

            return child === wchild.name;
          });
        })).map(function (child) {
          var name;
          var opts;

          if (typeof child === 'string') {
            name = child;
            opts = children[name] || _this.options_[name] || {};
          } else {
            name = child.name;
            opts = child;
          }

          return {
            name: name,
            opts: opts
          };
        }).filter(function (child) {
          // we have to make sure that child.name isn't in the techOrder since
          // techs are registerd as Components but can't aren't compatible
          // See https://github.com/videojs/video.js/issues/2772
          var c = Component.getComponent(child.opts.componentClass || toTitleCase(child.name));
          return c && !Tech.isTech(c);
        }).forEach(handleAdd);
      }
    }
    /**
     * Builds the default DOM class name. Should be overriden by sub-components.
     *
     * @return {string}
     *         The DOM class name for this object.
     *
     * @abstract
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      // Child classes can include a function that does:
      // return 'CLASS NAME' + this._super();
      return '';
    }
    /**
     * Bind a listener to the component's ready state.
     * Different from event listeners in that if the ready event has already happened
     * it will trigger the function immediately.
     *
     * @return {Component}
     *         Returns itself; method can be chained.
     */
    ;

    _proto.ready = function ready(fn, sync) {
      if (sync === void 0) {
        sync = false;
      }

      if (!fn) {
        return;
      }

      if (!this.isReady_) {
        this.readyQueue_ = this.readyQueue_ || [];
        this.readyQueue_.push(fn);
        return;
      }

      if (sync) {
        fn.call(this);
      } else {
        // Call the function asynchronously by default for consistency
        this.setTimeout(fn, 1);
      }
    }
    /**
     * Trigger all the ready listeners for this `Component`.
     *
     * @fires Component#ready
     */
    ;

    _proto.triggerReady = function triggerReady() {
      this.isReady_ = true; // Ensure ready is triggered asynchronously

      this.setTimeout(function () {
        var readyQueue = this.readyQueue_; // Reset Ready Queue

        this.readyQueue_ = [];

        if (readyQueue && readyQueue.length > 0) {
          readyQueue.forEach(function (fn) {
            fn.call(this);
          }, this);
        } // Allow for using event listeners also

        /**
         * Triggered when a `Component` is ready.
         *
         * @event Component#ready
         * @type {EventTarget~Event}
         */


        this.trigger('ready');
      }, 1);
    }
    /**
     * Find a single DOM element matching a `selector`. This can be within the `Component`s
     * `contentEl()` or another custom context.
     *
     * @param {string} selector
     *        A valid CSS selector, which will be passed to `querySelector`.
     *
     * @param {Element|string} [context=this.contentEl()]
     *        A DOM element within which to query. Can also be a selector string in
     *        which case the first matching element will get used as context. If
     *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
     *        nothing it falls back to `document`.
     *
     * @return {Element|null}
     *         the dom element that was found, or null
     *
     * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
     */
    ;

    _proto.$ = function $$$1(selector, context) {
      return $(selector, context || this.contentEl());
    }
    /**
     * Finds all DOM element matching a `selector`. This can be within the `Component`s
     * `contentEl()` or another custom context.
     *
     * @param {string} selector
     *        A valid CSS selector, which will be passed to `querySelectorAll`.
     *
     * @param {Element|string} [context=this.contentEl()]
     *        A DOM element within which to query. Can also be a selector string in
     *        which case the first matching element will get used as context. If
     *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
     *        nothing it falls back to `document`.
     *
     * @return {NodeList}
     *         a list of dom elements that were found
     *
     * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
     */
    ;

    _proto.$$ = function $$$$1(selector, context) {
      return $$(selector, context || this.contentEl());
    }
    /**
     * Check if a component's element has a CSS class name.
     *
     * @param {string} classToCheck
     *        CSS class name to check.
     *
     * @return {boolean}
     *         - True if the `Component` has the class.
     *         - False if the `Component` does not have the class`
     */
    ;

    _proto.hasClass = function hasClass$$1(classToCheck) {
      return hasClass(this.el_, classToCheck);
    }
    /**
     * Add a CSS class name to the `Component`s element.
     *
     * @param {string} classToAdd
     *        CSS class name to add
     */
    ;

    _proto.addClass = function addClass$$1(classToAdd) {
      addClass(this.el_, classToAdd);
    }
    /**
     * Remove a CSS class name from the `Component`s element.
     *
     * @param {string} classToRemove
     *        CSS class name to remove
     */
    ;

    _proto.removeClass = function removeClass$$1(classToRemove) {
      removeClass(this.el_, classToRemove);
    }
    /**
     * Add or remove a CSS class name from the component's element.
     * - `classToToggle` gets added when {@link Component#hasClass} would return false.
     * - `classToToggle` gets removed when {@link Component#hasClass} would return true.
     *
     * @param  {string} classToToggle
     *         The class to add or remove based on (@link Component#hasClass}
     *
     * @param  {boolean|Dom~predicate} [predicate]
     *         An {@link Dom~predicate} function or a boolean
     */
    ;

    _proto.toggleClass = function toggleClass$$1(classToToggle, predicate) {
      toggleClass(this.el_, classToToggle, predicate);
    }
    /**
     * Show the `Component`s element if it is hidden by removing the
     * 'vjs-hidden' class name from it.
     */
    ;

    _proto.show = function show() {
      this.removeClass('vjs-hidden');
    }
    /**
     * Hide the `Component`s element if it is currently showing by adding the
     * 'vjs-hidden` class name to it.
     */
    ;

    _proto.hide = function hide() {
      this.addClass('vjs-hidden');
    }
    /**
     * Lock a `Component`s element in its visible state by adding the 'vjs-lock-showing'
     * class name to it. Used during fadeIn/fadeOut.
     *
     * @private
     */
    ;

    _proto.lockShowing = function lockShowing() {
      this.addClass('vjs-lock-showing');
    }
    /**
     * Unlock a `Component`s element from its visible state by removing the 'vjs-lock-showing'
     * class name from it. Used during fadeIn/fadeOut.
     *
     * @private
     */
    ;

    _proto.unlockShowing = function unlockShowing() {
      this.removeClass('vjs-lock-showing');
    }
    /**
     * Get the value of an attribute on the `Component`s element.
     *
     * @param {string} attribute
     *        Name of the attribute to get the value from.
     *
     * @return {string|null}
     *         - The value of the attribute that was asked for.
     *         - Can be an empty string on some browsers if the attribute does not exist
     *           or has no value
     *         - Most browsers will return null if the attibute does not exist or has
     *           no value.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute}
     */
    ;

    _proto.getAttribute = function getAttribute$$1(attribute) {
      return getAttribute(this.el_, attribute);
    }
    /**
     * Set the value of an attribute on the `Component`'s element
     *
     * @param {string} attribute
     *        Name of the attribute to set.
     *
     * @param {string} value
     *        Value to set the attribute to.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute}
     */
    ;

    _proto.setAttribute = function setAttribute$$1(attribute, value) {
      setAttribute(this.el_, attribute, value);
    }
    /**
     * Remove an attribute from the `Component`s element.
     *
     * @param {string} attribute
     *        Name of the attribute to remove.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute}
     */
    ;

    _proto.removeAttribute = function removeAttribute$$1(attribute) {
      removeAttribute(this.el_, attribute);
    }
    /**
     * Get or set the width of the component based upon the CSS styles.
     * See {@link Component#dimension} for more detailed information.
     *
     * @param {number|string} [num]
     *        The width that you want to set postfixed with '%', 'px' or nothing.
     *
     * @param {boolean} [skipListeners]
     *        Skip the componentresize event trigger
     *
     * @return {number|string}
     *         The width when getting, zero if there is no width. Can be a string
     *           postpixed with '%' or 'px'.
     */
    ;

    _proto.width = function width(num, skipListeners) {
      return this.dimension('width', num, skipListeners);
    }
    /**
     * Get or set the height of the component based upon the CSS styles.
     * See {@link Component#dimension} for more detailed information.
     *
     * @param {number|string} [num]
     *        The height that you want to set postfixed with '%', 'px' or nothing.
     *
     * @param {boolean} [skipListeners]
     *        Skip the componentresize event trigger
     *
     * @return {number|string}
     *         The width when getting, zero if there is no width. Can be a string
     *         postpixed with '%' or 'px'.
     */
    ;

    _proto.height = function height(num, skipListeners) {
      return this.dimension('height', num, skipListeners);
    }
    /**
     * Set both the width and height of the `Component` element at the same time.
     *
     * @param  {number|string} width
     *         Width to set the `Component`s element to.
     *
     * @param  {number|string} height
     *         Height to set the `Component`s element to.
     */
    ;

    _proto.dimensions = function dimensions(width, height) {
      // Skip componentresize listeners on width for optimization
      this.width(width, true);
      this.height(height);
    }
    /**
     * Get or set width or height of the `Component` element. This is the shared code
     * for the {@link Component#width} and {@link Component#height}.
     *
     * Things to know:
     * - If the width or height in an number this will return the number postfixed with 'px'.
     * - If the width/height is a percent this will return the percent postfixed with '%'
     * - Hidden elements have a width of 0 with `window.getComputedStyle`. This function
     *   defaults to the `Component`s `style.width` and falls back to `window.getComputedStyle`.
     *   See [this]{@link http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/}
     *   for more information
     * - If you want the computed style of the component, use {@link Component#currentWidth}
     *   and {@link {Component#currentHeight}
     *
     * @fires Component#componentresize
     *
     * @param {string} widthOrHeight
     8        'width' or 'height'
     *
     * @param  {number|string} [num]
     8         New dimension
     *
     * @param  {boolean} [skipListeners]
     *         Skip componentresize event trigger
     *
     * @return {number}
     *         The dimension when getting or 0 if unset
     */
    ;

    _proto.dimension = function dimension(widthOrHeight, num, skipListeners) {
      if (num !== undefined) {
        // Set to zero if null or literally NaN (NaN !== NaN)
        if (num === null || num !== num) {
          num = 0;
        } // Check if using css width/height (% or px) and adjust


        if (('' + num).indexOf('%') !== -1 || ('' + num).indexOf('px') !== -1) {
          this.el_.style[widthOrHeight] = num;
        } else if (num === 'auto') {
          this.el_.style[widthOrHeight] = '';
        } else {
          this.el_.style[widthOrHeight] = num + 'px';
        } // skipListeners allows us to avoid triggering the resize event when setting both width and height


        if (!skipListeners) {
          /**
           * Triggered when a component is resized.
           *
           * @event Component#componentresize
           * @type {EventTarget~Event}
           */
          this.trigger('componentresize');
        }

        return;
      } // Not setting a value, so getting it
      // Make sure element exists


      if (!this.el_) {
        return 0;
      } // Get dimension value from style


      var val = this.el_.style[widthOrHeight];
      var pxIndex = val.indexOf('px');

      if (pxIndex !== -1) {
        // Return the pixel value with no 'px'
        return parseInt(val.slice(0, pxIndex), 10);
      } // No px so using % or no style was set, so falling back to offsetWidth/height
      // If component has display:none, offset will return 0
      // TODO: handle display:none and no dimension style using px


      return parseInt(this.el_['offset' + toTitleCase(widthOrHeight)], 10);
    }
    /**
     * Get the computed width or the height of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @param {string} widthOrHeight
     *        A string containing 'width' or 'height'. Whichever one you want to get.
     *
     * @return {number}
     *         The dimension that gets asked for or 0 if nothing was set
     *         for that dimension.
     */
    ;

    _proto.currentDimension = function currentDimension(widthOrHeight) {
      var computedWidthOrHeight = 0;

      if (widthOrHeight !== 'width' && widthOrHeight !== 'height') {
        throw new Error('currentDimension only accepts width or height value');
      }

      if (typeof window$1.getComputedStyle === 'function') {
        var computedStyle = window$1.getComputedStyle(this.el_);
        computedWidthOrHeight = computedStyle.getPropertyValue(widthOrHeight) || computedStyle[widthOrHeight];
      } // remove 'px' from variable and parse as integer


      computedWidthOrHeight = parseFloat(computedWidthOrHeight); // if the computed value is still 0, it's possible that the browser is lying
      // and we want to check the offset values.
      // This code also runs wherever getComputedStyle doesn't exist.

      if (computedWidthOrHeight === 0) {
        var rule = "offset" + toTitleCase(widthOrHeight);
        computedWidthOrHeight = this.el_[rule];
      }

      return computedWidthOrHeight;
    }
    /**
     * An object that contains width and height values of the `Component`s
     * computed style. Uses `window.getComputedStyle`.
     *
     * @typedef {Object} Component~DimensionObject
     *
     * @property {number} width
     *           The width of the `Component`s computed style.
     *
     * @property {number} height
     *           The height of the `Component`s computed style.
     */

    /**
     * Get an object that contains computed width and height values of the
     * component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {Component~DimensionObject}
     *         The computed dimensions of the component's element.
     */
    ;

    _proto.currentDimensions = function currentDimensions() {
      return {
        width: this.currentDimension('width'),
        height: this.currentDimension('height')
      };
    }
    /**
     * Get the computed width of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {number}
     *         The computed width of the component's element.
     */
    ;

    _proto.currentWidth = function currentWidth() {
      return this.currentDimension('width');
    }
    /**
     * Get the computed height of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {number}
     *         The computed height of the component's element.
     */
    ;

    _proto.currentHeight = function currentHeight() {
      return this.currentDimension('height');
    }
    /**
     * Set the focus to this component
     */
    ;

    _proto.focus = function focus() {
      this.el_.focus();
    }
    /**
     * Remove the focus from this component
     */
    ;

    _proto.blur = function blur() {
      this.el_.blur();
    }
    /**
     * When this Component receives a `keydown` event which it does not process,
     *  it passes the event to the Player for handling.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      if (this.player_) {
        // We only stop propagation here because we want unhandled events to fall
        // back to the browser.
        event.stopPropagation();
        this.player_.handleKeyDown(event);
      }
    }
    /**
     * Many components used to have a `handleKeyPress` method, which was poorly
     * named because it listened to a `keydown` event. This method name now
     * delegates to `handleKeyDown`. This means anyone calling `handleKeyPress`
     * will not see their method calls stop working.
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to be called.
     */
    ;

    _proto.handleKeyPress = function handleKeyPress(event) {
      this.handleKeyDown(event);
    }
    /**
     * Emit a 'tap' events when touch event support gets detected. This gets used to
     * support toggling the controls through a tap on the video. They get enabled
     * because every sub-component would have extra overhead otherwise.
     *
     * @private
     * @fires Component#tap
     * @listens Component#touchstart
     * @listens Component#touchmove
     * @listens Component#touchleave
     * @listens Component#touchcancel
     * @listens Component#touchend
      */
    ;

    _proto.emitTapEvents = function emitTapEvents() {
      // Track the start time so we can determine how long the touch lasted
      var touchStart = 0;
      var firstTouch = null; // Maximum movement allowed during a touch event to still be considered a tap
      // Other popular libs use anywhere from 2 (hammer.js) to 15,
      // so 10 seems like a nice, round number.

      var tapMovementThreshold = 10; // The maximum length a touch can be while still being considered a tap

      var touchTimeThreshold = 200;
      var couldBeTap;
      this.on('touchstart', function (event) {
        // If more than one finger, don't consider treating this as a click
        if (event.touches.length === 1) {
          // Copy pageX/pageY from the object
          firstTouch = {
            pageX: event.touches[0].pageX,
            pageY: event.touches[0].pageY
          }; // Record start time so we can detect a tap vs. "touch and hold"

          touchStart = new Date().getTime(); // Reset couldBeTap tracking

          couldBeTap = true;
        }
      });
      this.on('touchmove', function (event) {
        // If more than one finger, don't consider treating this as a click
        if (event.touches.length > 1) {
          couldBeTap = false;
        } else if (firstTouch) {
          // Some devices will throw touchmoves for all but the slightest of taps.
          // So, if we moved only a small distance, this could still be a tap
          var xdiff = event.touches[0].pageX - firstTouch.pageX;
          var ydiff = event.touches[0].pageY - firstTouch.pageY;
          var touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

          if (touchDistance > tapMovementThreshold) {
            couldBeTap = false;
          }
        }
      });

      var noTap = function noTap() {
        couldBeTap = false;
      }; // TODO: Listen to the original target. http://youtu.be/DujfpXOKUp8?t=13m8s


      this.on('touchleave', noTap);
      this.on('touchcancel', noTap); // When the touch ends, measure how long it took and trigger the appropriate
      // event

      this.on('touchend', function (event) {
        firstTouch = null; // Proceed only if the touchmove/leave/cancel event didn't happen

        if (couldBeTap === true) {
          // Measure how long the touch lasted
          var touchTime = new Date().getTime() - touchStart; // Make sure the touch was less than the threshold to be considered a tap

          if (touchTime < touchTimeThreshold) {
            // Don't let browser turn this into a click
            event.preventDefault();
            /**
             * Triggered when a `Component` is tapped.
             *
             * @event Component#tap
             * @type {EventTarget~Event}
             */

            this.trigger('tap'); // It may be good to copy the touchend event object and change the
            // type to tap, if the other event properties aren't exact after
            // Events.fixEvent runs (e.g. event.target)
          }
        }
      });
    }
    /**
     * This function reports user activity whenever touch events happen. This can get
     * turned off by any sub-components that wants touch events to act another way.
     *
     * Report user touch activity when touch events occur. User activity gets used to
     * determine when controls should show/hide. It is simple when it comes to mouse
     * events, because any mouse event should show the controls. So we capture mouse
     * events that bubble up to the player and report activity when that happens.
     * With touch events it isn't as easy as `touchstart` and `touchend` toggle player
     * controls. So touch events can't help us at the player level either.
     *
     * User activity gets checked asynchronously. So what could happen is a tap event
     * on the video turns the controls off. Then the `touchend` event bubbles up to
     * the player. Which, if it reported user activity, would turn the controls right
     * back on. We also don't want to completely block touch events from bubbling up.
     * Furthermore a `touchmove` event and anything other than a tap, should not turn
     * controls back on.
     *
     * @listens Component#touchstart
     * @listens Component#touchmove
     * @listens Component#touchend
     * @listens Component#touchcancel
     */
    ;

    _proto.enableTouchActivity = function enableTouchActivity() {
      // Don't continue if the root player doesn't support reporting user activity
      if (!this.player() || !this.player().reportUserActivity) {
        return;
      } // listener for reporting that the user is active


      var report = bind(this.player(), this.player().reportUserActivity);
      var touchHolding;
      this.on('touchstart', function () {
        report(); // For as long as the they are touching the device or have their mouse down,
        // we consider them active even if they're not moving their finger or mouse.
        // So we want to continue to update that they are active

        this.clearInterval(touchHolding); // report at the same interval as activityCheck

        touchHolding = this.setInterval(report, 250);
      });

      var touchEnd = function touchEnd(event) {
        report(); // stop the interval that maintains activity if the touch is holding

        this.clearInterval(touchHolding);
      };

      this.on('touchmove', report);
      this.on('touchend', touchEnd);
      this.on('touchcancel', touchEnd);
    }
    /**
     * A callback that has no parameters and is bound into `Component`s context.
     *
     * @callback Component~GenericCallback
     * @this Component
     */

    /**
     * Creates a function that runs after an `x` millisecond timeout. This function is a
     * wrapper around `window.setTimeout`. There are a few reasons to use this one
     * instead though:
     * 1. It gets cleared via  {@link Component#clearTimeout} when
     *    {@link Component#dispose} gets called.
     * 2. The function callback will gets turned into a {@link Component~GenericCallback}
     *
     * > Note: You can't use `window.clearTimeout` on the id returned by this function. This
     *         will cause its dispose listener not to get cleaned up! Please use
     *         {@link Component#clearTimeout} or {@link Component#dispose} instead.
     *
     * @param {Component~GenericCallback} fn
     *        The function that will be run after `timeout`.
     *
     * @param {number} timeout
     *        Timeout in milliseconds to delay before executing the specified function.
     *
     * @return {number}
     *         Returns a timeout ID that gets used to identify the timeout. It can also
     *         get used in {@link Component#clearTimeout} to clear the timeout that
     *         was set.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout}
     */
    ;

    _proto.setTimeout = function setTimeout(fn, timeout) {
      var _this2 = this;

      // declare as variables so they are properly available in timeout function
      // eslint-disable-next-line
      var timeoutId, disposeFn;
      fn = bind(this, fn);
      timeoutId = window$1.setTimeout(function () {
        _this2.off('dispose', disposeFn);

        fn();
      }, timeout);

      disposeFn = function disposeFn() {
        return _this2.clearTimeout(timeoutId);
      };

      disposeFn.guid = "vjs-timeout-" + timeoutId;
      this.on('dispose', disposeFn);
      return timeoutId;
    }
    /**
     * Clears a timeout that gets created via `window.setTimeout` or
     * {@link Component#setTimeout}. If you set a timeout via {@link Component#setTimeout}
     * use this function instead of `window.clearTimout`. If you don't your dispose
     * listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} timeoutId
     *        The id of the timeout to clear. The return value of
     *        {@link Component#setTimeout} or `window.setTimeout`.
     *
     * @return {number}
     *         Returns the timeout id that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout}
     */
    ;

    _proto.clearTimeout = function clearTimeout(timeoutId) {
      window$1.clearTimeout(timeoutId);

      var disposeFn = function disposeFn() {};

      disposeFn.guid = "vjs-timeout-" + timeoutId;
      this.off('dispose', disposeFn);
      return timeoutId;
    }
    /**
     * Creates a function that gets run every `x` milliseconds. This function is a wrapper
     * around `window.setInterval`. There are a few reasons to use this one instead though.
     * 1. It gets cleared via  {@link Component#clearInterval} when
     *    {@link Component#dispose} gets called.
     * 2. The function callback will be a {@link Component~GenericCallback}
     *
     * @param {Component~GenericCallback} fn
     *        The function to run every `x` seconds.
     *
     * @param {number} interval
     *        Execute the specified function every `x` milliseconds.
     *
     * @return {number}
     *         Returns an id that can be used to identify the interval. It can also be be used in
     *         {@link Component#clearInterval} to clear the interval.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval}
     */
    ;

    _proto.setInterval = function setInterval(fn, interval) {
      var _this3 = this;

      fn = bind(this, fn);
      var intervalId = window$1.setInterval(fn, interval);

      var disposeFn = function disposeFn() {
        return _this3.clearInterval(intervalId);
      };

      disposeFn.guid = "vjs-interval-" + intervalId;
      this.on('dispose', disposeFn);
      return intervalId;
    }
    /**
     * Clears an interval that gets created via `window.setInterval` or
     * {@link Component#setInterval}. If you set an inteval via {@link Component#setInterval}
     * use this function instead of `window.clearInterval`. If you don't your dispose
     * listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} intervalId
     *        The id of the interval to clear. The return value of
     *        {@link Component#setInterval} or `window.setInterval`.
     *
     * @return {number}
     *         Returns the interval id that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearInterval}
     */
    ;

    _proto.clearInterval = function clearInterval(intervalId) {
      window$1.clearInterval(intervalId);

      var disposeFn = function disposeFn() {};

      disposeFn.guid = "vjs-interval-" + intervalId;
      this.off('dispose', disposeFn);
      return intervalId;
    }
    /**
     * Queues up a callback to be passed to requestAnimationFrame (rAF), but
     * with a few extra bonuses:
     *
     * - Supports browsers that do not support rAF by falling back to
     *   {@link Component#setTimeout}.
     *
     * - The callback is turned into a {@link Component~GenericCallback} (i.e.
     *   bound to the component).
     *
     * - Automatic cancellation of the rAF callback is handled if the component
     *   is disposed before it is called.
     *
     * @param  {Component~GenericCallback} fn
     *         A function that will be bound to this component and executed just
     *         before the browser's next repaint.
     *
     * @return {number}
     *         Returns an rAF ID that gets used to identify the timeout. It can
     *         also be used in {@link Component#cancelAnimationFrame} to cancel
     *         the animation frame callback.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}
     */
    ;

    _proto.requestAnimationFrame = function requestAnimationFrame(fn) {
      var _this4 = this;

      // declare as variables so they are properly available in rAF function
      // eslint-disable-next-line
      var id, disposeFn;

      if (this.supportsRaf_) {
        fn = bind(this, fn);
        id = window$1.requestAnimationFrame(function () {
          _this4.off('dispose', disposeFn);

          fn();
        });

        disposeFn = function disposeFn() {
          return _this4.cancelAnimationFrame(id);
        };

        disposeFn.guid = "vjs-raf-" + id;
        this.on('dispose', disposeFn);
        return id;
      } // Fall back to using a timer.


      return this.setTimeout(fn, 1000 / 60);
    }
    /**
     * Cancels a queued callback passed to {@link Component#requestAnimationFrame}
     * (rAF).
     *
     * If you queue an rAF callback via {@link Component#requestAnimationFrame},
     * use this function instead of `window.cancelAnimationFrame`. If you don't,
     * your dispose listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} id
     *        The rAF ID to clear. The return value of {@link Component#requestAnimationFrame}.
     *
     * @return {number}
     *         Returns the rAF ID that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame}
     */
    ;

    _proto.cancelAnimationFrame = function cancelAnimationFrame(id) {
      if (this.supportsRaf_) {
        window$1.cancelAnimationFrame(id);

        var disposeFn = function disposeFn() {};

        disposeFn.guid = "vjs-raf-" + id;
        this.off('dispose', disposeFn);
        return id;
      } // Fall back to using a timer.


      return this.clearTimeout(id);
    }
    /**
     * Register a `Component` with `videojs` given the name and the component.
     *
     * > NOTE: {@link Tech}s should not be registered as a `Component`. {@link Tech}s
     *         should be registered using {@link Tech.registerTech} or
     *         {@link videojs:videojs.registerTech}.
     *
     * > NOTE: This function can also be seen on videojs as
     *         {@link videojs:videojs.registerComponent}.
     *
     * @param {string} name
     *        The name of the `Component` to register.
     *
     * @param {Component} ComponentToRegister
     *        The `Component` class to register.
     *
     * @return {Component}
     *         The `Component` that was registered.
     */
    ;

    Component.registerComponent = function registerComponent(name, ComponentToRegister) {
      if (typeof name !== 'string' || !name) {
        throw new Error("Illegal component name, \"" + name + "\"; must be a non-empty string.");
      }

      var Tech = Component.getComponent('Tech'); // We need to make sure this check is only done if Tech has been registered.

      var isTech = Tech && Tech.isTech(ComponentToRegister);
      var isComp = Component === ComponentToRegister || Component.prototype.isPrototypeOf(ComponentToRegister.prototype);

      if (isTech || !isComp) {
        var reason;

        if (isTech) {
          reason = 'techs must be registered using Tech.registerTech()';
        } else {
          reason = 'must be a Component subclass';
        }

        throw new Error("Illegal component, \"" + name + "\"; " + reason + ".");
      }

      name = toTitleCase(name);

      if (!Component.components_) {
        Component.components_ = {};
      }

      var Player = Component.getComponent('Player');

      if (name === 'Player' && Player && Player.players) {
        var players = Player.players;
        var playerNames = Object.keys(players); // If we have players that were disposed, then their name will still be
        // in Players.players. So, we must loop through and verify that the value
        // for each item is not null. This allows registration of the Player component
        // after all players have been disposed or before any were created.

        if (players && playerNames.length > 0 && playerNames.map(function (pname) {
          return players[pname];
        }).every(Boolean)) {
          throw new Error('Can not register Player component after player has been created.');
        }
      }

      Component.components_[name] = ComponentToRegister;
      return ComponentToRegister;
    }
    /**
     * Get a `Component` based on the name it was registered with.
     *
     * @param {string} name
     *        The Name of the component to get.
     *
     * @return {Component}
     *         The `Component` that got registered under the given name.
     *
     * @deprecated In `videojs` 6 this will not return `Component`s that were not
     *             registered using {@link Component.registerComponent}. Currently we
     *             check the global `videojs` object for a `Component` name and
     *             return that if it exists.
     */
    ;

    Component.getComponent = function getComponent(name) {
      if (!name) {
        return;
      }

      name = toTitleCase(name);

      if (Component.components_ && Component.components_[name]) {
        return Component.components_[name];
      }
    };

    return Component;
  }();
  /**
   * Whether or not this component supports `requestAnimationFrame`.
   *
   * This is exposed primarily for testing purposes.
   *
   * @private
   * @type {Boolean}
   */


  Component.prototype.supportsRaf_ = typeof window$1.requestAnimationFrame === 'function' && typeof window$1.cancelAnimationFrame === 'function';
  Component.registerComponent('Component', Component);

  /**
   * @file browser.js
   * @module browser
   */
  var USER_AGENT = window$1.navigator && window$1.navigator.userAgent || '';
  var webkitVersionMap = /AppleWebKit\/([\d.]+)/i.exec(USER_AGENT);
  var appleWebkitVersion = webkitVersionMap ? parseFloat(webkitVersionMap.pop()) : null;
  /**
   * Whether or not this device is an iPad.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IPAD = /iPad/i.test(USER_AGENT);
  /**
   * Whether or not this device is an iPhone.
   *
   * @static
   * @const
   * @type {Boolean}
   */
  // The Facebook app's UIWebView identifies as both an iPhone and iPad, so
  // to identify iPhones, we need to exclude iPads.
  // http://artsy.github.io/blog/2012/10/18/the-perils-of-ios-user-agent-sniffing/

  var IS_IPHONE = /iPhone/i.test(USER_AGENT) && !IS_IPAD;
  /**
   * Whether or not this device is an iPod.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IPOD = /iPod/i.test(USER_AGENT);
  /**
   * Whether or not this is an iOS device.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IOS = IS_IPHONE || IS_IPAD || IS_IPOD;
  /**
   * The detected iOS version - or `null`.
   *
   * @static
   * @const
   * @type {string|null}
   */

  var IOS_VERSION = function () {
    var match = USER_AGENT.match(/OS (\d+)_/i);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  }();
  /**
   * Whether or not this is an Android device.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_ANDROID = /Android/i.test(USER_AGENT);
  /**
   * The detected Android version - or `null`.
   *
   * @static
   * @const
   * @type {number|string|null}
   */

  var ANDROID_VERSION = function () {
    // This matches Android Major.Minor.Patch versions
    // ANDROID_VERSION is Major.Minor as a Number, if Minor isn't available, then only Major is returned
    var match = USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);

    if (!match) {
      return null;
    }

    var major = match[1] && parseFloat(match[1]);
    var minor = match[2] && parseFloat(match[2]);

    if (major && minor) {
      return parseFloat(match[1] + '.' + match[2]);
    } else if (major) {
      return major;
    }

    return null;
  }();
  /**
   * Whether or not this is a native Android browser.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_NATIVE_ANDROID = IS_ANDROID && ANDROID_VERSION < 5 && appleWebkitVersion < 537;
  /**
   * Whether or not this is Mozilla Firefox.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_FIREFOX = /Firefox/i.test(USER_AGENT);
  /**
   * Whether or not this is Microsoft Edge.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_EDGE = /Edge/i.test(USER_AGENT);
  /**
   * Whether or not this is Google Chrome.
   *
   * This will also be `true` for Chrome on iOS, which will have different support
   * as it is actually Safari under the hood.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_CHROME = !IS_EDGE && (/Chrome/i.test(USER_AGENT) || /CriOS/i.test(USER_AGENT));
  /**
   * The detected Google Chrome version - or `null`.
   *
   * @static
   * @const
   * @type {number|null}
   */

  var CHROME_VERSION = function () {
    var match = USER_AGENT.match(/(Chrome|CriOS)\/(\d+)/);

    if (match && match[2]) {
      return parseFloat(match[2]);
    }

    return null;
  }();
  /**
   * The detected Internet Explorer version - or `null`.
   *
   * @static
   * @const
   * @type {number|null}
   */

  var IE_VERSION = function () {
    var result = /MSIE\s(\d+)\.\d/.exec(USER_AGENT);
    var version = result && parseFloat(result[1]);

    if (!version && /Trident\/7.0/i.test(USER_AGENT) && /rv:11.0/.test(USER_AGENT)) {
      // IE 11 has a different user agent string than other IE versions
      version = 11.0;
    }

    return version;
  }();
  /**
   * Whether or not this is desktop Safari.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_SAFARI = /Safari/i.test(USER_AGENT) && !IS_CHROME && !IS_ANDROID && !IS_EDGE;
  /**
   * Whether or not this is any flavor of Safari - including iOS.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_ANY_SAFARI = (IS_SAFARI || IS_IOS) && !IS_CHROME;
  /**
   * Whether or not this device is touch-enabled.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var TOUCH_ENABLED = isReal() && ('ontouchstart' in window$1 || window$1.navigator.maxTouchPoints || window$1.DocumentTouch && window$1.document instanceof window$1.DocumentTouch);

  var browser = /*#__PURE__*/Object.freeze({
    IS_IPAD: IS_IPAD,
    IS_IPHONE: IS_IPHONE,
    IS_IPOD: IS_IPOD,
    IS_IOS: IS_IOS,
    IOS_VERSION: IOS_VERSION,
    IS_ANDROID: IS_ANDROID,
    ANDROID_VERSION: ANDROID_VERSION,
    IS_NATIVE_ANDROID: IS_NATIVE_ANDROID,
    IS_FIREFOX: IS_FIREFOX,
    IS_EDGE: IS_EDGE,
    IS_CHROME: IS_CHROME,
    CHROME_VERSION: CHROME_VERSION,
    IE_VERSION: IE_VERSION,
    IS_SAFARI: IS_SAFARI,
    IS_ANY_SAFARI: IS_ANY_SAFARI,
    TOUCH_ENABLED: TOUCH_ENABLED
  });

  /**
   * @file time-ranges.js
   * @module time-ranges
   */

  /**
   * Returns the time for the specified index at the start or end
   * of a TimeRange object.
   *
   * @typedef    {Function} TimeRangeIndex
   *
   * @param      {number} [index=0]
   *             The range number to return the time for.
   *
   * @return     {number}
   *             The time offset at the specified index.
   *
   * @deprecated The index argument must be provided.
   *             In the future, leaving it out will throw an error.
   */

  /**
   * An object that contains ranges of time.
   *
   * @typedef  {Object} TimeRange
   *
   * @property {number} length
   *           The number of time ranges represented by this object.
   *
   * @property {module:time-ranges~TimeRangeIndex} start
   *           Returns the time offset at which a specified time range begins.
   *
   * @property {module:time-ranges~TimeRangeIndex} end
   *           Returns the time offset at which a specified time range ends.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges
   */

  /**
   * Check if any of the time ranges are over the maximum index.
   *
   * @private
   * @param   {string} fnName
   *          The function name to use for logging
   *
   * @param   {number} index
   *          The index to check
   *
   * @param   {number} maxIndex
   *          The maximum possible index
   *
   * @throws  {Error} if the timeRanges provided are over the maxIndex
   */
  function rangeCheck(fnName, index, maxIndex) {
    if (typeof index !== 'number' || index < 0 || index > maxIndex) {
      throw new Error("Failed to execute '" + fnName + "' on 'TimeRanges': The index provided (" + index + ") is non-numeric or out of bounds (0-" + maxIndex + ").");
    }
  }
  /**
   * Get the time for the specified index at the start or end
   * of a TimeRange object.
   *
   * @private
   * @param      {string} fnName
   *             The function name to use for logging
   *
   * @param      {string} valueIndex
   *             The property that should be used to get the time. should be
   *             'start' or 'end'
   *
   * @param      {Array} ranges
   *             An array of time ranges
   *
   * @param      {Array} [rangeIndex=0]
   *             The index to start the search at
   *
   * @return     {number}
   *             The time that offset at the specified index.
   *
   * @deprecated rangeIndex must be set to a value, in the future this will throw an error.
   * @throws     {Error} if rangeIndex is more than the length of ranges
   */


  function getRange(fnName, valueIndex, ranges, rangeIndex) {
    rangeCheck(fnName, rangeIndex, ranges.length - 1);
    return ranges[rangeIndex][valueIndex];
  }
  /**
   * Create a time range object given ranges of time.
   *
   * @private
   * @param   {Array} [ranges]
   *          An array of time ranges.
   */


  function createTimeRangesObj(ranges) {
    if (ranges === undefined || ranges.length === 0) {
      return {
        length: 0,
        start: function start() {
          throw new Error('This TimeRanges object is empty');
        },
        end: function end() {
          throw new Error('This TimeRanges object is empty');
        }
      };
    }

    return {
      length: ranges.length,
      start: getRange.bind(null, 'start', 0, ranges),
      end: getRange.bind(null, 'end', 1, ranges)
    };
  }
  /**
   * Create a `TimeRange` object which mimics an
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges|HTML5 TimeRanges instance}.
   *
   * @param {number|Array[]} start
   *        The start of a single range (a number) or an array of ranges (an
   *        array of arrays of two numbers each).
   *
   * @param {number} end
   *        The end of a single range. Cannot be used with the array form of
   *        the `start` argument.
   */


  function createTimeRanges(start, end) {
    if (Array.isArray(start)) {
      return createTimeRangesObj(start);
    } else if (start === undefined || end === undefined) {
      return createTimeRangesObj();
    }

    return createTimeRangesObj([[start, end]]);
  }

  /**
   * @file buffer.js
   * @module buffer
   */
  /**
   * Compute the percentage of the media that has been buffered.
   *
   * @param {TimeRange} buffered
   *        The current `TimeRange` object representing buffered time ranges
   *
   * @param {number} duration
   *        Total duration of the media
   *
   * @return {number}
   *         Percent buffered of the total duration in decimal form.
   */

  function bufferedPercent(buffered, duration) {
    var bufferedDuration = 0;
    var start;
    var end;

    if (!duration) {
      return 0;
    }

    if (!buffered || !buffered.length) {
      buffered = createTimeRanges(0, 0);
    }

    for (var i = 0; i < buffered.length; i++) {
      start = buffered.start(i);
      end = buffered.end(i); // buffered end can be bigger than duration by a very small fraction

      if (end > duration) {
        end = duration;
      }

      bufferedDuration += end - start;
    }

    return bufferedDuration / duration;
  }

  /**
   * @file fullscreen-api.js
   * @module fullscreen-api
   * @private
   */
  /**
   * Store the browser-specific methods for the fullscreen API.
   *
   * @type {Object}
   * @see [Specification]{@link https://fullscreen.spec.whatwg.org}
   * @see [Map Approach From Screenfull.js]{@link https://github.com/sindresorhus/screenfull.js}
   */

  var FullscreenApi = {}; // browser API methods

  var apiMap = [['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror', 'fullscreen'], // WebKit
  ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror', '-webkit-full-screen'], // Mozilla
  ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror', '-moz-full-screen'], // Microsoft
  ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError', '-ms-fullscreen']];
  var specApi = apiMap[0];
  var browserApi;
  var prefixedAPI = false; // determine the supported set of functions

  for (var i = 0; i < apiMap.length; i++) {
    // check for exitFullscreen function
    if (apiMap[i][1] in document) {
      browserApi = apiMap[i];
      break;
    }
  } // map the browser API names to the spec API names


  if (browserApi) {
    for (var _i = 0; _i < browserApi.length; _i++) {
      FullscreenApi[specApi[_i]] = browserApi[_i];
    }

    prefixedAPI = browserApi[0] === specApi[0];
  }

  /**
   * @file media-error.js
   */
  /**
   * A Custom `MediaError` class which mimics the standard HTML5 `MediaError` class.
   *
   * @param {number|string|Object|MediaError} value
   *        This can be of multiple types:
   *        - number: should be a standard error code
   *        - string: an error message (the code will be 0)
   *        - Object: arbitrary properties
   *        - `MediaError` (native): used to populate a video.js `MediaError` object
   *        - `MediaError` (video.js): will return itself if it's already a
   *          video.js `MediaError` object.
   *
   * @see [MediaError Spec]{@link https://dev.w3.org/html5/spec-author-view/video.html#mediaerror}
   * @see [Encrypted MediaError Spec]{@link https://www.w3.org/TR/2013/WD-encrypted-media-20130510/#error-codes}
   *
   * @class MediaError
   */

  function MediaError(value) {
    // Allow redundant calls to this constructor to avoid having `instanceof`
    // checks peppered around the code.
    if (value instanceof MediaError) {
      return value;
    }

    if (typeof value === 'number') {
      this.code = value;
    } else if (typeof value === 'string') {
      // default code is zero, so this is a custom error
      this.message = value;
    } else if (isObject(value)) {
      // We assign the `code` property manually because native `MediaError` objects
      // do not expose it as an own/enumerable property of the object.
      if (typeof value.code === 'number') {
        this.code = value.code;
      }

      assign(this, value);
    }

    if (!this.message) {
      this.message = MediaError.defaultMessages[this.code] || '';
    }
  }
  /**
   * The error code that refers two one of the defined `MediaError` types
   *
   * @type {Number}
   */


  MediaError.prototype.code = 0;
  /**
   * An optional message that to show with the error. Message is not part of the HTML5
   * video spec but allows for more informative custom errors.
   *
   * @type {String}
   */

  MediaError.prototype.message = '';
  /**
   * An optional status code that can be set by plugins to allow even more detail about
   * the error. For example a plugin might provide a specific HTTP status code and an
   * error message for that code. Then when the plugin gets that error this class will
   * know how to display an error message for it. This allows a custom message to show
   * up on the `Player` error overlay.
   *
   * @type {Array}
   */

  MediaError.prototype.status = null;
  /**
   * Errors indexed by the W3C standard. The order **CANNOT CHANGE**! See the
   * specification listed under {@link MediaError} for more information.
   *
   * @enum {array}
   * @readonly
   * @property {string} 0 - MEDIA_ERR_CUSTOM
   * @property {string} 1 - MEDIA_ERR_ABORTED
   * @property {string} 2 - MEDIA_ERR_NETWORK
   * @property {string} 3 - MEDIA_ERR_DECODE
   * @property {string} 4 - MEDIA_ERR_SRC_NOT_SUPPORTED
   * @property {string} 5 - MEDIA_ERR_ENCRYPTED
   */

  MediaError.errorTypes = ['MEDIA_ERR_CUSTOM', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED', 'MEDIA_ERR_ENCRYPTED'];
  /**
   * The default `MediaError` messages based on the {@link MediaError.errorTypes}.
   *
   * @type {Array}
   * @constant
   */

  MediaError.defaultMessages = {
    1: 'You aborted the media playback',
    2: 'A network error caused the media download to fail part-way.',
    3: 'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.',
    4: 'The media could not be loaded, either because the server or network failed or because the format is not supported.',
    5: 'The media is encrypted and we do not have the keys to decrypt it.'
  }; // Add types as properties on MediaError
  // e.g. MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

  for (var errNum = 0; errNum < MediaError.errorTypes.length; errNum++) {
    MediaError[MediaError.errorTypes[errNum]] = errNum; // values should be accessible on both the class and instance

    MediaError.prototype[MediaError.errorTypes[errNum]] = errNum;
  } // jsdocs for instance/static members added above

  var tuple = SafeParseTuple;

  function SafeParseTuple(obj, reviver) {
    var json;
    var error = null;

    try {
      json = JSON.parse(obj, reviver);
    } catch (err) {
      error = err;
    }

    return [error, json];
  }

  /**
   * Returns whether an object is `Promise`-like (i.e. has a `then` method).
   *
   * @param  {Object}  value
   *         An object that may or may not be `Promise`-like.
   *
   * @return {boolean}
   *         Whether or not the object is `Promise`-like.
   */
  function isPromise(value) {
    return value !== undefined && value !== null && typeof value.then === 'function';
  }
  /**
   * Silence a Promise-like object.
   *
   * This is useful for avoiding non-harmful, but potentially confusing "uncaught
   * play promise" rejection error messages.
   *
   * @param  {Object} value
   *         An object that may or may not be `Promise`-like.
   */

  function silencePromise(value) {
    if (isPromise(value)) {
      value.then(null, function (e) {});
    }
  }

  /**
   * @file text-track-list-converter.js Utilities for capturing text track state and
   * re-creating tracks based on a capture.
   *
   * @module text-track-list-converter
   */

  /**
   * Examine a single {@link TextTrack} and return a JSON-compatible javascript object that
   * represents the {@link TextTrack}'s state.
   *
   * @param {TextTrack} track
   *        The text track to query.
   *
   * @return {Object}
   *         A serializable javascript representation of the TextTrack.
   * @private
   */
  var trackToJson_ = function trackToJson_(track) {
    var ret = ['kind', 'label', 'language', 'id', 'inBandMetadataTrackDispatchType', 'mode', 'src'].reduce(function (acc, prop, i) {
      if (track[prop]) {
        acc[prop] = track[prop];
      }

      return acc;
    }, {
      cues: track.cues && Array.prototype.map.call(track.cues, function (cue) {
        return {
          startTime: cue.startTime,
          endTime: cue.endTime,
          text: cue.text,
          id: cue.id
        };
      })
    });
    return ret;
  };
  /**
   * Examine a {@link Tech} and return a JSON-compatible javascript array that represents the
   * state of all {@link TextTrack}s currently configured. The return array is compatible with
   * {@link text-track-list-converter:jsonToTextTracks}.
   *
   * @param {Tech} tech
   *        The tech object to query
   *
   * @return {Array}
   *         A serializable javascript representation of the {@link Tech}s
   *         {@link TextTrackList}.
   */


  var textTracksToJson = function textTracksToJson(tech) {
    var trackEls = tech.$$('track');
    var trackObjs = Array.prototype.map.call(trackEls, function (t) {
      return t.track;
    });
    var tracks = Array.prototype.map.call(trackEls, function (trackEl) {
      var json = trackToJson_(trackEl.track);

      if (trackEl.src) {
        json.src = trackEl.src;
      }

      return json;
    });
    return tracks.concat(Array.prototype.filter.call(tech.textTracks(), function (track) {
      return trackObjs.indexOf(track) === -1;
    }).map(trackToJson_));
  };
  /**
   * Create a set of remote {@link TextTrack}s on a {@link Tech} based on an array of javascript
   * object {@link TextTrack} representations.
   *
   * @param {Array} json
   *        An array of `TextTrack` representation objects, like those that would be
   *        produced by `textTracksToJson`.
   *
   * @param {Tech} tech
   *        The `Tech` to create the `TextTrack`s on.
   */


  var jsonToTextTracks = function jsonToTextTracks(json, tech) {
    json.forEach(function (track) {
      var addedTrack = tech.addRemoteTextTrack(track).track;

      if (!track.src && track.cues) {
        track.cues.forEach(function (cue) {
          return addedTrack.addCue(cue);
        });
      }
    });
    return tech.textTracks();
  };

  var textTrackConverter = {
    textTracksToJson: textTracksToJson,
    jsonToTextTracks: jsonToTextTracks,
    trackToJson_: trackToJson_
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var keycode = createCommonjsModule(function (module, exports) {
    // Source: http://jsfiddle.net/vWx8V/
    // http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

    /**
     * Conenience method returns corresponding value for given keyName or keyCode.
     *
     * @param {Mixed} keyCode {Number} or keyName {String}
     * @return {Mixed}
     * @api public
     */
    function keyCode(searchInput) {
      // Keyboard Events
      if (searchInput && 'object' === typeof searchInput) {
        var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode;
        if (hasKeyCode) searchInput = hasKeyCode;
      } // Numbers


      if ('number' === typeof searchInput) return names[searchInput]; // Everything else (cast to string)

      var search = String(searchInput); // check codes

      var foundNamedKey = codes[search.toLowerCase()];
      if (foundNamedKey) return foundNamedKey; // check aliases

      var foundNamedKey = aliases[search.toLowerCase()];
      if (foundNamedKey) return foundNamedKey; // weird character?

      if (search.length === 1) return search.charCodeAt(0);
      return undefined;
    }
    /**
     * Compares a keyboard event with a given keyCode or keyName.
     *
     * @param {Event} event Keyboard event that should be tested
     * @param {Mixed} keyCode {Number} or keyName {String}
     * @return {Boolean}
     * @api public
     */


    keyCode.isEventKey = function isEventKey(event, nameOrCode) {
      if (event && 'object' === typeof event) {
        var keyCode = event.which || event.keyCode || event.charCode;

        if (keyCode === null || keyCode === undefined) {
          return false;
        }

        if (typeof nameOrCode === 'string') {
          // check codes
          var foundNamedKey = codes[nameOrCode.toLowerCase()];

          if (foundNamedKey) {
            return foundNamedKey === keyCode;
          } // check aliases


          var foundNamedKey = aliases[nameOrCode.toLowerCase()];

          if (foundNamedKey) {
            return foundNamedKey === keyCode;
          }
        } else if (typeof nameOrCode === 'number') {
          return nameOrCode === keyCode;
        }

        return false;
      }
    };

    exports = module.exports = keyCode;
    /**
     * Get by name
     *
     *   exports.code['enter'] // => 13
     */

    var codes = exports.code = exports.codes = {
      'backspace': 8,
      'tab': 9,
      'enter': 13,
      'shift': 16,
      'ctrl': 17,
      'alt': 18,
      'pause/break': 19,
      'caps lock': 20,
      'esc': 27,
      'space': 32,
      'page up': 33,
      'page down': 34,
      'end': 35,
      'home': 36,
      'left': 37,
      'up': 38,
      'right': 39,
      'down': 40,
      'insert': 45,
      'delete': 46,
      'command': 91,
      'left command': 91,
      'right command': 93,
      'numpad *': 106,
      'numpad +': 107,
      'numpad -': 109,
      'numpad .': 110,
      'numpad /': 111,
      'num lock': 144,
      'scroll lock': 145,
      'my computer': 182,
      'my calculator': 183,
      ';': 186,
      '=': 187,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      '`': 192,
      '[': 219,
      '\\': 220,
      ']': 221,
      "'": 222 // Helper aliases

    };
    var aliases = exports.aliases = {
      'windows': 91,
      '⇧': 16,
      '⌥': 18,
      '⌃': 17,
      '⌘': 91,
      'ctl': 17,
      'control': 17,
      'option': 18,
      'pause': 19,
      'break': 19,
      'caps': 20,
      'return': 13,
      'escape': 27,
      'spc': 32,
      'spacebar': 32,
      'pgup': 33,
      'pgdn': 34,
      'ins': 45,
      'del': 46,
      'cmd': 91
      /*!
       * Programatically add the following
       */
      // lower case chars

    };

    for (i = 97; i < 123; i++) {
      codes[String.fromCharCode(i)] = i - 32;
    } // numbers


    for (var i = 48; i < 58; i++) {
      codes[i - 48] = i;
    } // function keys


    for (i = 1; i < 13; i++) {
      codes['f' + i] = i + 111;
    } // numpad keys


    for (i = 0; i < 10; i++) {
      codes['numpad ' + i] = i + 96;
    }
    /**
     * Get by code
     *
     *   exports.name[13] // => 'Enter'
     */


    var names = exports.names = exports.title = {}; // title for backward compat
    // Create reverse mapping

    for (i in codes) {
      names[codes[i]] = i;
    } // Add aliases


    for (var alias in aliases) {
      codes[alias] = aliases[alias];
    }
  });
  var keycode_1 = keycode.code;
  var keycode_2 = keycode.codes;
  var keycode_3 = keycode.aliases;
  var keycode_4 = keycode.names;
  var keycode_5 = keycode.title;

  var MODAL_CLASS_NAME = 'vjs-modal-dialog';
  /**
   * The `ModalDialog` displays over the video and its controls, which blocks
   * interaction with the player until it is closed.
   *
   * Modal dialogs include a "Close" button and will close when that button
   * is activated - or when ESC is pressed anywhere.
   *
   * @extends Component
   */

  var ModalDialog =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(ModalDialog, _Component);

    /**
     * Create an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Mixed} [options.content=undefined]
     *        Provide customized content for this modal.
     *
     * @param {string} [options.description]
     *        A text description for the modal, primarily for accessibility.
     *
     * @param {boolean} [options.fillAlways=false]
     *        Normally, modals are automatically filled only the first time
     *        they open. This tells the modal to refresh its content
     *        every time it opens.
     *
     * @param {string} [options.label]
     *        A text label for the modal, primarily for accessibility.
     *
     * @param {boolean} [options.pauseOnOpen=true]
     *        If `true`, playback will will be paused if playing when
     *        the modal opens, and resumed when it closes.
     *
     * @param {boolean} [options.temporary=true]
     *        If `true`, the modal can only be opened once; it will be
     *        disposed as soon as it's closed.
     *
     * @param {boolean} [options.uncloseable=false]
     *        If `true`, the user will not be able to close the modal
     *        through the UI in the normal ways. Programmatic closing is
     *        still possible.
     */
    function ModalDialog(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.opened_ = _this.hasBeenOpened_ = _this.hasBeenFilled_ = false;

      _this.closeable(!_this.options_.uncloseable);

      _this.content(_this.options_.content); // Make sure the contentEl is defined AFTER any children are initialized
      // because we only want the contents of the modal in the contentEl
      // (not the UI elements like the close button).


      _this.contentEl_ = createEl('div', {
        className: MODAL_CLASS_NAME + "-content"
      }, {
        role: 'document'
      });
      _this.descEl_ = createEl('p', {
        className: MODAL_CLASS_NAME + "-description vjs-control-text",
        id: _this.el().getAttribute('aria-describedby')
      });
      textContent(_this.descEl_, _this.description());

      _this.el_.appendChild(_this.descEl_);

      _this.el_.appendChild(_this.contentEl_);

      return _this;
    }
    /**
     * Create the `ModalDialog`'s DOM element
     *
     * @return {Element}
     *         The DOM element that gets created.
     */


    var _proto = ModalDialog.prototype;

    _proto.createEl = function createEl$$1() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: this.buildCSSClass(),
        tabIndex: -1
      }, {
        'aria-describedby': this.id() + "_description",
        'aria-hidden': 'true',
        'aria-label': this.label(),
        'role': 'dialog'
      });
    };

    _proto.dispose = function dispose() {
      this.contentEl_ = null;
      this.descEl_ = null;
      this.previouslyActiveEl_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      return MODAL_CLASS_NAME + " vjs-hidden " + _Component.prototype.buildCSSClass.call(this);
    }
    /**
     * Returns the label string for this modal. Primarily used for accessibility.
     *
     * @return {string}
     *         the localized or raw label of this modal.
     */
    ;

    _proto.label = function label() {
      return this.localize(this.options_.label || 'Modal Window');
    }
    /**
     * Returns the description string for this modal. Primarily used for
     * accessibility.
     *
     * @return {string}
     *         The localized or raw description of this modal.
     */
    ;

    _proto.description = function description() {
      var desc = this.options_.description || this.localize('This is a modal window.'); // Append a universal closeability message if the modal is closeable.

      if (this.closeable()) {
        desc += ' ' + this.localize('This modal can be closed by pressing the Escape key or activating the close button.');
      }

      return desc;
    }
    /**
     * Opens the modal.
     *
     * @fires ModalDialog#beforemodalopen
     * @fires ModalDialog#modalopen
     */
    ;

    _proto.open = function open() {
      if (!this.opened_) {
        var player = this.player();
        /**
          * Fired just before a `ModalDialog` is opened.
          *
          * @event ModalDialog#beforemodalopen
          * @type {EventTarget~Event}
          */

        this.trigger('beforemodalopen');
        this.opened_ = true; // Fill content if the modal has never opened before and
        // never been filled.

        if (this.options_.fillAlways || !this.hasBeenOpened_ && !this.hasBeenFilled_) {
          this.fill();
        } // If the player was playing, pause it and take note of its previously
        // playing state.


        this.wasPlaying_ = !player.paused();

        if (this.options_.pauseOnOpen && this.wasPlaying_) {
          player.pause();
        }

        this.on('keydown', this.handleKeyDown); // Hide controls and note if they were enabled.

        this.hadControls_ = player.controls();
        player.controls(false);
        this.show();
        this.conditionalFocus_();
        this.el().setAttribute('aria-hidden', 'false');
        /**
          * Fired just after a `ModalDialog` is opened.
          *
          * @event ModalDialog#modalopen
          * @type {EventTarget~Event}
          */

        this.trigger('modalopen');
        this.hasBeenOpened_ = true;
      }
    }
    /**
     * If the `ModalDialog` is currently open or closed.
     *
     * @param  {boolean} [value]
     *         If given, it will open (`true`) or close (`false`) the modal.
     *
     * @return {boolean}
     *         the current open state of the modaldialog
     */
    ;

    _proto.opened = function opened(value) {
      if (typeof value === 'boolean') {
        this[value ? 'open' : 'close']();
      }

      return this.opened_;
    }
    /**
     * Closes the modal, does nothing if the `ModalDialog` is
     * not open.
     *
     * @fires ModalDialog#beforemodalclose
     * @fires ModalDialog#modalclose
     */
    ;

    _proto.close = function close() {
      if (!this.opened_) {
        return;
      }

      var player = this.player();
      /**
        * Fired just before a `ModalDialog` is closed.
        *
        * @event ModalDialog#beforemodalclose
        * @type {EventTarget~Event}
        */

      this.trigger('beforemodalclose');
      this.opened_ = false;

      if (this.wasPlaying_ && this.options_.pauseOnOpen) {
        player.play();
      }

      this.off('keydown', this.handleKeyDown);

      if (this.hadControls_) {
        player.controls(true);
      }

      this.hide();
      this.el().setAttribute('aria-hidden', 'true');
      /**
        * Fired just after a `ModalDialog` is closed.
        *
        * @event ModalDialog#modalclose
        * @type {EventTarget~Event}
        */

      this.trigger('modalclose');
      this.conditionalBlur_();

      if (this.options_.temporary) {
        this.dispose();
      }
    }
    /**
     * Check to see if the `ModalDialog` is closeable via the UI.
     *
     * @param  {boolean} [value]
     *         If given as a boolean, it will set the `closeable` option.
     *
     * @return {boolean}
     *         Returns the final value of the closable option.
     */
    ;

    _proto.closeable = function closeable(value) {
      if (typeof value === 'boolean') {
        var closeable = this.closeable_ = !!value;
        var close = this.getChild('closeButton'); // If this is being made closeable and has no close button, add one.

        if (closeable && !close) {
          // The close button should be a child of the modal - not its
          // content element, so temporarily change the content element.
          var temp = this.contentEl_;
          this.contentEl_ = this.el_;
          close = this.addChild('closeButton', {
            controlText: 'Close Modal Dialog'
          });
          this.contentEl_ = temp;
          this.on(close, 'close', this.close);
        } // If this is being made uncloseable and has a close button, remove it.


        if (!closeable && close) {
          this.off(close, 'close', this.close);
          this.removeChild(close);
          close.dispose();
        }
      }

      return this.closeable_;
    }
    /**
     * Fill the modal's content element with the modal's "content" option.
     * The content element will be emptied before this change takes place.
     */
    ;

    _proto.fill = function fill() {
      this.fillWith(this.content());
    }
    /**
     * Fill the modal's content element with arbitrary content.
     * The content element will be emptied before this change takes place.
     *
     * @fires ModalDialog#beforemodalfill
     * @fires ModalDialog#modalfill
     *
     * @param {Mixed} [content]
     *        The same rules apply to this as apply to the `content` option.
     */
    ;

    _proto.fillWith = function fillWith(content) {
      var contentEl = this.contentEl();
      var parentEl = contentEl.parentNode;
      var nextSiblingEl = contentEl.nextSibling;
      /**
        * Fired just before a `ModalDialog` is filled with content.
        *
        * @event ModalDialog#beforemodalfill
        * @type {EventTarget~Event}
        */

      this.trigger('beforemodalfill');
      this.hasBeenFilled_ = true; // Detach the content element from the DOM before performing
      // manipulation to avoid modifying the live DOM multiple times.

      parentEl.removeChild(contentEl);
      this.empty();
      insertContent(contentEl, content);
      /**
       * Fired just after a `ModalDialog` is filled with content.
       *
       * @event ModalDialog#modalfill
       * @type {EventTarget~Event}
       */

      this.trigger('modalfill'); // Re-inject the re-filled content element.

      if (nextSiblingEl) {
        parentEl.insertBefore(contentEl, nextSiblingEl);
      } else {
        parentEl.appendChild(contentEl);
      } // make sure that the close button is last in the dialog DOM


      var closeButton = this.getChild('closeButton');

      if (closeButton) {
        parentEl.appendChild(closeButton.el_);
      }
    }
    /**
     * Empties the content element. This happens anytime the modal is filled.
     *
     * @fires ModalDialog#beforemodalempty
     * @fires ModalDialog#modalempty
     */
    ;

    _proto.empty = function empty() {
      /**
      * Fired just before a `ModalDialog` is emptied.
      *
      * @event ModalDialog#beforemodalempty
      * @type {EventTarget~Event}
      */
      this.trigger('beforemodalempty');
      emptyEl(this.contentEl());
      /**
      * Fired just after a `ModalDialog` is emptied.
      *
      * @event ModalDialog#modalempty
      * @type {EventTarget~Event}
      */

      this.trigger('modalempty');
    }
    /**
     * Gets or sets the modal content, which gets normalized before being
     * rendered into the DOM.
     *
     * This does not update the DOM or fill the modal, but it is called during
     * that process.
     *
     * @param  {Mixed} [value]
     *         If defined, sets the internal content value to be used on the
     *         next call(s) to `fill`. This value is normalized before being
     *         inserted. To "clear" the internal content value, pass `null`.
     *
     * @return {Mixed}
     *         The current content of the modal dialog
     */
    ;

    _proto.content = function content(value) {
      if (typeof value !== 'undefined') {
        this.content_ = value;
      }

      return this.content_;
    }
    /**
     * conditionally focus the modal dialog if focus was previously on the player.
     *
     * @private
     */
    ;

    _proto.conditionalFocus_ = function conditionalFocus_() {
      var activeEl = document.activeElement;
      var playerEl = this.player_.el_;
      this.previouslyActiveEl_ = null;

      if (playerEl.contains(activeEl) || playerEl === activeEl) {
        this.previouslyActiveEl_ = activeEl;
        this.focus();
      }
    }
    /**
     * conditionally blur the element and refocus the last focused element
     *
     * @private
     */
    ;

    _proto.conditionalBlur_ = function conditionalBlur_() {
      if (this.previouslyActiveEl_) {
        this.previouslyActiveEl_.focus();
        this.previouslyActiveEl_ = null;
      }
    }
    /**
     * Keydown handler. Attached when modal is focused.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Do not allow keydowns to reach out of the modal dialog.
      event.stopPropagation();

      if (keycode.isEventKey(event, 'Escape') && this.closeable()) {
        event.preventDefault();
        this.close();
        return;
      } // exit early if it isn't a tab key


      if (!keycode.isEventKey(event, 'Tab')) {
        return;
      }

      var focusableEls = this.focusableEls_();
      var activeEl = this.el_.querySelector(':focus');
      var focusIndex;

      for (var i = 0; i < focusableEls.length; i++) {
        if (activeEl === focusableEls[i]) {
          focusIndex = i;
          break;
        }
      }

      if (document.activeElement === this.el_) {
        focusIndex = 0;
      }

      if (event.shiftKey && focusIndex === 0) {
        focusableEls[focusableEls.length - 1].focus();
        event.preventDefault();
      } else if (!event.shiftKey && focusIndex === focusableEls.length - 1) {
        focusableEls[0].focus();
        event.preventDefault();
      }
    }
    /**
     * get all focusable elements
     *
     * @private
     */
    ;

    _proto.focusableEls_ = function focusableEls_() {
      var allChildren = this.el_.querySelectorAll('*');
      return Array.prototype.filter.call(allChildren, function (child) {
        return (child instanceof window$1.HTMLAnchorElement || child instanceof window$1.HTMLAreaElement) && child.hasAttribute('href') || (child instanceof window$1.HTMLInputElement || child instanceof window$1.HTMLSelectElement || child instanceof window$1.HTMLTextAreaElement || child instanceof window$1.HTMLButtonElement) && !child.hasAttribute('disabled') || child instanceof window$1.HTMLIFrameElement || child instanceof window$1.HTMLObjectElement || child instanceof window$1.HTMLEmbedElement || child.hasAttribute('tabindex') && child.getAttribute('tabindex') !== -1 || child.hasAttribute('contenteditable');
      });
    };

    return ModalDialog;
  }(Component);
  /**
   * Default options for `ModalDialog` default options.
   *
   * @type {Object}
   * @private
   */


  ModalDialog.prototype.options_ = {
    pauseOnOpen: true,
    temporary: true
  };
  Component.registerComponent('ModalDialog', ModalDialog);

  /**
   * Common functionaliy between {@link TextTrackList}, {@link AudioTrackList}, and
   * {@link VideoTrackList}
   *
   * @extends EventTarget
   */

  var TrackList =
  /*#__PURE__*/
  function (_EventTarget) {
    _inheritsLoose(TrackList, _EventTarget);

    /**
     * Create an instance of this class
     *
     * @param {Track[]} tracks
     *        A list of tracks to initialize the list with.
     *
     * @abstract
     */
    function TrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      _this = _EventTarget.call(this) || this;
      _this.tracks_ = [];
      /**
       * @memberof TrackList
       * @member {number} length
       *         The current number of `Track`s in the this Trackist.
       * @instance
       */

      Object.defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), 'length', {
        get: function get() {
          return this.tracks_.length;
        }
      });

      for (var i = 0; i < tracks.length; i++) {
        _this.addTrack(tracks[i]);
      }

      return _this;
    }
    /**
     * Add a {@link Track} to the `TrackList`
     *
     * @param {Track} track
     *        The audio, video, or text track to add to the list.
     *
     * @fires TrackList#addtrack
     */


    var _proto = TrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var index = this.tracks_.length;

      if (!('' + index in this)) {
        Object.defineProperty(this, index, {
          get: function get() {
            return this.tracks_[index];
          }
        });
      } // Do not add duplicate tracks


      if (this.tracks_.indexOf(track) === -1) {
        this.tracks_.push(track);
        /**
         * Triggered when a track is added to a track list.
         *
         * @event TrackList#addtrack
         * @type {EventTarget~Event}
         * @property {Track} track
         *           A reference to track that was added.
         */

        this.trigger({
          track: track,
          type: 'addtrack',
          target: this
        });
      }
    }
    /**
     * Remove a {@link Track} from the `TrackList`
     *
     * @param {Track} rtrack
     *        The audio, video, or text track to remove from the list.
     *
     * @fires TrackList#removetrack
     */
    ;

    _proto.removeTrack = function removeTrack(rtrack) {
      var track;

      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] === rtrack) {
          track = this[i];

          if (track.off) {
            track.off();
          }

          this.tracks_.splice(i, 1);
          break;
        }
      }

      if (!track) {
        return;
      }
      /**
       * Triggered when a track is removed from track list.
       *
       * @event TrackList#removetrack
       * @type {EventTarget~Event}
       * @property {Track} track
       *           A reference to track that was removed.
       */


      this.trigger({
        track: track,
        type: 'removetrack',
        target: this
      });
    }
    /**
     * Get a Track from the TrackList by a tracks id
     *
     * @param {string} id - the id of the track to get
     * @method getTrackById
     * @return {Track}
     * @private
     */
    ;

    _proto.getTrackById = function getTrackById(id) {
      var result = null;

      for (var i = 0, l = this.length; i < l; i++) {
        var track = this[i];

        if (track.id === id) {
          result = track;
          break;
        }
      }

      return result;
    };

    return TrackList;
  }(EventTarget);
  /**
   * Triggered when a different track is selected/enabled.
   *
   * @event TrackList#change
   * @type {EventTarget~Event}
   */

  /**
   * Events that can be called with on + eventName. See {@link EventHandler}.
   *
   * @property {Object} TrackList#allowedEvents_
   * @private
   */


  TrackList.prototype.allowedEvents_ = {
    change: 'change',
    addtrack: 'addtrack',
    removetrack: 'removetrack'
  }; // emulate attribute EventHandler support to allow for feature detection

  for (var event in TrackList.prototype.allowedEvents_) {
    TrackList.prototype['on' + event] = null;
  }

  /**
   * Anywhere we call this function we diverge from the spec
   * as we only support one enabled audiotrack at a time
   *
   * @param {AudioTrackList} list
   *        list to work on
   *
   * @param {AudioTrack} track
   *        The track to skip
   *
   * @private
   */

  var disableOthers = function disableOthers(list, track) {
    for (var i = 0; i < list.length; i++) {
      if (!Object.keys(list[i]).length || track.id === list[i].id) {
        continue;
      } // another audio track is enabled, disable it


      list[i].enabled = false;
    }
  };
  /**
   * The current list of {@link AudioTrack} for a media file.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#audiotracklist}
   * @extends TrackList
   */


  var AudioTrackList =
  /*#__PURE__*/
  function (_TrackList) {
    _inheritsLoose(AudioTrackList, _TrackList);

    /**
     * Create an instance of this class.
     *
     * @param {AudioTrack[]} [tracks=[]]
     *        A list of `AudioTrack` to instantiate the list with.
     */
    function AudioTrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      // make sure only 1 track is enabled
      // sorted from last index to first index
      for (var i = tracks.length - 1; i >= 0; i--) {
        if (tracks[i].enabled) {
          disableOthers(tracks, tracks[i]);
          break;
        }
      }

      _this = _TrackList.call(this, tracks) || this;
      _this.changing_ = false;
      return _this;
    }
    /**
     * Add an {@link AudioTrack} to the `AudioTrackList`.
     *
     * @param {AudioTrack} track
     *        The AudioTrack to add to the list
     *
     * @fires TrackList#addtrack
     */


    var _proto = AudioTrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var _this2 = this;

      if (track.enabled) {
        disableOthers(this, track);
      }

      _TrackList.prototype.addTrack.call(this, track); // native tracks don't have this


      if (!track.addEventListener) {
        return;
      }

      track.enabledChange_ = function () {
        // when we are disabling other tracks (since we don't support
        // more than one track at a time) we will set changing_
        // to true so that we don't trigger additional change events
        if (_this2.changing_) {
          return;
        }

        _this2.changing_ = true;
        disableOthers(_this2, track);
        _this2.changing_ = false;

        _this2.trigger('change');
      };
      /**
       * @listens AudioTrack#enabledchange
       * @fires TrackList#change
       */


      track.addEventListener('enabledchange', track.enabledChange_);
    };

    _proto.removeTrack = function removeTrack(rtrack) {
      _TrackList.prototype.removeTrack.call(this, rtrack);

      if (rtrack.removeEventListener && rtrack.enabledChange_) {
        rtrack.removeEventListener('enabledchange', rtrack.enabledChange_);
        rtrack.enabledChange_ = null;
      }
    };

    return AudioTrackList;
  }(TrackList);

  /**
   * Un-select all other {@link VideoTrack}s that are selected.
   *
   * @param {VideoTrackList} list
   *        list to work on
   *
   * @param {VideoTrack} track
   *        The track to skip
   *
   * @private
   */

  var disableOthers$1 = function disableOthers(list, track) {
    for (var i = 0; i < list.length; i++) {
      if (!Object.keys(list[i]).length || track.id === list[i].id) {
        continue;
      } // another video track is enabled, disable it


      list[i].selected = false;
    }
  };
  /**
   * The current list of {@link VideoTrack} for a video.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#videotracklist}
   * @extends TrackList
   */


  var VideoTrackList =
  /*#__PURE__*/
  function (_TrackList) {
    _inheritsLoose(VideoTrackList, _TrackList);

    /**
     * Create an instance of this class.
     *
     * @param {VideoTrack[]} [tracks=[]]
     *        A list of `VideoTrack` to instantiate the list with.
     */
    function VideoTrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      // make sure only 1 track is enabled
      // sorted from last index to first index
      for (var i = tracks.length - 1; i >= 0; i--) {
        if (tracks[i].selected) {
          disableOthers$1(tracks, tracks[i]);
          break;
        }
      }

      _this = _TrackList.call(this, tracks) || this;
      _this.changing_ = false;
      /**
       * @member {number} VideoTrackList#selectedIndex
       *         The current index of the selected {@link VideoTrack`}.
       */

      Object.defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), 'selectedIndex', {
        get: function get() {
          for (var _i = 0; _i < this.length; _i++) {
            if (this[_i].selected) {
              return _i;
            }
          }

          return -1;
        },
        set: function set() {}
      });
      return _this;
    }
    /**
     * Add a {@link VideoTrack} to the `VideoTrackList`.
     *
     * @param {VideoTrack} track
     *        The VideoTrack to add to the list
     *
     * @fires TrackList#addtrack
     */


    var _proto = VideoTrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var _this2 = this;

      if (track.selected) {
        disableOthers$1(this, track);
      }

      _TrackList.prototype.addTrack.call(this, track); // native tracks don't have this


      if (!track.addEventListener) {
        return;
      }

      track.selectedChange_ = function () {
        if (_this2.changing_) {
          return;
        }

        _this2.changing_ = true;
        disableOthers$1(_this2, track);
        _this2.changing_ = false;

        _this2.trigger('change');
      };
      /**
       * @listens VideoTrack#selectedchange
       * @fires TrackList#change
       */


      track.addEventListener('selectedchange', track.selectedChange_);
    };

    _proto.removeTrack = function removeTrack(rtrack) {
      _TrackList.prototype.removeTrack.call(this, rtrack);

      if (rtrack.removeEventListener && rtrack.selectedChange_) {
        rtrack.removeEventListener('selectedchange', rtrack.selectedChange_);
        rtrack.selectedChange_ = null;
      }
    };

    return VideoTrackList;
  }(TrackList);

  /**
   * The current list of {@link TextTrack} for a media file.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttracklist}
   * @extends TrackList
   */

  var TextTrackList =
  /*#__PURE__*/
  function (_TrackList) {
    _inheritsLoose(TextTrackList, _TrackList);

    function TextTrackList() {
      return _TrackList.apply(this, arguments) || this;
    }

    var _proto = TextTrackList.prototype;

    /**
     * Add a {@link TextTrack} to the `TextTrackList`
     *
     * @param {TextTrack} track
     *        The text track to add to the list.
     *
     * @fires TrackList#addtrack
     */
    _proto.addTrack = function addTrack(track) {
      var _this = this;

      _TrackList.prototype.addTrack.call(this, track);

      if (!this.queueChange_) {
        this.queueChange_ = function () {
          return _this.queueTrigger('change');
        };
      }

      if (!this.triggerSelectedlanguagechange) {
        this.triggerSelectedlanguagechange_ = function () {
          return _this.trigger('selectedlanguage