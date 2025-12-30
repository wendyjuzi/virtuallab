import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient: Stomp.Client | null = null

export function connectWebSocket(teamId: number, onMessage: (msg: any) => void) {
  const socket = new SockJS('/ws') // Spring Boot 的端点是 /ws
  stompClient = Stomp.over(socket)

  stompClient.connect({}, () => {
    console.log('WebSocket connected')

    // 订阅团队聊天室频道
    stompClient?.subscribe(`/topic/chat/${teamId}`, (message) => {
      onMessage(JSON.parse(message.body))
    })
  })
}

export function sendMessage(message: any) {
  if (stompClient && stompClient.connected) {
    stompClient.send('/app/chat', {}, JSON.stringify(message))
  }
}

export function disconnectWebSocket() {
  stompClient?.disconnect(() => {
    console.log('WebSocket disconnected')
  })
}
