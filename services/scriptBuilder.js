const util = require('../util');

/**
 * Enum for OpCode
 * @readonly
 * @enum {number}
 */
const OpCode = {
    PUSH0: 0,
    PUSHF: 0,
    PUSHBYTES1: 1,
    PUSHBYTES75: 75,
    PUSHDATA1: 76,
    PUSHDATA2: 77,
    PUSHDATA4: 78,
    PUSHM1: 79,
    PUSH1: 81,
    PUSHT: 81,
    PUSH2: 82,
    PUSH3: 83,
    PUSH4: 84,
    PUSH5: 85,
    PUSH6: 86,
    PUSH7: 87,
    PUSH8: 88,
    PUSH9: 89,
    PUSH10: 90,
    PUSH11: 91,
    PUSH12: 92,
    PUSH13: 93,
    PUSH14: 94,
    PUSH15: 95,
    PUSH16: 96,
    NOP: 97,
    JMP: 98,
    JMPIF: 99,
    JMPIFNOT: 100,
    CALL: 101,
    RET: 102,
    APPCALL: 103,
    SYSCALL: 104,
    TAILCALL: 105,
    DUPFROMALTSTACK: 106,
    TOALTSTACK: 107,
    FROMALTSTACK: 108,
    XDROP: 109,
    XSWAP: 114,
    XTUCK: 115,
    DEPTH: 116,
    DROP: 117,
    DUP: 118,
    NIP: 119,
    OVER: 120,
    PICK: 121,
    ROLL: 122,
    ROT: 123,
    SWAP: 124,
    TUCK: 125,
    CAT: 126,
    SUBSTR: 127,
    LEFT: 128,
    RIGHT: 129,
    SIZE: 130,
    INVERT: 131,
    AND: 132,
    OR: 133,
    XOR: 134,
    EQUAL: 135,
    INC: 139,
    DEC: 140,
    SIGN: 141,
    NEGATE: 143,
    ABS: 144,
    NOT: 145,
    NZ: 146,
    ADD: 147,
    SUB: 148,
    MUL: 149,
    DIV: 150,
    MOD: 151,
    SHL: 152,
    SHR: 153,
    BOOLAND: 154,
    BOOLOR: 155,
    NUMEQUAL: 156,
    NUMNOTEQUAL: 158,
    LT: 159,
    GT: 160,
    LTE: 161,
    GTE: 162,
    MIN: 163,
    MAX: 164,
    WITHIN: 165,
    SHA1: 167,
    SHA256: 168,
    HASH160: 169,
    HASH256: 170,
    CHECKSIG: 172,
    CHECKMULTISIG: 174,
    ARRAYSIZE: 192,
    PACK: 193,
    UNPACK: 194,
    PICKITEM: 195,
    SETITEM: 196,
    NEWARRAY: 197,
    NEWSTRUCT: 198,
    THROW: 240,
    THROWIFNOT: 241
};

module.exports = class ScriptBuilder {
    constructor(str = '') {
        this.str = str
        this.pter = 0
    }

    isEmpty () {
        return this.pter >= this.str.length
    }

    read (bytes) {
        if (this.isEmpty()) throw new Error()
        const out = this.str.substr(this.pter, bytes * 2)
        this.pter += bytes * 2
        return out
    }

    readVarBytes () {
        return this.read(this.readVarInt())
    }
    readVarInt () {
        let len = parseInt(this.read(1), 16)
        if (len === 0xfd) len = parseInt(util.reverseHex(this.read(2)), 16)
        else if (len === 0xfe) len = parseInt(util.reverseHex(this.read(4)), 16)
        else if (len === 0xff) len = parseInt(util.reverseHex(this.read(8)), 16)
        return len
    }

    /**
     * Appends a AppCall and scriptHash. Used to end off a script.
     * @param {string} scriptHash - Hexstring(BE)
     * @param {boolean} useTailCall - Defaults to false
     * @return {ScriptBuilder} this
     */
    _emitAppCall (scriptHash, useTailCall = false) {
        if (scriptHash.length !== 40) throw new Error()
        return this.emit(useTailCall ? OpCode.TAILCALL : OpCode.APPCALL, util.reverseHex(scriptHash))
    }

    /**
     * Private method to append an array
     * @param {Array} arr
     * @return {ScriptBuilder} this
     */
    _emitArray (arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            this.emitPush(arr[i])
        }
        return this.emitPush(arr.length).emit(OpCode.PACK)
    }

    /**
     * Private method to append a hexstring.
     * @param {string} hexstring - Hexstring(BE)
     * @return {ScriptBuilder} this
     */
    _emitString (hexstring) {
        const size = hexstring.length / 2
        if (size <= OpCode.PUSHBYTES75) {
            this.str += util.num2hexstring(size)
            this.str += hexstring
        } else if (size < 0x100) {
            this.emit(OpCode.PUSHDATA1)
            this.str += util.num2hexstring(size)
            this.str += hexstring
        } else if (size < 0x10000) {
            this.emit(OpCode.PUSHDATA2)
            this.str += util.num2hexstring(size, 4)
            this.str += hexstring
        } else {
            this.emit(OpCode.PUSHDATA4)
            this.str += util.num2hexstring(size, 8)
            this.str += hexstring
        }
        return this
    }

    /**
     * Private method to append a number.
     * @param {number} num
     * @return {ScriptBuilder} this
     */
    _emitNum (num) {
        if (num === -1) return this.emit(OpCode.PUSHM1)
        if (num === 0) return this.emit(OpCode.PUSH0)
        if (num > 0 && num <= 16) return this.emit(OpCode.PUSH1 - 1 + num)
        return this.emitPush(util.reverseHex(util.int2hex(num)))
    }

    /**
     * Appends an Opcode, followed by args
     * @param {OpCode} op
     * @param {string} args
     * @return {ScriptBuilder} this
     */
    emit (op, args) {
        this.str += util.num2hexstring(op)
        if (args) this.str += args
        return this
    }

    /**
     * Appends args, operation and scriptHash
     * @param {string} scriptHash - Hexstring(BE)
     * @param {string|null} operation - ASCII, defaults to null
     * @param {Array|string|number|boolean} args - any
     * @param {boolean} useTailCall - Use TailCall instead of AppCall
     * @return {ScriptBuilder} this
     */
    emitAppCall (scriptHash, operation = null, args = undefined, useTailCall = false) {
        this.emitPush(args)
        if (operation) {
            let hexOp = ''
            for (let i = 0; i < operation.length; i++) {
                hexOp += util.num2hexstring(operation.charCodeAt(i))
            }
            this.emitPush(hexOp)
        }
        this._emitAppCall(scriptHash, useTailCall)
        return this
    }

    /**
     * Appends data depending on type. Used to append params/array lengths.
     * @param {Array|string|number|boolean} data
     * @return {ScriptBuilder} this
     */
    emitPush (data) {
        switch (typeof (data)) {
            case 'boolean':
                return this.emit(data ? OpCode.PUSHT : OpCode.PUSHF)
            case 'string':
                return this._emitString(data)
            case 'number':
                return this._emitNum(data)
            case 'object':
                return this._emitArray(data)
            case 'undefined':
                return this.emitPush(false)
            default:
                throw new Error()
        }
    }

    buildScript({ scriptHash, operation = null, args = undefined, useTailCall = false }) {
        const sb = new ScriptBuilder();
        return sb.emitAppCall(scriptHash, operation, args, useTailCall).str
    }
}



