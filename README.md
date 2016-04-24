# require
<h2>简单的模块加载器(学习理解用)</h2>
<h3>API</h3>
<p>define: 定义模块</p>
<p>require: 加载模块</p>
<h3>代码示范</h3>
<p>
//A.js<br/ >
asdf.define(function(){<br/ >
	var a = this.require('js/B');<br/ >
	return { A: a };<br/ >
});<br/ >
</p>
<p>
//B.js<br/ >
asdf.define('B', function(){<br/ >
	var b = this.require('js/C');<br/ >
	return { B: b };<br/ >
});<br/ >
</p>
<p>
//C.js<br/ >
asdf.define('C', function(){<br/ >
	return { hello: 'world' };<br/ >
});
</p>
<p>
//D.js
<br/ >
asdf.define(function(){
<br/ >
	return this.require('js/B');
	<br/ >
});<br/ >
</p>
<p>
//main.js
<br/ >
asdf.require('js/A', function(a){
<br/ >
	console.log(a);
	<br/ >
});
</p>
