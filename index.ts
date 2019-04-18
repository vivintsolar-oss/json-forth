export type Interpreter = (code: any, ...args: any[]) => Promise<any[]>;
export type Operator = (interp: Interpreter, ctx: Object, ...args: any[]) => Promise<any[]>;
export type OpTable = { [key: string]: Operator };

export async function interpreter(
    opTable: OpTable,
    ast: any[],
    stack: any[],
    ctx: Object = {},
): Promise<any[]> {
  const recurse: Interpreter = (code, ...args) => interpreter(opTable, code, [ ...stack, ...args ], ctx);

  for (const node of ast) {
    if (typeof node === 'string' && node[0] === '#') {
      // Strings prefixed with "#" represent built-in functions,
      // whose instructions objects can be looked up in opTable
      const op = opTable[node.slice(1)];

      // Instructions may call functions that are provided
      // to them as arguments, so a reference to `interp`,
      // (via the `recurse` wrapper) is provided to every
      // instruction to permit interpreting those functions.
      // Additionally, all instructions have access to the
      // shared global context. That means the actual data
      // arguments to each instruction are 2 less than the
      // total number of arguments to the JS function that
      // implements it.
      const arglen = op.length - 2;

      // pop as many arguments as this operation requires
      const args = arglen > 0 ? stack.splice(-arglen) : [];

      if (args.length < arglen) {
        throw new Error(
          `Insufficient Arguments for ${ node } (required: ${ arglen }; stack size: ${ args.length })`
        );
      }

      stack.push(...await op(recurse, ctx, ...args));
    } else {
      // Everything else is just a value that gets pushed onto the stack.
      stack.push(node);
    }
  }

  return stack;
}