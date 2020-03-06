import binary_builder from './binary_builder';
import CompileError from './compile_error';
import { types } from './assembly/types';

export default class compiler {
    constructor(private builder: binary_builder) {}
    private legal_types = ['i32', 'f32', 'i64', 'f64'];
    // The  main function can't be used because it's the function used when instructions are not in functions
    private funcs: string[] = ['main'];
    private vars: any = {};
    /**
     * Compiles the given code into lower level code
     * @param code
     */
    public compile(code: string) {
        const lines = code.split(/\r\n|\r|\n/g);

        lines.forEach((line, i) => {
            const spaces = line.match(/^(\s*)/)[0].length;

            if (line.indexOf('def') >= 0) {
                const function_definition = line.match(
                    //             ---type---      -------function name----------        -----------------arguments-------------
                    /^(\s*)def(\s+)([a-z1-9]+)(\s+)(([a-zA-Z\_]+)([a-zA-Z1-9\_]*))(\s*)\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)\:(\s*)/
                );
                /**
                 * If the line is a function definition line
                 */
                if (function_definition) {
                    const function_return_type = function_definition[3];
                    const function_export_name = function_definition[5];
                    const function_arguments = function_definition[9];

                    // Check if a function name is available
                    if (this.funcs.indexOf(function_export_name) >= 0)
                        throw new CompileError(
                            `Function name "${function_export_name}" has already been taken.`,
                            i
                        );

                    // Check if the return type is a legal return type
                    if (this.legal_types.indexOf(function_return_type) < 0)
                        throw new CompileError(
                            `Type "${function_return_type}" is not a legal return type. Accepted types are ${this.legal_types
                                .map((type) => `"${type}"`)
                                .join(',')}`,
                            i
                        );

                    let vars: string[] = [];
                    let var_types: types[] = [];

                    const args = function_arguments
                        .split(',')
                        .map((arg) => arg.trim().split(' '));
                    args.forEach((arg) => {
                        if (arg.length != 2)
                            throw new CompileError(
                                'Function arguments must be valid',
                                i
                            );

                        //@ts-ignore
                        const var_type: types = arg[0];
                        const var_name = arg[1];

                        if (vars.indexOf(var_name) >= 0)
                            throw new CompileError(
                                `"${var_name}" has already been declared in this function.`,
                                i
                            );

                        if (this.legal_types.indexOf(var_type) < 0)
                            throw new CompileError(
                                `Type "${var_type}" of "${var_name}" is not a legal type.`,
                                i
                            );

                        vars.push(var_name);
                        vars.push(var_type);
                    });

                    this.vars[function_export_name] = { vars, var_types };
                    return;
                }
            }

            if (line.indexOf('var') >= 0) {
                const var_declaration = line.match(
                    /^(\s*)var(\s+)([a-z1-9]+)(\s+)([a-zA-Z\_]+)(\s*)/
                );
                if (var_declaration) {
                    const statement = var_declaration[0];
                    const assignement_part = line.replace(statement, '');
                    if (
                        assignement_part.length > 0 &&
                        assignement_part[0] == '='
                    ) {
                        console.log(assignement_part);
                    }
                    return;
                }
            }
        });

        console.log('Compiled with no error !');
    }
}
