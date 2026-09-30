# API

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Meetings
- `POST /api/meetings`
- `GET /api/meetings`
- `GET /api/meetings/by-code/:roomCode`
- `GET /api/meetings/:id`
- `POST /api/meetings/:id/join`
- `POST /api/meetings/:id/leave`
- `POST /api/meetings/:id/end`
- `GET /api/meetings/:id/participants`

## Files
- `POST /api/meetings/:meetingId/files`
- `GET /api/meetings/:meetingId/files`
- `GET /api/files/:id/download`
- `DELETE /api/files/:id`
