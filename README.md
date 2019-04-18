# json-forth
An interpreter for concatenative languages with JSON syntax.

This interpreter implements a simple, generic class of homoiconic concatenative language designed for ease of interpretation and ease of synthesis; it is not intended primarily to be written or read by humans, although it certainly can be. The specific language to interpret is determined by an input op table.

The module exports a single `interpret` function with the signature `interpret(opTable: OpTable, ast: any[], stack: any[], ctx?: Object): Promise<any[]>`.

* `opTable` is an object whose keys map to `Operator` functions, with the signature `(interp: (code: any, ...args: any[]) => Promise<any[]>, ctx: Object, ...args: any[]) => Promise<any[]>`. The first argument to an operator function is recursive callback into the interpreter, which allows for executing nested code blocks; this facility would be used by the implementation of, e.g., conditionals or loops.
* `ast` is an array of containing the code/data to be executed.
* `stack` is an array to use as the starting state of the program data stack.
* `ctx` is an arbitrary object which will be passed in to all operations which can be used to hold arbitrary mutable context data. If no explicit context is provided, an empty object is created for internal use.

The contents of the `ast` array are interpreted as follows:

* Strings beginning with "#" are treated as built-in function calls.
* Embedded arrays are contextually treated either as anonymous function definitions or data lists, either of which will be pushed onto the data stack. (If a subsequent function call passes the array to `interp` for evaluation, then it is code; otherwise, it is data.)
* All other JSON values are treated as functions that simply place their own value onto the data stack. E.g., `1` just pushes the numeric value 1 onto the data stack, `"hello"` pushes the string "hello" onto the data stack, etc.
