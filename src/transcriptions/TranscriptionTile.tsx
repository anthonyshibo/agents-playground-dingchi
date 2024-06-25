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

  useEffect(() => {
    const newTranscripts = new Map(transcripts);
    const allMessages: ChatMessageType[] = [];

    participants.forEach((participant) => {
      const publication = participant.audioTracks.find((track) => track.source === Track.Source.Microphone);
      if (publication) {
        const transcription = useTrackTranscription({
          publication,
          source: Track.Source.Microphone,
          participant,
        });

        transcription.segments.forEach((s) => {
          newTranscripts.set(
            s.id,
            segmentToChatMessage(
              s,
              newTranscripts.get(s.id),
              participant
            )
          );
        });
      }
    });

    allMessages.push(...Array.from(newTranscripts.values()));

    for (const msg of chatMessages) {
      const participant = participants.find((p) => p.identity === msg.from?.identity);
      if (participant) {
        allMessages.push({
          name: participant.name || "Unknown",
          message: msg.message,
          timestamp: msg.timestamp,
          isSelf: msg.from?.identity === localParticipant.localParticipant.identity,
        });
      }
    }

    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(allMessages);
    setTranscripts(newTranscripts);
  }, [
    transcripts,
    chatMessages,
    localParticipant.localParticipant,
    participants,
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
