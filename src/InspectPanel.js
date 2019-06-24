import React, { Component } from 'react'
import { Button, Callout, Intent } from '@blueprintjs/core'
// import ReactSVG from 'react-svg'
// import { SvgLoader, TransformMotion } from 'react-svgmt'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import { Motion, spring } from 'react-motion'
import * as logger from 'winston'
import { Flex, Box } from 'reflexbox'
import { FaBalanceScale } from 'react-icons/fa'

const TransformMotion = props => (
  <Motion
    defaultStyle={props.start}
    style={{
      x: spring(props.target.x || 0),
      y: spring(props.target.y || 0),
      angle: spring(props.target.angle || 0, { 'stiffness': 85, 'damping': 10 }),
      rotateX: spring(props.target.rotateX || 0),
      rotateY: spring(props.target.rotateY || 0)
    }}
  >
    {value => {
      const tr = `$ORIGINAL translate(${value.x},${value.y}) rotate(${value.angle} ${value.rotateX} ${value.rotateY})`
      return <SvgProxy selector={props.selector} transform={tr} />
    }}
  </Motion>
)

class InspectPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      rotation: {
        'from': 0,
        'to': 0
      }
    }
  }

  componentDidMount = () => {
    this.setState({
      'rotation': {
        'from': this.state.rotation.to,
        'to': this.scaleRotation(this.props.serialdata.weight)
      }
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    logger.debug('InspectPanel::cDU:', this.props.serialdata)
    if (prevProps.serialdata.weight !== this.props.serialdata.weight) {
      this.setState({
        'rotation': {
          'from': this.state.rotation.to,
          'to': this.scaleRotation(this.props.serialdata.weight)
        }
      })
    }
  }

  scaleRotation = (weight) => {
    console.log('InspectPanel::scaleRotaton: new weight is', weight)
    let rotation
    if (weight < 105) {
      rotation = 0
    } else if (weight > 150) {
      rotation = -270
    } else {
      rotation = -1 * Math.round(((weight - 105) * 6) * 10) / 10
    }
    return rotation
  }

  render () {
    const panelActive = this.props.active ? {} : { 'display': 'none' }
    const scaleIcon = <span className='bp3-icon'><FaBalanceScale size='0.8em' /></span>
    const rfid = this.props.serialdata ? this.props.serialdata.rfid : '-'
    const temperature = this.props.serialdata
      ? Math.round(this.props.serialdata.temp, 0)
      : 0
    const weight = this.props.serialdata
      ? Math.round(this.props.serialdata.weight * 100) / 100
      : 0

    const weightTitle = 'Weight' + (
      (temperature > 0)
        ? ' (at ' + temperature.toFixed(0) + '°C)'
        : ''
    )

    logger.debug('InspectPanel::render:', this.props)

    return (
      <div className='inspectpanel' style={panelActive}>
        <Flex w={1} p={0} justify='space-between'>
          <Box w={4 / 10} p={3}>
            <Callout
              className='carcards'
              intent={Intent.NONE}
              icon='drive-time'
              title='RFID'
            >
              {rfid}
            </Callout>
          </Box>
          <Box w={2 / 10} p={3}>
            <Box px={1}>
              <Button
                id='tare'
                onClick={this.props.sendTare}
                intent={Intent.PRIMARY}
                text='Tare'
                type='button'
                fill
              />
            </Box>
            <Box p={1}>
              <Button
                id='calibration'
                onClick={this.props.sendCalibration}
                intent={Intent.WARNING}
                text='142'
                type='button'
                fill
              />
            </Box>
          </Box>
          <Box w={4 / 10} p={3}>
            <Callout
              className='carcards'
              intent={Intent.NONE}
              icon={scaleIcon}
              title={weightTitle}
            >
              {weight}
            </Callout>
          </Box>
        </Flex>
        <Flex w={1} p={0} align='stretch' className='scalecontainer'>
          <Box w={1} p={1}>
            <SvgLoader className='scale' path={this.props.scaletheme}>
              <TransformMotion
                selector='#completescale'
                start={{
                  x: 0,
                  y: 0,
                  angle: this.state.rotation.from,
                  rotateX: 250,
                  rotateY: 252.5
                }}
                target={{
                  x: 0,
                  y: 0,
                  angle: this.state.rotation.to,
                  rotateX: 250,
                  rotateY: 252.5
                }}
              />
            </SvgLoader>
          </Box>
        </Flex>
      </div>
    )
  }
}

export default InspectPanel
