# jQuery.deferredEach()

This is a non-blocking, asynchronous implementation of [jQuery.each()](http://api.jquery.com/jQuery.each/)
using [jQuery's deferred/promise features](http://api.jquery.com/category/deferred-object/).
It allows you to iterate over huge arrays or objects without hogging the UI thread
in which client-side JS runs. That kind of thread-hogging can freeze up the
browser's user interface and lead to the dreaded long-running script error message.

If you'd like an example of `$.deferredEach()` in action, check out
[Flexitable](https://github.com/adammessinger/Flexitable) -- the jQuery plugin
for which I originally created it.

## How Does It Work?

Instead of this:

```javascript
results = processAllTheThings(massive_obj);

doMagic(results);
addPizzazz(results);
doBigFinish();
takeBow();
```

You do something like this:

```javascript
$.deferredEach(massive_obj, processThing)
  .progress(function(amount_done, count, length) {
    var pct_complete = Math.round(amount_done * 100) + '%';
    updateProgressMeter(pct_complete, count, length);
  })
  .then(doMagic)
  .then(addPizzazz)
  .done(doBigFinish)
  .fail(appeaseAudience)
  .always(takeBow);
```

### Progress Callbacks

`.progress()` callbacks get passed the following numeric arguments:

1. `amount_done`: A decimal representation of how much of the work has been
completed on each iteration.
2. `count`: The integer count of the last-processed item in the collection.
**Unlike an array index, `count` starts at 1 rather than 0.**
3. `length`: The length of the collection being processed.

Processing an object with four properties would run your progress callback
four times with the following arguments
 
1. `0.25, 1, 4`
2. `0.5, 2, 4`
3. `0.75, 3, 4`
4. `1, 4, 4`

You can, for example, update a progress bar using only the `amount_done`, or do
something specific when the process begins or ends by checking `count === 1` or
`count === length`.

### Success & Failure Callbacks

All completion callback funcitons added with methods like `.then()`, `.done()`,
`.fail()`, and `.always()` recieve two arguments:

1. `collection`: The array or object you're iterating over.
2. `message`: A string giving the reason for the deferred's resolution or rejection.
   Currently comes in three flavors:
   * `"done"`: The deferred was resolved because we're done iterating over the
     passed collection.
   * `"error: empty collection"`: The deferred was rejected because the passed 
     collection was empty (had nothing to iterate over).
   * `"error: invalid callback"`: The deferred was rejected because the passed 
     callback was [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
     or not a function.

The object or array returned as `collection` will include any alterations that your
processing callback made on each iteration.

## Disclaimer

Using jQuery.deferredEach _will_ make your script run slower than `$.each()` or
a simple loop. That's because it's using `setTimeout` to take a short break after
each iteration and let the browser handle other work, like responding to user
interactions. This plugin is meant for those times you just can't avoid iterating
over a huge object or array in the browser.

## Credit Where Due

jQuery.deferredEach is based on $.yieldingEach -- posted by
[colinmarc](https://github.com/colinmarc) to the now-defunct Forrst.com -- and
the source for jQuery.each().
