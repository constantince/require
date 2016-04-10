# require
<h2>简单的模块加载器(学习理解用)</h2>
<h3>API</h3>
<p>define: 定义模块</p>
<p>require: 加载模块</p>
<h3>代码示范</h3>
<p>
//A.js
asdf.define(function(){
	var a = this.require('js/B');
	return { A: a };
});
//B.js
asdf.define('B', function(){
	var b = this.require('js/C');
	return { B: b };
});
//C.js
asdf.define('C', function(){
	return { hello: 'world' };
});
//D.js
asdf.define(function(){
	return this.require('js/B');
});
//main.js
asdf.require('js/A', function(a){
	console.log(a);
});
</p>
