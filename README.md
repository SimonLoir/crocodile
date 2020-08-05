# Crocodile.js

## What is Crocodile.js ?

Crocodile.js is an open source project that aims to create a new programming language based on the python syntax. The main difference resides in the fact that Crocodile.js is strictly typed and can be compiled. The main compilation target is webassembly.

Crocodile.js comes with it's own Crocodile.js to binary compiler that lets you create wasm files easily. Wasm files can then be used in your javascript to reduce the execution time of your code.

## What are the supported types ?

-   i32 (int)
-   f32 (float)
-   i64 (int)
-   f64 (float)

## How to declare a variable ?

A variable is defined with the keyword `var` which is then followed by the type of the variable and its name.
`var [var_type] [var_name] = [value]`
and
`var [var_type] [var_name]`
are two valid ways of declaring a variable. Two or more variables can't be defined on a single line.

Example :

```
var i32 a = 5
var i32 b
```

## How to write a function ?

Here is a basic Crocodile.js function :

```
def [return type] [name]([args]):
    return [return_value]
```

And here is a fully functionnal example :

```
def i32 add(i32 a, i32 b):
    return a + b
```
