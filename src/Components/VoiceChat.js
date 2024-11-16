import React, { useState } from 'react';
import { createClient, createMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

const VoiceChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [microphoneTrack, setMicrophoneTrack] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true); // Track microphone state

  const startVoiceChat = async () => {
    console.log('Initializing Agora client...');
    const agoraClient = createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);

    try {
      console.log('Joining Agora channel...');
      await agoraClient.join(
        'b470801139ae4d3aa5375b4434930a04',
        'Snake',
        '007eJxTYDi889cf4TMbSng083Wn5m61DjTt6pj0e8EswZm+syfNCrFWYEgyMTewMDA0NLZMTDVJMU5MNDU2N00yMTE2sTQ2SDQw2XHCPL0hkJHh18sIRkYGCATxWRmC8xKzUxkYAIRBIAo=',
        null
      );

      console.log('Creating microphone audio track...');
      const micTrack = await createMicrophoneAudioTrack({
        AEC: true, // Echo cancellation
        AGC: true, // Automatic gain control
        ANS: true, // Automatic noise suppression
      });
      setMicrophoneTrack(micTrack);

      console.log('Publishing microphone audio track...');
      await agoraClient.publish([micTrack]);

      console.log('Voice chat is live!');
      setIsConnected(true);

      // Subscribe to other users' audio
      agoraClient.on('user-published', async (user, mediaType) => {
        console.log(`User published: ${user.uid}`);
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          console.log(`Playing audio from user: ${user.uid}`);
          const remoteAudioTrack = user.audioTrack;

          // Prevent playing own audio
          if (user.uid !== agoraClient.uid) {
            remoteAudioTrack.play();
          } else {
            console.log('Ignoring own audio playback');
          }
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

  // Toggle microphone on/off
  const toggleMic = () => {
    if (microphoneTrack) {
      if (isMicOn) {
        microphoneTrack.setEnabled(false); // Mute microphone
        console.log('Microphone muted');
      } else {
        microphoneTrack.setEnabled(true); // Unmute microphone
        console.log('Microphone unmuted');
      }
      setIsMicOn(!isMicOn);
    }
  };

  const stopVoiceChat = async () => {
    if (client) {
      console.log('Stopping voice chat...');
      if (microphoneTrack) {
        microphoneTrack.stop();
        microphoneTrack.close();
      }
      await client.leave();
      setIsConnected(false);
      setClient(null);
      setMicrophoneTrack(null);
      console.log('Voice chat stopped.');
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={startVoiceChat}>Start Voice Chat</button>
      ) : (
        <>
          <p>Voice Chat is Live!</p>
          <button onClick={toggleMic}>
            {isMicOn ? 'Turn Off Microphone' : 'Turn On Microphone'}
          </button>
          <button onClick={stopVoiceChat}>Stop Voice Chat</button>
        </>
      )}
    </div>
  );
};

export default VoiceChat;
