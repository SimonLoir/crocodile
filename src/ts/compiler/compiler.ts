import binary_builder from './binary_builder';
import CompileError from './compile_error';

export default class compiler {
    constructor(private builder: binary_builder) {}
    private legal_types = ['i32', 'f32', 'i64', 'f64'];
    // The  main function can't be used because it's the function used when instructions are not in functions
    private funcs: string[] = ['main'];
    /**
     * Compiles the given code into lower level code
     * @param code
     */
    public compile(code: string) {
        const lines = code.split(/\r\n|\r|\n/g);

        lines.forEach((line, i) => {
            const spaces = line.match(/^(\s*)/)[0].length;
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
            }
        });
    }
}
