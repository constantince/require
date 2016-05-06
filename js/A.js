Salut.define(['js/E', 'js/F'], function(e, f){
	var a = this.require('js/B');
  // var k = 'N';
  //变量定义的是异步执行...
  function syncLoadN (k) {
    Salut.require('js/'+ k, function(n) {
      console.log(n);
    });
  }
  
  
	// console.log(a, document.currentScript.src);
	return { A: a, E:e, F:f, send: syncLoadN};
});