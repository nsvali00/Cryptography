import ServerBaseAPI from './serverBaseAPI.js'
import ServerActionCreator from '../actions/server.actioncreator.js'
import { Constants } from '../dispatcher/app.dispatcher.js'
import Utils from './utils.js'
import ClientsStore from '../stores/clients.store.js'
import { encryption, decryption } from './caesar-cipher'
import Aes from './aes'

/** 
 * Control message processing functions. 
 */
function init(msg) {
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_INIT,
        payload: msg
    })
}

function clientJoined(msg) {
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_CLIENT_JOINED,
        payload: msg
    })
}

function clientLeft(msg) {
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_CLIENT_LEFT,
        payload: msg
    })
}

function keyAgreeProt(msg) {    
    const state = ClientsStore.getState()    
    const Process = {
        initiator: () => { // INITIATOR's state machine

            switch (state.keyAgreeState.INITIATOR) {                
                //--------------------------------------------------------------
                // INITIATOR_STATE_0 = Send request (e.g., for the public key).
                //--------------------------------------------------------------
                case Constants.KA_INITIATOR_STATE_0:
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_REQ,
                        payload: { keyAgreeNextState: Constants.KA_INITIATOR_STATE_1 }
                    })                                       
                    ServerAPI.write({...msg})
                    console.log('Key agreement protocol.INITIATOR sent -> PublicKey REQUEST', msg)

                    // Reset the state machine after a timeout.
                    setTimeout(() => {                        
                        console.log('INITIATOR.TIMEOUT!')
                        const state = ClientsStore.getState()
                        if (state.keyAgreeState.INITIATOR === Constants.KA_INITIATOR_STATE_0) return
                        console.log('INITIATOR.TIMEOUT -> RESETTING')
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.KEY_AGREE_REQ,
                            payload: { keyAgreeNextState: Constants.KA_INITIATOR_STATE_0 }
                        })  
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.DELETE_KEY,
                            payload: { clientID: state.clientID }
                        })                    
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.DELETE_KEY,
                            payload: { clientID: msg.to }
                        })                                                                  
                    }, 3000)
                    break

                //--------------------------------------------------------------
                // INITIATOR_STATE_1 = Having received the public key, generate
                //                     a preMasterKey, encrypt it with the 
                //                     public key and send to the remote client.
                //                     Also derive symmetric keys from the 
                //                     preMasterKey. 
                //--------------------------------------------------------------
                case Constants.KA_INITIATOR_STATE_1:
                    console.log('Key agreement protocol.INITIATOR received -> PublicKey', msg)
                    
                    // Generate preMasterKey.
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************
                    const preMasterKey = 'preMasterKey'

                    // Store preMasterKey locally (to the property 'secret' of ClientsStore).
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY,
                        payload: { 
                            secret: preMasterKey,
                            clientID: state.clientID
                        }
                    }) 
                    // Store preMasterKey locally (to the property 'secret' of 'clients[clientID]' object in ClientsStore).                   
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY,
                        payload: { 
                            secret: preMasterKey,
                            clientID: msg.from
                        }
                    })

                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************
                    let _msg = {
                        type: Constants.TYPE_KEY_AGREE_PROT,
                        subtype: Constants.KEY_AGREE_REQ,
                        from: state.clientID,
                        to: msg.from,            
                        content: 'PRE_MASTER_KEY_ENCRYPTED_WITH_THE_PUBLIC KEY',
                        timestamp: Utils.getTimestamp()
                    }                         
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_REQ,
                        payload: { keyAgreeNextState: Constants.KA_INITIATOR_STATE_2 }
                    })                                       
                    ServerAPI.write({..._msg})
                    console.log('Key agreement protocol.INITIATOR sent -> E_PublicKey(preMasterKey)', _msg)                                    
                    break

                //--------------------------------------------------------------
                // INITIATOR_STATE_2 = Verify the integrity of the session 
                //                     (using FINISHED msg). Delete the symmetric
                //                     keys derived in the previous state if 
                //                     the integrity violated.
                //--------------------------------------------------------------
                case Constants.KA_INITIATOR_STATE_2:
                    console.log('Key agreement protocol.INITIATOR received -> FINISHED', msg)

                    // Derive a symmetric key for the remote client using the preMasterKey; 
                    // you can retrieve it from the property 'secret' of ClientsStore.
                    // You can use PBKDF2 or HKDF (HMAC-based Extract-and-Expand Key Derivation Function (HKDF) - https://tools.ietf.org/html/rfc5869)
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************

                    // Store the symmetric key for the remote client.
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY_DONE,
                        payload: {
                            key: 'PMK-DERIVE-RESPO',
                            clientID: msg.from
                        }
                    })

                    // Derive a symmetric key for the local client.
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************

                    // Store the symmetric key for the local client.
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY_DONE,
                        payload: { 
                            key: 'PMK-DERIVE-INITI',
                            clientID: state.clientID
                        }
                    })

                    // Verify session integrity (i.e., the integrity of FINISHED); 
                    // delete the derived keys if the integrity is violated.
                    // ServerActionCreator.serverCtrMsg({
                    //     type: Constants.DELETE_KEY,
                    //     payload: { clientID: state.clientID }
                    // })                    
                    // ServerActionCreator.serverCtrMsg({
                    //     type: Constants.DELETE_KEY,
                    //     payload: { clientID: msg.from }
                    // })

                    _msg = {
                        type: Constants.TYPE_KEY_AGREE_PROT,
                        subtype: Constants.KEY_AGREE_REQ,
                        from: state.clientID,
                        to: msg.from,            
                        content: 'FINISHED',
                        timestamp: Utils.getTimestamp()
                    }
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_REQ,
                        payload: { keyAgreeNextState: Constants.KA_INITIATOR_STATE_0 }
                    })      
                    ServerAPI.write({..._msg})
                    console.log('Key agreement protocol.INITIATOR sent -> FINISHED', _msg)                    
                    break

                default:
                    break                              
            }                   
        },
        responder: () => { // RESPONDER's state machine                    
            switch (state.keyAgreeState.RESPONDER) {
                //--------------------------------------------------------------
                // RESPONDER_STATE_0 = Having received a request send own 
                //                     public key to the INITIATOR.
                //--------------------------------------------------------------                
                case Constants.KA_RESPONDER_STATE_0:                    
                    console.log('Key agreement protocol.RESPONDER received -> PublicKey REQUEST', msg)                    

                    // Check if asymmetric keys are loaded.
                    if (!state.publicKey) {
                        console.log('Key agreement protocol.RESPONDER ERROR -> PublicKey not availale.', msg)
                        return
                    }

                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************
                    let _msg = {
                        type: Constants.TYPE_KEY_AGREE_PROT,
                        subtype: Constants.KEY_AGREE_RES,
                        from: state.clientID,
                        to: msg.from,            
                        content: 'PUBLIC_KEY',
                        timestamp: Utils.getTimestamp()
                    }                         
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_RES,
                        payload: { keyAgreeNextState: Constants.KA_RESPONDER_STATE_1 }
                    })                                       
                    ServerAPI.write({..._msg})
                    console.log('Key agreement protocol.RESPONDER sent -> PublicKey', _msg)   
                    
                    // Reset the state machine after a timeout.
                    setTimeout(() => {
                        console.log('RESPONDER.TIMEOUT!')
                        const state = ClientsStore.getState()
                        if (state.keyAgreeState.RESPONDER === Constants.KA_RESPONDER_STATE_0) return
                        console.log('RESPONDER.TIMEOUT -> RESETTING')
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.KEY_AGREE_RES,
                            payload: { keyAgreeNextState: Constants.KA_RESPONDER_STATE_0 }
                        })
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.DELETE_KEY,
                            payload: { clientID: state.clientID }
                        })                    
                        ServerActionCreator.serverCtrMsg({
                            type: Constants.DELETE_KEY,
                            payload: { clientID: _msg.to }
                        })                                                                                            
                    }, 3000)                                                                        
                    break

                //--------------------------------------------------------------
                // RESPONDER_STATE_1 = Having received the encrypted preMasterKey,
                //                     decrypt and derive symmetric keys from it. 
                //                     Sign the FINISHED msg with the local
                //                     symmetric key and send the signed msg back 
                //                     to the INITIATOR. 
                //--------------------------------------------------------------                
                case Constants.KA_RESPONDER_STATE_1:
                    console.log('Key agreement protocol.RESPONDER received -> E_PublicKey(preMasterKey)', msg)
                    
                    // Decrypt the preMasterKey. 
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************

                    // Store preMasterKey locally (to the property 'secret' of ClientsStore).
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY,
                        payload: { 
                            secret: 'preMasterKey',
                            clientID: state.clientID
                        }
                    })
                    // Store preMasterKey locally (to the property 'secret' of 'clients[clientID]' object in ClientsStore).                   
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY,
                        payload: { 
                            secret: 'preMasterKey',
                            clientID: msg.from
                        }
                    })                    

                    // Derive a symmetric key for the remote client.
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************

                    // Store the symmetric key for the remote client.
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY_DONE,
                        payload: { 
                            key: 'PMK-DERIVE-INITI',
                            clientID: msg.from
                        }
                    })                                        

                    // Derive a symmetric key for the local client.                    
                    // ******************************
                    // **** YOUR ACTION REQUIRED ****
                    // ******************************

                    // Store the symmetric key for the local client.
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.GENERATE_KEY_DONE,
                        payload: { 
                            key: 'PMK-DERIVE-RESPO',
                            clientID: state.clientID
                        }
                    })
                    _msg = {
                        type: Constants.TYPE_KEY_AGREE_PROT,
                        subtype: Constants.KEY_AGREE_RES,
                        from: state.clientID,
                        to: msg.from,            
                        content: 'FINISHED',
                        timestamp: Utils.getTimestamp()
                    }                         
                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_RES,
                        payload: { keyAgreeNextState: Constants.KA_RESPONDER_STATE_2 }
                    })                                       
                    ServerAPI.write({..._msg})                                   
                    console.log('Key agreement protocol.RESPONDER sent -> FINISHED', _msg)                    
                    break

                //--------------------------------------------------------------
                // RESPONDER_STATE_2 = Having received the signed msg FINISHED 
                //                     from INITIATOR, verify the msg integrity
                //                     using the the symmetric key derived in 
                //                     the previous state.
                //--------------------------------------------------------------                
                case Constants.KA_RESPONDER_STATE_2:
                    console.log('Key agreement protocol.RESPONDER received -> FINISHED', msg)
                    
                    // Verify session integrity (i.e., the integrity of FINISHED); 
                    // delete the derived keys if the integrity is violated.
                    // ServerActionCreator.serverCtrMsg({
                    //     type: Constants.DELETE_KEY,
                    //     payload: { clientID: state.clientID }
                    // })                    
                    // ServerActionCreator.serverCtrMsg({
                    //     type: Constants.DELETE_KEY,
                    //     payload: { clientID: msg.from }
                    // })                    

                    ServerActionCreator.serverCtrMsg({
                        type: Constants.KEY_AGREE_RES,
                        payload: { keyAgreeNextState: Constants.KA_RESPONDER_STATE_0 }
                    })                                       
                    break                

                default:
                    break                                                
            }
        }
    }    
    
    if ((msg !== null) && (msg.subtype !== null)) {
        switch(msg.subtype) {
            // A 'msg' from INITIATOR so RESPONDER should process it
            // (except for the very first 'msg' from INITIATOR).
            case Constants.KEY_AGREE_REQ:
                (msg.from === state.clientID) ? Process.initiator() : Process.responder()
                break

            // A 'msg' from RESPONDER so INITIATOR should process it.    
            case Constants.KEY_AGREE_RES:
                Process.initiator() 
                break

            default:
                break
        }
    }
}

