/**
 * Hash抽象类
 */
class Hash {
    constructor(block_size){
        if (new.target === Hash){
            throw new Error("Cannot instantiate abstract class")
        }
        Reflect.ownKeys(Hash.prototype).forEach((key) => {
            if (!new.target.prototype.hasOwnProperty(key)){
                throw new Error(`请覆写 ${key} 方法`);
            }
        })
        this.block_size = block_size
    }
    
    hash(plain_text){}

}

module.exports = {
    Hash
}
