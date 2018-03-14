import React, { Component } from 'react'
import { render } from 'react-dom'
import { Router, Link, hashHistory } from 'react-router'

let styles = {}
styles.link = {
    display: 'inline-block',
    padding: 20,
    color: 'salmon',
    fontWeight: 200,
    cursor: 'pointer'
}

styles.activeLink = Object.assign(styles.link, {
    color: 'darkred'
})

class App extends Component {
    render() {
        return <div>
            <Nav />
            {this.props.children || 'dashboard'}
        </div>
    }
}

class Nav extends Component {
    render() {
        return <div>
            <Link to="/imageTester"
                style={styles.link} activeStyle={styles.activeLink}>imageTester</Link>
            <Link to="/audioTester"
                style={styles.link} activeStyle={styles.activeLink}>audioTester</Link>
            <Link to="/fractalEditor"
                style={styles.link} activeStyle={styles.activeLink}>fractalEditor</Link>
        </div>
    }
}

const rootRoute = {
    path: '/',
    component: App,
    indexRoute: { onEnter: (nextState, replace) => replace('/fractalEditor') },
    childRoutes: [
      require('./imageTester/index'),
      require('./audioTester/index'),
      ...require('./fractalEditor/index')
    ]
}

render((
  <Router
    history={hashHistory}
    routes={rootRoute}
  />
), document.getElementById('container'))