import React, { Component } from 'react'
import { Switch, Navbar, Button, Alignment, Intent } from '@blueprintjs/core'

class Navigation extends Component {
  // helper functions to switch between panels, unfortunately I haven't
  // found a way to pass a parameter into a button-click handler
  // calls the changePanel function in the App component
  toInspect = () => { this.props.changePanel('inspect') }
  toSettings = () => { this.props.changePanel('settings') }
  changeZoomMinus = () => { this.props.changeZoom('-') }
  changeZoomPlus = () => { this.props.changeZoom('+') }

  render () {
    return (
      <Navbar className={this.props.className}>
        <Navbar.Group className='navigation'>
          <Navbar.Heading>
            <strong>pwd-companion</strong>
          </Navbar.Heading>
          <Navbar.Divider />
          <Button id='inspect' onClick={this.toInspect} className='navigation-button'
            intent={this.props.panelId === 'inspect' ? Intent.PRIMARY : Intent.NONE}
            large={false} type='button' icon='search' text='Car Inspector' />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Switch checked={this.props.darktheme} inline label='Dark'
            onChange={this.props.changeTheme} />
          <Button id='zoomminus' onClick={this.changeZoomMinus} className='navigation-button'
            intent={Intent.NONE}
            large={false} type='button' icon='minus' />
          <Button id='zoomplus' onClick={this.changeZoomPlus} className='navigation-button'
            intent={Intent.NONE}
            large={false} type='button' icon='plus' />
          <Button id='settings' onClick={this.toSettings} className='navigation-button'
            intent={this.props.panelId === 'settings' ? Intent.PRIMARY : Intent.NONE}
            large={false} type='button' icon='cog' text='Settings' />
        </Navbar.Group>
      </Navbar>
    )
  }
}

export default Navigation
