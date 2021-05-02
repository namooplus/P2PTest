let connector, channel, isCaller;

function initConnection()
{
    connector = new RTCPeerConnection();
    connector.onicecandidate = e => {
        console.log("나의 연결 정보");
        console.log(JSON.stringify(connector.localDescription));
    };
}
function addChat(message, who)
{
    const newChat = document.createElement('p');
    newChat.textContent = message;
    newChat.style.borderBottom = "1px solid gray";
    newChat.style.margin = "0";
    newChat.style.padding = "5px 10px";
    if (who == 0) newChat.style.textAlign = "end";
    else if (who == 1) newChat.style.textAlign = "start";
    else if (who == 2) newChat.style.textAlign = "center";
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
        addChat("(알림) 상대방과 연결되었습니다.", 2);
    }
    channel.onclose = e => addChat("(알림) 상대방과의 연결이 끊어졌습니다.", 2);
    channel.onmessage = e => addChat(e.data, 1);

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
            addChat("(알림) 상대방과 연결되었습니다.", 2);
        }
        connectedChannel.onclose = e => addChat("(알림) 상대방과의 연결이 끊어졌습니다.", 2);
        connectedChannel.onmessage = e => addChat(e.data, 1);
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
    addChat(message, 0);
    document.querySelector('#send-layout > input').value = '';
}

document.addEventListener("DOMContentLoaded", () => {
    initConnection();
});
