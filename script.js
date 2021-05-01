let connection, dataChannel;

function initConnection()
{
    connection = new RTCPeerConnection();
    connection.onicecandidate = e => {
        console.log("채널 정보");
        console.log(JSON.stringify(connection.localDescription));
        document.getElementById("post-my-layout").textContent = JSON.stringify(connection.localDescription);
    };
}
function createChannel()
{
    dataChannel = connection.createDataChannel("wow");
    dataChannel.onopen = e => console.log("상대방과 연결되었습니다.");
    dataChannel.onclose = e => console.log("상대방과의 연결이 끊어졌습니다.");
    dataChannel.onmessage = e => console.log("상대방 : " + e.data);

    connection.createOffer().then(offer => {
        document.getElementById("pre-my-layout").style.display = "none";
        document.getElementById("post-my-layout").textContent = JSON.stringify(offer);
        connection.setLocalDescription(offer);
    });
}
function answerRequest()
{
    connection.ondatachannel = e => {
        connection.channel = e.channel;
        connection.channel.onopen = e => console.log("상대방과 연결되었습니다.");
        connection.channel.onclose = e => console.log("상대방과의 연결이 끊어졌습니다.");
        connection.channel.onmessage = e => console.log("상대방 : " + e.data);
    }

    document.getElementById("pre-your-layout").style.display = "none";
    document.getElementById("post-your-layout").textContent = document.getElementById('sender-info').value;
    connection.setRemoteDescription(JSON.parse(document.getElementById('sender-info').value)); 

    connection.createAnswer().then(answer => {
        document.getElementById("pre-my-layout").style.display = "none";
        document.getElementById("post-my-layout").textContent = JSON.stringify(answer);
        connection.setLocalDescription(answer);
    });
}
function acceptRequest()
{
    document.getElementById("pre-your-layout").style.display = "none";
    document.getElementById("post-your-layout").textContent = document.getElementById('receiver-info').value;
    connection.setRemoteDescription(JSON.parse(document.getElementById('receiver-info').value));
}

document.addEventListener("DOMContentLoaded", () => {
    initConnection();
});
