import React, { useEffect, useState } from 'react';
import { createClient, createMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

const VoiceChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [microphoneTrack, setMicrophoneTrack] = useState(null);

  useEffect(() => {
    const initVoiceChat = async () => {
      console.log('Initializing Agora client...');
      const agoraClient = createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);

      try {
        console.log('Joining Agora channel...');
        await agoraClient.join('b470801139ae4d3aa5375b4434930a04', 'Snake', '007eJxTYDi889cf4TMbSng083Wn5m61DjTt6pj0e8EswZm+syfNCrFWYEgyMTewMDA0NLZMTDVJMU5MNDU2N00yMTE2sTQ2SDQw2XHCPL0hkJHh18sIRkYGCATxWRmC8xKzUxkYAIRBIAo=', null);

        console.log('Creating microphone audio track...');
        const micTrack = await createMicrophoneAudioTrack(); // Create a microphone audio track
        setMicrophoneTrack(micTrack);

        console.log('Publishing microphone audio track...');
        await agoraClient.publish([micTrack]); // Publish microphone track

        console.log('Voice chat is live!');
        setIsConnected(true);

        // Subscribe to other users' audio
        agoraClient.on('user-published', async (user, mediaType) => {
          console.log(`User published: ${user.uid}`);
          await agoraClient.subscribe(user, mediaType); // Subscribe to the published audio

          if (mediaType === 'audio') {
            console.log(`Playing audio from user: ${user.uid}`);
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play(); // Play the audio from the other user
          }
        });

        agoraClient.on('user-unpublished', (user) => {
          console.log(`User unpublished: ${user.uid}`);
        });

        agoraClient.on('user-joined', (user) => {
          console.log(`User joined: ${user.uid}`);
        });

        agoraClient.on('user-left', (user) => {
          console.log(`User left: ${user.uid}`);
        });

      } catch (error) {
        console.error('Failed to join the channel:', error);
      }
    };

    initVoiceChat();

    return () => {
      if (microphoneTrack) {
        microphoneTrack.stop();
        microphoneTrack.close();
      }
      if (client) client.leave();
      setIsConnected(false);
    };
  }, []);

  return (
    <div>
      {isConnected ? <p>Voice Chat is Live!</p> : <p>Connecting to voice chat...</p>}
    </div>
  );
};

export default VoiceChat;
