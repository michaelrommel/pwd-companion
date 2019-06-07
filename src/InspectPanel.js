import React, { Component } from 'react'
import { Callout, Intent } from '@blueprintjs/core'
import ReactSVG from 'react-svg'
import { Flex, Box } from 'reflexbox'
import { FaBalanceScale } from 'react-icons/fa'

const Gradient = () => {
  return (
    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden focusable={false}>
      <linearGradient id={'my-cool-gradient'} x2={1} y2={1}>
        <stop offset='0%' stop-color='#770000' />
        <stop offset='50%' stop-color='#007700' />
        <stop offset='100%' stop-color='#000077' />
      </linearGradient>
    </svg>
  )
}

class InspectPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    const panelActive = this.props.active ? {} : { 'display': 'none' }
    const rfid = this.props.serialdata ? this.props.serialdata.rfid : ''
    const scale = <span className='bp3-icon'><FaBalanceScale size='1.5em' /></span>

    return (
      <div className='inspectpanel' style={panelActive}>
        <Flex w={1} p={0} justify='space-between'>
          <Box w={1 / 3} p={1}>
            <Callout
              intent={Intent.NONE}
              icon='drive-time'
              title='RFID'
            >
              {rfid}
            </Callout>
          </Box>
          <Box w={1 / 3} p={1}>
            <Callout
              intent={Intent.NONE}
              icon={scale}
              title='Weight'
            >
              {rfid}
            </Callout>
          </Box>
        </Flex>
        <Flex w={1} p={0} align='stretch'>
          <Box w={1} p={1} className='scalecontainer'>
            <ReactSVG
              className='scalewindow'
              src='/scale-window.svg'
            />
            <ReactSVG
              className='scale'
              src='/scale-background.svg'
            />
          </Box>
        </Flex>
      </div>
    )
  }
}

export default InspectPanel
