const fs = require('fs')
const path = require("path")
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const babel = require("@babel/core")

/**
 * 模块解析处理
 * @param {*} file 文件路径
 * @returns { file, deps, code }
 */
const getModuleInfo = (file) => {
    const body = fs.readFileSync(file, 'utf-8')
    // 使用babel将当前模块转化为AST
    const ast = parser.parse(body, {
        // 同时解析es模块和cjs模块
        sourceType: 'unambiguous'
    })
    // 遍历ast
    const deps = {} // 依赖文件的 相对路径(引用路径):绝对路径
    traverse(ast, {
        // 分析import
        ImportDeclaration({ node }) {
            const dirname = path.dirname(file)
            let postfix = file.slice(file.lastIndexOf('.'), file.length)
            const abspath = './' + path.join(dirname, node.source.value + postfix)
            deps[node.source.value] = abspath
        },
        // 分析require
        CallExpression({ node }) {
            if (node.callee.name === 'require') {
                const dirname = path.dirname(file)
                let postfix = file.slice(file.lastIndexOf('.'), file.length)
                const abspath = './' + path.join(dirname, node.arguments[0].value + postfix)
                deps[node.arguments[0].value] = abspath
            }
        }
    })
    // 使用babel，将es6转为es5，Promise等api也会被转化
    const { code } = babel.transformFromAst(ast, null, {
        presets: ["@babel/preset-env"]
    })
    const moduleInfo = { file, deps, code }
    return moduleInfo
}

// 递归获取依赖，生成依赖关系图
const parseModules = (file) => {
    const entry = getModuleInfo(file)
    const moduleInfoQueue = [entry]

    const depsGraph = {}

    for (let i = 0; i < moduleInfoQueue.length; i++) {
        const deps = moduleInfoQueue[i].deps
        if (deps) {
            for (const key in deps) {
                if (deps.hasOwnProperty(key)) {
                    moduleInfoQueue.push(getModuleInfo(deps[key]))
                }
            }
        }
    }

    moduleInfoQueue.forEach(moduleInfo => {
        depsGraph[moduleInfo.file] = {
            deps: moduleInfo.deps,
            code: moduleInfo.code
        }
    })
    console.log(depsGraph);
    return depsGraph
}

/**
 * 打包入口函数
 * @param {*} enrty 入口文件路径
 * @returns 模块加载IIFE
 */
const bundle = (enrty) => {
    const depsGraph = JSON.stringify(parseModules(enrty))

    /** 
     * 这里其实是自己实现了require方法
     * 核心就是通过eval来执行模块的code（通过模块的绝对路径），返回模块的exports导出内容
     * 浏览器不支持require，需要自己实现require的功能，在浏览器执行
     */
    return `(function (graph) {
        function __webpack_require__(file) {
            function absRequire(relPath) {
                return __webpack_require__(graph[file].deps[relPath])
            }
            var exports={};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        __webpack_require__('${enrty}')
    })(${depsGraph})`
}

const content = bundle('./src/index.js')

if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true });
}
fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js', content)


