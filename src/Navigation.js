import React, { Component } from 'react'
import { Switch, Navbar, Button, Alignment, Intent } from '@blueprintjs/core'
import { rehydrateStateWithLocalStorage, saveStateToLocalStorage } from './localstorageFunctions'

class Navigation extends Component {
  componentDidMount () {
    console.log('Navigation: mounted')
    // rehydrate the state from local storage to initialize the app
    this.setState(rehydrateStateWithLocalStorage('navigation', this.state))
    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener(
      'beforeunload',
      this.saveStateHandler
    )
  }

  componentWillUnmount () {
    window.removeEventListener(
      'beforeunload',
      this.saveStateHandler
    )
    // saves if component has a chance to unmount
    this.saveStateHandler()
  }

  saveStateHandler = () => {
    saveStateToLocalStorage('navigation', this.state)
  }

  // helper functions to switch between panels, unfortunately I haven't
  // found a way to pass a parameter into a button-click handler
  // calls the changePanel function in the App component
  toSettings = () => { this.props.changePanel('settings') }

  render () {
    return (
      <Navbar className={this.props.className}>
        <Navbar.Group className='navigation'>
          <Navbar.Heading>
            <strong>pwd-companion</strong>
          </Navbar.Heading>
          <Navbar.Divider />
          <Button id='settings' onClick={this.toSettings} className='navigation-button'
            intent={this.props.panelId === 'settings' ? Intent.PRIMARY : Intent.NONE}
            disabled={!this.props.user}
            large={false} type='button' icon='cog' text='Settings' />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Switch checked={this.props.darktheme} inline label='Dark'
            onChange={this.props.changeTheme} />
          <Button id='session' onClick={this.toSettings} className='navigation-button'
            intent={this.props.panelId === 'session' ? Intent.PRIMARY : Intent.NONE}
            large={false} type='button' icon={this.props.user ? 'log-out' : 'log-in'} />
        </Navbar.Group>
      </Navbar>
    )
  }
}

export default Navigation
