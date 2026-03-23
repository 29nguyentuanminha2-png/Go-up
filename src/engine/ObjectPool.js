export class ObjectPool {
  constructor(createFn, initial = 0) {
    this.createFn = createFn;
    this.free = [];
    for (let i = 0; i < initial; i += 1) {
      this.free.push(this.createFn());
    }
  }

  acquire() {
    return this.free.pop() || this.createFn();
  }

  release(obj) {
    this.free.push(obj);
  }

  releaseAll(list) {
    for (let i = 0; i < list.length; i += 1) {
      this.release(list[i]);
    }
    list.length = 0;
  }
}
