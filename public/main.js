// 이 사용자의 고유 코드 생성
function uniqueID() {
	function chr4() {
		return Math.random().toString(16).slice(-4);
	}
	return chr4() + chr4() + "-" + chr4() + "-" + chr4() + "-" + chr4() + "-" + chr4() + chr4() + chr4();
}
const id = uniqueID();

const RTC_CONFIGURATION = {
	iceServers: [
		{ url: "stun:stun1.l.google.com:19302" },
		{
			url: "turn:numb.viagenie.ca",
			credential: "muazkh",
			username: "webrtc@live.com",
		},
	],
};

let socket = io.connect("http://58.145.101.15:3000/");

let localVideo = document.getElementById("local");
let remoteVideo = document.getElementById("remote");
let sBtn = document.getElementById("Sender");
let rBtn = document.getElementById("Receiver");

// 화면 공유
function selectDesktop() {
	if (navigator.getDisplayMedia) {
		return navigator.getDisplayMedia({ audio: true, video: true });
	} else if (navigator.mediaDevices.getDisplayMedia) {
		return navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
	} else {
		return navigator.mediaDevices.getUserMedia({ audio: true, video: { mediaSource: "screen" } });
	}
}

// 송신자
async function senderSetting() {
	console.log("sender");
	let sender = new RTCPeerConnection(RTC_CONFIGURATION);
	let stableCheck = false;

	// 송신자 이벤트들
	sender.addEventListener("icecandidate", (e) => {
		// 연결을 위한 이벤트
		if (e.candidate) socket.emit("SenderSendIceCandidat", e.candidate);
	});
	sender.addEventListener("signalingstatechange", () => {
		// 연결 상태 확인
		stableCheck = sender.signalingState != "stable";
	});

	let localStream = await selectDesktop();
	localVideo.srcObject = localStream;

	sender.addTrack(localStream.getVideoTracks()[0], localStream);
	// sender.addTrack(localStream.getAudioTracks()[0], localStream);

	let offer = await sender.createOffer({
		offerToReceiveAudio: 1,
		offerToReceiveVideo: 1,
	});
	sender.setLocalDescription(offer);
	socket.emit("sendOffer", offer);

	socket.on("ReceiverSendIceCandidat", (candidate) => {
		console.log("ReceiverSendIceCandidat:", candidate);
		if (candidate) sender.addIceCandidate(new RTCIceCandidate(candidate));
	});

	socket.on("sendAnswer", (answer) => {
		if (stableCheck) sender.setRemoteDescription(answer);
	});
}
// 수신자
async function receiverSetting() {
	console.log("receiver");
	let receiver = new RTCPeerConnection(RTC_CONFIGURATION);

	receiver.addEventListener("icecandidate", (e) => {
		// 연결을 위한 이벤트
		if (e.candidate) socket.emit("ReceiverSendIceCandidat", e.candidate);
	});
	receiver.addEventListener("track", (e) => {
		// 연결 완료 후 트랙을 비디오태그에 송출
		remoteVideo.srcObject = e.streams[0];
	});

	socket.on("SenderSendIceCandidat", (candidate) => {
		console.log("SenderSendIceCandidat:", candidate);
		if (candidate) receiver.addIceCandidate(new RTCIceCandidate(candidate));
	});
	socket.on("sendOffer", async (offer) => {
		await receiver.setRemoteDescription(offer);

		let answer = await receiver.createAnswer();
		await receiver.setLocalDescription(answer);

		socket.emit("sendAnswer", answer);
	});
}

sBtn.addEventListener("click", () => {
	senderSetting();
});

rBtn.addEventListener("click", () => {
	receiverSetting();
});
