const rehydrateStateWithLocalStorage = (moduleName, stateOrGetStateCallback) => {
  console.log('localstorageFunctions::rehydrate: restoring state for', moduleName)
  let state
  if (typeof stateOrGetStateCallback === 'function') {
    // get the state to save via the callback
    state = stateOrGetStateCallback()
  } else {
    state = stateOrGetStateCallback
  }
  let newState = {}
  // for all items in state
  for (let key in state) {
    // add modulename to key to let different modules
    // use the localstorage
    let lskey = moduleName + '.' + key
    // if the key exists in localStorage
    if (window.localStorage.hasOwnProperty(lskey)) {
      // get the key's value from localStorage
      let value = window.localStorage.getItem(lskey)
      // parse the localStorage string and setState
      try {
        console.log('localstorageFunctions::rehydrate: parsing', lskey, value)
        // in localstorage those values are stored as strings
        if (value === 'undefined') {
          value = undefined
        } else if (value === 'null') {
          value = null
        } else {
          value = JSON.parse(value)
        }
        newState[key] = value
      } catch (e) {
        // handle empty string
        throw (e)
      }
    }
  }
  return newState
}

const saveStateToLocalStorage = (moduleName, stateOrGetStateCallback) => {
  console.log('localstorageFunctions::save: saving state for', moduleName)
  let state
  if (typeof stateOrGetStateCallback === 'function') {
    // get the state to save via the callback
    state = stateOrGetStateCallback()
  } else {
    state = stateOrGetStateCallback
  }
  // for every item in React state
  for (let key in state) {
    // add modulename to key to let different modules
    // use the localstorage
    let lskey = moduleName + '.' + key
    // save to localStorage
    window.localStorage.setItem(lskey, JSON.stringify(state[key]))
  }
}

export { rehydrateStateWithLocalStorage, saveStateToLocalStorage }
