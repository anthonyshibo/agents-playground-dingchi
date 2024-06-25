import { ChatMessageType, ChatTile } from "@/components/chat/ChatTile";
import {
  TrackReferenceOrPlaceholder,
  useChat,
  useLocalParticipant,
  useParticipants,
  useTrackTranscription,
} from "@livekit/components-react";
import {
  LocalParticipant,
  Participant,
  Track,
  TranscriptionSegment,
} from "livekit-client";
import { useEffect, useState } from "react";

export function TranscriptionTile({
  accentColor,
}: {
  accentColor: string;
}) {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [lastParticipant, setLastParticipant] = useState<Participant | null>(null);
  const [transcripts, setTranscripts] = useState<Map<string, ChatMessageType>>(
    new Map()
  );
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { chatMessages, send: sendChat } = useChat();

  useEffect(() => {
    if (participants.length > 0) {
      setLastParticipant(participants[participants.length - 1]);
    }
  }, [participants]);

  useEffect(() => {
    const allMessages: ChatMessageType[] = [];

    if (lastParticipant) {
      const audioTrack = lastParticipant.audioTracks.find(
        (track) => track.source === Track.Source.Microphone
      );
      if (audioTrack) {
        const messages = useTrackTranscription({
          publication: audioTrack,
          source: Track.Source.Microphone,
          participant: lastParticipant,
        }).segments.map((s) =>
          segmentToChatMessage(s, undefined, lastParticipant)
        );
        allMessages.push(...messages);
      }
    }

    const localMessages = useTrackTranscription({
      publication: localParticipant.microphoneTrack,
      source: Track.Source.Microphone,
      participant: localParticipant.localParticipant,
    }).segments.map((s) =>
      segmentToChatMessage(s, undefined, localParticipant.localParticipant)
    );
    allMessages.push(...localMessages);

    for (const msg of chatMessages) {
      const isAgent = participants.some(
        (p) => p.identity === msg.from?.identity
      );
      const isSelf = msg.from?.identity === localParticipant.localParticipant.identity;
      let name = msg.from?.name;
      if (!name) {
        if (isAgent) {
          name = "Agent";
        } else if (isSelf) {
          name = "You";
        } else {
          name = "Unknown";
        }
      }
      allMessages.push({
        name,
        message: msg.message,
        timestamp: msg.timestamp,
        isSelf: isSelf,
      });
    }

    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(allMessages);
  }, [
    transcripts,
    chatMessages,
    localParticipant.localParticipant,
    participants,
    lastParticipant,
  ]);

  return (
    <ChatTile messages={messages} accentColor={accentColor} onSend={sendChat} />
  );
}

function segmentToChatMessage(
  s: TranscriptionSegment,
  existingMessage: ChatMessageType | undefined,
  participant: Participant
): ChatMessageType {
  const msg: ChatMessageType = {
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? "You" : "Agent",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
}
