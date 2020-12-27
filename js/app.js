import LoraWS from './LoraWS.js';

const lastDecodedMsgEl = document.getElementById('lastMsgDecode');
const msgLengthEl = document.getElementById('msgLength');
const msgFromEl = document.getElementById('msgFrom');
const msgToEl = document.getElementById('msgTo');
const addressEl = document.getElementById('address');
const msgIdEl = document.getElementById('msgId');
const formEl = document.getElementById('sendForm');
const msgInputEl = document.getElementById('msgInput');

const btnConnectEl = document.getElementById('btn-connect');
const btnDisconnectEl = document.getElementById('btn-disconnect');

const loraWS = LoraWS.getInstance();

btnConnectEl.addEventListener('click', handleConnectClick);
btnDisconnectEl.addEventListener('click', handleDisconnectClick);
formEl.addEventListener('submit', handleOnSubmit);

btnDisconnectEl.disabled = true;
if(localStorage.getItem('wsUri')){
    addressEl.value = localStorage.getItem('wsUri');
}

function handleConnectClick() {
	try {
		loraWS.wsUri = addressEl.value;
		loraWS.onMessage = handleMessageReceived;
		loraWS.onClose = handleOnClose;
		loraWS.onOpen = handleOnOpen;
		loraWS.connect();
	} catch (e) {}

	localStorage.setItem('wsUri', addressEl.value);

	btnConnectEl.disabled = true;
	addressEl.disabled = true;
	btnDisconnectEl.disabled = false;
}

function handleDisconnectClick() {
	loraWS.disconnect();
}

function handleOnSubmit(event) {
	event.preventDefault();

	const msg = msgInputEl.value;
	loraWS.send(msg);
}

function handleMessageReceived(data) {
	msgIdEl.innerText = data.msgId;
	msgLengthEl.innerText = data.msgLength;
	msgFromEl.innerText = data.senderAddress;
	msgToEl.innerText = data.receiverAddress;
	lastDecodedMsgEl = data.msg;
}

function handleOnOpen() {}

function handleOnClose(event) {
	btnConnectEl.disabled = false;
	addressEl.disabled = false;
	btnDisconnectEl.disabled = true;
}