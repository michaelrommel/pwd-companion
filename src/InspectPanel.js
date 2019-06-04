import React, { Component } from 'react'
import { Flex, Box } from 'reflexbox'

class InspectPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    const panelActive = this.props.active ? {} : { 'display': 'none' }

    return (
      <div className='inspectpanel' style={panelActive}>
        <Flex w={1} p={0}>
          <Box w={17 / 20}>
            <div>Car Details</div>
            <div>{this.props.serialdata}</div>
          </Box>
        </Flex>
      </div>
    )
  }
}

export default InspectPanel
