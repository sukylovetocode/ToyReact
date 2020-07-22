// let childrenSymbol = Symbol("children")
class ElementWrapper {
    constructor(type){
        this.type = type
        this.props = Object.create(null)
        // this[childrenSymbol] = []
        // this.root = document.createElement(type)
        this.children = []
    }
    get vdom(){
        return this
    }

    setAttribute(name, value){
        // 表示所有字符
        // if(name.match(/^on([\s\S]+)$/)){
        //     // console.log(RegExp.$1)
        //     // 绑定我们的监听函数
        //     let EventName = RegExp.$1.replace(/^[\s\S]/,(s) => s.toLowerCase())
        //     this.root.addEventListener(EventName, value)
        // }

        // if(name === 'className')
        //     this.root.setAttribute("class", value)

        // this.root.setAttribute(name, value)
        this.props[name] = value
    }
    appendChild(vchild){
        // let range = document.createRange()
        // if(this.root.children.length){
        //     range.setStartAfter(this.root.lastchild)
        //     range.setEndAfter(this.root.lastchild)
        // }else{
        //     range.setStart(this,root, 0)
        //     range.setEnd(this.root, 0)
        // }
        // vchild.mountTo(range)
        // this[childrenSymbol].push(vchild)
        this.children.push(vchild.vdom)
    }
    mountTo(range){
        // range.deleteContents()
        // parent.appendChild(this.root)
        this.range = range
        let placeholder = document.createComment("placeholder")
        let endRange = document.createRange()
        endRange.setStart(this.range.endContainer, this.range.endOffset)
        endRange.setEnd(this.range.endContainer, this.range.endOffset)
        endRange.insertNode(placeholder)

        range.deleteContents()
        let element = document.createElement(this.type)

        for(let name in this.props){
            //取出name
                 let value = this.props[name]
                if(name.match(/^on([\s\S]+)$/)){
                    // console.log(RegExp.$1)
                    // 绑定我们的监听函数
                    let eventName = RegExp.$1.replace(/^[\s\S]/,(s) => s.toLowerCase())
                    element.addEventListener(eventName, value)
                }

                if(name === 'className'){
                    element.setAttribute('class', value);
                }

                element.setAttribute(name, value)

            }

            for(let child of this.children){
                   let range = document.createRange()
                    if(element.children.length){
                        range.setStartAfter(element.lastChild)
                        range.setEndAfter(element.lastChild)
                    }else{
                        range.setStart(element, 0)
                        range.setEnd(element, 0)
                    }
                    child.mountTo(range)
            }

        

        range.insertNode(element)
    }
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content)
        this.type = "#text"
        this.children = []
        this.props = Object.create(null)
    }
    mountTo(range){
        this.range = range
        // parent.appendChild(this.root)
        range.deleteContents()
        range.insertNode(this.root)
    }
    get vdom() {
        return this
    }
}

export class Component{
    constructor(){
        this.children = []
        this.props = Object.create(null)
    }
    get type(){
        return this.constructor.name
    }
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)$/)){
            console.log('ddd')
        }
        this.props[name] = value
        this[name] = value
    }

    mountTo(range){
       this.range = range
       this.update()
        

        // lastchild 可能是null
        // let range = document.createRange()
        // range.setStartAfter(parent.lastChild)
        // range.setEndAfter(parent.lastChild)
    }
    update(){
        // let placeholder = document.createComment("placeholder")
        // let range = document.createRange()
        // range.setStart(this.range.endContainer, this.range.endOffset)
        // range.setEnd(this.range.endContainer, this.range.endOffset)
        // range.insertNode(placeholder)

        // this.range.deleteContents()

        let vdom = this.vdom
        if(this.oldVdom){
           let isSameNode = (node1, node2) => {
                if(node1.type !== node2.type){
                    return false
                }

                for(let name of node1.props){
                    if (typeof node1.props[name] === 'object' && typeof node2.props[name] === 'object'
                    && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])) {
                        continue;
                    }

                    if(node1.props[name] !== node2.props[name]){
                        return false
                    }
                    if(Object.keys(node1.props).length !== Object.keys(node2.props).length){
                        return false
                    }
                }

                return true
           }

           let isSameTree = (node1, node2) => {
                if(!isSameNode(node1, node2)){
                    return false
                }

                if(node1.children.length != node2.children.length){
                    return false
                }

                for(let i=0;i<node1.children.length;i++){
                    if(!isSameTree(node1.children[i], node2.children[i])){
                        return false
                    }
                }

                return true
           
             }

             let replace = (newTree, oldTree) => {
                  // 无影响树的状态
                    if(isSameTree(newTree, oldTree)){
                        return 
                    }
                    if(!isSameNode(newTree, oldTree)){
                        newTree.mountTo(oldTree.range)
                        // 处理chindren
                    }else{
                        for(let i=0;i<newTree.children.length;i++){
                            replace(newTree.children[i], oldTree.children[i])
                        }
                    }
             }

            replace(vdom, this.oldVdom)

             console.log('new',vdom)
             console.log('old',this.vdom)
        }else{
            vdom.mountTo(this.range)

        }
        this.oldVdom = vdom
        
    }

    get vdom(){
       return this.render().vdom
    }

    appendChild(vchild){
        this.children.push(vchild)
    }
    setState(state){
        let merge = (oldState, newState) => {
            for(let p in newState){
                // 对对象特殊处理
                if(typeof newState[p] === "object" && newState[p] !== null){
                    if(typeof oldState[p] !== "object"){
                        if(newState[p] instanceof Array){
                            oldState[p] = []
                        }else{
                            oldState[p] = {}
                        }
                    }
                    
                    merge(oldState[p], newState[p])
                }else{
                    oldState[p] = newState[p]
                }
            }
        }
        if(!this.state && state){
            this.state = {}
        }
        merge(this.state, state)
        // 重新绘制 range 特性
        this.update()
        
    }
}

export let ToyReact = {
    createElement(type, attributes, ...children){
        let element 

        if(typeof type === "string"){
            element = new ElementWrapper(type)
        }else{
            element = new type()
        }

        for(let name in attributes){
            //element[name] = attributes[name] wrong
            element.setAttribute(name, attributes[name])
        }
        
        let insertChildren = (children) =>{
            for(let child of children){
                if(typeof child === 'object' && child instanceof Array){
                    insertChildren(child)
                }else{
                    // debugger
                    if(!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)){
                        child = String(child)
                    }
                    if(typeof child === 'string'){
                        // child = document.createTextNode(child)
                        child = new TextWrapper(child)
                    }
                    element.appendChild(child)
                }
            }
        }
        insertChildren(children)

        return element
    },
    render(vdom,element){
        let range = document.createRange()
        if(element.children.length){
            range.setStartAfter(element.lastChild)
            range.setEndAfter(element.lastChild)
        }else{
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }

        vdom.mountTo(range)
    }
}