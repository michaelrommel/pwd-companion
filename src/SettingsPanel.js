import React, { Component } from 'react'
import * as Yup from 'yup'
import { RadioGroup, Radio, Intent, Button } from '@blueprintjs/core'
import { Formik, Form } from 'formik'
import { Flex, Box } from 'reflexbox'
import DisplayToast from './DisplayToast'

const getValidationSchema = (values) => {
  return (
    Yup.object().shape({
      serialport: Yup.string()
        .required('Serialport needs to be specified')
    })
  )
}

const SerialportSelector = (props) => {
  let {
    isSubmitting,
    handleSubmit,
    initialValues,
    setFieldValue,
    values
  } = props

  let serialportList = initialValues.serialportList
  let themeList = [
    {
      'label': 'Vehicles',
      'path': './scale-vehicles.plain.svg'
    },
    {
      'label': 'People',
      'path': './scale-people.plain.svg'
    }
  ]

  const handlePortChange = (e) => {
    setFieldValue('serialport', e.currentTarget.value)
  }

  const handleThemeChange = (e) => {
    setFieldValue('scaletheme', e.currentTarget.value)
  }

  return (
    <Form>
      <Flex p={2}>
        <Box w={1 / 2}>
          <RadioGroup
            large
            id={'serialport'}
            label={'Serialport'}
            onChange={handlePortChange}
            selectedValue={values.serialport}
          >
            {serialportList.map((port) => (
              <Radio
                key={port.comName}
                label={`${port.comName} (${port.manufacturer})`}
                value={port.comName}
              />
            ))}
          </RadioGroup>
        </Box>
        <Box w={1 / 2}>
          <RadioGroup
            large
            id={'scaletheme'}
            label={'Scale Theme'}
            onChange={handleThemeChange}
            selectedValue={values.scaletheme}
          >
            {themeList.map((theme) => (
              <Radio
                key={theme.label}
                label={`${theme.label}`}
                value={theme.path}
              />
            ))}
          </RadioGroup>
        </Box>
      </Flex>
      <Flex p={2}>
        <Box>
          <Button
            id='saveSettings' onClick={handleSubmit}
            type='button'
            intent={Intent.PRIMARY}
            text={isSubmitting ? 'Saving...' : 'Save Settings'} />
        </Box>
      </Flex>
    </Form>
  )
}

class SettingsFormContainer extends Component {
  onSubmit = async (values, actions) => {
    this.props.changePort(values.serialport)
    this.props.changeScaleTheme(values.scaletheme)
    this.showToast('Successfully saved the settings.',
      Intent.SUCCESS, 'tick-circle')
    actions.setSubmitting(false)
  }

  showToast = (msg, intent, icon) => {
    DisplayToast.show({ 'message': msg, 'intent': intent, 'icon': icon })
  }

  render () {
    const initialValues = this.props.settings

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={getValidationSchema()}
        onSubmit={this.onSubmit}
        component={SerialportSelector}
      />
    )
  }
}

class SettingsPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    const panelActive = this.props.active ? {} : { 'display': 'none' }

    return (
      <div className='settingspanel' style={panelActive}>
        <Flex w={1} p={0}>
          <Box w={1}>
            <SettingsFormContainer
              urlprefix={this.props.urlprefix}
              settings={this.props.settings}
              changePort={this.props.changePort}
              changeScaleTheme={this.props.changeScaleTheme}
            />
          </Box>
        </Flex>
      </div>
    )
  }
}

export default SettingsPanel
