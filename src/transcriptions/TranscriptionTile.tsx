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
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();
  const { chatMessages, send: sendChat } = useChat();

  const [transcripts, setTranscripts] = useState<Map<string, ChatMessageType>>(
    new Map()
  );
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  // Get transcriptions for all participants
  const participantTranscriptions = participants.map((participant) => {
    return useTrackTranscription({
      publication: participant.audioTracks.find((track) => track.source === Track.Source.Microphone),
      source: Track.Source.Microphone,
      participant: participant,
    });
  });

  // store transcripts
  useEffect(() => {
    const allMessages: ChatMessageType[] = [];

    participantTranscriptions.forEach((transcription, index) => {
      const participant = participants[index];
      transcription.segments.forEach((s) => {
        transcripts.set(
          s.id,
          segmentToChatMessage(
            s,
            transcripts.get(s.id),
            participant
          )
        );
      });
    });

    allMessages.push(...Array.from(transcripts.values()));

    for (const msg of chatMessages) {
      const participant = participants.find((p) => p.identity === msg.from?.identity);
      const isSelf = msg.from?.identity === localParticipant.localParticipant.identity;
      let name = msg.from?.name;
      if (!name) {
        if (isSelf) {
          name = "You";
        } else if (participant) {
          name = participant.name || "Unknown";
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
    participantTranscriptions,
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
    name: participant instanceof LocalParticipant ? "You" : participant.name || "Unknown",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
}
