# require
<h2>简单的模块加载器(学习理解用)</h2>
<h3>API</h3>
<p>define: 定义模块</p>
<p>require: 加载模块</p>
<h3>代码示范</h3>
<p>
//A.js 普通模块定义<br/ >
Salut.define(function(){<br/ >
	var a = this.require('js/B');<br/ >
	return { A: a };<br/ >
});<br/ >
</p>
<p>
//B.js 声明模块名称b<br/ >
Salut.define('B', function(){<br/ >
	var b = this.require('js/C');<br/ >
	return { B: b };<br/ >
});<br/ >
</p>
<p>
//C.js 未生命模块名称 提前声明了模块的依赖D<br/ >
Salut.define(['D'], function(){<br/ >
	return { hello: 'world' };<br/ >
});
</p>
<p>
//D.js 提前声明多个模块依赖以及 在函数体内生命模块
<br/ >
Salut.define(['A', 'D'],function(){
<br/ >
	return this.require('js/B');
	<br/ >
});<br/ >
</p>
<p>
//main.js
<br/ >
Salut.require('js/A', function(a){
<br/ >
	console.log(a);
	<br/ >
});
</p>
