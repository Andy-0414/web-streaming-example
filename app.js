const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { origins: "*:*" });

app.use(express.static("public"));
app.use(express.static("node_modules"));

server.listen(3000, () => {
	console.log("HLS server open");
});

io.on("connection", (socket) => {
	console.log("connect");
	socket.on("streamStart", (data) => {
		socket.emit("streamStart", data);
	});
	socket.on("streamView", (data) => {
		socket.emit("streamView", data);
	});
});
