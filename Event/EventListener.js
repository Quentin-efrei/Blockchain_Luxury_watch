/* Creates custom event subscription to application specific events */
/* event alerts when a word of length between 5 and 9 is submitted */

const {
        Message,
        EventFilter,
        EventList,
        EventSubscription,
        ClientEventsSubscribeRequest,
        ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf');
const { TextDecoder } = require('text-encoding/lib/encoding')
const { Stream } = require('sawtooth-sdk/messaging/stream');
var decoder = new TextDecoder('utf8')
const VALIDATOR_URL = "tcp://validator:4004"

//returns the message data as a list 
function getEventsMessage(message) {
        let Eventlist = EventList.decode(message.content).events
        Eventlist.map(function (event) {
                if (event.eventType === 'Product/Verify') {
                        console.log("Manufacturer event found   : ", event);
                }
                else if (event.eventType === 'sawtooth/block-commit') {
                        console.log("\n \n \n");
                        console.log("Block commit event found   : ", event);
                }
        })
}

// returns the subscription request status 
function checkStatus(response) {
        let msg = ""
        if (response.status === 0) {
                msg = 'subscription : OK'
        } if (response.status === 1) {
                msg = 'subscription : GOOD '
        } else {
                msg = 'subscription failed !'
        }
        return msg
}

//create subscription for custom event 
function EventSubscribe(URL) {

        let stream = new Stream(URL)
        //Creating a block-commit event subscription
        const blockCommitSubscription = EventSubscription.create({
                eventType: 'sawtooth/block-commit'
        })
        //creating a custom subscription
        const verification = EventSubscription.create({
                eventType: 'Product/Verify',
        })
        //creating a subscription_request
        const subscription_request = ClientEventsSubscribeRequest.encode({
                subscriptions: [blockCommitSubscription, verification]
        }).finish()

        stream.connect(() => {
                stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST, subscription_request)
                        .then(function (response) {
                                return ClientEventsSubscribeResponse.decode(response)
                        })
                        .then(function (decoded_Response) {
                                console.log(checkStatus(decoded_Response))
                        })

                stream.onReceive(getEventsMessage)
        })

}


EventSubscribe(VALIDATOR_URL);