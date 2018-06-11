# babel-function-to-string
Transform funtion(){}.toString() to string.

> Replace funtion(){}.toString() with an inline string

## Example

```js
const a = funtion(){}.toString();
const b = funtion(){/*@toString*/};
```
to:
```js
const a = "funtion(){}";
const b = "funtion(){}";
```
