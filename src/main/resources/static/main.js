const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startBtn = document.getElementById("startBtn");
const screenShareBtn = document.getElementById("screenShareBtn");
const offerBtn = document.getElementById("offerBtn");

// 원격 비디오 클릭 시 오디오 재생 (자동재생 차단 우회)
remoteVideo.addEventListener('click', () => {
    remoteVideo.play().then(() => {
        console.log("✅ 오디오 재생 시작");
    }).catch(err => {
        console.error("❌ 재생 실패:", err);
    });
});

let localStream;
let peerConnection;
let stompClient;
let mySessionId; // 내 세션 ID 저장
let isScreenSharing = false; // 화면 공유 상태

const roomId = "room1";

// STOMP 연결
function connectStomp() {
    const sock = new SockJS("/signal");
    stompClient = Stomp.over(sock);

    // 디버그 모드 활성화
    stompClient.debug = (str) => {
        console.log('STOMP Debug:', str);
    };

    stompClient.connect({},
        // 연결 성공 콜백
        (frame) => {
            console.log("✅ STOMP 연결 성공");

            // 내 세션 ID 저장
            mySessionId = stompClient.ws._transport.url.split('/')[5];
            console.log("내 세션 ID:", mySessionId);

            stompClient.subscribe(`/topic/room/${roomId}`, async (message) => {
                const data = JSON.parse(message.body);

                // 자신이 보낸 메시지는 무시
                if (data.senderSessionId === mySessionId) {
                    console.log("⏭️ 내가 보낸 메시지 무시:", data.type);
                    return;
                }

                switch (data.type) {
                    case "offer":
                        console.log("📩 Offer 수신");
                        await handleOffer(data.offer);
                        break;

                    case "answer":
                        console.log("📩 Answer 수신");
                        await handleAnswer(data.answer);
                        break;

                    case "ice":
                        console.log("📩 ICE Candidate 수신");
                        if (peerConnection) {
                            await peerConnection.addIceCandidate(data.candidate);
                        }
                        break;
                }
            });
        },
        // 연결 실패 콜백
        (error) => {
            console.error("❌ STOMP 연결 실패:", error);
            alert("STOMP 서버 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.");
        }
    );
}

// 미디어 스트림 시작
startBtn.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        localVideo.srcObject = localStream;
        console.log("🎥 로컬 미디어 스트림 획득 (비디오 + 오디오)");

        startBtn.disabled = true;
        if (screenShareBtn) screenShareBtn.disabled = false;
        offerBtn.disabled = false;
    } catch (err) {
        // 오디오 없이 비디오만 시도
        if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
            try {
                console.warn("️ 오디오 없이 비디오만 시도");
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });

                localVideo.srcObject = localStream;
                console.log("🎥 로컬 미디어 스트림 획득 (비디오만)");

                startBtn.disabled = true;
                if (screenShareBtn) screenShareBtn.disabled = false;
                offerBtn.disabled = false;
            } catch (videoErr) {
                console.error("❌ 비디오도 사용할 수 없습니다", videoErr);
                alert("카메라를 찾을 수 없습니다. OBS 가상 카메라가 켜져있는지 확인하세요.");
            }
        } else {
            alert(`미디어 장치 오류: ${err.message}\n\nOBS 가상 카메라를 켰는지 확인하세요.`);
        }
    }
};

// 화면 공유 시작/중지
if (screenShareBtn) {
    screenShareBtn.onclick = async () => {
        try {
            if (!isScreenSharing) {
                // 화면 공유 시작
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true  // 시스템 오디오 포함
                });

                const screenVideoTrack = screenStream.getVideoTracks()[0];
                const screenAudioTrack = screenStream.getAudioTracks()[0];

                // 로컬 비디오에 화면 공유 표시
                localVideo.srcObject = screenStream;

                // PeerConnection이 있으면 트랙 교체
                if (peerConnection) {
                    // 비디오 트랙 교체
                    const videoSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenVideoTrack);
                        console.log("🖥️ 화면 공유 비디오 트랙으로 교체");
                    }

                    // 오디오 트랙 교체 (시스템 오디오가 있는 경우)
                    if (screenAudioTrack) {
                        const audioSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
                        if (audioSender) {
                            audioSender.replaceTrack(screenAudioTrack);
                            console.log("🔊 시스템 오디오 트랙으로 교체");
                        }
                    }
                }

                // 화면 공유 중지 시 자동으로 카메라로 돌아가기
                screenVideoTrack.onended = () => {
                    switchBackToCamera();
                };

                isScreenSharing = true;
                screenShareBtn.textContent = "화면 공유 중지";
                console.log("🖥️ 화면 공유 시작 (비디오 + 시스템 오디오)");

            } else {
                // 화면 공유 중지
                switchBackToCamera();
            }
        } catch (err) {
            console.error("❌ 화면 공유 오류", err);
        }
    };
}

