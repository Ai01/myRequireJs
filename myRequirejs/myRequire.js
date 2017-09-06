// 工具函数
var isBrowser = new Function("try {return this===window;}catch(e){return false;}");
var isNode = new Function("try {return this===global;}catch(e){return false;}");

function isFunction(item) {
  return typeof item === 'function';
}

function isString(item) {
  return typeof item === 'string';
}

function getCurrentModuleName() {
  let src = document.currentScript.getAttribute('src');
  return modulePathToModuleName(src);
}

function modulePathToModuleName(path) {
  let reg = /\w*.js/;
  let output = reg.exec(path);
  if (!output) {
    return path;
  } else {
    return output[0].split('.')[0];
  }
}

function moduleNameToModulePath(name) {
  let reg = /\w*.js/;
  let output = reg.exec(name);
  if (!output) {
    return `./${name}.js`;
  } else {
    return name;
  }
}

function getMainEntryModuleName() {
  let dataMain = document.currentScript.getAttribute('data-main');
  return modulePathToModuleName(dataMain);
}


// requiejs namespace
var R = {
  require: '',
  define: '',
};

if (isNode()) {
  console.error('requirejs不支持在node中运行');
} else if (isBrowser()) {

  let mid = 0; // 模块id。初始为0，根据这个值来生成每一个模块的id
  let tid = 0; // 任务id。初始为0，根据这个值来生成每一个任务的id
  let modules = {}; // 所有模块
  let tasks = {}; // 所有任务
  let mapDepToModuleOrTask = {}; // 模块 -> 依赖这个模块的模块映射

  Module.STATUS = {
    INITED: 1,
    FETCHING: 2,
    FETCHED: 3,
    EXECUTING: 4,
    EXECUTED: 5,
    ERROR: 6,
  };

  // require用来生成task
  R.require = function (dep, cb, errorFn) {
    if (isFunction(dep)) {
      cb = dep;
      dep = undefined;
    }
    let task = new Task(dep, cb, errorFn);
    task.analyzeDep();
  };


  /**
   * define用来生成module
   * @param {any} name 模块名(可省略) 
   * @param {any} dep 依赖模块数组(可省略)
   * @param {any} cb 成功回调函数(必填)
   * @param {any} errorFn 失败回调函数(可省略)
   */
  R.define = function (name, dep, cb, errorFn) {
    // 缺少参赛处理 
    if (isFunction(name)) {
      cb = name;
      name = getCurrentModuleName();
    } else if (Array.isArray(name) && isFunction(dep)) {
      // 传入了依赖和回调
      cb = dep;
      dep = name;
      name = getCurrentModuleName();
    } else if (isString(name) && Array.isArray(dep) && isFunction(cb)) {
      // 传入了名字，依赖和回调
    }

    let module = modules[name];
    module.name = name;
    module.dep = dep;
    module.cb = cb;
    module.errorFn = errorFn;
    module.analyzeDep();
  };


  // module对象
  function Module(name, dep, cb, errorFn) {
    this.mid = ++mid;
    this.init(name, dep, cb, errorFn);
    this.fetch();
  }

  Module.prototype.init = function (name, dep, cb, errorFn) {
    this.name = name;
    this.src = moduleNameToModulePath(name);
    this.dep = dep;
    this.cb = cb;
    this.errorFn = errorFn;
    this.callHook('INITED');
  }

  // fetch
  Module.prototype.fetch = function () {
    const script = document.createElement('script');
    script.src = this.src;
    document.body.appendChild(script);
    this.callHook('FETCHING');
  }

  Module.prototype.fetchFail = function () {
    console.error(`${this.name}模块加载失败`);
    this.callHook('ERROR');
  }

  // analyze dep 
  Module.prototype.analyzeDep = function () {

    // ToDo 处理dep中包含require的特殊情况

    // ToDo 处理循环依赖

    let depCount = this.dep ? this.dep.length : 0;

    if (depCount == 0) {
      this.execute();
      return;
    }

    Object.defineProperty(this, 'depCount', {
      get() {
        return depCount;
      },
      set(newDepCount) {
        depCount = newDepCount;
        if (newDepCount === 0) {
          if (this.mid) {
            console.log(`模块${this.name}的依赖已经全部准备好`);
          } else if (this.tid) {
            console.log(`任务${this.tid}的依赖已经全部准备好`);
          }
          this.execute();
        }
      }
    });

    this.depCount = depCount;

    if (!this.depCount) {
      return;
    };

    this.dep.forEach((depedModuleName) => {
      if (!modules[depedModuleName]) {
        let module = new Module(depedModuleName);
        modules[module.name] = module;
      }

      if (!mapDepToModuleOrTask[depedModuleName]) {
        mapDepToModuleOrTask[depedModuleName] = [];
      }

      mapDepToModuleOrTask[depedModuleName].push(this);

    })

  }

  // status改变
  Module.prototype.callHook = function (mStatus) {
    let status = Module.STATUS[mStatus];
    if (!this.status) {
      Object.defineProperty(this, 'status', {
        get() {
          return status;
        },
        set(newStatus) {
          status = newStatus;
          if (status === 5) {
            // module executed
            let depedModules = mapDepToModuleOrTask[this.name];
            if (!depedModules) {
              return
            };
            depedModules.forEach((module) => {
              setTimeout(() => {
                module.depCount--;
              })
            });
          }
        }
      });
    } else {
      this.status = status;
    }
  }

  // execute 
  Module.prototype.execute = function () {
    this.callHook('EXECUTING');
    let arg = (this.dep || []).map((dep) => {
      return modules[dep].exports;
    })


    this.exports = this.cb.apply(this, arg);
    this.callHook('EXECUTED');
    if (this.tid) {
      console.log(`任务${this.tid}执行完毕`);
    } else if (this.mid) {
      console.log(`模块${this.name}执行完毕`);
    }
  }

  function Task(dep, cb, errorFn) {
    this.tid = ++tid;
    this.init(dep, cb, errorFn);
  }

  Task.prototype = Object.create(Module.prototype);

  Task.prototype.init = function (dep, cb, errorFn) {
    this.dep = dep;
    this.cb = cb;
    this.errorFn = errorFn;
    tasks[this.tid] = this;
  }

  let mainEntryModule = new Module(getMainEntryModuleName());
  modules[mainEntryModule.name] = mainEntryModule;

}