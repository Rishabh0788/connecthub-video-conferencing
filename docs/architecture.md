# Architecture

The client uses React state/hooks for UI and WebRTC lifecycle management. REST endpoints handle authentication, meetings and files. Socket.IO is the signaling and collaboration bus. Video/audio are not routed through Express: browsers negotiate peer-to-peer RTCPeerConnections through Socket.IO signaling.

## WebRTC flow
1. Authenticated client connects to Socket.IO.
2. Client joins `meeting:<meetingId>`.
3. Server verifies meeting access.
4. New client receives existing socket participants.
5. New client creates offers; existing participants return answers.
6. ICE candidates are relayed to the intended socket.
7. Media tracks are attached to peer connections.

## Collaboration flow
Chat, whiteboard operations, media state and screen-sharing events are sent through the meeting Socket.IO room. Chat messages are also persisted in PostgreSQL.
