var asdf = {};
(function(doc, asdf) {
	asdf.showAllStack = function() {
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
	// var strackFun = [];
	
	function _String(string, func) {
		string = _analyseName(string);
		var depends = _analyseDepend(func) || [];
		// debugger;
		excuteStack.push(function() {
			return modules[string] = func.call(asdf);
		});
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

	function _Array(array, func) {
		for (var i = 0, l = array.length; i < l; i++) {
			_String(array[i], func);
		}
	}

	function _Function(func) {
		var name = _analyseName(_getCurrentScript().src);
		_String(name, func);
	}
	//to define functions get many params 
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
					func[i].callback.call(asdf, arg);
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
	function _analyseDepend(func) {
		var firstReg = /\.require\((\"|\')[^\)]*(\"|\')\)/g,
			secondReg = /\((\"|\')[^\)]*(\"|\')\)/g,
			lastReplaceRge = /\((\"|\')|(\"|\')\)/g;
		var string = func.toString();
		var allFiles = string.match(firstReg);
		var newArr = [];
		if (!allFiles) {
			return '';
		}
		allFiles.map(function(v) {
			var m = v.match(secondReg)[0].replace(lastReplaceRge, '');
			//只有在异步加载的情况下需要 返回解析依赖
			if(!modules[_analyseName(m)]) {
				newArr.push(m);	
			}
		});
		if(newArr.length > 0) {
			return newArr;
		}else{
			return ''
		}
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
		// this !== window && this.next();
		excuteChain.next();
	}
	/**
	 *
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

	asdf.define = define;
	asdf.require = require;
})(document, asdf);