let connector, channel, isCaller, notified;

function initConnection()
{
    connector = new RTCPeerConnection();
    connector.onicecandidate = e => {
        if (notified) return;

        console.log("나의 연결 정보");
        console.log(JSON.stringify(connector.localDescription));
        addNoti("- 로그를 확인해 자신의 연결 정보를 상대방에게 전달해주세요. -");
        notified = true;
    };
}
function addChat(message, isMe)
{
    // 현재 날짜 불러오기
    const date = new Date();

    // UI 업데이트
    const newChat = document.createElement('p');
    newChat.innerHTML = message + '<br><span style="color: gray; font-size: 0.5em;">' + date.toLocaleString() + '에 보냄.</span>';
    newChat.style.display = "inline-block";
    newChat.style.maxWidth = "200px";
    newChat.style.borderRadius = "7px";
    newChat.style.margin = "10px 20px";
    newChat.style.padding = "10px 10px";
    newChat.style.backgroundColor = isMe ? "beige" : "lightblue";
    newChat.style.alignSelf = isMe ? "flex-end" : "flex-start";
    newChat.style.boxShadow = "0 0 7px dimgrey";
    newChat.style.textAlign = isMe ? "end" : "start";
    newChat.style.color = "black";

    document.querySelector('#chat-layout').appendChild(newChat);
}
function addNoti(message)
{
    const newChat = document.createElement('p');
    newChat.innerHTML = message;
    newChat.style.margin = "0";
    newChat.style.padding = "10px 0";
    newChat.style.textAlign = "center";
    newChat.style.alignSelf = "center";
    newChat.style.color = "gray";

    document.querySelector('#chat-layout').appendChild(newChat);
}

function createChannel()
{
    isCaller = true;

    // 채널 생성
    channel = connector.createDataChannel("new");
    channel.onopen = e => {
        document.querySelector('#state-me').textContent = '연결됨';
        document.querySelector('#state-me').classList.add("blue");
        document.querySelector('#state-other').textContent = '연결됨';
        document.querySelector('#state-other').classList.add("blue");
        addNoti("- 상대방과 연결되었습니다. -");
    }
    channel.onclose = e => addNoti("- 상대방과의 연결이 끊어졌습니다. -");
    channel.onmessage = e => addChat(e.data, false);

    // '나' 접속
    connector.createOffer().then(offer => connector.setLocalDescription(offer));

    // UI 업데이트
    document.querySelector('#state-other').classList.add("hidden");
    document.querySelector('#input-other').classList.remove("hidden");
    document.querySelector('#state-me').textContent = '연결됨';
    document.querySelector('#state-me').classList.add("blue");
}
function connectChannel()
{
    isCaller = false;

    connector.ondatachannel = e => {
        const connectedChannel = e.channel;
        connectedChannel.onopen = e => {
            document.querySelector('#state-me').textContent = '연결됨';
            document.querySelector('#state-me').classList.add("blue");
            document.querySelector('#state-other').textContent = '연결됨';
            document.querySelector('#state-other').classList.add("blue");
            addNoti("- 상대방과 연결되었습니다. -");
        }
        connectedChannel.onclose = e => addNoti("- 상대방과의 연결이 끊어졌습니다. -");
        connectedChannel.onmessage = e => addChat(e.data, false);
        connector.channel = connectedChannel;
    }

    // UI 업데이트
    document.querySelector('#state-me').classList.add("hidden");
    document.querySelector('#input-me').classList.remove("hidden");
}
function connectMe()
{
    // 채널 접속 및 '나' 접속
    const otherInfo = JSON.parse(document.querySelector('#input-me > input').value);
    connector.setRemoteDescription(otherInfo);
    connector.createAnswer().then(answer => connector.setLocalDescription(answer));

    // UI 업데이트
    document.querySelector('#input-me').classList.add("hidden");
    document.querySelector('#state-me').classList.remove("hidden");
    document.querySelector('#state-me').textContent = '연결 대기 중';
    document.querySelector('#state-me').classList.add("yellow");
    document.querySelector('#state-other').textContent = '연결됨';
    document.querySelector('#state-other').classList.add("blue");
}
function acceptOther()
{
    // 상대방 접속
    const otherInfo = JSON.parse(document.querySelector('#input-other > input').value);
    connector.setRemoteDescription(otherInfo);

    // UI 업데이트
    document.querySelector('#input-other').classList.add("hidden");
    document.querySelector('#state-other').classList.remove("hidden");
    document.querySelector('#state-other').textContent = '연결됨';
    document.querySelector('#state-other').classList.add("blue");
}
function send()
{
    const message = document.querySelector('#send-layout > input').value;

    // 전송
    if (isCaller) channel.send(message);
    else connector.channel.send(message);

    // UI 업데이트
    addChat(message, true);
    document.querySelector('#send-layout > input').value = '';
}

document.addEventListener("DOMContentLoaded", () => {
    initConnection();
});
