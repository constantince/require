var Salut = {};
(function(doc, Salut) {
	Salut.showAllStack = function() {
		console.log(modules);
		console.log(excuteStack);
		console.log(pathAndFileName);
		console.log(entreScriptName);

	}
	var modules = {};
	var entreScriptName;
	var head = doc.head || doc.getElementsByTagName('head')[0];
	//执行栈
	var excuteStack = [];
	//文件名对应关系表
	var pathAndFileName = {};
	// sring：模块定义名称 func：模块的返回函数  others：提前声明的依赖数组
	function _String(string, func, others) {
		//得到分析路径
		string = _analyseName(string);
		//得到函数中的依赖文件名 如果依赖文件已经缓存，那么就无需返回依赖数组了。直接执行返回的函数
		var depends = _analyseDepend(func, others||[]);
		//将已经加载的模块存入栈中
		excuteStack.push(function() {
			//引入函数需要的参数
			var params = [];
			if(others && others.length > 0) {
				others.forEach(function(v){
					params.push(modules[_analyseName(v)]);
				});
			}
			return modules[string] = func.apply(Salut, params);
		});
		//执行依定义方法，得到return的模块
		_excuteRequire(depends);
		for (var i = 0, l = depends.length; i < l; i++) {
			(function(i) {
				excuteChain.after(function() {
					var c = require(depends[i]);
					if(c) {
						this.next();
					};
				});
			})(i);
		}
	}
	//define的第一个参数为数组的情况
	function _Array(array, func) {
		_Function(func, array);
		// for (var i = 0, l = array.length; i < l; i++) {
		// 	_String(array[i], func);
		// }
	}
	//define的第一个参数为函数
	function _Function(func, others) {
		var name = _analyseName(_getCurrentScript().src);
		_String(name, func, others||[]);
	}
	//策略模式处理不同参数的问题
	var defineParamObj = {
		'String': _String,
		'Array': _Array,
		'Function': _Function
	}
	/*
	var defineParamObj = {
	    'String': function(string, func) {
	        string = _analyseName(string);
	        var depends = _analyseDepend(func) || [];
	        // debugger;
	        excuteStack.push(function() {
	           return modules[string] = func();
	        });
	        _excuteRequire(depends);
	        for (var i = 0, l = depends.length; i < l; i++) {
	            (function(i) {
	                excuteChain.after(function() {
	                    require(depends[i]);
	                });
	            })(i);
	        }
	        // excuteChain.excute();
	    },
	    'Array': function(array, func) {
	        for (var i = 0, l = array.length; i < l; i++) {
	            this['String'](array[i], func);
	        }
	    },
	    'Function': function(func) {
	    	var name = _analyseName(_getCurrentScript().src);
	    	this['String'](name, func);
	    }
	}
	*/
	/**
	 * to excute all func require;
	 * @param depends length
	 * @returns 
	 */
	function _excuteRequire(depends) {
		if (depends.length === 0) {
			var u = excuteStack.length;
			while (u--) {
				var params = excuteStack[u]();;
				if (u === 0) {
					Events.trigger('excute', params);
					excuteStack = [];
				}
			}
		}
	}

	var Events = (function() {
		var func = [];

		function _on(name, fn) {
			func.push({
				name: name,
				callback: fn
			});
		}

		function _trigger(name, arg) {
			for (var i = 0, l = func.length; i < l; i++) {
				if (func[i].name === name) {
					func[i].callback.call(Salut, arg);
				}
			}
			_clear();
		}

		function _clear() {
			func = [];
		}

		return {
			on: _on,
			trigger: _trigger
		}
	})();

	/**
	 * a chain to order func excute;
	 * @param 
	 * @returns 
	 */
	// var Chain = (function() {
	function _Chain() {
		this.cache = [];
	}
	/**
	 * add function to order stack
	 * @param func (func)
	 * @returns {_Chain}
	 */
	_Chain.prototype.after = function(fn) {
			this.cache.push(fn);
			this.cur = 0;
			return this;
		}
		/**
		 * To pass the authority to next function excute
		 * @param 
		 * @returns
		 */
	_Chain.prototype.passRequest = function() {
			var result = 'continue';
			while (this.cur < this.cache.length && result === 'continue') {
				result = this.cache[this.cur++].apply(this, arguments);
				if (this.cur === this.cache.length) {
					this.clear();
				}
			}
		}
		/**
		 * an api to excute func in stack
		 * @param 
		 * @returns 
		 */
	_Chain.prototype.next = function() {
			this.excute();
		}
		/**
		 * let use to excute those function
		 * @param 
		 * @returns
		 */
	_Chain.prototype.excute = function() {
		this.passRequest.apply(this, arguments)
	}

	/**
	 * to clear stack all function
	 * @param 
	 * @returns
	 */
	_Chain.prototype.clear = function() {
		this.cache = [];
		this.cur = 0;
	}



	var excuteChain = new _Chain();
	// return new _Chain();
	// })();
	/**
	 * To analyseDepend those func who was each depend on others;
	 * @param url script(func)
	 * @returns {array}
	 */
	//分析文件代码中的加载情况
	function _analyseDepend(func, others) {
		var firstReg = /\.require\((\"|\')[^\)]*(\"|\')\)/g,
			secondReg = /\((\"|\')[^\)]*(\"|\')\)/g,
			lastReplaceRge = /\((\"|\')|(\"|\')\)/g;
		var string = func.toString();
		var allFiles = (string.match(firstReg) || []).concat(others);
		var newArr = [];
		// if (!allFiles) { allFiles = []; }
		//将预先定义的依赖加入
		// allFiles = allFiles.concat(others);
		if(!allFiles.length) return newArr;
		allFiles.map(function(v) {
			var m;
			if(m = v.match(secondReg)) {
			 	m = m[0].replace(lastReplaceRge, '');
			}else{
				m = v;	
			}
			//只有在异步加载的情况下需要 返回解析依赖
			if(!modules[_analyseName(m)]) {
				newArr.push(m);	
			}
		});
		// if(newArr.length > 0) {
			return newArr;
		// }else{
		// 	return ''
		// }
	}
	/**
	 * To analyseDepend module's path and name;
	 * @param name
	 * @returns {string}
	 */
	function _analyseName(path) {
		var needAnalyse = path.indexOf('/') > -1 ? true : false;
		var newPath = path;
		if (needAnalyse) {
			if (!pathAndFileName[path]) {
				var fileIndex = path.lastIndexOf('/') + 1;
				newPath = path.substr(fileIndex).replace(/\.js$/g, '');
				pathAndFileName[path] = newPath;
			} else {
				return pathAndFileName[path];
			}
		}
		return newPath
	};
	/**
	 * To get require module's;
	 * @param name
	 * @returns name path
	 */
	function _getPath(name) {
		var needAnalyse = name.indexOf('/') > -1 ? true : false;
		if (needAnalyse)
			return name;
		var path = name;
		for (var i in pathAndFileName) {
			if (name == pathAndFileName[i])
				path = i;
		}
		return path;
	};

	/**
	 * @param url script's location(string|array|func)
	 * @returns {null}
	 */
	function _createScript(url) {
		var script = doc.createElement('script');
		var me = this;
		script.async = true;
		script.src = url + '.js';
		if ('onload' in script) {
			script.onload = function(event) {
				return _scriptLoaded.call(me, script);
			};
		} else {
			script.onreadystatechange = function() {
				if (/loaded|complete/.test(node.readyState)) {
					me.next();
					_scriptLoaded(script);
				}
			};
		}
		head.appendChild(script);
	}
	/**
	 *
	 * @param modules name or function(string|array|func)
	 * @returns {callstack}
	 */
	function _scriptLoaded(script) {
		head.removeChild(script);
		excuteChain.next();
	}
	/**
	 *定义模块的方法
	 * @param modules name or function(string|array|func)
	 * @returns {callstack}
	 */
	function define() {
		var arg = Array.prototype.slice.call(arguments);
		var paramType = Object.prototype.toString.call(arg[0]).split(' ')[1].replace(/\]/, '');
		defineParamObj[paramType].apply(null, arg);
		// Chain.excute();
	}

	/**
	 *
	 * @param modules name or uri (string)
	 * @returns {module}
	 */
	function require(name, func) {
		var p = _analyseName(name);
		if (p in modules) {
			func && func.call(this, modules[p]);
			return modules[p];
		} else {
			_createScript(name);
			func && Events.on('excute', func);
		}
	}
	/**
	 *get current script path name
	 * @param modules name or uri (string)
	 * @returns {module}
	 */
	function _getCurrentScript() {
		//取得正在解析的script节点
		if (doc.currentScript) {
			//firefox 4+
			return doc.currentScript;
		}
	}

	var currentScriptNode = _getCurrentScript();
	entreScriptName = currentScriptNode.getAttribute('app-main');
	if (entreScriptName) {
		require(entreScriptName);
	}

	Salut.define = define;
	Salut.require = require;
})(document, Salut);