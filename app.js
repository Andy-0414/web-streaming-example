const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { origins: "*:*" });

app.use(express.static("public"));
app.use(express.static("node_modules"));

server.listen(3000, () => {
	console.log("stream server open");
});
// TODO: 리시버 1명당 1개의 피어를 생성해서 각각 연결해줘야함, 리시버들을 저장하고 관리하는 공간이 필요(socketid사용)
io.on("connection", (socket) => {
	socket.on("SenderSendIceCandidat", (data) => {
		console.log("SenderSendIceCandidat:");
		io.sockets.emit("SenderSendIceCandidat", data);
	});
	socket.on("ReceiverSendIceCandidat", (data) => {
		console.log("ReceiverSendIceCandidat:");
		io.sockets.emit("ReceiverSendIceCandidat", data);
	});
	socket.on("sendOffer", (data) => {
		console.log("sendOffer:");
		io.sockets.emit("sendOffer", data);
	});
	socket.on("sendAnswer", (data) => {
		console.log("sendAnswer:");
		io.sockets.emit("sendAnswer", data);
	});
});
