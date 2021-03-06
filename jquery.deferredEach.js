/**
 * jQuery.deferredEach()
 * A non-blocking, async implementation of $.each() using
 * jQuery's deferred/promise features.
 * https://github.com/adammessinger/jQuery.deferredEach
 *
 * Copyright (c) 2016 Adam Messinger, http://zenscope.com/
 * Released under the MIT license, see LICENSE.txt for details.
 *
 * Based on "yieldingEach" by Colin Marc (http://colinmarc.com/) and the source
 * for jQuery.each()
 */

;(function($, undefined) {
  'use strict';

  $.deferredEach = function(collection, callback) {
    var i = 0;
    var length = collection.length;
    var is_array = _isArraylike(collection);
    var has_empty_collection = (is_array && !length) || $.isEmptyObject(collection);
    var has_invalid_callback = (!callback || typeof callback !== 'function');
    var parent_deferred = $.Deferred();
    var child_deferreds;
    var keys = [];
    var next, key;

    if (has_empty_collection) {
      return parent_deferred.reject(collection, 'error: empty collection').promise();
    }
    if (has_invalid_callback) {
      return parent_deferred.reject(collection, 'error: invalid callback').promise();
    }

    if (is_array) {
      child_deferreds = _makeChildDeferredsArray(length);

      next = function() {
        if (i < length && callback.call(collection[i], i, collection[i++]) !== false) {
          setTimeout(next, 1);
        }
        child_deferreds[i - 1].resolve();
        parent_deferred.notify((i / length), i, length);
      };
      next();
    } else {
      for (key in collection) {
        keys.push(key);
      }
      child_deferreds = _makeChildDeferredsArray(keys.length);

      next = function() {
        if (i < keys.length && callback.call(collection[keys[i]], keys[i], collection[keys[i++]]) !== false) {
          setTimeout(next, 1);
        }
        child_deferreds[i - 1].resolve();
        parent_deferred.notify((i / keys.length), i, keys.length);
      };
      next();
    }

    $.when.apply(undefined, child_deferreds).then(function() {
      var notify_length = is_array ? length : keys.length;

      parent_deferred.notify(1, i, notify_length);
      parent_deferred.resolve(collection, 'done');
    });

    return parent_deferred.promise();
  };

  function _makeChildDeferredsArray(length) {
    var i = 0;
    var array = [];

    for (; i < length; i++) {
      array.push($.Deferred());
    }
    return array;
  }

  function _isArraylike(obj) {
    var length = obj.length;
    var type = $.type(obj);

    if (type === "function" || $.isWindow(obj)) {
      return false;
    }
    if (obj.nodeType === 1 && length) {
      return true;
    }
    return type === "array" || length === 0 || (typeof length === "number" && length > 0 && (length - 1) in obj);
  }
})(jQuery);
