const { Matrix } = require('../math/matrix');
const { Buffer } = require("node:buffer")
const s_box = [
    [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76],
    [0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0],
    [0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15],
    [0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75],
    [0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84],
    [0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf],
    [0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8],
    [0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2],
    [0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73],
    [0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb],
    [0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79],
    [0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08],
    [0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a],
    [0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e],
    [0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf],
    [0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16]
]

const mix_column_matrix = [
    [2, 3, 1, 1],
    [1, 2, 3, 1],
    [1, 1, 2, 3],
    [3, 1, 1, 2]
]

const Rcon = [
    [0x01, 0x00, 0x00, 0x00],
    [0x02, 0x00, 0x00, 0x00],
    [0x04, 0x00, 0x00, 0x00],
    [0x08, 0x00, 0x00, 0x00],
    [0x10, 0x00, 0x00, 0x00],
    [0x20, 0x00, 0x00, 0x00],
    [0x40, 0x00, 0x00, 0x00],
    [0x80, 0x00, 0x00, 0x00],
    [0x1b, 0x00, 0x00, 0x00],
    [0x36, 0x00, 0x00, 0x00],
    [0x6C, 0x00, 0x00, 0x00],
    [0xD8, 0x00, 0x00, 0x00],
    [0xAB, 0x00, 0x00, 0x00],
    [0xED, 0x00, 0x00, 0x00],
    [0x9A, 0x00, 0x00, 0x00],
]


// 参考C#的枚举, 虽然无所谓
const PaddingMode = {
    None: 1,
    PKCS7: 2,
    Zeros: 3,
    ANSIX923: 4,
    ISO10126: 5
}

const CipherMode = {
    CBC: 1,
    ECB: 2,
    OFB: 3,
    CFB: 4,
    CTS: 5
}

const Padding = {
    /**
     * PKCS7填充
     * @param {Buffer} cipher 待填充的数据
     * @param {number} bytes_len 需要填充到的字节数,默认为16字节
     */
    PKCS7: function (cipher, bytes_len) {
        bytes_len = bytes_len ?? 16
        const pad = bytes_len - (cipher.length % bytes_len);
        const buffer = Buffer.from(new Array(pad).fill(pad));
        return Buffer.concat([cipher, buffer])
    },
    /**
     * None填充
     * @param {Buffer} cipher 待填充的数据
     * @param {number} bytes_len 需要的字节数,默认为16字节
     */
    None: function (cipher, bytes_len) {
        bytes_len = bytes_len ?? 16
        if (cipher.length % bytes_len !== 0) {
            throw new Error("明文不满足长度需求");
        }
    },
    Zeros: function (cipher, bytes_len) {
        bytes_len = bytes_len ?? 16
        const pad = bytes_len - (cipher.length % bytes_len);
        const buffer = Buffer.from(new Array(pad).fill(0));
        return Buffer.concat([cipher, buffer])
    }
}

class Aes {
    #cipher_mode;
    #padding_mode;
    /**
     * AES 算法
     * @param {CipherMode} cipher_mode 
     * @param {PaddingMode} padding_mode 
     */
    constructor(cipher_mode, padding_mode) {
        this.#cipher_mode = cipher_mode;
        this.#padding_mode = padding_mode;
    }

