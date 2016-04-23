//数组中添加依赖 依赖前置
Salut.define(['A', 'js/F'], function(a, f) {
	return {A:a, F:f};
});