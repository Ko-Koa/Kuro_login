const { Buffer } = require("node:buffer");
const { GF128 } = require("./galoisField")

class Matrix {
    /**
     * 
     * @param {Buffer} data 原始数据
     * @param {number} block_size 块大小
     */
    constructor(data, block_size) {
        this.matrix = this.#init_matrix(data, block_size);
    }

    /**
     * 将数据分割成若干块
     * @param {Buffer} buffer 待分割的数据
     * @param {number} block_size 块大小,默认为 4
     */
    #init_matrix(buffer, block_size) {
        const state = [];
        block_size = block_size ?? 4;
        const turn = Math.floor(buffer.length / block_size);
        for (let i = 0; i < turn; i++) {
            const chunk = [];
            for (let j = 0; j < block_size; j++) {
                chunk.push(buffer[i * block_size + j])
            }
            state.push(Buffer.from(chunk))
        }
        return state
    }

    /**
     * 矩阵转置
     */
    transpose() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < i; j++) {
                const tmp = this.matrix[i][j];
                this.matrix[i][j] = this.matrix[j][i];
                this.matrix[j][i] = tmp;
            }
        }
    }

    /**
     * 获得第n列数据
     * @param {number} index 列索引
     * @returns {Buffer}
     */
    col(index) {
        const buffer = [];
        this.matrix.forEach(row => {
            buffer.push(row[index]);
        })
        return Buffer.from(buffer)
    }

    gf_multiply(a, b) {
        const rowsA = a.length;
        const colsA = a[0].length;
        const rowsB = b.length;
        const colsB = b[0].length;
        if (colsA !== rowsB) {
            throw new Error("Matrices dimensions do not match for multiplication.");
        }
        const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] ^= GF128.multy(a[i][k], b[k][j]);
                }
            }
            result[i] = Buffer.from(result[i])
        }
        return result;
    }

}

module.exports = { Matrix };