// 카메라로 돌아가기
async function switchBackToCamera() {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    const cameraVideoTrack = cameraStream.getVideoTracks()[0];
    const cameraAudioTrack = cameraStream.getAudioTracks()[0];

    // 로컬 비디오에 카메라 표시
    localVideo.srcObject = cameraStream;
    localStream = cameraStream;

    // PeerConnection이 있으면 트랙 교체
    if (peerConnection) {
        // 비디오 트랙 교체
        const videoSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
            videoSender.replaceTrack(cameraVideoTrack);
            console.log("🎥 카메라 비디오 트랙으로 교체");
        }

        // 오디오 트랙 교체
        const audioSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
        if (audioSender && cameraAudioTrack) {
            audioSender.replaceTrack(cameraAudioTrack);
            console.log("🎤 마이크 오디오 트랙으로 교체");
        }
    }

    isScreenSharing = false;
    if (screenShareBtn) screenShareBtn.textContent = "화면 공유 시작";
    console.log("🎥 카메라로 전환 (비디오 + 오디오)");
}

// PeerConnection 생성
function createPeerConnection() {
    if (peerConnection) return;

    const config = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    peerConnection = new RTCPeerConnection(config);
    console.log("🔗 RTCPeerConnection 생성");

    // 로컬 트랙 추가
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // ICE Candidate 수집 → STOMP 전송
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("🧊 ICE Candidate:", event.candidate.type, "|", event.candidate.candidate);

            stompClient.send(
                "/app/signal",
                {},
                JSON.stringify({
                    type: "ice",
                    roomId: roomId,
                    candidate: event.candidate
                })
            );
        }
    };

    // 원격 스트림 수신
    peerConnection.ontrack = (event) => {
        console.log("🎬 원격 트랙 수신:", event.track.kind);

        // 아직 스트림이 설정되지 않았을 때만 설정
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = event.streams[0];
            console.log("✅ 원격 스트림 설정 완료");
        }
    };
}

// Offer 생성 & 전송
offerBtn.onclick = async () => {
    if (!stompClient || !stompClient.connected) {
        alert("STOMP 서버에 연결되지 않았습니다.");
        return;
    }

    createPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    stompClient.send(
        "/app/signal",
        {},
        JSON.stringify({
            type: "offer",
            roomId: roomId,
            offer: offer
        })
    );

    console.log("📤 Offer 전송");
};

// Offer 수신 처리
async function handleOffer(offer) {
    createPeerConnection();

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    stompClient.send(
        "/app/signal",
        {},
        JSON.stringify({
            type: "answer",
            roomId: roomId,
            answer: answer
        })
    );

    console.log("📤 Answer 전송");

    // 연결 완료 후 원격 비디오 재생 시도
    setTimeout(() => {
        if (remoteVideo.srcObject) {
            remoteVideo.play().catch(err => {
                console.warn("⚠️ 오디오 자동 재생 차단됨. 상대방 화면을 클릭하세요.");
            });
        }
    }, 1000);
}

// Answer 수신 처리
async function handleAnswer(answer) {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
    );

    // 연결 완료 후 원격 비디오 재생 시도
    setTimeout(() => {
        if (remoteVideo.srcObject) {
            remoteVideo.play().catch(err => {
                console.warn("⚠️ 오디오 자동 재생 차단됨. 상대방 화면을 클릭하세요.");
            });
        }
    }, 1000);
}

// 페이지 로드시 STOMP 연결
connectStomp();
