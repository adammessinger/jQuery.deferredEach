#jQuery.deferredEach()

This is a non-blocking, asynchronous implementation of [jQuery.each()](http://api.jquery.com/jQuery.each/)
using [jQuery's deferred/promise features](http://api.jquery.com/category/deferred-object/).
It allows you to iterate over huge arrays or objects without hogging the UI thread
in which client-side JS runs. That kind of thread-hogging can freeze up the
browser's user interface and lead to the dreaded long-running script error message.

##How Does It Work?

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

###Progress Callbacks

`.progress()` callbacks get passed the following numeric arguments:

* `amount_done`: A decimal representation of how much of the work has been
completed on each iteration.
* `count`: The integer count of last-processed item in the collection. **Unlike
an array index, `count` starts at 1 rather than 0.**
* `length`: The length of the collection being processed.

Processing an object with four properties would run your progress callback
four times with the following arguments
 
1. `0.25, 1, 4`
2. `0.5, 2, 4`
3. `0.75, 3, 4`
4. `1, 4, 4`

You can, for example, update a progress bar using only the `amount_done`, or do
something specific when the process begins or ends by checking `count === 1` or
`count === length`.

###Completion Callbacks

Completion callbacks like `.done()` and the first (or only) function passed to
`.then()` get the array or object you're iterating over as their argument,
similar to how `$.each()` returns the object it was used to iterate over. This
returned object or array will include any alterations that your processing 
callback made on each iteration.

##Disclaimer

Using jQuery.deferredEach _will_ make your script run slower than `$.each()` or
a simple loop. That's because it's using `setTimeout` to take a short break after
each iteration and let the browser handle other work, like responding to user
interactions. This plugin is meant for those times you just can't avoid iterating
over a huge object or array in the browser.

##Credit Where Due

jQuery.deferredEach is based on $.yieldingEach -- posted by
[colinmarc](https://github.com/colinmarc) to the now-defunct Forrst.com -- and
the source for jQuery.each().