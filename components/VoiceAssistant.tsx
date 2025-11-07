
import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: LiveSession is not an exported member of @google/genai.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob } from "@google/genai";

// Fix: Define a local interface for the session object since LiveSession is not exported.
interface LiveSession {
    sendRealtimeInput(input: { media: GenaiBlob }): void;
    close(): void;
}

// --- START OF AUDIO UTILS ---
// These functions are self-contained here to avoid extra files.

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): GenaiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to avoid distortion
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- END OF AUDIO UTILS ---

interface VoiceAssistantProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  t: (key: any) => string;
}

interface ConversationTurn {
    role: 'user' | 'model' | 'system';
    text: string;
}

type ConnectionState = 'idle' | 'connecting' | 'listening' | 'speaking';

const MicIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/><path d="M12 17a5 5 0 0 1-5-5H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2a5 5 0 0 1-5 5z"/></svg>
);

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onGenerate, isLoading, t }) => {
    const [prompt, setPrompt] = useState('');
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const latestConversation = useRef(conversation);
    useEffect(() => {
        latestConversation.current = conversation;
    }, [conversation]);
    
    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        setConnectionState('idle');
    }, []);
    
    useEffect(() => {
        return () => stopConversation();
    }, [stopConversation]);

    const startConversation = async () => {
        setError(null);
        setConnectionState('connecting');
        setConversation([{role: 'system', text: t('voiceAssistantReady')}]);

        try {
            if (!process.env.API_KEY) throw new Error("API key not configured.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Fix: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to any to support Safari.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // Fix: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to any to support Safari.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('listening');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            // Update last user message or add new one
                            const lastTurn = latestConversation.current[latestConversation.current.length - 1];
                            if (lastTurn?.role === 'user') {
                                setConversation(prev => [...prev.slice(0, -1), {role: 'user', text: lastTurn.text + text}]);
                            } else {
                                setConversation(prev => [...prev, {role: 'user', text}]);
                            }
                        }

                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setConnectionState('speaking');
                            const lastTurn = latestConversation.current[latestConversation.current.length - 1];
                            if (lastTurn?.role === 'model') {
                                setConversation(prev => [...prev.slice(0, -1), {role: 'model', text: lastTurn.text + text}]);
                            } else {
                                setConversation(prev => [...prev, {role: 'model', text}]);
                            }
                        }

                        if(message.serverContent?.turnComplete) {
                            setConnectionState('listening');
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            const outputCtx = outputAudioContextRef.current;
                            if (!outputCtx) return;

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            const sources = audioSourcesRef.current;
                            source.addEventListener('ended', () => {
                                sources.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error(e);
                        setError("A connection error occurred.");
                        stopConversation();
                    },
                    onclose: () => {},
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: t('voiceSystemInstruction'),
                },
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to start microphone. Please check permissions.");
            setConnectionState('idle');
        }
    };

    const handleMicClick = () => {
        if (connectionState === 'idle') {
            startConversation();
        } else {
            stopConversation();
        }
    };

    const handleGenerateClick = () => {
      // Use the last model response as the prompt, assuming it's the summary
      const lastModelTurn = [...conversation].reverse().find(turn => turn.role === 'model');
      const finalPrompt = lastModelTurn ? lastModelTurn.text : prompt;

      if (finalPrompt) {
        onGenerate(finalPrompt);
      } else {
        setError("Please have a conversation with the assistant to create a prompt first, or type one manually.");
      }
    }

    const getMicButtonClass = () => {
        switch(connectionState) {
            case 'connecting': return 'bg-yellow-500 animate-pulse';
            case 'listening': return 'bg-green-500';
            case 'speaking': return 'bg-purple-500';
            default: return 'bg-gray-600 hover:bg-gray-500';
        }
    }

    return (
        <div>
            <div id="chat-log" className="h-48 overflow-y-auto bg-gray-700/50 p-3 rounded-md mb-4 space-y-3">
                {conversation.map((turn, index) => (
                    <div key={index} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {turn.role !== 'system' && (
                            <p className={`px-4 py-2 rounded-lg max-w-[80%] ${turn.role === 'user' ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                {turn.text}
                            </p>
                        )}
                         {turn.role === 'system' && (
                            <p className="text-center w-full text-gray-400 text-sm italic">{turn.text}</p>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex items-center justify-center space-x-4">
                <button
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`p-4 rounded-full text-white transition-colors duration-300 disabled:opacity-50 ${getMicButtonClass()}`}
                    aria-label={connectionState === 'idle' ? 'Start conversation' : 'Stop conversation'}
                >
                    <MicIcon className="w-8 h-8"/>
                </button>
            </div>
            
             <div className="mt-6">
                <label htmlFor="finalPrompt" className="block text-sm font-medium text-gray-400 mb-1">{t('voiceAssistantFinalPromptLabel')}</label>
                <textarea
                    id="finalPrompt"
                    className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none"
                    placeholder={t('voiceAssistantFinalPromptPlaceholder')}
                    value={prompt || ([...conversation].reverse().find(turn => turn.role === 'model')?.text ?? '')}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                />
            </div>
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
             <button
                onClick={handleGenerateClick}
                disabled={isLoading || connectionState === 'connecting'}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? t('generatingButton') : t('voiceAssistantGenerateButton')}
            </button>
        </div>
    );
};
