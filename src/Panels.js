import React, { Component } from 'react'
import InspectPanel from './InspectPanel'
import SettingsPanel from './SettingsPanel'

class Panels extends Component {
  render () {
    return (
      <React.Fragment>
        <InspectPanel active={this.props.panelId === 'inspect'}
          serialdata={this.props.serialdata}
          scaletheme={this.props.settings.scaletheme}
          sendTare={this.props.sendTare}
          sendCalibration={this.props.sendCalibration}
        />
        <SettingsPanel active={this.props.panelId === 'settings'}
          settings={this.props.settings}
          changePort={this.props.changePort}
          changeScaleTheme={this.props.changeScaleTheme}
        />
      </React.Fragment>
    )
  }
}

export default Panels
