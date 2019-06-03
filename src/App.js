import React, { Component } from 'react'
import {Tab, Tabs, H3} from '@blueprintjs/core'
import Navigation from './Navigation'
import './App.css'

class App extends Component {
  render () {
    return (
      <div className={`App bp3-dark`}>
        <Navigation />
      </div>
    )
  }
}

export default App
