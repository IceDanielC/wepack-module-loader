# wepack-module-loader
简易的模块加载器，模拟简易版webpack解析打包过程

主要是实现的webpack打包的`make`阶段:

从入口点分析模块及其依赖的模块（babel插件转化为AST，分析ImportDeclaration和CallExpression生成deps对象，babel.transformFromAst将AST转化为code），创建这些模块对象（大致是这样{ file, deps, code }），并生成依赖关系图

`目前支持 esm 和 commonjs 两种模块类型`

- 安装依赖
`pnpm i`

- 构建测试bundle
`pnpm run build`

- 测试直接在本地运行index.html即可

