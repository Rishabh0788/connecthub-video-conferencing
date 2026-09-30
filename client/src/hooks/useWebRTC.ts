import { useCallback, useEffect, useRef, useState } from 'react';
import type { RemotePeer } from '../types';
import type { Socket } from 'socket.io-client';

export function useWebRTC(socket: Socket | null, meetingId: string | undefined) {
  const [localStream,setLocalStream]=useState<MediaStream>();
  const [peers,setPeers]=useState<Record<string,RemotePeer>>({});
  const peersRef=useRef<Record<string,RTCPeerConnection>>({});
  const streamRef=useRef<MediaStream>();
  const createPeer=useCallback((socketId:string,initiator:boolean,user:{id:string;name:string})=>{
    const existing=peersRef.current[socketId]; if(existing) return existing;
    const pc=new RTCPeerConnection({iceServers:[{urls:import.meta.env.VITE_STUN_URL||'stun:stun.l.google.com:19302'}]});
    peersRef.current[socketId]=pc;
    streamRef.current?.getTracks().forEach(t=>pc.addTrack(t,streamRef.current!));
    pc.onicecandidate=e=>{if(e.candidate)socket?.emit('ice-candidate',{to:socketId,candidate:e.candidate});};
    pc.ontrack=e=>setPeers(p=>({...p,[socketId]:{...(p[socketId]??{socketId,user}),user,stream:e.streams[0]}}));
    pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState)){pc.close();delete peersRef.current[socketId];setPeers(p=>{const n={...p};delete n[socketId];return n;});}};
    if(initiator)pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>socket?.emit('offer',{to:socketId,offer:pc.localDescription}));
    setPeers(p=>({...p,[socketId]:{...(p[socketId]??{socketId,user}),user}}));
    return pc;
  },[socket]);
  useEffect(()=>{if(!socket||!meetingId)return;let active=true;
    navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(s=>{if(!active)return s.getTracks().forEach(t=>t.stop());streamRef.current=s;setLocalStream(s);socket.emit('join-meeting',{meetingId});}).catch(()=>setLocalStream(undefined));
    const existing=(items:{socketId:string;user:{id:string;name:string}}[])=>items.forEach(p=>createPeer(p.socketId,true,p.user));
    const joined=(p:{socketId:string;user:{id:string;name:string}})=>createPeer(p.socketId,false,p.user);
    const offer=async({from,offer,user}:{from:string;offer:RTCSessionDescriptionInit;user?:{id:string;name:string}})=>{const pc=createPeer(from,false,user??{id:from,name:'Participant'});await pc.setRemoteDescription(offer);const answer=await pc.createAnswer();await pc.setLocalDescription(answer);socket.emit('answer',{to:from,answer:pc.localDescription});};
    const answer=async({from,answer}:{from:string;answer:RTCSessionDescriptionInit})=>{await peersRef.current[from]?.setRemoteDescription(answer);};
    const ice=async({from,candidate}:{from:string;candidate:RTCIceCandidateInit})=>{await peersRef.current[from]?.addIceCandidate(candidate).catch(()=>undefined);};
    const status=(event:'toggle-mic'|'toggle-camera'|'screen-share-started'|'screen-share-stopped',payload:any)=>setPeers(p=>{const n={...p};const item=n[payload.from];if(!item)return p;if(event==='toggle-mic')item.micOn=payload.enabled;if(event==='toggle-camera')item.cameraOn=payload.enabled;if(event==='screen-share-started')item.screenSharing=true;if(event==='screen-share-stopped')item.screenSharing=false;return {...n,[payload.from]:{...item}}});
    const left=({socketId}:{socketId:string})=>{peersRef.current[socketId]?.close();delete peersRef.current[socketId];setPeers(p=>{const n={...p};delete n[socketId];return n;});};
    socket.on('existing-participants',existing).on('participant-joined',joined).on('offer',offer).on('answer',answer).on('ice-candidate',ice).on('participant-left',left).on('toggle-mic',p=>status('toggle-mic',p)).on('toggle-camera',p=>status('toggle-camera',p)).on('screen-share-started',p=>status('screen-share-started',p)).on('screen-share-stopped',p=>status('screen-share-stopped',p));
    return()=>{active=false;socket.off('existing-participants',existing).off('participant-joined',joined).off('offer',offer).off('answer',answer).off('ice-candidate',ice).off('participant-left',left).off('toggle-mic').off('toggle-camera').off('screen-share-started').off('screen-share-stopped');Object.values(peersRef.current).forEach(p=>p.close());peersRef.current={};streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=undefined;setLocalStream(undefined);setPeers({});};
  },[socket,meetingId,createPeer]);
  const toggleMic=()=>{const t=streamRef.current?.getAudioTracks()[0];if(!t)return false;t.enabled=!t.enabled;socket?.emit('toggle-mic',{enabled:t.enabled});return t.enabled;};
  const toggleCamera=()=>{const t=streamRef.current?.getVideoTracks()[0];if(!t)return false;t.enabled=!t.enabled;socket?.emit('toggle-camera',{enabled:t.enabled});return t.enabled;};
  const shareScreen=async()=>{if(!streamRef.current)return false;const display=await navigator.mediaDevices.getDisplayMedia({video:true});const track=display.getVideoTracks()[0];for(const pc of Object.values(peersRef.current)){const sender=pc.getSenders().find(s=>s.track?.kind==='video');if(sender)await sender.replaceTrack(track);}track.onended=async()=>{const cam=streamRef.current?.getVideoTracks()[0];for(const pc of Object.values(peersRef.current)){const sender=pc.getSenders().find(s=>s.track?.kind==='video');if(sender&&cam)await sender.replaceTrack(cam);}socket?.emit('screen-share-stopped');};socket?.emit('screen-share-started');return true;};
  return {localStream,peers:Object.values(peers),toggleMic,toggleCamera,shareScreen};
}
