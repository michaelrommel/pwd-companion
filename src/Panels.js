import React, { Component } from 'react'
import InspectPanel from './InspectPanel'
import SettingsPanel from './SettingsPanel'

class Panels extends Component {
  render () {
    return (
      <React.Fragment>
        <InspectPanel active={this.props.panelId === 'inspect'}
          urlprefix={this.props.urlprefix}
          serialdata={this.props.serialdata}
        />
        <SettingsPanel active={this.props.panelId === 'settings'}
          settings={this.props.settings}
          changePort={this.props.changePort}
        />
      </React.Fragment>
    )
  }
}

export default Panels