    #xor_buffer(buffer1, buffer2) {
        const buffer_len = buffer1.length
        const buffer = Buffer.alloc(buffer_len);
        for (let i = 0; i < buffer_len; i++) {
            buffer.writeUint8(buffer1[i] ^ buffer2[i], i)
        }
        return buffer
    }

    /**
     * 对buffer进行字节替换
     * @param {Buffer} buffer 需要字节替换的数据
     */
    #sub_word(buffer) {
        const result = []
        for (let i = 0; i < buffer.length; i++) {
            const number = buffer[i];
            const row = number >> 4;
            const column = number & 0xF;
            result[i] = s_box[row][column]
        }
        return Buffer.from(result)
    }

    /**
     * 字节代换
     * @param {Matrix} state 状态矩阵
     */
    #sub_byte(state) {
        state = state.matrix;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const number = state[i][j]
                const row = number >> 4;
                const column = number & 0xF;
                state[i].writeUint8(s_box[row][column], j);
            }
        }
    }

    /**
     * 行位移
     * @param {Matrix} state 状态矩阵
     */
    #shift_row(state) {
        state = state.matrix;
        let tmp1 = state[1][0];
        state[1][0] = state[1][1];
        state[1][1] = state[1][2];
        state[1][2] = state[1][3];
        state[1][3] = tmp1;

        tmp1 = state[2][0];
        let tmp2 = state[2][1];
        state[2][0] = state[2][2];
        state[2][1] = state[2][3];
        state[2][2] = tmp1;
        state[2][3] = tmp2;

        tmp1 = state[3][0];
        tmp2 = state[3][1];
        let tmp3 = state[3][2];
        state[3][0] = state[3][3]
        state[3][1] = tmp1;
        state[3][2] = tmp2;
        state[3][3] = tmp3;
    }

    /**
     * 列混合
     * @param {Matrix} state 状态矩阵
     */
    #mix_column(state) {
        state.matrix = state.gf_multiply(mix_column_matrix, state.matrix);
    }

    /**
     * 轮密钥加
     * @param {Matrix} state 状态矩阵
     * @param {Buffer} round_key 轮密钥 
     */
    #add_round_key(state, round_key) {
        state = state.matrix;
        const key_matrix = new Matrix(round_key, 4);
        key_matrix.transpose();
        for (let i = 0; i < 4; i++) {
            state[i] = this.#xor_buffer(state[i], key_matrix.matrix[i])
        }
    }

    /**
     * T函数
     * @param {Buffer} buffer 需要转换的buffer
     */
    #T(buffer, turn_count) {
        // 循环位移
        const _buffer = buffer
        buffer = Buffer.from([_buffer[1], _buffer[2], _buffer[3], _buffer[0]]);

        // 字节代换
        buffer = this.#sub_word(buffer);
        // 轮常量异或
        return this.#xor_buffer(buffer, Rcon[turn_count])

    }

    /**
     * 密钥扩展
     * @param {Buffer} key 初始密钥
     */
    #key_expansion(key) {
        /*
        The following algorithms will be used based on the size of the key:
            16 bytes = AES-128
            24 bytes = AES-192
            32 bytes = AES-256
        */
        const nk = key.length / 4;
        const nr = nk + 6;
        const key_matrix = new Matrix(key, 4).matrix;
        const w = [];
        for (let i = 0; i < 4 * (nr + 1); i++) {
            if (i < nk) {
                w[i] = key_matrix[i]
            } else {
                let temp = w[i - 1];
                if (i % nk == 0) {
                    temp = this.#T(temp, (i / nk) - 1);
                }
                else if (nk > 6 && i % nk == 4) {
                    temp = this.#sub_word(temp)
                }
                w[i] = this.#xor_buffer(w[i - nk], temp)
            }
        }
        const round_keys = []
        for (let i = 1; i < (nr + 1); i++) {
            round_keys.push(Buffer.concat([w[4 * i], w[4 * i + 1], w[4 * i + 2], w[4 * i + 3]]))
        }
        return round_keys
    }

    /**
     * AES 加密算法
     * @param {Buffer} chunk 加密块
     * @param {Buffer} key 密钥
     * @returns {Buffer}
     */
    #aes_encrypt(chunk, key) {
        const nk = key.length / 4;
        const nr = nk + 6;

        let state = new Matrix(chunk, 4);
        state.transpose()
        const round_key = this.#key_expansion(key);
        // 初始密钥加
        this.#add_round_key(state, key);

        // 轮循
        for (let i = 0; i < (nr - 1); i++) {
            this.#sub_byte(state);
            this.#shift_row(state);
            this.#mix_column(state);
            this.#add_round_key(state, round_key[i]);
        }

        // 最后一轮
        this.#sub_byte(state);
        this.#shift_row(state);
        this.#add_round_key(state, round_key[nr - 1]);
        state.transpose()
        return Buffer.concat(state.matrix)
    }

    /**
     * AES CBC模式加密
     * @param {Buffer} plaintext 明文
     * @param {Buffer} key 密钥
     * @param {Buffer} iv 初始化向量
     * @returns {Buffer}
     */
    #cbc_encrypt(plaintext, key, iv) {
        const result = []
        // 计算块个数, 将明文进行分区
        const block_number = Math.floor(plaintext.length / 16);
        plaintext = new Matrix(plaintext, 16).matrix;
        for (let i = 0; i < block_number; i++) {
            let chunk = plaintext[i];
            chunk = this.#xor_buffer(chunk, iv)
            const block_data = this.#aes_encrypt(chunk, key);
            iv = block_data
            result.push(block_data)
        }
        return Buffer.concat(result);
    }

    /**
     * AES ECB模式加密
     * @param {Buffer} plaintext 明文
     * @param {Buffer} key 初始密钥
     */
    #ecb_encrypt(plaintext, key) {
        const result = []
        // 计算块个数, 将明文进行分区
        const block_number = Math.floor(plaintext.length / 16);
        plaintext = new Matrix(plaintext, 16).matrix;
        for (let i = 0; i < block_number; i++) {
            let chunk = plaintext[i];
            const block_data = this.#aes_encrypt(chunk, key);
            result.push(block_data)
        }
        return Buffer.concat(result);
    }

    /**
     * AES 算法加密
     * @param {Buffer} plaintext 明文
     * @param {Buffer} key 密钥
     * @param {Buffer} iv 向量
     * @returns {Buffer} 加密过后的数据
     */
    encrypt(plaintext, key, iv) {
        // 检查密钥
        if (key === undefined) {
            throw new Error("请提供密钥");
        }

        // 填充明文
        switch (this.#padding_mode) {
            case PaddingMode.PKCS7:
                plaintext = Padding.PKCS7(plaintext)
                break;
            case PaddingMode.None:
                plaintext = Padding.None(plaintext)
                break;
            case PaddingMode.Zeros:
                plaintext = Padding.Zeros(plaintext)
                break;
            default:
                throw new Error("暂不支持该填充算法");
        }

        // AES工作模式
        switch (this.#cipher_mode) {
            case CipherMode.CBC:
                // 检查入参是否有iv, 以及长度是否符合
                if (iv === undefined) {
                    throw new Error("CBC模式需要提供iv初始向量");
                }

                if (iv.length !== 16) {
                    throw new Error("初始向量iv长度错误");
                }

                return this.#cbc_encrypt(plaintext, key, iv);
            case CipherMode.ECB:
                return this.#ecb_encrypt(plaintext, key);
            default:
                throw new Error("暂不支持该模式")
        }
    }

}

module.exports = {
    Aes, CipherMode, PaddingMode
}