/** 
 * Regular message processing function. 
 */
function regular(msg) {
    let key = ClientsStore.getState().clients[msg.clientID].key;
    let iv = msg.iv.data;
    let aes = new Aes();

    if (key)
        msg.content = aes.decryption_128_ctr(msg.content, key, iv);

    ServerActionCreator.serverNewMsg(msg)
}

const Process = {
    0: init,
    1: clientJoined,
    2: clientLeft,
    3: keyAgreeProt
}

class ServerAPI extends ServerBaseAPI {
    keyAgreementRequest(toClientID) {
        const { clientID, keyAgreeState } = ClientsStore.getState()
        if (keyAgreeState.INITIATOR !== Constants.KA_INITIATOR_STATE_0 ||
            keyAgreeState.RESPONDER !== Constants.KA_RESPONDER_STATE_0) return
        const msg = {
            type: Constants.TYPE_KEY_AGREE_PROT,
            subtype: Constants.KEY_AGREE_REQ,
            from: clientID,
            to: toClientID,
            timestamp: Utils.getTimestamp()
        }
        keyAgreeProt(msg)
    }

    _processMessage(msg) {
        Process.hasOwnProperty(msg.type) ? (
            Process[msg.type](msg)
        ) : (
                regular(msg)
            )
    }

    onConnect(options) {
        const nickname = {
            nickname: options.nickname || Utils.getRandomName()
        }
        ServerActionCreator.serverConnected(nickname)
        ServerBaseAPI.write(nickname)
    }

    onData(msg) {
        this._processMessage(msg)
    }

    write(data) {
        const key = ClientsStore.getState().key;
        let aes = new Aes();

        const crypto = require('crypto')
        data.iv = crypto.randomBytes(16);

        if (key)
            data.content = aes.encryption_128_ctr(data.content, key, data.iv);

        ServerBaseAPI.write(data)
    }
}

const serverAPI = new ServerAPI()

export default serverAPI