#jQuery.deferredEach()

This is a non-blocking, asynchronous implementation of jQuery.each() using jQuery's
deferred/promise features. It allows you to iterate over huge arrays or objects
without hogging the UI thread in which client-side JS runs. That kind of thread-
hogging can freeze up the browser's user interface and lead to the dreaded long-
running script error message.

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
  .progress(function(amt_done) {
    updateProgressMeter(Math.round(amt_done * 100) + '%');
  })
  .then(doMagic)
  .then(addPizzazz)
  .done(doBigFinish)
  .fail(appeaseAudience)
  .always(takeBow);
}
```

* `.progress()` callbacks get passed a decimal representation of how much of the
  work has been completed on each iteration. For example, processing an object with
  four properties would run your progress callback four times with 0.25, 0.5, 0.75,
  and finally 1 as the argument.
* Completion callbacks like `.done()` and the first (or only) function passed to
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