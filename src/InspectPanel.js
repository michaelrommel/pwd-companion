import React, { Component } from 'react'
import { Callout, Intent } from '@blueprintjs/core'
// import ReactSVG from 'react-svg'
// import { SvgLoader, TransformMotion } from 'react-svgmt'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import { Motion, spring } from 'react-motion'
import * as logger from 'winston'
import { Flex, Box } from 'reflexbox'
import { FaBalanceScale } from 'react-icons/fa'
import memoizeOne from 'memoize-one'

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
      scaleTransformation: '',
      previousRotation: 0,
      currentRotation: 0
    }
  }

  updateScale = (weight) => {
    console.log('InspectPanel::updateScale: new weight is', weight)
    let rotation
    if (weight < 120) {
      rotation = 0
    } else if (weight > 150) {
      rotation = 180
    } else {
      rotation = -1 * Math.round(((weight - 120) * 6) * 10) / 10
    }
    this.setState({ 'previousRotation': this.state.currentRotation })
    this.setState({ 'currentRotation': rotation })
  }

  memoizeUpdateScale = memoizeOne(
    (p) => {
      console.log('InspectPanel::memoizedUpdateScale: props are', p)
      this.updateScale(p)
    }
  )

  render () {
    const panelActive = this.props.active ? {} : { 'display': 'none' }
    const rfid = this.props.serialdata ? this.props.serialdata.rfid : '-'
    const weight = this.props.serialdata ? this.props.serialdata.weight : 0
    const scale = <span className='bp3-icon'><FaBalanceScale size='0.8em' /></span>

    logger.debug('InspectPanel::render:', this.props)
    this.memoizeUpdateScale(weight, rfid)

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
          <Box w={4 / 10} p={3}>
            <Callout
              className='carcards'
              intent={Intent.NONE}
              icon={scale}
              title='Weight'
            >
              {weight}
            </Callout>
          </Box>
        </Flex>
        <Flex w={1} p={0} align='stretch' className='scalecontainer'>
          <Box w={1} p={1}>
            <SvgLoader className='scale' path='/circle-with-carimages-scale-clipped.plain.svg'>
              <TransformMotion
                selector='#completescale'
                start={{
                  x: 0,
                  y: 0,
                  angle: this.state.previousRotation,
                  rotateX: 250,
                  rotateY: 414.7
                }}
                target={{
                  x: 0,
                  y: 0,
                  angle: this.state.currentRotation,
                  rotateX: 250,
                  rotateY: 414.7
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
