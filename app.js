const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { origins: "*:*" });

app.use(express.static("public"));
app.use(express.static("node_modules"));

server.listen(3000, () => {
	console.log("stream server open");
});

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
