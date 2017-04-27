import Dispatcher from 'flux'

const Constants = {
    UI_ACTION: 'UI_ACTION',
    SERVER_ACTION: 'SERVER_ACTION',
    CONNECT: 'CONNECT',
    CONNECTED: 'CONNECTED',
    ERROR: 'ERROR',
    CHANGE: 'change',
    MSG: 'MSG',
    TYPE_INIT: 0,
    TYPE_CLIENT_JOINED: 1,
    TYPE_CLIENT_LEFT: 2,
    TYPE_KEY_AGREE_PROT: 3,
    GENERATE_KEY: 'GENERATE_KEY',
    GENERATE_KEY_DONE: 'GENERATE_KEY_DONE',
    DELETE_KEY: 'DELETE_KEY',
    LOAD_ASYM_KEYS: 'LOAD_ASYM_KEYS',
    LOAD_ASYM_KEYS_DONE: 'LOAD_ASYM_KEYS_DONE',
    KEY_AGREE_REQ: 'KEY_AGREE_REQ',
    KEY_AGREE_RES: 'KEY_AGREE_RES',
    KA_INITIATOR_STATE_0: 'KA_INITIATOR_STATE_0',
    KA_INITIATOR_STATE_1: 'KA_INITIATOR_STATE_1',
    KA_INITIATOR_STATE_2: 'KA_INITIATOR_STATE_2',
    KA_RESPONDER_STATE_0: 'KA_RESPONDER_STATE_0',
    KA_RESPONDER_STATE_1: 'KA_RESPONDER_STATE_1',
    KA_RESPONDER_STATE_2: 'KA_RESPONDER_STATE_2'
}

class AppDispatcher extends Dispatcher.Dispatcher {
    constructor() {
        super()
    }

    handleUIAction(action) {
        this.dispatch({
            source: Constants.UI_ACTION,
            action: action
        })                
    }

    handleServerAction(action) {
        this.dispatch({
            source: Constants.SERVER_ACTION,
            action: action
        })
    }
}

const appDispatcher = new AppDispatcher()

export { appDispatcher as default, Constants }