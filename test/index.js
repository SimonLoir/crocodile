var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var PyWASMBuilder = /** @class */ (function () {
    function PyWASMBuilder() {
        this.wasm_module_header = [0x00, 0x61, 0x73, 0x6d];
        this.wasm_module_version = [0x01, 0x00, 0x00, 0x00];
        this.codes = {
            op_codes: {
                end: 0x0b,
                get_local: 0x20,
                f32_add: 0x92
            },
            values: {
                i32: 0x7f,
                f32: 0x7d
            }
        };
        this.signedLEB128 = function (n) {
            var buffer = [];
            var more = true;
            while (more) {
                var byte = n & 0x7f;
                n >>>= 7;
                if ((n === 0 && (byte & 0x40) === 0) ||
                    (n === -1 && (byte & 0x40) !== 0)) {
                    more = false;
                }
                else {
                    byte |= 0x80;
                }
                buffer.push(byte);
            }
            return buffer;
        };
        this.section = {
            custom: 0,
            type: 1,
            "import": 2,
            func: 3,
            table: 4,
            memory: 5,
            global: 6,
            "export": 7,
            start: 8,
            element: 9,
            code: 10,
            data: 11
        };
    }
    PyWASMBuilder.prototype.createSection = function (sectionType, data) {
        return __spreadArrays([sectionType], this.vector(data));
    };
    PyWASMBuilder.prototype.addFunction = function (name, index) {
        var type = __spreadArrays([
            0x60
        ], this.vector([this.codes.values.f32, this.codes.values.f32]), this.vector([this.codes.values.f32]));
        var funcSection = this.createSection(this.section.func, this.vector([this.signedLEB128(index)]));
        var funcBody = this.vector([
            0x0,
            this.codes.op_codes.get_local,
            this.unsignedLEB128(0),
            this.codes.op_codes.get_local,
            this.unsignedLEB128(1),
            this.codes.op_codes.f32_add,
            this.codes.op_codes.end
        ]);
        var funcCodeSection = this.createSection(this.section.code, this.vector([funcBody]));
        var exportSection = this.createSection(this.section["export"], this.vector([
            __spreadArrays(this.encodeString(name), [0x00, this.signedLEB128(index)])
        ]));
        return __spreadArrays(this.createSection(this.section.type, this.vector([type])), funcSection, exportSection, funcCodeSection);
    };
    PyWASMBuilder.prototype.build = function () {
        return new Uint8Array(__spreadArrays(this.wasm_module_header, this.wasm_module_version, this.addFunction('add', 0)));
    };
    PyWASMBuilder.prototype.encodeString = function (str) {
        return __spreadArrays([str.length], str.split('').map(function (s) { return s.charCodeAt(0); }));
    };
    PyWASMBuilder.prototype.unsignedLEB128 = function (n) {
        var buffer = [];
        do {
            var byte = n & 0x7f;
            n >>>= 7;
            if (n !== 0) {
                byte |= 0x80;
            }
            buffer.push(byte);
        } while (n !== 0);
        return buffer;
    };
    PyWASMBuilder.prototype.flatten = function (arr) {
        return [].concat.apply([], arr);
    };
    PyWASMBuilder.prototype.vector = function (data) {
        return __spreadArrays([this.unsignedLEB128(data.length)], this.flatten(data));
    };
    PyWASMBuilder.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wasm_code, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wasm_code = this.build();
                        return [4 /*yield*/, WebAssembly.instantiate(wasm_code)];
                    case 1:
                        instance = (_a.sent()).instance;
                        console.log(instance.exports.add(5, 35.8888));
                        console.log(this.codes);
                        return [2 /*return*/];
                }
            });
        });
    };
    return PyWASMBuilder;
}());
new PyWASMBuilder().run();
