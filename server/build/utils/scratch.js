"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log('start');
function test(num) {
    return __awaiter(this, void 0, void 0, function* () {
        return num === 5;
    });
}
let num = 0;
function checkConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        num++;
        console.log('num:', num);
        return yield test(num);
    });
}
const loop = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield checkConnection();
    console.log('result:', result);
    if (result) {
        clearInterval(loop);
        console.log('end');
    }
}), 1000);
