// questions:

// depCount是用来干什么的: module或者task的依赖长度

// task和module的不同之处在哪里: 
// task的功能是在task的依赖都准备好了后执行该任务的成功回调函数,task对应着require,不需要fetch方法
// module则是一个js文件，js文件中定义了对象，对象中包括了公用的方法。module对应着define，需要fetch方法


// fetch方法是网络请求吗
// fetch方法不是网络请求，本质上它是用来加载需要的js文件,根据文件路径来添加script标签








let require, define;

(function (global) {
  if (global !== window) {
    console.log('当前环境非浏览器');
    return;
  }

  let mid = 0;
  let tid = 0;
  // 存储所有模块的容器
  let modules = {};
  // 存储的所有tasks
  let tasks = {};
  // 将模块或task的name和具体的module或者task一一对应
  // 收集了全局范围内的所有模块或者task和它们对应的依赖
  // 当某一个模块准备好了过后，会将mapDepToModuleOrTask中所有依赖此模块的depCount减1
  let mapDepToModuleOrTask = {};

  window.modules = modules;
  window.tasks = tasks;
  window.mapDepToModuleOrTask = mapDepToModuleOrTask;

  require = function (dep, cb, errorFn) {
    // 创建task
    if (isFunction(dep)) {
      cb = dep;
      dep = undefined;
    }
    let task = new task(dep, cb, errorFn);
    task.analyzeDeep();
  }

  define = function (name, dep, cb, errorFn) {
    // 定义一个模块
  }

  // 启动主入口加载流程
  let mainEntryModule = new Module(getMainEntryModuleName());
  modules[mainEntryModule.name] = mainEntryModule;































  // 模块的状态
  Module.status = {}

  function Module(name, dep, cb, errorFn) {
    // 模块
    // name 模块名
    // dep 模块依赖
    // cb 成功回调
    // errorFn 失败回调
  }

  Module.prototype.init = function (name, dep, cb, errorFn) {
    // 模块init
    // name 模块名
    // dep array 模块依赖
    // cb 成功回调函数
    // errorFn 失败回调函数
  }

  Module.prototype.fetch = function () {
    // 获取模块，实质就是将模块的路径放入script标签 
  }

  Module.prototype.fetchFail = function () {
    // 获取失败的回调函数
  }

  Module.prototype.analyzeDeep = function () {
    // 分析模块依赖?
    // depCount 模块依赖量
    // mapDepToModuleOrTask 模块名->模块依赖映射表
    let depCount = this.dep ? this.dep.length : 0;
    Object.defineProperty(this, 'depCount', {
      get() {
        return depCount;
      },
      set(newDepCount) {
        depCount = newDepCount;
        if (newDepCount === 0) {
          if (this.mid) {
            console.log('module');
          } else if (this.tid) {
            console.log('task')
          }
          this.execute();
        }
      }
    });
    this.depCount = depCount;

    if (!this.depCount) return;

    this.dep.forEach((depModuleName) => {
      if (!modules[depModuleName]) {
        let module = new Module(depModuleName);
        modules[module.name] = module;
      }

      if (!mapDepToModuleOrTask[depModuleName]) {
        mapDepToModuleOrTask[depModuleName] = [];
      }
      mapDepToModuleOrTask[depModuleName].push(this);

    });

  }

  Module.prototype.checkCycle = function () {
    // 检查模块循环依赖问题
    let cycleDep = [];
    for(let depModuleName of (this.dep || [])){
      if(
        mapDepToModuleOrTask[this.name] 
        && 
        mapDepToModuleOrTask[this.name].indexOf(modules[depModuleName])1== -1
      ){
          cycleDep.push(depModuleName);
        }
    }
    return cycleDep.length ? cycleDep : undefined; 
  }

  Module.prototype.execute = function () {
    // 执行模块?
    this.callHook('EXECUTING');
    let arg = (this.dep || []).map((dep) => {
      return modules[dep].exports;
    });

    if (this.requireInDep !== -1 && this.requireInDep !== undefined) {
      arg.splice(this.requireInDep, 0, require);
    }

    this.exports = this.cb.apply(this, arg);
    this.callHook('EXECUTED');
    if (this.tid) {
      console.log('task end');
    } else if (this.mid) {
      console.log('module end');
    }

  }

  Module.prototype.callHook = function (mStatus) {
    // 状态机:触发模块状态转移
    // 当模块处于运算完成状态时，查找模块名->模块依赖映射表，修改相应的depCount
    let status = Module.STATUS[mStatus];
    if(!this.status){
      Object.defineProperty(this, 'status', {
        get(){
          return status;
        },
        set(newStatus){
          status = newStatus;
          if(status === 5){
            let depedModules = mapDepToModuleOrTask[this.name];
          }
          if(!depedModules) return;
          depedModules.forEach((module)=>{
            setTimeout(()=>{
              module.depCount--;
            });
          });
        }
      })
    }
  }

  function Task(dep, cb, errorFn) {
    // 每次调用require相当于创建一个task
    // 任务构造函数
    // dep 依赖数组
    // cb 成功回调函数
    // errorFn 失败回调函数
  }

  Task.prototype = Object.create(Module.prototype);

  Task.prototype.init = function (dep, cb, errorFn) {
    // dep 依赖数组
    // cb 成功回调函数
    // errorFn 失败回调函数
  }




























  // 工具函数

  function getMainEntryModuleName() {
    // 获取主入口模块名
  }

  function getCurrentModuleName() {
    // 获取当前正在执行的模块的模块名
  }

  function modulePathToModuleName(path) {
    // 将模块的路径换成模块名
  }

  function moduleNameToModulePath(name) {
    // 将模块名转换成模块路径
  }

  function isFunction() {
    // 判断是否是函数
  }

  function isString() {
    // 判断是否时字符串
  }





})