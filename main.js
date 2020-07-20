import {ToyReact, Component} from './ToyReact'

class MyComponent extends Component{
    render(){
        return <div>
            <span>Hello</span>
            {this.children}
        </div>
    }
}

let a = <MyComponent name="a" id="ida">
    <div>123</div>
</MyComponent>

ToyReact.render(
    a,
    document.body
)

// document.body.appendChild(a)
ToyReact.render(a, document.body)